"""
Multi-Vector Catalog Deduplication Module.
"""

import re
from typing import Dict, Set, Optional, Tuple, Any

from ingestion_pipeline.config import PipelineConfig


class CatalogDeduplicator:
    """
    Maintains indices across:
      - SKU
      - Source URL
      - Title Fingerprint (normalized token set)
      - Perceptual image hashes (dHash Hamming distance)
    """

    def __init__(self, config: PipelineConfig = PipelineConfig()):
        self.config = config
        self.seen_skus: Set[str] = set()
        self.seen_urls: Set[str] = set()
        self.seen_title_fingerprints: Set[str] = set()
        self.seen_image_hashes: Dict[str, str] = {}  # hash -> sku

    def register_existing_product(self, product: Dict[str, Any]):
        """Indexes an existing product already in the Meyvan database."""
        if product.get("sku"):
            self.seen_skus.add(str(product["sku"]).upper())

        provenance = product.get("provenance", {})
        if provenance.get("sourceUrl"):
            self.seen_urls.add(provenance["sourceUrl"])
        elif product.get("sourceUrl"):
            self.seen_urls.add(product["sourceUrl"])

        if product.get("name"):
            self.seen_title_fingerprints.add(self._create_title_fingerprint(product["name"]))

        # Image hashes if present
        for h in product.get("imageHashes", []):
            self.seen_image_hashes[h] = product.get("sku", "EXISTING")

    def _create_title_fingerprint(self, title: str) -> str:
        """Strips noise words and creates a sorted token fingerprint."""
        tokens = re.findall(r"\w+", title.lower())
        stop_words = {"طلا", "۱۸", "عیار", "مدل", "طرح", "لوکس", "جدید"}
        meaningful = sorted(list({t for t in tokens if t not in stop_words and len(t) > 1}))
        return "-".join(meaningful)

    @staticmethod
    def hamming_distance(hash1: str, hash2: str) -> int:
        """Computes Hamming distance between two 16-character hex strings."""
        try:
            val1 = int(hash1, 16)
            val2 = int(hash2, 16)
            xor = val1 ^ val2
            return bin(xor).count("1")
        except (ValueError, TypeError):
            return 999

    def check_duplicate(
        self,
        sku: str,
        source_url: str,
        title: str,
        image_hashes: Optional[list] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Checks if candidate matches any existing item.
        Returns:
            is_duplicate: bool
            reason: description of matching vector
        """
        # 1. Exact SKU match
        if sku.upper() in self.seen_skus:
            return True, f"SKU conflict: {sku} already registered"

        # 2. Source URL match
        if source_url in self.seen_urls:
            return True, f"URL conflict: {source_url} already ingested"

        # 3. Title semantic fingerprint match
        fp = self._create_title_fingerprint(title)
        if fp and fp in self.seen_title_fingerprints:
            return True, f"Title similarity conflict: semantic fingerprint '{fp}' matches existing piece"

        # 4. Perceptual Image Hash match
        if image_hashes:
            for new_h in image_hashes:
                if not new_h:
                    continue
                for existing_h, orig_sku in self.seen_image_hashes.items():
                    dist = self.hamming_distance(new_h, existing_h)
                    if dist <= self.config.PERCEPTUAL_HASH_HAMMING_THRESHOLD:
                        return True, f"Image visual duplicate: perceptual distance {dist} to SKU {orig_sku}"

        return False, None

    def record_new(
        self,
        sku: str,
        source_url: str,
        title: str,
        image_hashes: Optional[list] = None
    ):
        """Records newly ingested product in deduplication indices."""
        self.seen_skus.add(sku.upper())
        self.seen_urls.add(source_url)
        self.seen_title_fingerprints.add(self._create_title_fingerprint(title))
        if image_hashes:
            for h in image_hashes:
                if h:
                    self.seen_image_hashes[h] = sku
