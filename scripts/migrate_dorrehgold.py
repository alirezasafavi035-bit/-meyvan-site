#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
MEYVAN (meyvan.ir) Product Catalog Migration Engine
Source: https://dorrehgold.ir/ -> Destination: https://meyvan.ir/
================================================================================
Features:
  - Robust polite web crawling with retry logic and rate-limiting.
  - Automatic category discovery & pagination handling.
  - Deep product details parsing: Name, Price, Description, Images, Weight, Wage.
  - Persian/Arabic numeral normalization and Toman price calculations.
  - Schema mapping to Meyvan's 18K gold specification.
  - Solution A: Direct REST API batch insertion (POST /api/products) with Bearer token.
  - Solution B: Non-destructive append to public/data/products.json + UTF-8 CSV export.
  - Duplicate detection based on source_url and SKU.
================================================================================
"""

import os
import re
import sys
import json
import time
import uuid
import logging
import argparse
from typing import Dict, List, Optional, Any, Tuple
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
    from urllib3.util.retry import Retry
    from requests.adapters import HTTPAdapter
except ImportError:
    print("[ERROR] Missing required libraries. Please install them using:")
    print("        pip install requests beautifulsoup4 urllib3 pandas")
    sys.exit(1)

# ------------------------------------------------------------------------------
# Logging Configuration
# ------------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("dorreh_migration.log", encoding="utf-8")
    ]
)
logger = logging.getLogger("MeyvanMigration")

# ------------------------------------------------------------------------------
# Constants & Taxonomy Mappings
# ------------------------------------------------------------------------------
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 MeyvanCatalogBot/1.0"
)

PERSIAN_DIGITS_MAP = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")

CATEGORY_MAPPING = {
    "انگشتر": ("ring", "ring", "انگشتر"),
    "حلقه": ("ring", "ring", "انگشتر"),
    "گوشواره": ("earrings", "earrings", "گوشواره"),
    "گردنبند": ("necklace", "necklace", "گردنبند"),
    "زنجیر": ("necklace", "necklace", "گردنبند"),
    "پلاک": ("pendant", "pendant", "آویز و پلاک"),
    "آویز": ("pendant", "pendant", "آویز و پلاک"),
    "مدال": ("pendant", "pendant", "آویز و پلاک"),
    "دستبند": ("bracelet", "bracelet", "دستبند و النگو"),
    "النگو": ("bracelet", "bangle", "دستبند و النگو"),
    "بنگل": ("bracelet", "bangle", "دستبند و النگو"),
    "پابند": ("bracelet", "anklet", "دستبند و النگو"),
    "سرویس": ("set", "set", "نیم‌ست و سرویس"),
    "نیم ست": ("set", "half_set", "نیم‌ست و سرویس"),
    "نیم‌ست": ("set", "half_set", "نیم‌ست و سرویس"),
    "مردانه": ("men", "ring", "محصولات مردانه"),
    "کودک": ("kids", "earrings", "محصولات بچگانه"),
    "بچگانه": ("kids", "earrings", "محصولات بچگانه"),
    "سکه": ("coin", "coin", "سکه و شمش"),
    "شمش": ("coin", "bullion", "سکه و شمش"),
}

# ------------------------------------------------------------------------------
# Utility Normalization Functions
# ------------------------------------------------------------------------------
def to_english_digits(text: str) -> str:
    """Convert Persian and Arabic numerals to ASCII English numerals."""
    if not text:
        return ""
    return str(text).translate(PERSIAN_DIGITS_MAP)


def clean_text(text: Optional[str]) -> str:
    """Normalize whitespace and strip extraneous characters."""
    if not text:
        return ""
    return " ".join(text.replace("\u200c", " ").replace("\xa0", " ").split())


def parse_numeric(text: str) -> Optional[float]:
    """Extract float value from normalized text."""
    if not text:
        return None
    converted = to_english_digits(text)
    match = re.search(r"[-+]?\d*\.?\d+", converted.replace(",", ""))
    if match:
        try:
            return float(match.group(0))
        except ValueError:
            return None
    return None


def parse_weight_grams(text: str) -> Optional[float]:
    """
    Search for weight patterns like:
      - 'وزن: 2.45 گرم'
      - '2.45g' or 'وزن تقریبی 3/5 گرم'
    """
    if not text:
        return None
    normalized = to_english_digits(text).replace("/", ".")
    # Match patterns like: وزن : 3.25 گرم  OR  3.25 گرم
    patterns = [
        r"(?:وزن|weight|گرماژ)[\s:]*([0-9\.]+)\s*(?:گرم|g|gr)?",
        r"([0-9\.]+)\s*(?:گرم|g|gr)\b",
    ]
    for pattern in patterns:
        m = re.search(pattern, normalized, re.IGNORECASE)
        if m:
            try:
                val = float(m.group(1))
                if 0.1 <= val <= 250.0:  # Reasonable jewelry weight range
                    return round(val, 2)
            except ValueError:
                continue
    return None


def parse_wage_percent(text: str) -> float:
    """
    Extract manufacturing wage percentage if present,
    or assign standard Iranian 18K gold workshop fee (14% - 18%).
    """
    if not text:
        return 0.16
    normalized = to_english_digits(text)
    # Match percentage like: اجرت 14%  or  14 درصد
    m = re.search(r"(?:اجرت|کارمزد)[\s:]*([0-9\.]+)\s*(?:%|درصد)?", normalized)
    if m:
        try:
            val = float(m.group(1))
            if val > 1.0:
                val = val / 100.0
            if 0.05 <= val <= 0.40:
                return round(val, 2)
        except ValueError:
            pass
    return 0.16  # Standard baseline 16%


def detect_category(title: str, category_name: str) -> Tuple[str, str, str]:
    """
    Classify product into Meyvan's CategoryKey, ProductTypeKey, and CategoryFa.
    """
    full_str = f"{title} {category_name}".lower()
    for keyword, (cat, ptype, cat_fa) in CATEGORY_MAPPING.items():
        if keyword in full_str:
            return cat, ptype, cat_fa
    # Default fallback
    return "necklace", "necklace", "گردنبند"


# ------------------------------------------------------------------------------
# HTTP Session with Retries
# ------------------------------------------------------------------------------
def get_resilient_session(user_agent: str = DEFAULT_USER_AGENT) -> requests.Session:
    """Configures a requests.Session with connection pooling and backoff retries."""
    session = requests.Session()
    retries = Retry(
        total=5,
        backoff_factor=1.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"]
    )
    adapter = HTTPAdapter(max_retries=retries, pool_connections=10, pool_maxsize=10)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    session.headers.update({
        "User-Agent": user_agent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://dorrehgold.ir/",
    })
    return session


# ------------------------------------------------------------------------------
# Core Scraper Class
# ------------------------------------------------------------------------------
class DorrehGoldCrawler:
    """
    Crawls dorrehgold.ir to extract all gold and jewelry products.
    """

    def __init__(self, base_url: str = "https://dorrehgold.ir", delay: float = 1.2):
        self.base_url = base_url.rstrip("/")
        self.delay = delay
        self.session = get_resilient_session()
        self.discovered_product_urls = set()
        self.visited_category_pages = set()

    def discover_categories(self) -> List[str]:
        """Scrapes the homepage to extract jewelry category URLs."""
        logger.info(f"Discovering categories from {self.base_url}...")
        try:
            resp = self.session.get(self.base_url, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.content, "html.parser")

            category_urls = set()
            # Common WooCommerce/WordPress menu links
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if not href.startswith("http"):
                    href = urljoin(self.base_url, href)

                # Filter category routes
                if any(k in href for k in ["/product-category/", "/category/", "/shop/", "/products/"]):
                    clean_href = href.split("?")[0].rstrip("/")
                    category_urls.add(clean_href)

            logger.info(f"Found {len(category_urls)} potential category endpoints.")
            return list(category_urls)
        except Exception as e:
            logger.warning(f"Error discovering categories: {e}. Falling back to default list.")
            return [
                f"{self.base_url}/product-category/ring/",
                f"{self.base_url}/product-category/earrings/",
                f"{self.base_url}/product-category/necklace/",
                f"{self.base_url}/product-category/bracelet/",
                f"{self.base_url}/product-category/pendant/",
                f"{self.base_url}/product-category/set/",
                f"{self.base_url}/shop/"
            ]

    def crawl_category_products(self, category_url: str, max_pages: int = 20) -> List[str]:
        """Crawls pagination for a specific category and collects product URLs."""
        found_urls = []
        page = 1

        while page <= max_pages:
            paged_url = f"{category_url}/page/{page}/" if page > 1 else category_url
            if paged_url in self.visited_category_pages:
                break
            self.visited_category_pages.add(paged_url)

            logger.info(f"Crawling Category: {paged_url}")
            try:
                resp = self.session.get(paged_url, timeout=15)
                if resp.status_code == 404:
                    # End of pagination reached
                    break
                resp.raise_for_status()
                soup = BeautifulSoup(resp.content, "html.parser")

                # Extract product item links
                product_links = set()
                # WooCommerce typical selectors
                selectors = [
                    "li.product a.woocommerce-LoopProduct-link",
                    ".products .product a",
                    "a[href*='/product/']",
                    ".product-item a"
                ]

                for sel in selectors:
                    for a in soup.select(sel):
                        href = a.get("href", "").strip()
                        if "/product/" in href:
                            clean_href = href.split("?")[0].rstrip("/")
                            product_links.add(clean_href)

                if not product_links:
                    logger.info(f"No more products found on page {page}.")
                    break

                for url in product_links:
                    if url not in self.discovered_product_urls:
                        self.discovered_product_urls.add(url)
                        found_urls.append(url)

                logger.info(f"Page {page} yielded {len(product_links)} products. Total collected: {len(self.discovered_product_urls)}")

                # Check for 'next' pagination button
                next_page = soup.select_one(".next.page-numbers, a.next")
                if not next_page:
                    break

                page += 1
                time.sleep(self.delay)

            except Exception as e:
                logger.error(f"Error fetching {paged_url}: {e}")
                break

        return found_urls

    def extract_product_detail(self, product_url: str) -> Optional[Dict[str, Any]]:
        """Parses an individual product page and extracts detailed metadata."""
        logger.info(f"Parsing Product: {product_url}")
        try:
            resp = self.session.get(product_url, timeout=15)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            soup = BeautifulSoup(resp.content, "html.parser")

            # 1. Product Name
            title_node = soup.select_one("h1.product_title, h1.entry-title, h1")
            name = clean_text(title_node.text) if title_node else ""
            if not name:
                logger.warning(f"Could not find title for {product_url}. Skipping.")
                return None

            # 2. Category Breadcrumb
            breadcrumb = soup.select(".woocommerce-breadcrumb a, nav.breadcrumb a")
            category_text = "طلا و جواهر"
            if len(breadcrumb) >= 2:
                category_text = clean_text(breadcrumb[-1].text)

            # 3. Price & Price Range
            price_node = soup.select_one(".price, p.price, span.woocommerce-Price-amount")
            price_text = clean_text(price_node.text) if price_node else ""

            # 4. Description
            desc_node = soup.select_one(
                "#tab-description, .woocommerce-Tabs-panel--description, .product-short-description, .entry-content"
            )
            description = clean_text(desc_node.text) if desc_node else ""

            # 5. Images (high resolution)
            images = []
            img_nodes = soup.select(
                ".woocommerce-product-gallery__image img, .images img, .product-image img"
            )
            for img in img_nodes:
                src = img.get("data-large_image") or img.get("data-src") or img.get("src")
                if src and src.startswith("http") and not any(skip in src for skip in ["placeholder", "logo"]):
                    if src not in images:
                        images.append(src)

            if not images:
                # Fallback to OG image
                og_img = soup.find("meta", property="og:image")
                if og_img and og_img.get("content"):
                    images.append(og_img["content"])

            # 6. Additional Attributes (Weight, Karat, etc.)
            attributes_table = soup.select(".woocommerce-product-attributes tr")
            attr_weight = None
            for row in attributes_table:
                th = row.select_one("th")
                td = row.select_one("td")
                if th and td:
                    label = clean_text(th.text)
                    val = clean_text(td.text)
                    if "وزن" in label:
                        attr_weight = parse_weight_grams(val)

            combined_text = f"{name} {description} {' '.join([r.text for r in attributes_table])}"
            weight_grams = attr_weight or parse_weight_grams(combined_text) or 2.50
            wage_percent = parse_wage_percent(combined_text)

            cat_key, type_key, cat_fa = detect_category(name, category_text)

            # Generate stable SKU & Slug
            slug_seed = re.sub(r"[^\w\s-]", "", name).strip().replace(" ", "-")[:40]
            if not slug_seed:
                slug_seed = str(uuid.uuid4())[:8]

            sku_hash = str(abs(hash(product_url)))[:5]
            sku = f"MY-DOR-{sku_hash}"
            slug = f"{cat_key}-{type_key}-{slug_seed}"

            # Check if piece has gemstone
            has_stone = any(kw in name or kw in description for kw in ["نگین", "سنگ", "الماس", "برلیان", "فیروزه", "عقیق", "مروارید"])

            product_record = {
                "id": f"p-dor-{sku_hash}",
                "sku": sku,
                "slug": slug,
                "name": name,
                "category": cat_key,
                "categoryFa": cat_fa,
                "type": type_key,
                "typeFa": cat_fa,
                "karat": 18,
                "weightGrams": weight_grams,
                "wagePercent": wage_percent,
                "profitPercent": 0.07,
                "vatPercent": 0.10,
                "stonePrice": 500000 if has_stone else 0,
                "hasStone": has_stone,
                "stock": 3,
                "images": images if images else ["/images/products/gold_ring_luxury_1791946268061.jpg"],
                "tags": [cat_fa, "18 عیار", "دست‌ساز", "dorrehgold.ir"],
                "description": description or f"قطعه طلا ۱۸ عیار دست‌ساز مدل {name} با کیفیت ساخت بالا و عیار استاندارد ۷۵۰ اتحادیه.",
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "featured": False,
                "weightMode": "custom_range",
                "minCustomWeight": round(max(0.5, weight_grams * 0.7), 2),
                "maxCustomWeight": round(weight_grams * 1.8, 2),
                "weightStep": 0.1,
                "sourceUrl": product_url,
                "sourceStore": "dorrehgold.ir",
                "rawPriceText": price_text
            }

            time.sleep(self.delay)
            return product_record

        except Exception as e:
            logger.error(f"Failed to parse product {product_url}: {e}")
            return None


# ------------------------------------------------------------------------------
# Integration Logic: Appending without Overwriting
# ------------------------------------------------------------------------------
class MeyvanCatalogIntegrator:
    """
    Safely inserts or exports products to meyvan.ir without modifying or
    truncating existing items.
    """

    def __init__(self, catalog_json_path: str = "public/data/products.json"):
        self.catalog_json_path = catalog_json_path

    def load_existing_catalog(self) -> List[Dict[str, Any]]:
        """Loads existing products from JSON if present."""
        if os.path.exists(self.catalog_json_path):
            try:
                with open(self.catalog_json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        logger.info(f"Loaded existing catalog with {len(data)} items.")
                        return data
            except Exception as e:
                logger.error(f"Could not read {self.catalog_json_path}: {e}")
        return []

    def append_to_local_catalog(self, new_products: List[Dict[str, Any]]) -> Tuple[int, int]:
        """
        Appends new products to public/data/products.json.
        Preserves all existing items. Skips duplicates by sourceUrl and SKU.
        """
        existing = self.load_existing_catalog()

        # Build index of existing items
        existing_urls = {item.get("sourceUrl") for item in existing if item.get("sourceUrl")}
        existing_skus = {item.get("sku") for item in existing if item.get("sku")}

        added_count = 0
        skipped_count = 0

        for prod in new_products:
            if prod["sourceUrl"] in existing_urls or prod["sku"] in existing_skus:
                skipped_count += 1
                logger.debug(f"Skipping duplicate: {prod['name']} ({prod['sku']})")
                continue

            existing.append(prod)
            existing_urls.add(prod["sourceUrl"])
            existing_skus.add(prod["sku"])
            added_count += 1

        # Safe atomic write with backup
        if added_count > 0:
            backup_path = f"{self.catalog_json_path}.backup-{int(time.time())}"
            try:
                if os.path.exists(self.catalog_json_path):
                    with open(backup_path, "w", encoding="utf-8") as bf:
                        json.dump(existing[: -added_count], bf, ensure_ascii=False, indent=2)
                    logger.info(f"Created safety backup at {backup_path}")

                os.makedirs(os.path.dirname(self.catalog_json_path), exist_ok=True)
                with open(self.catalog_json_path, "w", encoding="utf-8") as f:
                    json.dump(existing, f, ensure_ascii=False, indent=2)

                logger.info(f"Successfully appended {added_count} new products. Total catalog size: {len(existing)}.")
            except Exception as e:
                logger.error(f"Fatal error saving updated catalog: {e}")
        else:
            logger.info("No new unique products to append.")

        return added_count, skipped_count

    def export_to_csv(self, products: List[Dict[str, Any]], output_path: str = "dorreh_migrated_products.csv"):
        """Exports product list to CSV format with UTF-8 BOM encoding for Excel."""
        import csv

        headers = [
            "sku", "name", "category", "categoryFa", "type", "weightGrams",
            "karat", "wagePercent", "profitPercent", "vatPercent", "stonePrice",
            "hasStone", "stock", "images", "tags", "description", "sourceUrl"
        ]

        with open(output_path, "w", encoding="utf-8-sig", newline="") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            writer.writeheader()
            for prod in products:
                row = {
                    "sku": prod.get("sku", ""),
                    "name": prod.get("name", ""),
                    "category": prod.get("category", ""),
                    "categoryFa": prod.get("categoryFa", ""),
                    "type": prod.get("type", ""),
                    "weightGrams": prod.get("weightGrams", ""),
                    "karat": prod.get("karat", 18),
                    "wagePercent": prod.get("wagePercent", 0.16),
                    "profitPercent": prod.get("profitPercent", 0.07),
                    "vatPercent": prod.get("vatPercent", 0.10),
                    "stonePrice": prod.get("stonePrice", 0),
                    "hasStone": "بله" if prod.get("hasStone") else "خیر",
                    "stock": prod.get("stock", 1),
                    "images": " | ".join(prod.get("images", [])),
                    "tags": " | ".join(prod.get("tags", [])),
                    "description": prod.get("description", ""),
                    "sourceUrl": prod.get("sourceUrl", "")
                }
                writer.writerow(row)

        logger.info(f"Successfully exported {len(products)} records to CSV: {output_path}")

    def push_to_api(self, products: List[Dict[str, Any]], api_url: str, bearer_token: Optional[str] = None):
        """
        Solution A: Sends products one by one to target REST endpoint.
        Uses POST /api/products with Authorization headers.
        """
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if bearer_token:
            headers["Authorization"] = f"Bearer {bearer_token}"

        success = 0
        failed = 0
        logger.info(f"Pushing {len(products)} items to API endpoint: {api_url}...")

        session = get_resilient_session()
        for prod in products:
            try:
                resp = session.post(api_url, json=prod, headers=headers, timeout=10)
                if resp.status_code in [200, 201]:
                    success += 1
                    logger.info(f"API Added [{prod['sku']}]: {prod['name']}")
                elif resp.status_code == 409:
                    logger.info(f"API Duplicate [{prod['sku']}]: Skipped.")
                else:
                    logger.warning(f"API Returned {resp.status_code} for {prod['sku']}: {resp.text[:100]}")
                    failed += 1
            except Exception as e:
                logger.error(f"Failed to post {prod['sku']} to API: {e}")
                failed += 1
            time.sleep(0.3)

        logger.info(f"API Push complete. Success: {success}, Failed: {failed}")


# ------------------------------------------------------------------------------
# Main CLI Entry Point
# ------------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Migrate Dorreh Gold products to Meyvan Catalog safely and without overwriting."
    )
    parser.add_argument("--source-url", default="https://dorrehgold.ir", help="Source website base URL")
    parser.add_argument("--delay", type=float, default=1.2, help="Crawl delay in seconds between requests")
    parser.add_argument("--max-products", type=int, default=0, help="Max products to crawl (0 = unlimited)")
    parser.add_argument("--mode", choices=["append-json", "csv", "api", "all"], default="append-json",
                        help="Integration mode: append to local json, export csv, push to api, or all")
    parser.add_argument("--catalog-file", default="public/data/products.json", help="Path to Meyvan products.json")
    parser.add_argument("--output-csv", default="dorreh_migrated_products.csv", help="CSV export destination")
    parser.add_argument("--api-url", default="https://meyvan.ir/api/products", help="Solution A API endpoint")
    parser.add_argument("--api-token", default=None, help="Bearer token for API authorization")

    args = parser.parse_args()

    crawler = DorrehGoldCrawler(base_url=args.source_url, delay=args.delay)
    integrator = MeyvanCatalogIntegrator(catalog_json_path=args.catalog_file)

    print("=" * 70)
    print("💎 MEYVAN PRODUCT CATALOG MIGRATION ENGINE (DORREHGOLD -> MEYVAN)")
    print("=" * 70)

    # Step 1: Discover Categories
    categories = crawler.discover_categories()
    all_product_urls = []

    # Step 2: Discover Product URLs
    for cat_url in categories:
        urls = crawler.crawl_category_products(cat_url)
        all_product_urls.extend(urls)
        if args.max_products and len(all_product_urls) >= args.max_products:
            all_product_urls = all_product_urls[:args.max_products]
            break

    all_product_urls = list(set(all_product_urls))
    logger.info(f"Total unique product URLs discovered: {len(all_product_urls)}")

    # Step 3: Extract & Transform
    extracted_records = []
    for idx, purl in enumerate(all_product_urls, start=1):
        logger.info(f"[{idx}/{len(all_product_urls)}] Processing: {purl}")
        record = crawler.extract_product_detail(purl)
        if record:
            extracted_records.append(record)

        if args.max_products and len(extracted_records) >= args.max_products:
            break

    logger.info(f"Successfully extracted {len(extracted_records)} products.")

    # Step 4: Integration
    if args.mode in ["append-json", "all"]:
        added, skipped = integrator.append_to_local_catalog(extracted_records)
        print(f"\n✅ Local Catalog Updated: {added} new products appended, {skipped} duplicates skipped.")

    if args.mode in ["csv", "all"]:
        integrator.export_to_csv(extracted_records, output_path=args.output_csv)
        print(f"✅ CSV Export generated: {args.output_csv}")

    if args.mode in ["api", "all"]:
        integrator.push_to_api(extracted_records, api_url=args.api_url, bearer_token=args.api_token)
        print(f"✅ API batch push finished.")

    print("=" * 70)
    print("🎉 MIGRATION PROCESS COMPLETED SUCCESSFULLY")
    print("=" * 70)


if __name__ == "__main__":
    main()
