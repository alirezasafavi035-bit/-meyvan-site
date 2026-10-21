"""
Supplier Official API / JSON Feed Adapter.
"""

import logging
from typing import Iterable, List, Optional, Dict, Any

from ingestion_pipeline.adapters.base_adapter import BaseSourceAdapter, RawProductRecord

logger = logging.getLogger("MeyvanPipeline.ApiFeedAdapter")


class ApiFeedAdapter(BaseSourceAdapter):
    """
    Adapter for ingestion from an authorized supplier JSON endpoint or local export feed.
    """

    def __init__(
        self,
        base_url: str,
        feed_endpoint: str,
        auth_header: Optional[Dict[str, str]] = None,
        explicit_permission_confirmed: bool = True,
        **kwargs
    ):
        super().__init__(base_url, explicit_permission_confirmed, **kwargs)
        self.feed_endpoint = feed_endpoint
        self.auth_header = auth_header or {}
        if self.auth_header:
            self.session.headers.update(self.auth_header)
        self._cached_items: List[Dict[str, Any]] = []

    def discover_product_urls(self) -> Iterable[str]:
        """Fetches the supplier API feed and yields item identifiers or URLs."""
        full_endpoint = f"{self.base_url}/{self.feed_endpoint.lstrip('/')}"
        logger.info(f"Fetching supplier product feed from: {full_endpoint}")
        try:
            resp = self.get_url(full_endpoint)
            data = resp.json()

            # Handle pagination or arrays
            items = data.get("products", data) if isinstance(data, dict) else data
            if isinstance(items, list):
                self._cached_items = items
                for idx, item in enumerate(items):
                    yield item.get("source_url") or item.get("url") or f"urn:feed-item:{idx}"
        except Exception as e:
            logger.error(f"Error fetching API feed: {e}")

    def fetch_product(self, url: str) -> Optional[RawProductRecord]:
        """Finds cached product record matching the URL/URN."""
        for item in self._cached_items:
            item_url = item.get("source_url") or item.get("url")
            if item_url == url or f"urn:feed-item:{self._cached_items.index(item)}" == url:
                return RawProductRecord(
                    source_url=item_url or url,
                    source_website=self.base_url,
                    raw_title=item.get("title") or item.get("name", ""),
                    raw_description=item.get("description", ""),
                    raw_sku=str(item.get("sku") or item.get("id", "")),
                    raw_brand=item.get("brand", "MEYVAN"),
                    raw_category=item.get("category", "طلا و جواهر"),
                    raw_weight_text=str(item.get("weight", "")),
                    raw_karat_text=str(item.get("karat", "18")),
                    raw_price_text=str(item.get("price", "")),
                    raw_currency=item.get("currency", "TOMAN"),
                    raw_image_urls=item.get("images", []),
                    raw_specifications=item.get("specifications", {})
                )
        return None
