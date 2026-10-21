#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CLI Runner for Meyvan Gold Jewelry Ingestion Pipeline.
"""

import sys
import argparse
import logging

from ingestion_pipeline.config import PipelineConfig
from ingestion_pipeline.adapters.sitemap_adapter import SitemapProductAdapter
from ingestion_pipeline.adapters.api_feed_adapter import ApiFeedAdapter
from ingestion_pipeline.pipeline import IngestionPipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

def main():
    parser = argparse.ArgumentParser(
        description="Compliant, production-grade gold jewelry catalog ingestion for meyvan.ir"
    )
    parser.add_argument("--source-url", required=True, help="Supplier website base URL (e.g. https://supplier-gold.ir)")
    parser.add_argument("--sitemap-url", default=None, help="Optional direct path to product sitemap.xml")
    parser.add_argument("--api-feed", default=None, help="Optional supplier API JSON feed endpoint")
    parser.add_argument("--permission-confirmed", action="store_true", default=False,
                        help="Mandatory compliance flag confirming legal authorization to ingest data and images.")
    parser.add_argument("--delay", type=float, default=1.5, help="Polite crawling delay between requests in seconds.")
    parser.add_argument("--max-items", type=int, default=None, help="Maximum items to process (default: unlimited).")
    parser.add_argument("--existing-catalog", default="public/data/products.json",
                        help="Path to current Meyvan catalog for deduplication.")
    parser.add_argument("--output-dir", default="ingestion_output", help="Directory where output artifacts will be saved.")

    args = parser.parse_args()

    if not args.permission_confirmed:
        print("\n" + "!" * 70)
        print("COMPLIANCE SAFETY CHECK ERROR:")
        print("You must supply the --permission-confirmed flag indicating that you have explicit,")
        print("legal permission from the supplier/content owner to ingest and display their product")
        print("data and images on meyvan.ir.")
        print("!" * 70 + "\n")
        sys.exit(1)

    config = PipelineConfig(DEFAULT_CRAWL_DELAY_SECONDS=args.delay)

    # Select adapter
    if args.api_feed:
        adapter = ApiFeedAdapter(
            base_url=args.source_url,
            feed_endpoint=args.api_feed,
            explicit_permission_confirmed=True,
            config=config
        )
    else:
        adapter = SitemapProductAdapter(
            base_url=args.source_url,
            sitemap_url=args.sitemap_url,
            explicit_permission_confirmed=True,
            config=config
        )

    pipeline = IngestionPipeline(
        adapter=adapter,
        config=config,
        existing_catalog_path=args.existing_catalog,
        output_dir=args.output_dir
    )

    pipeline.run(max_items=args.max_items)


if __name__ == "__main__":
    main()
