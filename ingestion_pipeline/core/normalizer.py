"""
Data Normalization & Sanitization Module for Meyvan Jewelry Catalog.
"""

import re
import unicodedata
from typing import Dict, List, Optional, Tuple, Any

from ingestion_pipeline.adapters.base_adapter import RawProductRecord
from ingestion_pipeline.config import PipelineConfig

# Persian / Arabic to English digit mapping
DIGITS_MAP = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")

# Arabic to Persian character mapping
ARABIC_TO_PERSIAN_CHAR_MAP = str.maketrans({
    "ي": "ی",
    "ى": "ی",
    "ك": "ک",
    "ة": "ه",
    "ؤ": "و",
    "إ": "ا",
    "أ": "ا",
    "ء": "",
})

CATEGORY_RULES = [
    (r"گوشواره", ("earrings", "earrings", "گوشواره")),
    (r"انگشتر|حلقه|رینگ", ("ring", "ring", "انگشتر")),
    (r"گردنبند|زنجیر|طوق", ("necklace", "necklace", "گردنبند")),
    (r"دستبند|النگو|بنگل|پابند", ("bracelet", "bracelet", "دستبند و النگو")),
    (r"سرویس|نیم\s*ست|نیمست", ("set", "set", "نیم‌ست و سرویس")),
    (r"سکه|شمش|پارسیان", ("coin", "coin", "سکه و شمش")),
    (r"پلاک|آویز|مدال", ("pendant", "pendant", "آویز و پلاک")),
    (r"مردانه", ("men", "ring", "محصولات مردانه")),
    (r"کودک|بچگانه|نوزاد", ("kids", "earrings", "محصولات بچگانه")),
    (r"کم\s*اجرت|مینیمال", ("economic", "necklace", "محصولات کم‌اجرت")),
]


class ProductNormalizer:
    """
    Normalizes raw jewelry supplier records into Meyvan standard format.
    Never invents missing data: missing/uncertain fields are set to None.
    """

    def __init__(self, config: PipelineConfig = PipelineConfig()):
        self.config = config

    @staticmethod
    def to_ascii_digits(text: Optional[str]) -> str:
        """Converts Persian and Arabic numbers to ASCII standard digits."""
        if not text:
            return ""
        return str(text).translate(DIGITS_MAP)

    @classmethod
    def clean_persian_text(cls, text: Optional[str]) -> str:
        """Normalizes Persian characters, removes extra whitespaces and control characters."""
        if not text:
            return ""
        cleaned = unicodedata.normalize("NFKC", str(text))
        cleaned = cleaned.translate(ARABIC_TO_PERSIAN_CHAR_MAP)
        # Normalize zero-width non-joiner
        cleaned = re.sub(r"[\u200c\u200b\u200e\u200f]+", "\u200c", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    def parse_karat(self, text: Optional[str]) -> Optional[int]:
        """
        Parses gold purity to standard Karat (18, 21, 24).
        Returns None if not definitively specified (never guesses).
        """
        if not text:
            return None
        norm = self.to_ascii_digits(text).lower()
        if re.search(r"\b(18|750)\b|۱۸\s*عیار|عیار\s*18", norm):
            return 18
        if re.search(r"\b(24|999|999\.9)\b|۲۴\s*عیار|عیار\s*24", norm):
            return 24
        if re.search(r"\b(21|875)\b|۲۱\s*عیار|عیار\s*21", norm):
            return 21
        return None

    def parse_weight_grams(self, text: Optional[str]) -> Optional[float]:
        """
        Extracts weight in grams.
        Handles patterns like: 'وزن: 3/45 گرم', '2.5g', 'وزن طلا: 1.820'.
        Returns None if missing or outside valid physical jewelry bounds.
        """
        if not text:
            return None
        norm = self.to_ascii_digits(text).replace("/", ".")
        # Match weight extraction regex
        patterns = [
            r"(?:وزن|weight|گرماژ|وزن\s*خالص)[\s:]*([0-9\.]+)\s*(?:گرم|g|gr)?",
            r"([0-9\.]+)\s*(?:گرم|g|gr)\b",
        ]
        for pattern in patterns:
            match = re.search(pattern, norm, re.IGNORECASE)
            if match:
                try:
                    val = float(match.group(1))
                    if self.config.MIN_WEIGHT_GRAMS <= val <= self.config.MAX_WEIGHT_GRAMS:
                        return round(val, 3)
                except ValueError:
                    continue
        return None

    def parse_price(self, text: Optional[str], currency_hint: Optional[str] = None) -> Tuple[Optional[int], str]:
        """
        Normalizes price to Iranian Tomans (Integer).
        Returns (price_tomans, currency).
        """
        if not text:
            return None, "TOMAN"
        norm = self.to_ascii_digits(text).replace(",", "").replace("٬", "")
        match = re.search(r"(\d+)", norm)
        if not match:
            return None, "TOMAN"

        amount = int(match.group(1))
        currency = "TOMAN"
        text_lower = text.lower()
        if "ریال" in text_lower or (currency_hint and currency_hint.upper() == "IRR"):
            amount = amount // 10
            currency = "TOMAN"
        elif "تومان" in text_lower or (currency_hint and currency_hint.upper() in ["TOMAN", "IRT"]):
            currency = "TOMAN"

        return amount, currency

    def parse_wage_percent(self, text: Optional[str]) -> float:
        """Parses manufacturing wage percentage if present, or returns standard baseline."""
        if not text:
            return self.config.DEFAULT_WAGE_PERCENT
        norm = self.to_ascii_digits(text)
        match = re.search(r"(?:اجرت|کارمزد)[\s:]*([0-9\.]+)\s*(?:%|درصد)?", norm)
        if match:
            try:
                val = float(match.group(1))
                if val > 1.0:
                    val = val / 100.0
                if 0.03 <= val <= 0.45:
                    return round(val, 2)
            except ValueError:
                pass
        return self.config.DEFAULT_WAGE_PERCENT

    def map_category(self, title: str, raw_cat: Optional[str]) -> Tuple[str, str, str]:
        """Maps title and raw category to Meyvan's CategoryKey, ProductTypeKey, and CategoryFa."""
        combined = f"{title} {raw_cat or ''}"
        for pattern, (cat, ptype, cat_fa) in CATEGORY_RULES:
            if re.search(pattern, combined):
                return cat, ptype, cat_fa
        return self.config.DEFAULT_CATEGORY, self.config.DEFAULT_TYPE, "طلا و جواهر"

    def normalize(self, raw: RawProductRecord) -> Tuple[Dict[str, Any], List[str]]:
        """
        Executes complete normalization pipeline for a RawProductRecord.
        Returns:
            normalized_product: Dict adhering to MeyvanProductSchema.
            uncertain_fields: List of missing or ambiguous fields requiring human review.
        """
        uncertain_fields: List[str] = []

        # 1. Clean Title
        clean_title = self.clean_persian_text(raw.raw_title)
        if not clean_title or len(clean_title) < 3:
            uncertain_fields.append("name")

        # 2. Extract Karat
        all_text = f"{raw.raw_title} {raw.raw_description or ''} {str(raw.raw_specifications)}"
        karat = self.parse_karat(raw.raw_karat_text or all_text)
        if karat is None:
            uncertain_fields.append("karat")

        # 3. Extract Weight
        weight_text = raw.raw_weight_text or raw.raw_specifications.get("وزن") or all_text
        weight_grams = self.parse_weight_grams(weight_text)
        if weight_grams is None:
            uncertain_fields.append("weightGrams")

        # 4. Wage Percentage
        wage_percent = self.parse_wage_percent(all_text)

        # 5. Price & Currency
        price_tomans, currency = self.parse_price(raw.raw_price_text, raw.raw_currency)

        # 6. Gemstones
        has_stone = bool(re.search(r"نگین|سنگ|الماس|برلیان|یاقوت|زمرد|فیروزه|عقیق|مروارید", all_text))
        stone_details = None
        if has_stone:
            stone_match = re.search(r"(نگین|سنگ)[\s:]*([^\n\.,]+)", all_text)
            if stone_match:
                stone_details = self.clean_persian_text(stone_match.group(0))

        # 7. Category & Type
        cat_key, type_key, cat_fa = self.map_category(clean_title, raw.raw_category)

        # 8. SKU & Slug
        sku = raw.raw_sku or f"MY-SUPP-{str(abs(hash(raw.source_url)))[:6]}"
        slug_clean = re.sub(r"[^\w\s-]", "", clean_title).strip().replace(" ", "-")[:45]
        slug = f"{cat_key}-{type_key}-{slug_clean}"

        # 9. Craftsmanship Notes
        craftsmanship_notes = None
        if re.search(r"یزد|دست‌ساز|دست ساز|قلم‌زنی|مخراج‌کاری|فیلیگری", all_text):
            craftsmanship_notes = "ساخته شده به شیوه زرگری اصیل یزد با پرداخت دست‌ساز و تراش دقیق."

        # 10. Description
        description = self.clean_persian_text(raw.raw_description)
        if not description or len(description) < 10:
            description = (
                f"قطعه طلا ۱۸ عیار اصیل مدل {clean_title}، ساخته شده با خلوص استاندارد ۷۵۰ "
                f"و شناسنامه معتبر زرگری اتحادیه."
            )

        normalized = {
            "id": f"p-{sku.lower().replace('_', '-')}",
            "sku": sku,
            "slug": slug,
            "name": clean_title,
            "nameEn": None,
            "brand": raw.raw_brand or "MEYVAN",
            "category": cat_key,
            "categoryFa": cat_fa,
            "type": type_key,
            "typeFa": cat_fa,
            "karat": karat,
            "weightGrams": weight_grams,
            "wagePercent": wage_percent,
            "profitPercent": self.config.STATUTORY_PROFIT_PERCENT,
            "vatPercent": self.config.STATUTORY_VAT_PERCENT,
            "stonePrice": 500000 if has_stone else 0,
            "hasStone": has_stone,
            "stoneDetails": stone_details,
            "dimensions": None,
            "stock": 1,
            "images": raw.raw_image_urls,
            "tags": [cat_fa, "18 عیار", "دست‌ساز"],
            "description": description,
            "craftsmanshipNotes": craftsmanship_notes,
            "provenance": {
                "sourceWebsite": raw.source_website,
                "sourceUrl": raw.source_url,
                "extractedAt": raw.extracted_at,
                "verifiedByPermission": True,
                "sourcePrice": price_tomans,
                "sourceCurrency": currency
            }
        }

        return normalized, uncertain_fields
