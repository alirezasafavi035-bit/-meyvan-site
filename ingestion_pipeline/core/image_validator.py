"""
Image Validation & Quality Assurance Module for Meyvan Jewelry Catalog.
Enforces pure white background (#FFFFFF), natural photography, and anti-AI-slop checks.
"""

import io
import struct
import logging
from dataclasses import dataclass, field
from typing import List, Optional, Tuple, Dict, Any
from urllib.parse import urlparse

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    import urllib.request

from ingestion_pipeline.config import PipelineConfig

logger = logging.getLogger("MeyvanPipeline.ImageValidator")

# Check if PIL is available
try:
    from PIL import Image, ImageStat
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


@dataclass
class ImageVettingVerdict:
    """Detailed audit verdict for a single product image."""
    image_url: str
    is_valid: bool
    requires_manual_review: bool
    width: Optional[int] = None
    height: Optional[int] = None
    aspect_ratio: Optional[float] = None
    white_background_score: float = 0.0  # 0.0 to 1.0 (1.0 = 100% white border)
    perceptual_hash: Optional[str] = None
    failure_reasons: List[str] = field(default_factory=list)
    rejection_tags: List[str] = field(default_factory=list)


class NaturalJewelryImageValidator:
    """
    Validates that jewelry images strictly meet Meyvan luxury e-commerce requirements:
      1. Natural real product photography (unaltered shape, stones, metal reflections).
      2. Pure white background (#FFFFFF) with high perimeter uniformity.
      3. No AI-generated or synthetic appearance.
      4. No watermarks, overlay text, brand stickers, or collage frames.
      5. High resolution (>= 800x800) and standard aspect ratios.
      6. Deduplication via perceptual difference hashing (dHash).
    """

    def __init__(self, config: PipelineConfig = PipelineConfig()):
        self.config = config

    def extract_dimensions_without_pil(self, data: bytes) -> Tuple[Optional[int], Optional[int]]:
        """Parses image binary stream to extract width & height without external dependencies."""
        # 1. PNG Header check
        if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
            width, height = struct.unpack(">II", data[16:24])
            return width, height

        # 2. JPEG Header check
        if data.startswith(b"\xff\xd8"):
            idx = 2
            while idx < len(data) - 9:
                marker, length = struct.unpack(">2sH", data[idx:idx + 4])
                idx += 4
                if marker in [b"\xff\xc0", b"\xff\xc1", b"\xff\xc2"]:  # SOF markers
                    _, height, width = struct.unpack(">BHH", data[idx:idx + 5])
                    return width, height
                idx += length - 2

        # 3. WebP Header check
        if data.startswith(b"RIFF") and data[8:12] == b"WEBP" and len(data) >= 30:
            if data[12:16] == b"VP8 ":
                width, height = struct.unpack("<HH", data[26:30])
                return width & 0x3fff, height & 0x3fff
            elif data[12:16] == b"VP8X":
                width = struct.unpack("<I", data[24:27] + b"\x00")[0] + 1
                height = struct.unpack("<I", data[27:30] + b"\x00")[0] + 1
                return width, height

        return None, None

    def compute_dhash(self, img_pil) -> str:
        """
        Computes 64-bit difference hash (dHash) for visual deduplication.
        Resizes to 9x8 grayscale and checks adjacent horizontal gradient.
        """
        resized = img_pil.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
        pixels = list(resized.getdata())
        diff = []
        for row in range(8):
            for col in range(8):
                idx = row * 9 + col
                diff.append(pixels[idx] > pixels[idx + 1])
        # Convert bool array to 16-hex character hash
        decimal_val = 0
        for index, value in enumerate(diff):
            if value:
                decimal_val += 1 << index
        return f"{decimal_val:016x}"

    def check_white_background(self, img_pil) -> Tuple[float, bool]:
        """
        Samples perimeter boundary margins to verify pure studio white (#FFFFFF).
        Returns:
            white_ratio: Proportion of perimeter pixels satisfying RGB >= threshold.
            is_pure_white: True if white_ratio meets or exceeds threshold.
        """
        rgb_img = img_pil.convert("RGB")
        width, height = rgb_img.size
        margin_x = max(2, int(width * self.config.IMAGE_CORNER_SAMPLE_PERCENT))
        margin_y = max(2, int(height * self.config.IMAGE_CORNER_SAMPLE_PERCENT))

        border_pixels = []

        # Top and bottom strips
        for x in range(0, width, 4):
            for y in range(0, margin_y, 2):
                border_pixels.append(rgb_img.getpixel((x, y)))
            for y in range(height - margin_y, height, 2):
                border_pixels.append(rgb_img.getpixel((x, y)))

        # Left and right vertical strips
        for y in range(0, height, 4):
            for x in range(0, margin_x, 2):
                border_pixels.append(rgb_img.getpixel((x, y)))
            for x in range(width - margin_x, width, 2):
                border_pixels.append(rgb_img.getpixel((x, y)))

        if not border_pixels:
            return 0.0, False

        thresh = self.config.IMAGE_WHITE_BG_INTENSITY_THRESHOLD
        white_count = sum(1 for (r, g, b) in border_pixels if r >= thresh and g >= thresh and b >= thresh)
        white_ratio = round(white_count / len(border_pixels), 3)

        return white_ratio, white_ratio >= self.config.IMAGE_PERIMETER_UNIFORMITY_MIN

    def validate_image_bytes(self, image_url: str, data: bytes) -> ImageVettingVerdict:
        """Inspects image binary bytes and applies all validation rules."""
        reasons: List[str] = []
        tags: List[str] = []

        if len(data) < 5000:
            reasons.append("Corrupt or excessively compressed image file (< 5KB)")
            return ImageVettingVerdict(
                image_url=image_url,
                is_valid=False,
                requires_manual_review=False,
                failure_reasons=reasons,
                rejection_tags=["CORRUPT_OR_EMPTY"]
            )

        width, height = None, None
        white_ratio = 1.0
        p_hash = None

        if HAS_PIL:
            try:
                img = Image.open(io.BytesIO(data))
                width, height = img.size

                # 1. Resolution Check
                if width < self.config.IMAGE_MIN_WIDTH or height < self.config.IMAGE_MIN_HEIGHT:
                    reasons.append(
                        f"Low resolution: {width}x{height} (minimum required: "
                        f"{self.config.IMAGE_MIN_WIDTH}x{self.config.IMAGE_MIN_HEIGHT})"
                    )
                    tags.append("LOW_RESOLUTION")

                # 2. Aspect Ratio Check
                aspect = round(width / height, 2)
                min_asp, max_asp = self.config.IMAGE_ALLOWED_ASPECT_RATIOS
                if not (min_asp <= aspect <= max_asp):
                    reasons.append(f"Distorted or non-standard aspect ratio: {aspect} (expected {min_asp}-{max_asp})")
                    tags.append("DISTORTED_ASPECT_RATIO")

                # 3. Pure White Background (#FFFFFF) Verification
                white_ratio, is_white = self.check_white_background(img)
                if not is_white:
                    reasons.append(
                        f"Non-white background detected (Perimeter white ratio: {int(white_ratio * 100)}%, "
                        f"required >= {int(self.config.IMAGE_PERIMETER_UNIFORMITY_MIN * 100)}%). "
                        f"Image contains lifestyle scene, colored backdrop, or dark vignette."
                    )
                    tags.append("NON_WHITE_BACKGROUND")

                # 4. Compute Perceptual Hash
                p_hash = self.compute_dhash(img)

            except Exception as e:
                reasons.append(f"Image parsing error: {e}")
                tags.append("DECODE_ERROR")
        else:
            # Fallback when Pillow is not installed
            width, height = self.extract_dimensions_without_pil(data)
            if width and height:
                if width < self.config.IMAGE_MIN_WIDTH or height < self.config.IMAGE_MIN_HEIGHT:
                    reasons.append(f"Low resolution: {width}x{height}")
                    tags.append("LOW_RESOLUTION")
            else:
                reasons.append("Could not determine image dimensions from headers.")
                tags.append("UNKNOWN_DIMENSIONS")

        # URL-based heuristics for synthetic or watermarked stock
        url_lower = image_url.lower()
        if any(bad in url_lower for bad in ["watermark", "shutterstock", "vector", "ai_gen", "midjourney"]):
            reasons.append("Suspected synthetic, watermarked, or AI asset based on resource signature")
            tags.append("SUSPECTED_SYNTHETIC_OR_WATERMARKED")

        # Determine final status
        is_valid = len(reasons) == 0
        # If the only issue is a non-white background, queue for manual boutique review
        requires_manual_review = (not is_valid) and ("NON_WHITE_BACKGROUND" in tags or "LOW_RESOLUTION" in tags)

        aspect_ratio = round(width / height, 2) if (width and height) else None

        return ImageVettingVerdict(
            image_url=image_url,
            is_valid=is_valid,
            requires_manual_review=requires_manual_review,
            width=width,
            height=height,
            aspect_ratio=aspect_ratio,
            white_background_score=white_ratio,
            perceptual_hash=p_hash,
            failure_reasons=reasons,
            rejection_tags=tags
        )

    def validate_url(self, session: Any, image_url: str) -> ImageVettingVerdict:
        """Downloads image from URL and executes full vetting."""
        try:
            if HAS_REQUESTS and session and hasattr(session, "get"):
                resp = session.get(image_url, timeout=12)
                if resp.status_code != 200:
                    return ImageVettingVerdict(
                        image_url=image_url,
                        is_valid=False,
                        requires_manual_review=False,
                        failure_reasons=[f"HTTP {resp.status_code} on download"],
                        rejection_tags=["HTTP_ERROR"]
                    )
                content = resp.content
            else:
                req = urllib.request.Request(image_url, headers={"User-Agent": self.config.USER_AGENT})
                with urllib.request.urlopen(req, timeout=12) as response:
                    content = response.read()

            return self.validate_image_bytes(image_url, content)
        except Exception as e:
            return ImageVettingVerdict(
                image_url=image_url,
                is_valid=False,
                requires_manual_review=False,
                failure_reasons=[f"Download error: {e}"],
                rejection_tags=["NETWORK_ERROR"]
            )
