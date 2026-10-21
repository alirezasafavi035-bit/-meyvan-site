"""
XML Sitemap and Product Page Scraping Adapter.
"""

import xml.etree.ElementTree as ET
import re
import logging
from typing import Iterable, List, Optional
from bs4 import BeautifulSoup

from ingestion_pipeline.adapters.base_adapter import BaseSourceAdapter, RawProductRecord

logger = logging.getLogger("MeyvanPipeline.SitemapAdapter")


class SitemapProductAdapter(BaseSourceAdapter):
    """
    Adapter that parses standard supplier XML sitemaps to discover product URLs,
    and extracts structured raw product data.
    """

    def __init__(
        self,
        base_url: str,
        sitemap_url: Optional[str] = None,
        explicit_permission_confirmed: bool = True,
        **kwargs
    ):
        super().__init__(base_url, explicit_permission_confirmed, **kwargs)
        self.sitemap_url = sitemap_url or f"{self.base_url}/sitemap.xml"

    def discover_product_urls(self) -> Iterable[str]:
        """Fetches sitemap and extracts product page URLs."""
        logger.info(f"Discovering product URLs from sitemap: {self.sitemap_url}")
        try:
            resp = self.get_url(self.sitemap_url)
            root = ET.fromstring(resp.content)

            # Support both sitemap index and direct urlset
            namespaces = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}

            # Check if this is a sitemapindex
            sub_sitemaps = root.findall(".//ns:sitemap/ns:loc", namespaces)
            if sub_sitemaps:
                for sub_loc in sub_sitemaps:
                    sub_url = sub_loc.text.strip()
                    if any(term in sub_url.lower() for term in ["product", "shop", "item", "kala"]):
                        logger.info(f"Parsing nested product sitemap: {sub_url}")
                        sub_resp = self.get_url(sub_url)
                        sub_root = ET.fromstring(sub_resp.content)
                        for url_tag in sub_root.findall(".//ns:url/ns:loc", namespaces):
                            val = url_tag.text.strip()
                            if self._is_product_url(val):
                                yield val
            else:
                for url_tag in root.findall(".//ns:url/ns:loc", namespaces):
                    val = url_tag.text.strip()
                    if self._is_product_url(val):
                        yield val
        except Exception as e:
            logger.error(f"Error reading sitemap {self.sitemap_url}: {e}")

    def _is_product_url(self, url: str) -> bool:
        """Filter to select only product detail pages."""
        lower = url.lower()
        return any(part in lower for part in ["/product/", "/p/", "/item/", "/kala-"])

    def fetch_product(self, url: str) -> Optional[RawProductRecord]:
        """Fetches and parses a single product page using BeautifulSoup."""
        try:
            resp = self.get_url(url)
            soup = BeautifulSoup(resp.content, "html.parser")

            # 1. Product Title
            title_node = soup.select_one("h1.product_title, h1.entry-title, h1")
            if not title_node:
                return None
            title = title_node.get_text().strip()

            # 2. SKU
            sku_node = soup.select_one(".sku, [itemprop='sku']")
            raw_sku = sku_node.get_text().strip() if sku_node else None

            # 3. Description
            desc_node = soup.select_one(
                "#tab-description, .woocommerce-product-details__short-description, .product-description, .entry-content"
            )
            raw_desc = desc_node.get_text().strip() if desc_node else ""

            # 4. Images
            images = []
            for img in soup.select(".woocommerce-product-gallery img, .product-images img, img.wp-post-image"):
                src = img.get("data-large_image") or img.get("data-src") or img.get("src")
                if src and src.startswith("http") and src not in images:
                    images.append(src)

            # 5. Attributes / Spec table
            specs = {}
            for row in soup.select("table.shop_attributes tr, .product-attributes tr"):
                th = row.select_one("th")
                td = row.select_one("td")
                if th and td:
                    specs[th.get_text().strip()] = td.get_text().strip()

            # 6. Price
            price_node = soup.select_one(".price, .woocommerce-Price-amount")
            raw_price = price_node.get_text().strip() if price_node else None

            # 7. Category
            crumb = soup.select(".woocommerce-breadcrumb a, nav.breadcrumb a")
            category_text = crumb[-1].get_text().strip() if len(crumb) >= 2 else "طلا و جواهر"

            return RawProductRecord(
                source_url=url,
                source_website=self.base_url,
                raw_title=title,
                raw_description=raw_desc,
                raw_sku=raw_sku,
                raw_category=category_text,
                raw_price_text=raw_price,
                raw_image_urls=images,
                raw_specifications=specs
            )
        except Exception as e:
            logger.error(f"Failed to fetch product at {url}: {e}")
            return None
