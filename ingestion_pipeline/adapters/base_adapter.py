"""
Base Source Adapter Interface and Compliance Contracts.
Supports both 'requests' (when installed) and standard library 'urllib.request' as fallback.
"""

import time
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Iterable
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser

try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    import urllib.request
    import urllib.error

from ingestion_pipeline.config import PipelineConfig

logger = logging.getLogger("MeyvanPipeline.Adapter")


class SimpleResponse:
    """Lightweight response wrapper when requests is not installed."""
    def __init__(self, status_code: int, content: bytes, headers: Optional[dict] = None):
        self.status_code = status_code
        self.content = content
        self.text = content.decode("utf-8", errors="replace")
        self.headers = headers or {}

    def json(self) -> Any:
        return json.loads(self.text)

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception(f"HTTP {self.status_code} Error")


@dataclass
class RawProductRecord:
    """Raw unnormalized product record directly extracted from source feed/page."""
    source_url: str
    source_website: str
    raw_title: str
    raw_description: Optional[str] = None
    raw_sku: Optional[str] = None
    raw_brand: Optional[str] = None
    raw_category: Optional[str] = None
    raw_weight_text: Optional[str] = None
    raw_karat_text: Optional[str] = None
    raw_price_text: Optional[str] = None
    raw_currency: Optional[str] = None
    raw_image_urls: List[str] = field(default_factory=list)
    raw_specifications: Dict[str, Any] = field(default_factory=dict)
    extracted_at: str = field(default_factory=lambda: time.strftime("%Y-%m-%dT%H:%M:%SZ"))


class BaseSourceAdapter(ABC):
    """
    Compliant Abstract Base Class for extracting jewelry product data.
    Enforces robots.txt verification, rate limiting, and explicit authorization.
    """

    def __init__(
        self,
        base_url: str,
        explicit_permission_confirmed: bool,
        config: PipelineConfig = PipelineConfig(),
        respect_robots_txt: bool = True
    ):
        if not explicit_permission_confirmed:
            raise PermissionError(
                "Compliance Violation: Explicit permission to ingest and display supplier "
                "data and images must be legally confirmed before initializing the adapter."
            )

        self.base_url = base_url.rstrip("/")
        self.config = config
        self.explicit_permission_confirmed = explicit_permission_confirmed
        self.respect_robots_txt = respect_robots_txt

        # Setup resilient HTTP session
        self.session = self._init_session()

        # Parse robots.txt
        self.robot_parser: Optional[RobotFileParser] = None
        if self.respect_robots_txt:
            self._init_robots_txt()

        self.last_request_time: float = 0.0

    def _init_session(self) -> Any:
        if HAS_REQUESTS:
            session = requests.Session()
            retries = Retry(
                total=self.config.MAX_RETRIES,
                backoff_factor=1.5,
                status_forcelist=[429, 500, 502, 503, 504],
                allowed_methods=["GET", "HEAD"]
            )
            adapter = HTTPAdapter(max_retries=retries, pool_connections=5, pool_maxsize=5)
            session.mount("http://", adapter)
            session.mount("https://", adapter)
            session.headers.update({
                "User-Agent": self.config.USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8",
                "Accept-Language": "fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7",
            })
            return session
        return None

    def _init_robots_txt(self):
        robots_url = urljoin(self.base_url, "/robots.txt")
        logger.info(f"Checking robots.txt at {robots_url}...")
        self.robot_parser = RobotFileParser()
        self.robot_parser.set_url(robots_url)
        try:
            resp = self._raw_get(robots_url)
            if resp.status_code == 200:
                self.robot_parser.parse(resp.text.splitlines())
                logger.info("Successfully parsed robots.txt.")
            else:
                logger.warning(f"robots.txt returned status {resp.status_code}. Defaulting to polite crawling.")
        except Exception as e:
            logger.warning(f"Could not fetch robots.txt ({e}). Proceeding under standard rate limit.")

    def can_fetch(self, url: str) -> bool:
        """Verifies if the URL is permitted under robots.txt."""
        if not self.respect_robots_txt or not self.robot_parser:
            return True
        allowed = self.robot_parser.can_fetch(self.config.USER_AGENT, url)
        if not allowed:
            logger.warning(f"Robots.txt DISALLOWS crawling url: {url}")
        return allowed

    def _rate_limit(self):
        """Ensures minimum delay between consecutive HTTP requests to avoid server strain."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.config.DEFAULT_CRAWL_DELAY_SECONDS:
            sleep_duration = self.config.DEFAULT_CRAWL_DELAY_SECONDS - elapsed
            time.sleep(sleep_duration)
        self.last_request_time = time.time()

    def _raw_get(self, url: str) -> SimpleResponse:
        """Internal GET executing either requests or urllib."""
        if HAS_REQUESTS and self.session:
            resp = self.session.get(url, timeout=self.config.REQUEST_TIMEOUT_SECONDS)
            return SimpleResponse(resp.status_code, resp.content, dict(resp.headers))
        else:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": self.config.USER_AGENT}
            )
            try:
                with urllib.request.urlopen(req, timeout=self.config.REQUEST_TIMEOUT_SECONDS) as response:
                    return SimpleResponse(response.getcode(), response.read(), dict(response.headers))
            except urllib.error.HTTPError as e:
                return SimpleResponse(e.code, e.read(), dict(e.headers))

    def get_url(self, url: str) -> SimpleResponse:
        """
        Compliance-checked HTTP GET wrapper.
        Enforces robots.txt, politeness rate limit, and provenance logging.
        Never bypasses CAPTCHAs or logins.
        """
        if not self.can_fetch(url):
            raise PermissionError(f"Crawl prohibited by robots.txt directive for URL: {url}")

        self._rate_limit()

        t_start = time.time()
        logger.debug(f"Requesting: {url}")
        try:
            resp = self._raw_get(url)
            duration = round(time.time() - t_start, 3)
            logger.info(f"FETCH [{resp.status_code}] {url} ({duration}s)")
            resp.raise_for_status()
            return resp
        except Exception as e:
            logger.error(f"Network error for {url}: {e}")
            raise

    @abstractmethod
    def discover_product_urls(self) -> Iterable[str]:
        """Discovers product URLs from official sitemap, API, or catalog."""
        pass

    @abstractmethod
    def fetch_product(self, url: str) -> Optional[RawProductRecord]:
        """Fetches and parses a single product into RawProductRecord."""
        pass
