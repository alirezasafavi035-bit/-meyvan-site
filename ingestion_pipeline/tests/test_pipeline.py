"""
Automated Test Suite for Meyvan Gold Jewelry Ingestion Pipeline.
"""

import unittest
from ingestion_pipeline.config import PipelineConfig
from ingestion_pipeline.core.normalizer import ProductNormalizer
from ingestion_pipeline.core.deduplicator import CatalogDeduplicator
from ingestion_pipeline.core.image_validator import NaturalJewelryImageValidator
from ingestion_pipeline.adapters.base_adapter import BaseSourceAdapter, RawProductRecord


class MockAdapter(BaseSourceAdapter):
    """Mock adapter for testing pipeline execution."""
    def discover_product_urls(self):
        return ["https://mock-supplier.ir/product/1", "https://mock-supplier.ir/product/2"]

    def fetch_product(self, url: str):
        if "1" in url:
            return RawProductRecord(
                source_url=url,
                source_website="https://mock-supplier.ir",
                raw_title="گوشواره طلا ۱۸ عیار زنانه ماه و ستاره",
                raw_description="گوشواره میخی ظریف وزن: ۲/۳۵ گرم ساخته شده از طلای استاندارد ۷۵۰ یزد.",
                raw_sku="SUP-101",
                raw_weight_text="۲.۳۵ گرم",
                raw_karat_text="۱۸ عیار",
                raw_price_text="۶۱,۲۵۰,۰۰۰ ریال",
                raw_image_urls=["https://mock-supplier.ir/img/earring1.jpg"]
            )
        else:
            # Incomplete product (missing weight and karat) to test zero-fabrication manual review policy
            return RawProductRecord(
                source_url=url,
                source_website="https://mock-supplier.ir",
                raw_title="انگشتر بدون ذکر وزن",
                raw_description="طرح جدید با نگین فیروزه",
                raw_sku="SUP-102",
                raw_weight_text="",
                raw_karat_text="",
                raw_price_text="۱۰,۰۰۰,۰۰۰ تومان",
                raw_image_urls=["https://mock-supplier.ir/img/ring.jpg"]
            )


class TestPipelineComponents(unittest.TestCase):

    def setUp(self):
        self.config = PipelineConfig()
        self.normalizer = ProductNormalizer(self.config)
        self.deduplicator = CatalogDeduplicator(self.config)
        self.validator = NaturalJewelryImageValidator(self.config)

    def test_persian_digit_and_text_normalization(self):
        text = "طلاي ۱۸ عيار با قيمت ۲۵,۷۹۰,۰۰۰ تومان"
        cleaned = self.normalizer.clean_persian_text(text)
        ascii_digits = self.normalizer.to_ascii_digits(cleaned)
        self.assertIn("طلای", cleaned)  # Arabic Yeh normalized to Persian Yeh
        self.assertIn("25,790,000", ascii_digits)

    def test_karat_normalization(self):
        self.assertEqual(self.normalizer.parse_karat("طلای ۱۸ عیار استاندارد"), 18)
        self.assertEqual(self.normalizer.parse_karat("Purity: 750 / 1000"), 18)
        self.assertEqual(self.normalizer.parse_karat("شمش ۲۴ عیار ۹۹۹.۹"), 24)
        self.assertEqual(self.normalizer.parse_karat("سکه ۲۱ عیار"), 21)
        # Never guess unrecognized values!
        self.assertIsNone(self.normalizer.parse_karat("بدون ذکر عیار"))

    def test_weight_normalization_and_bounds(self):
        # Persian slash decimal
        self.assertEqual(self.normalizer.parse_weight_grams("وزن قطعه: ۲/۴۵ گرم"), 2.45)
        # Standard decimal
        self.assertEqual(self.normalizer.parse_weight_grams("Weight: 12.85g"), 12.85)
        # Out of bounds rejection (< 0.1g or > 350g)
        self.assertIsNone(self.normalizer.parse_weight_grams("وزن: ۰.۰۱ گرم"))
        self.assertIsNone(self.normalizer.parse_weight_grams("وزن: ۶۰۰ گرم"))
        # Missing weight
        self.assertIsNone(self.normalizer.parse_weight_grams("انگشتر زیبا بدون وزن"))

    def test_price_normalization_and_rial_to_toman(self):
        # Toman
        price, curr = self.normalizer.parse_price("۵۹,۱۶۲,۱۷۰ تومان")
        self.assertEqual(price, 59162170)
        self.assertEqual(curr, "TOMAN")

        # Rial conversion (divide by 10)
        price_rial, curr_rial = self.normalizer.parse_price("۶۰۰,۰۰۰,۰۰۰ ریال")
        self.assertEqual(price_rial, 60000000)
        self.assertEqual(curr_rial, "TOMAN")

    def test_zero_fabrication_policy(self):
        """Verifies that missing weights/karat are set to None and added to uncertain fields."""
        raw = RawProductRecord(
            source_url="https://supplier.ir/p/test",
            source_website="https://supplier.ir",
            raw_title="دستبند بدون وزن",
            raw_description="دستبند زنجیری",
            raw_weight_text=None,
            raw_karat_text=None
        )
        normalized, uncertain = self.normalizer.normalize(raw)
        self.assertIsNone(normalized["weightGrams"])
        self.assertIsNone(normalized["karat"])
        self.assertIn("weightGrams", uncertain)
        self.assertIn("karat", uncertain)

    def test_deduplication(self):
        self.deduplicator.seen_skus.add("MY-TEST-001")
        self.deduplicator.seen_urls.add("https://supplier.ir/item-1")

        is_dup_sku, reason_sku = self.deduplicator.check_duplicate("MY-TEST-001", "https://other.ir", "گردنبند")
        self.assertTrue(is_dup_sku)
        self.assertIn("SKU conflict", reason_sku)

        is_dup_url, reason_url = self.deduplicator.check_duplicate("MY-TEST-002", "https://supplier.ir/item-1", "دستبند")
        self.assertTrue(is_dup_url)
        self.assertIn("URL conflict", reason_url)

    def test_permission_compliance_contract(self):
        """Adapter MUST raise PermissionError if permission flag is False."""
        with self.assertRaises(PermissionError):
            MockAdapter(
                base_url="https://unauthorized.ir",
                explicit_permission_confirmed=False
            )

    def test_full_pipeline_orchestration(self):
        """Tests complete pipeline run, verify outputs, and manual review routing."""
        import tempfile
        import os
        from ingestion_pipeline.pipeline import IngestionPipeline

        with tempfile.TemporaryDirectory() as tmpdir:
            adapter = MockAdapter("https://mock-supplier.ir", explicit_permission_confirmed=True)
            pipeline = IngestionPipeline(adapter=adapter, config=self.config, output_dir=tmpdir)
            report = pipeline.run()

            self.assertEqual(report["summary"]["totalProcessed"], 2)
            # Item 2 had no weight/karat, so it must be in the manual review queue
            self.assertEqual(report["manualReviewCount"], 2)  # images couldn't download on mock url + missing fields
            self.assertTrue(os.path.exists(os.path.join(tmpdir, "validation_report.json")))
            self.assertTrue(os.path.exists(os.path.join(tmpdir, "manual_review_queue.json")))


if __name__ == "__main__":
    unittest.main()

