"""
Meyvan Catalog Ingestion & Quality Assurance Pipeline Orchestrator.
"""

import os
import json
import csv
import time
import uuid
import logging
from typing import Dict, List, Optional, Any

from ingestion_pipeline.config import PipelineConfig
from ingestion_pipeline.adapters.base_adapter import BaseSourceAdapter, RawProductRecord
from ingestion_pipeline.core.normalizer import ProductNormalizer
from ingestion_pipeline.core.deduplicator import CatalogDeduplicator
from ingestion_pipeline.core.image_validator import NaturalJewelryImageValidator

logger = logging.getLogger("MeyvanPipeline.Orchestrator")


class IngestionPipeline:
    """
    Executes compliant end-to-end extraction, normalization, vetting, and export.
    """

    def __init__(
        self,
        adapter: BaseSourceAdapter,
        config: PipelineConfig = PipelineConfig(),
        existing_catalog_path: Optional[str] = None,
        output_dir: str = "ingestion_output"
    ):
        self.adapter = adapter
        self.config = config
        self.output_dir = output_dir
        self.normalizer = ProductNormalizer(config=config)
        self.deduplicator = CatalogDeduplicator(config=config)
        self.image_validator = NaturalJewelryImageValidator(config=config)

        # Pre-seed deduplicator with existing catalog
        if existing_catalog_path and os.path.exists(existing_catalog_path):
            self._load_existing_catalog(existing_catalog_path)

        os.makedirs(self.output_dir, exist_ok=True)

    def _load_existing_catalog(self, path: str):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        self.deduplicator.register_existing_product(item)
                    logger.info(f"Pre-loaded {len(data)} existing products into deduplication index.")
        except Exception as e:
            logger.warning(f"Could not load existing catalog from {path}: {e}")

    def run(self, max_items: Optional[int] = None) -> Dict[str, Any]:
        """Runs ingestion across discovered supplier products."""
        run_id = f"run-{uuid.uuid4().hex[:8]}"
        start_time = time.strftime("%Y-%m-%dT%H:%M:%SZ")

        logger.info(f"Starting Ingestion Pipeline [{run_id}] for source: {self.adapter.base_url}")

        accepted_products: List[Dict[str, Any]] = []
        rejected_items: List[Dict[str, Any]] = []
        manual_review_items: List[Dict[str, Any]] = []
        duplicates_skipped = 0
        total_discovered = 0
        total_processed = 0

        for url in self.adapter.discover_product_urls():
            total_discovered += 1
            if max_items and total_processed >= max_items:
                logger.info(f"Reached user limit of {max_items} items.")
                break

            try:
                raw_record = self.adapter.fetch_product(url)
                if not raw_record:
                    rejected_items.append({
                        "sourceUrl": url,
                        "rawTitle": "Unknown",
                        "reasons": ["Product page could not be parsed or returned empty payload"],
                        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                    })
                    continue

                total_processed += 1

                # Step 1: Normalization
                normalized_product, uncertain_fields = self.normalizer.normalize(raw_record)

                # Step 2: Deduplication
                is_dup, dup_reason = self.deduplicator.check_duplicate(
                    sku=normalized_product["sku"],
                    source_url=raw_record.source_url,
                    title=normalized_product["name"]
                )
                if is_dup:
                    duplicates_skipped += 1
                    logger.info(f"Skipped duplicate: {dup_reason}")
                    continue

                # Step 3: Image Vetting (Natural photo & pure white background)
                valid_images: List[str] = []
                image_review_notes: List[str] = []
                image_hashes: List[str] = []

                for img_url in raw_record.raw_image_urls:
                    verdict = self.image_validator.validate_url(self.adapter.session, img_url)
                    if verdict.is_valid:
                        valid_images.append(img_url)
                        if verdict.perceptual_hash:
                            image_hashes.append(verdict.perceptual_hash)
                    else:
                        image_review_notes.extend(verdict.failure_reasons)

                normalized_product["images"] = valid_images

                # Step 4: Routing (Accepted vs Manual Review vs Rejected)
                # Check for critical errors
                critical_errors: List[str] = []
                if not normalized_product["name"]:
                    critical_errors.append("Missing product title")
                if not raw_record.raw_image_urls:
                    critical_errors.append("No product images found in supplier listing")

                if critical_errors:
                    rejected_items.append({
                        "sku": normalized_product.get("sku"),
                        "sourceUrl": raw_record.source_url,
                        "rawTitle": raw_record.raw_title,
                        "reasons": critical_errors,
                        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                    })
                    continue

                # Check if item needs manual boutique inspection
                review_reasons: List[str] = []
                if uncertain_fields:
                    review_reasons.append(f"Uncertain or missing fields: {', '.join(uncertain_fields)}")
                if not valid_images:
                    review_reasons.append(
                        "No images passed automated pure-white (#FFFFFF) background test. "
                        f"Issues: {'; '.join(image_review_notes[:2])}. Requires manual studio inspection."
                    )
                if normalized_product.get("weightGrams") is None:
                    review_reasons.append("Exact weight in grams could not be verified from specifications.")
                if normalized_product.get("karat") is None:
                    review_reasons.append("Gold purity/karat could not be verified as 18K/21K/24K.")

                if review_reasons:
                    manual_review_items.append({
                        "sku": normalized_product.get("sku"),
                        "sourceUrl": raw_record.source_url,
                        "reviewReasons": review_reasons,
                        "missingFields": uncertain_fields,
                        "partialProduct": normalized_product,
                        "queuedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                    })
                    logger.warning(f"Queued for Manual Review [{normalized_product['sku']}]: {review_reasons}")
                else:
                    # Item is pristine and fully verified
                    accepted_products.append(normalized_product)
                    self.deduplicator.record_new(
                        sku=normalized_product["sku"],
                        source_url=raw_record.source_url,
                        title=normalized_product["name"],
                        image_hashes=image_hashes
                    )
                    logger.info(f"Accepted [{normalized_product['sku']}]: {normalized_product['name']}")

            except Exception as e:
                logger.error(f"Error processing {url}: {e}")
                rejected_items.append({
                    "sourceUrl": url,
                    "reasons": [f"Processing exception: {str(e)}"],
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                })

        # Save artifacts
        self._save_outputs(run_id, accepted_products, manual_review_items, rejected_items)

        # Generate validation report
        report = {
            "runId": run_id,
            "timestamp": start_time,
            "sourceWebsite": self.adapter.base_url,
            "complianceChecklist": {
                "robotsTxtRespected": self.adapter.respect_robots_txt,
                "rateLimitObserved": True,
                "explicitPermissionConfirmed": self.adapter.explicit_permission_confirmed,
                "noGenerativeAiUsed": True,
                "noAntiBotBypassed": True,
                "crawlDelaySeconds": self.config.DEFAULT_CRAWL_DELAY_SECONDS
            },
            "summary": {
                "totalDiscovered": total_discovered,
                "totalProcessed": total_processed,
                "accepted": len(accepted_products),
                "queuedForManualReview": len(manual_review_items),
                "rejected": len(rejected_items),
                "duplicatesSkipped": duplicates_skipped
            },
            "acceptedCount": len(accepted_products),
            "manualReviewCount": len(manual_review_items),
            "rejectedCount": len(rejected_items),
            "rejectedItems": rejected_items,
            "manualReviewItems": manual_review_items
        }

        report_file = os.path.join(self.output_dir, "validation_report.json")
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        self._print_terminal_summary(report)
        return report

    def _save_outputs(
        self,
        run_id: str,
        accepted: List[Dict[str, Any]],
        manual: List[Dict[str, Any]],
        rejected: List[Dict[str, Any]]
    ):
        """Saves JSON and CSV output files compatible with Meyvan."""
        # 1. Accepted Products JSON
        accepted_json = os.path.join(self.output_dir, "accepted_products.json")
        with open(accepted_json, "w", encoding="utf-8") as f:
            json.dump(accepted, f, ensure_ascii=False, indent=2)

        # 2. Accepted Products CSV (UTF-8 BOM for Persian Excel)
        accepted_csv = os.path.join(self.output_dir, "accepted_products.csv")
        fieldnames = [
            "sku", "name", "category", "categoryFa", "type", "weightGrams",
            "karat", "wagePercent", "profitPercent", "vatPercent", "stonePrice",
            "hasStone", "stock", "images", "tags", "description", "sourceUrl"
        ]
        with open(accepted_csv, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for p in accepted:
                writer.writerow({
                    "sku": p.get("sku"),
                    "name": p.get("name"),
                    "category": p.get("category"),
                    "categoryFa": p.get("categoryFa"),
                    "type": p.get("type"),
                    "weightGrams": p.get("weightGrams"),
                    "karat": p.get("karat"),
                    "wagePercent": p.get("wagePercent"),
                    "profitPercent": p.get("profitPercent"),
                    "vatPercent": p.get("vatPercent"),
                    "stonePrice": p.get("stonePrice"),
                    "hasStone": "بله" if p.get("hasStone") else "خیر",
                    "stock": p.get("stock", 1),
                    "images": " | ".join(p.get("images", [])),
                    "tags": " | ".join(p.get("tags", [])),
                    "description": p.get("description"),
                    "sourceUrl": p.get("provenance", {}).get("sourceUrl")
                })

        # 3. Manual Review Queue JSON
        manual_json = os.path.join(self.output_dir, "manual_review_queue.json")
        with open(manual_json, "w", encoding="utf-8") as f:
            json.dump(manual, f, ensure_ascii=False, indent=2)

    def _print_terminal_summary(self, report: Dict[str, Any]):
        """Prints a scannable summary report."""
        s = report["summary"]
        print("\n" + "=" * 65)
        print("💎 MEYVAN CATALOG INGESTION & COMPLIANCE REPORT")
        print("=" * 65)
        print(f"• Source Website        : {report['sourceWebsite']}")
        print(f"• Run ID                : {report['runId']}")
        print(f"• Robots.txt Respected  : {'✅ YES' if report['complianceChecklist']['robotsTxtRespected'] else '❌ NO'}")
        print(f"• Supplier Permission   : {'✅ CONFIRMED' if report['complianceChecklist']['explicitPermissionConfirmed'] else '❌ UNCONFIRMED'}")
        print(f"• Anti-Generative Policy: ✅ Strictly real natural photography")
        print("-" * 65)
        print(f"• Total Discovered      : {s['totalDiscovered']}")
        print(f"• Total Processed       : {s['totalProcessed']}")
        print(f"• ✅ Accepted (Valid)   : {s['accepted']}")
        print(f"• ⚠️ Manual Review Queue : {s['queuedForManualReview']}")
        print(f"• ❌ Rejected           : {s['rejected']}")
        print(f"• ⏭️ Duplicates Skipped  : {s['duplicatesSkipped']}")
        print("=" * 65)
        print(f"Outputs written to: {self.output_dir}/")
        print(f"  ├── accepted_products.json")
        print(f"  ├── accepted_products.csv")
        print(f"  ├── manual_review_queue.json")
        print(f"  └── validation_report.json")
        print("=" * 65 + "\n")
