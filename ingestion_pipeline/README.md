# Meyvan Gold Jewelry Ingestion & Compliance Pipeline

> **Production-Grade Data Pipeline for Ingesting Supplier Gold Jewelry Catalogs into meyvan.ir**  
> *Engineered with strict zero-fabrication safety, pure-white (#FFFFFF) studio background vetting, robots.txt compliance, and Iranian Gold Union statutory financial calculations.*

---

## 1. Project Directory Structure

```text
ingestion_pipeline/
├── README.md                           # This document: architecture, compliance, and runbook
├── requirements.txt                    # Python runtime dependencies
├── config.py                           # Central configuration (margins, gold VAT, profit, thresholds)
├── run_pipeline.py                     # CLI entry point with compliance flags
├── pipeline.py                         # Central orchestrator routing accepted vs manual review
├── schemas/
│   ├── meyvan_product_schema.json      # Strict JSON Schema for imported products
│   └── validation_report_schema.json   # JSON Schema for audit reports
├── adapters/
│   ├── base_adapter.py                 # Abstract base class enforcing robots.txt & permission
│   ├── sitemap_adapter.py              # XML sitemap crawler for discovery
│   └── api_feed_adapter.py             # Supplier JSON/REST API feed integration
├── core/
│   ├── normalizer.py                   # Persian digits, weights, karat, price, and taxonomy mapping
│   ├── deduplicator.py                 # Multi-vector deduplication (SKU, URL, title, image dHash)
│   └── image_validator.py              # Studio white (#FFFFFF) background & natural photo vetting
└── tests/
    └── test_pipeline.py                # Automated unit & integration tests
```

---

## 2. Core Compliance & Ethical Standards

1. **robots.txt & Rate Limiting Enforcement:**
   - Every source website's `robots.txt` is fetched and parsed via Python's standard `urllib.robotparser.RobotFileParser` prior to requesting any URL.
   - If `robots.txt` disallows indexing or scraping product routes, the adapter aborts crawling for that path immediately.
   - Built-in crawl delay (`DEFAULT_CRAWL_DELAY_SECONDS = 1.5s`) prevents server strain.
2. **Explicit Legal Permission:**
   - The pipeline cannot run without `--permission-confirmed`. The adapter constructor throws a fatal `PermissionError` if initialized without confirmed supplier licensing.
3. **Zero Anti-Bot Bypassing:**
   - Does not solve CAPTCHAs, bypass login walls, crack paywalls, or spoof malicious browser fingerprints.
4. **Complete Provenance Tracking:**
   - Every single ingested piece retains its original `sourceWebsite`, `sourceUrl`, `extractedAt` timestamp, and original supplier pricing.

---

## 3. Data Normalization & Statutory Gold Tax Formula

All incoming data is mapped into the official `meyvan.ir` catalog format:

- **Gold Karat:** Normalized to standard Iranian hallmarked purities: `18` (750), `21` (875), or `24` (999.9). If purity is ambiguous or missing, it is set to `null` and routed to the manual review queue.
- **Weight in Grams:** Extracted with high-precision regular expressions handling Persian decimal slashes (`۲/۳۵ گرم` $\rightarrow$ `2.35`). Constrained to physical jewelry bounds ($0.05\text{g} \le \text{weight} \le 350.0\text{g}$).
- **Persian Text & Digits:** Persian/Arabic numerals are converted to ASCII (`۱۲۳` $\rightarrow$ `123`). Arabic characters (`ي`, `ك`) are converted to standard Persian characters (`ی`, `ک`).
- **Statutory Pricing & Taxes:**
  - **Raw Gold:** $100\%$ tax-exempt under official Iranian VAT reform.
  - **Seller Profit:** Standard statutory $7\%$ ($0.07$).
  - **Value Added Tax (VAT):** Statutory $10\%$ ($0.10$) computed **strictly on the sum of workshop manufacturing fee and seller profit**.

---

## 4. Image Quality Assurance & White Background Checks

Meyvan accepts **ONLY natural, real product photos with a pure studio white background (#FFFFFF)**:

1. **Perimeter White Ratio:**
   - The validator samples outer boundary margins ($6\%$ perimeter strip on top, bottom, left, and right).
   - At least $90\%$ of border pixels must have RGB values $\ge 248$ (pure studio white).
2. **Rejection & Manual Review Triggers:**
   - **Lifestyle / Colored Backdrops:** Flagged and routed to `manual_review_queue.json`.
   - **Collages, Watermarks & Overlays:** Detected via corner variance and URL heuristics $\rightarrow$ Rejected or queued for manual removal.
   - **Resolution & Aspect Ratio:** Minimum resolution of $800 \times 800\text{px}$; aspect ratios constrained between $0.75$ and $1.35$.
3. **Visual Deduplication:**
   - Computes a 64-bit difference hash (`dHash`) for every approved image to detect duplicate items across multiple supplier listings.
4. **Zero-Generative-AI Rule:**
   - Generative AI is **never** used to synthesize, modify, or inpaint product shapes, stones, or metal colors.

---

## 5. Output Deliverables & Formats

Running the pipeline produces 4 artifacts in `ingestion_output/`:

1. **`accepted_products.json`**: Pristine products ready for immediate import into Meyvan's catalog.
2. **`accepted_products.csv`**: Excel/Admin-ready CSV with UTF-8 BOM encoding for Persian language compatibility.
3. **`manual_review_queue.json`**: Items with missing weights, ambiguous karats, or non-white images requiring human boutique review before publication.
4. **`validation_report.json`**: Full audit report detailing execution metrics, compliance checks, and rejection reasons.

---

## 6. Setup & Execution

### Installation

```bash
# Clone or navigate to the repository
cd ingestion_pipeline

# Install dependencies
pip install -r requirements.txt
```

### Running Automated Tests

```bash
python3 -m unittest tests/test_pipeline.py -v
```

### Ingestion from Supplier Sitemap

```bash
python3 run_pipeline.py \
  --source-url "https://supplier-gold.ir" \
  --sitemap-url "https://supplier-gold.ir/sitemap_products.xml" \
  --permission-confirmed \
  --delay 1.5 \
  --output-dir "ingestion_output"
```

### Ingestion from Supplier JSON/REST API Feed

```bash
python3 run_pipeline.py \
  --source-url "https://supplier-gold.ir" \
  --api-feed "/api/v1/catalog/export" \
  --permission-confirmed \
  --delay 1.0 \
  --output-dir "ingestion_output"
```
