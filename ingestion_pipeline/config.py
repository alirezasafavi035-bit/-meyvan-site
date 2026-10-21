"""
Configuration module for Meyvan Gold Jewelry Ingestion Pipeline.
"""

from dataclasses import dataclass, field
from typing import List, Tuple

@dataclass(frozen=True)
class PipelineConfig:
    # Gold & Financial Standards (Iranian Gold & Jewelry Union & VAT Reform)
    DEFAULT_KARAT: int = 18  # 750 / 1000 standard
    ALLOWED_KARATS: Tuple[int, ...] = (18, 21, 24)
    STATUTORY_PROFIT_PERCENT: float = 0.07  # 7% standard retailer profit
    STATUTORY_VAT_PERCENT: float = 0.10     # 10% VAT applied strictly on wage + profit
    DEFAULT_WAGE_PERCENT: float = 0.16      # 16% baseline artisanal making fee

    # Weight constraints (Grams)
    MIN_WEIGHT_GRAMS: float = 0.10
    MAX_WEIGHT_GRAMS: float = 350.0

    # Image Quality & White Background Constraints
    # Pure white is RGB(255, 255, 255)
    # Natural photos with pure white studio background must have corner/perimeter pixels very close to 255
    IMAGE_MIN_WIDTH: int = 800
    IMAGE_MIN_HEIGHT: int = 800
    IMAGE_ALLOWED_ASPECT_RATIOS: Tuple[float, float] = (0.75, 1.35)  # e.g. 1:1, 4:5, 3:4
    IMAGE_WHITE_BG_INTENSITY_THRESHOLD: int = 248  # Minimum channel value to be considered white
    IMAGE_CORNER_SAMPLE_PERCENT: float = 0.06      # Outer margin percentage checked for white
    IMAGE_PERIMETER_UNIFORMITY_MIN: float = 0.90   # 90%+ of border pixels must be pure white
    PERCEPTUAL_HASH_HAMMING_THRESHOLD: int = 4     # Threshold for duplicate image detection

    # Crawler Compliance & Politeness
    DEFAULT_CRAWL_DELAY_SECONDS: float = 1.5
    MAX_RETRIES: int = 4
    REQUEST_TIMEOUT_SECONDS: int = 15
    USER_AGENT: str = (
        "MeyvanCatalogIngestion/1.0 (+https://meyvan.ir/catalog-policy; "
        "LicensedSupplierSync; contact: catalog-ops@meyvan.ir)"
    )

    # Categories Mapping
    DEFAULT_CATEGORY: str = "necklace"
    DEFAULT_TYPE: str = "necklace"
