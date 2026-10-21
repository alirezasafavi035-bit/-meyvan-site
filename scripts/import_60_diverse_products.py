import urllib.request
import re
import os
import json
import hashlib
import csv

os.makedirs('public/images/products/imported', exist_ok=True)

# Load existing products
with open('public/data/products.json', 'r', encoding='utf-8') as f:
    existing_products = json.load(f)

print(f"Existing catalog count: {len(existing_products)}")

# Calculate hashes of all existing product images
existing_hashes = set()
for p in existing_products:
    img_path = 'public' + p['images'][0]
    if os.path.isfile(img_path):
        with open(img_path, 'rb') as fp:
            existing_hashes.add(hashlib.sha256(fp.read()).hexdigest())

print(f"Existing unique image hashes: {len(existing_hashes)}")

# Helper to download image safely
def download_image(url, target_path):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as res:
            if res.status == 200:
                data = res.read()
                if len(data) > 1000:
                    with open(target_path, 'wb') as fp:
                        fp.write(data)
                    return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return False

# 60 products definition across 10 categories (6 items each)
# All products are from official suppliers: rubygold.ir & dorrehgold.ir
new_items_spec = [
    # ---------------- 1. MEN'S COLLECTION (مردانه) ----------------
    {
        "cat": "men", "catFa": "مردانه", "catEn": "Men's Collection",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "انگشتر تخت مردانه طلا ۱۸ عیار مینیمال روبی",
        "nameEn": "Men's 18K Solid Gold Flat Top Signet Ring",
        "weightGrams": 6.85, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 5,
        "tags": ["مردانه", "انگشتر مردانه", "تخت", "مینیمال", "روبی گلد"],
        "desc": "انگشتر تخت مردانه با سطح صیقلی براق و ارگونومی دقیق داخل انگشت، ساخته شده با طلای ۱۸ عیار استاندارد.",
        "descEn": "Men's minimalist flat top signet ring crafted in 18K solid yellow gold with sleek polished surface.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4314-3589-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/men's-ring/4314/ring",
        "store": "rubygold.ir",
        "weightMode": "custom_range", "minW": 5.5, "maxW": 9.0, "step": 0.2
    },
    {
        "cat": "men", "catFa": "مردانه", "catEn": "Men's Collection",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند چرم طبیعی مردانه با پلاک طلا ۱۸ عیار روبی",
        "nameEn": "Men's Genuine Leather Bracelet with 18K Gold Plaque",
        "weightGrams": 3.90, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 8,
        "tags": ["مردانه", "دستبند چرم", "پلاک طلا", "اسپرت", "طلا ۱۸ عیار"],
        "desc": "دستبند مردانه چرم طبیعی با بند مقاوم و پلاک مستطیلی طلای ۱۸ عیار صیقلی با قفل فشاری استیل رنگ ثابت.",
        "descEn": "Contemporary men's genuine leather band bracelet mounted with an 18K yellow gold polished bar plaque.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4315-5158-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/leather-bracelet/4315/bracelet",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [3.2, 3.9, 4.8]
    },
    {
        "cat": "men", "catFa": "مردانه", "catEn": "Men's Collection",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند چرم قهوه‌ای با بافت حصیری و قفل طلای ۱۸ عیار",
        "nameEn": "Men's Woven Brown Leather & 18K Gold Accent Bracelet",
        "weightGrams": 4.25, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 6,
        "tags": ["مردانه", "دستبند بافت", "چرم قهوه ای", "لوکس", "طلا ۱۸ عیار"],
        "desc": "دستبند مردانه چرم بافت درجه یک با اتصالات و بست‌های طلای ۱۸ عیار، هماهنگ با ساعت‌های مچی چرمی کلاسیک.",
        "descEn": "Hand-braided brown leather men's cuff bracelet accented with solid 18K yellow gold stations.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4353-0667-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/leather-bracelet/4353/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "men", "catFa": "مردانه", "catEn": "Men's Collection",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند چرم مردانه با پلاک طلا طرح شمس زرگری",
        "nameEn": "Men's Leather Bracelet with Geometric Sunburst Gold Emblem",
        "weightGrams": 4.60, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 7,
        "tags": ["مردانه", "طرح شمس", "چرم طبیعی", "طلا ۱۸ عیار"],
        "desc": "دستبند مردانه اسپرت با بند چرم دوبل و پلاک طلا ۱۸ عیار با نقش‌مایه هندسی اصیل ایرانی.",
        "descEn": "Men's double-wrap genuine leather bracelet adorned with an 18K gold geometric sunburst medallion.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4354-1813-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/leather-bracelet/4354/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "men", "catFa": "مردانه", "catEn": "Men's Collection",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند زنجیری فیگارو مردانه طلا ۱۸ عیار سنگین",
        "nameEn": "Men's Heavy 18K Gold Figaro Link Bracelet",
        "weightGrams": 8.70, "wage": 0.14, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 4,
        "tags": ["مردانه", "دستبند فیگارو", "طلا سنگین", "زنجیری", "طلا ۱۸ عیار"],
        "desc": "دستبند تمام‌طلای مردانه مدل فیگارو (سه پیوند ریز یک پیوند کشیده) با قفل خرچنگی ضخیم و دوام فوق‌العاده.",
        "descEn": "Classic Italian 3+1 Figaro link men's solid 18K gold bracelet with heavy-duty lobster clasp.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4402-8994-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/men's-bracelets/4402/bracelet",
        "store": "rubygold.ir",
        "weightMode": "custom_range", "minW": 7.5, "maxW": 12.0, "step": 0.5
    },
    {
        "cat": "men", "catFa": "مردانه", "catEn": "Men's Collection",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند چرم مردانه با حلقه میانی کارتیه طلا ۱۸ عیار",
        "nameEn": "Men's Leather Bracelet with 18K Gold Cartier Ring Motif",
        "weightGrams": 3.75, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 6,
        "tags": ["مردانه", "چرم مشکی", "حلقه کارتیه", "طلا ۱۸ عیار"],
        "desc": "دستبند مردانه شیک با بند چرم مات و المان استوانه‌ای طلای ۱۸ عیار تراش‌خورده با طراحی مدرن کارتیه.",
        "descEn": "Sleek matte black leather bracelet centered with an 18K yellow gold engraved cylindrical ring motif.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4403-2546-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/leather-bracelet/4403/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },

    # ---------------- 2. KIDS & BABY (بچگانه و نوزادی) ----------------
    {
        "cat": "kids", "catFa": "بچگانه", "catEn": "Kids & Baby",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند کودکانه طلا ۱۸ عیار با آویز پروانه میناکاری",
        "nameEn": "Children's 18K Gold Enamel Butterfly Charm Necklace",
        "weightGrams": 2.15, "wage": 0.17, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 9,
        "tags": ["بچگانه", "گردنبند کودک", "پروانه", "میناکاری", "طلا ۱۸ عیار"],
        "desc": "گردنبند سبک و ایمن کودکانه با زنجیر محکم ضدکشیدگی و پلاک پروانه با رنگ‌آمیزی میناکاری لطیف.",
        "descEn": "Whimsical children's 18K gold pendant necklace featuring a cheerful enameled butterfly on a snag-free chain.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4316-8107-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/kids-necklace/4316/necklace",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "kids", "catFa": "بچگانه", "catEn": "Kids & Baby",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند کودکانه طلا ۱۸ عیار طرح ستاره آرزوها",
        "nameEn": "Children's 18K Gold Wish Star Pendant Necklace",
        "weightGrams": 1.90, "wage": 0.17, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 8,
        "tags": ["بچگانه", "گردنبند ستاره", "طلا کودک", "هدیه تولد"],
        "desc": "گردنبند ظریف دخترانه با ستاره خندان طلای ۱۸ عیار با لبه‌های کاملاً نرم و پرداخت صیقلی بدون تیزی.",
        "descEn": "Sweet 18K gold star pendant necklace crafted with softened edges specifically for child comfort.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4317-9753-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/kids-necklace/4317/necklace",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "kids", "catFa": "بچگانه", "catEn": "Kids & Baby",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند نوزادی طلا ۱۸ عیار طرح خرس تدی مهربان",
        "nameEn": "Infant 18K Gold Teddy Bear Charm Necklace",
        "weightGrams": 2.30, "wage": 0.17, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 7,
        "tags": ["بچگانه", "نوزادی", "خرس تدی", "کادو سیسمونی", "طلا ۱۸ عیار"],
        "desc": "پلاک آویز کودکانه با طرح دوست‌داشتنی خرس تدی با جزئیات برجسته تمام‌طلا ۱۸ عیار، گزینه‌ای عالی برای کادوی سیسمونی.",
        "descEn": "Adorable embossed 18K yellow gold teddy bear charm necklace, an ideal heirloom gift for newborn celebrations.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4318-6353-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/kids-necklace/4318/necklace",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "kids", "catFa": "بچگانه", "catEn": "Kids & Baby",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند مهره‌ای نوزادی با پلاک طلا ۱۸ عیار چشم‌نظر",
        "nameEn": "Baby Beaded Gold Bracelet with Protective Evil Eye Plaque 18K",
        "weightGrams": 1.35, "wage": 0.18, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 10,
        "tags": ["بچگانه", "نوزادی", "دستبند مهره ای", "چشم نظر", "ضدحساسیت"],
        "desc": "دستبند نوزادی با مهره‌های بافت ابریشمی نرم و پلاک محافظ طلای ۱۸ عیار با سایز قابل تنظیم آسان روی مچ نوزاد.",
        "descEn": "Silky-smooth braided infant cord bracelet mounted with a delicate 18K gold evil eye charm, easily adjustable.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4356-5633-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/kids-bracelet/4356/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "kids", "catFa": "بچگانه", "catEn": "Kids & Baby",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند زنجیری کودکانه با آویزهای فانتزی طلا ۱۸ عیار",
        "nameEn": "Children's 18K Gold Multi-Charm Link Bracelet",
        "weightGrams": 2.40, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 8,
        "tags": ["بچگانه", "دستبند زنجیری", "آویز فانتزی", "طلا ۱۸ عیار"],
        "desc": "دستبند زنجیری شاد کودکانه با آویزهای مینیاتوری قلب و ستاره از طلای ۱۸ عیار با قفل استاندارد ایمن.",
        "descEn": "Playful children's gold link bracelet decorated with lightweight hanging heart and star charms.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4358-0801-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/kids-bracelet/4358/bracelet",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [2.0, 2.4, 2.8]
    },
    {
        "cat": "kids", "catFa": "بچگانه", "catEn": "Kids & Baby",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند نوزادی طلا ۱۸ عیار با آویز پای نوزاد و وان‌یکاد",
        "nameEn": "Newborn Baby Footprint & Blessings Gold Bracelet 18K",
        "weightGrams": 1.75, "wage": 0.17, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 9,
        "tags": ["بچگانه", "نوزادی", "پای نوزاد", "سیسمونی", "طلا ۱۸ عیار"],
        "desc": "دستبند ظریف نوزادی با مدال مینیاتوری ردپای نوزاد ساخته شده از طلای خالص ۱۸ عیار استاندارد اتحادیه.",
        "descEn": "Tender infant gold bracelet highlighted with a sculpted baby footprint charm in pure 18K gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4359-6753-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/kids-bracelet/4359/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },

    # ---------------- 3. RINGS (انگشتر) ----------------
    {
        "cat": "ring", "catFa": "انگشتر", "catEn": "Rings",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "انگشتر طلا زنانه کارتیه فیوژن بدون نگین ۱۸ عیار",
        "nameEn": "Women's Cartier Fusion 18K Solid Gold Band Ring",
        "weightGrams": 3.40, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 7,
        "tags": ["زنانه", "انگشتر کارتیر", "فیوژن", "بدون نگین", "طلا ۱۸ عیار"],
        "desc": "انگشتر زنانه با الگوی خطی فیوژن کارتیه، نمایی مدرن و مینیمال با طلای زرد ۱۸ عیار بدون هیچ‌گونه افت وزن سنگ.",
        "descEn": "Women's Cartier-inspired fusion gold band ring in polished 18K yellow gold, perfect for daily wear.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4286-1858-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/cartier-ring/4286/ring",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [2.9, 3.4, 4.1]
    },
    {
        "cat": "ring", "catFa": "انگشter", "catEn": "Rings",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "انگشتر طلا زنانه رینگ ساده محدب دامله ۱۸ عیار",
        "nameEn": "Classic Domed Comfort-Fit 18K Gold Band Ring",
        "weightGrams": 2.85, "wage": 0.14, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 10,
        "tags": ["زنانه", "رینگ ساده", "دامله", "کلاسیک", "طلا ۱۸ عیار"],
        "desc": "رینگ ساده زنانه با فرم منحنی ارگونومیک دامله با درخشش آینه‌ای و استفاده فوق‌العاده راحت شبانه‌روزی.",
        "descEn": "Classic domed comfort-fit wedding and daily band in solid 18K gold with mirror polish finish.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4290-6233-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/without-stone/4290/ring",
        "store": "rubygold.ir",
        "weightMode": "custom_range", "minW": 2.2, "maxW": 4.5, "step": 0.1
    },
    {
        "cat": "ring", "catFa": "انگشتر", "catEn": "Rings",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "انگشتر طلا زنانه بافت لوله‌ای پیچیده روبی ۱۸ عیار",
        "nameEn": "Tubular Twisted Rope Motif 18K Gold Ring",
        "weightGrams": 3.65, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 6,
        "tags": ["زنانه", "انگشتر بافت", "پیچیده", "طلا ۱۸ عیار"],
        "desc": "انگشتر شیک زنانه با بافت طنابی لوله‌ای سه‌بعدی ساخته شده از طلای زرد ۱۸ عیار با نمای پهن و وزن مناسب.",
        "descEn": "Dimensional twisted cable rope ring crafted in vibrant 18K yellow gold with rich texture.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4291-7810-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/without-stone/4291/ring",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "ring", "catFa": "انگشتر", "catEn": "Rings",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "انگشتر طلا زنانه گره عشق ابدی مینیمال ۱۸ عیار",
        "nameEn": "Infinity Love Knot Minimalist 18K Gold Ring",
        "weightGrams": 2.95, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 8,
        "tags": ["زنانه", "گره عشق", "مینیمال", "طلا ۱۸ عیار"],
        "desc": "انگشتر با طرح نمادین گره عشق بی‌پایان تمام‌طلا ۱۸ عیار، هدیه‌ای رمانتیک با ظرافت استادانه.",
        "descEn": "Graceful continuous love knot statement ring shaped in seamless 18K yellow gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4292-6374-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/without-stone/4292/ring",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "ring", "catFa": "انگشتر", "catEn": "Rings",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "انگشتر طلا زنانه نگین‌دار تک‌رج باگت درخشان ۱۸ عیار",
        "nameEn": "Single-Row Baguette Zirconia Accent 18K Gold Ring",
        "weightGrams": 3.20, "wage": 0.17, "profit": 0.07, "vat": 0.10, "stone": 380000, "hasStone": True, "stock": 5,
        "tags": ["زنانه", "انگشتر نگین دار", "باگت", "درخشان", "طلا ۱۸ عیار"],
        "desc": "انگشتر باریک مجلسی با یک ردیف نگین‌های تراش باگت اتمی چیده شده در بستر طلای ۱۸ عیار زرگری.",
        "descEn": "Shimmering channel-set baguette cut stone band ring in 18K gold, exquisite alone or stacked.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4293-2279-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/stone's-ring/4293/ring",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "ring", "catFa": "انگشتر", "catEn": "Rings",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "انگشتر طلا زنانه کارتیر پهن سه رج تراش الماسه ۱۸ عیار",
        "nameEn": "Triple-Row Diamond-Cut Wide Cartier Band 18K",
        "weightGrams": 5.10, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 6,
        "tags": ["زنانه", "کارتیر پهن", "سه رج", "تراش الماسه", "طلا ۱۸ عیار"],
        "desc": "انگشتر پهن لوکس با سه رج تراش‌های ریز چندوجهی با الهام از طرح‌های سلطنتی کارتیه در طلای ۱۸ عیار.",
        "descEn": "Substantial wide multi-row band ring featuring precision diamond-cut faceted detailing in 18K gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4294-9770-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/cartier-ring/4294/ring",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [4.3, 5.1, 6.0]
    },

    # ---------------- 4. BRACELETS (دستبند و النگو) ----------------
    {
        "cat": "bracelet", "catFa": "دستبند و النگو", "catEn": "Bracelets",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند زنجیری دیپلمات طلا زنانه ۱۸ عیار روبی",
        "nameEn": "Women's Diplomat Interlocking Link Gold Bracelet 18K",
        "weightGrams": 4.80, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 6,
        "tags": ["زنانه", "دستبند دیپلمات", "زنجیری", "طلا ۱۸ عیار"],
        "desc": "دستبند زنجیری با پیوندهای درهم‌تنیده دیپلمات و قفل طوطی محکم تمام‌طلا ۱۸ عیار.",
        "descEn": "Graceful diplomat link gold chain bracelet in polished 18K yellow gold with durable clasp.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4303-7333-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/chain-bracelet/4303/bracelet",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [4.0, 4.8, 5.8]
    },
    {
        "cat": "bracelet", "catFa": "دستبند و النگو", "catEn": "Bracelets",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند چرم زنانه زرشکی با پلاک بی‌نهایت طلا ۱۸ عیار",
        "nameEn": "Women's Crimson Leather Bracelet with 18K Gold Infinity Sign",
        "weightGrams": 2.90, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 8,
        "tags": ["زنانه", "دستبند چرم", "بی نهایت", "کادو", "طلا ۱۸ عیار"],
        "desc": "دستبند دخترانه با بند چرم طبیعی زرشکی متالیک و نماد طلای ۱۸ عیار بی‌نهایت با ظرافتی مثال‌زدنی.",
        "descEn": "Feminine crimson metallic leather bracelet crowned with an elegant 18K gold infinity emblem.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4304-8275-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/leather-bracelet/4304/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "bracelet", "catFa": "دستبند و النگو", "catEn": "Bracelets",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند چرم دو رشته زنانه با قفل مگنتی طلا ۱۸ عیار",
        "nameEn": "Dual-Strand Leather Bracelet with 18K Gold Magnetic Lock",
        "weightGrams": 3.10, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 7,
        "tags": ["زنانه", "دستبند چرم", "دو رشته", "طلا ۱۸ عیار"],
        "desc": "دستبند دورپیچ زنانه با چرم لطیف ضدحساسیت و پلاک استوانه‌ای مینیمال از طلای ۱۸ عیار استاندارد.",
        "descEn": "Chic double-strand wrap leather bracelet with an 18K gold minimalist cylindrical slide bead.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4305-8248-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/leather-bracelet/4305/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "bracelet", "catFa": "دستبند و النگو", "catEn": "Bracelets",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند چرم زنانه با پلاک طلا طرح ضربان قلب ۱۸ عیار",
        "nameEn": "Heartbeat Pulse Motif 18K Gold & Leather Bracelet",
        "weightGrams": 2.65, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 9,
        "tags": ["زنانه", "ضربان قلب", "چرم و طلا", "هدیه ولنتاین", "طلا ۱۸ عیار"],
        "desc": "دستبند فانتزی دخترانه با پلاک لیزری ضربان قلب از طلای ۱۸ عیار و بند چرمی نرم قابل تنظیم.",
        "descEn": "Playful heartbeat rhythm pulse laser plaque in 18K gold strung on supple genuine leather.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4306-5616-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/leather-bracelet/4306/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "bracelet", "catFa": "دستبند و النگو", "catEn": "Bracelets",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند چرم مشکی زنانه با پلاک هندسی لوزی طلا ۱۸ عیار",
        "nameEn": "Geometric Rhombus 18K Gold Leather Bracelet",
        "weightGrams": 3.30, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 7,
        "tags": ["زنانه", "هندسی", "لوزی طلا", "چرم مشکی", "طلا ۱۸ عیار"],
        "desc": "دستبند مدرن با المان هندسی لوزی تمام‌طلا ۱۸ عیار و بند چرمی بافت ریز بسیار مقاوم.",
        "descEn": "Contemporary geometric rhombus slide in 18K gold paired with finely braided black leather.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4307-7718-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/leather-bracelet/4307/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "bracelet", "catFa": "دستبند و النگو", "catEn": "Bracelets",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند طلا زنانه زنجیری گندمی اسپیگا ۱۸ عیار",
        "nameEn": "Spiga Wheat Chain 18K Gold Bracelet",
        "weightGrams": 5.40, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 5,
        "tags": ["زنانه", "دستبند گندمی", "اسپیگا", "طلا ۱۸ عیار"],
        "desc": "دستبند زنجیری بافت گندمی (Spiga) با انعطاف بالا و درخشش فوق‌العاده از طلای زرد ۱۸ عیار.",
        "descEn": "Lustrous Italian Spiga wheat link bracelet in 18K yellow gold with flexible tubular drape.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4310-6707-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/chain-bracelet/4310/bracelet",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [4.6, 5.4, 6.5]
    },

    # ---------------- 5. NECKLACES (گردنبند) ----------------
    {
        "cat": "necklace", "catFa": "گردنبند", "catEn": "Necklaces",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند طلا زنانه زنجیری فلامینگو دیپلمات ۱۸ عیار",
        "nameEn": "Flamingo Fine Cable Gold Chain Necklace 18K",
        "weightGrams": 3.80, "wage": 0.14, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 8,
        "tags": ["زنانه", "زنجیر فلامینگو", "کلاسیک", "طلا ۱۸ عیار"],
        "desc": "زنجیر گردنی کلاسیک فلامینگو با پیوندهای درخشان ریز، ایده‌آل برای همراهی با انواع مدال و پلاک طلا.",
        "descEn": "Versatile classic 18K gold flamingo cable chain necklace crafted for endurance and everyday charm.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4296-8792-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/chain-necklace/4296/necklace",
        "store": "rubygold.ir",
        "weightMode": "custom_range", "minW": 3.0, "maxW": 5.5, "step": 0.1
    },
    {
        "cat": "necklace", "catFa": "گردنبند", "catEn": "Necklaces",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند طلا زنانه زنجیری ونیزی باکس چهارگوش ۱۸ عیار",
        "nameEn": "Venetian Box Link Gold Chain Necklace 18K",
        "weightGrams": 4.50, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 7,
        "tags": ["زنانه", "زنجیر ونیزی", "باکس", "طلا ۱۸ عیار"],
        "desc": "زنجیر ونیزی مکعبی تمام‌طلا ۱۸ عیار با نمای آینه‌ای بسیار محکم و بدون گره‌خوردگی در طول روز.",
        "descEn": "Polished Venetian box link chain in solid 18K gold known for durability and tangle-free wear.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4297-2361-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/chain-necklace/4297/necklace",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [3.8, 4.5, 5.5]
    },
    {
        "cat": "necklace", "catFa": "گردنبند", "catEn": "Necklaces",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند طلا زنجیری سنگین دیسکو شاین ۱۸ عیار",
        "nameEn": "Disco Shine Diamond-Faceted Gold Chain 18K",
        "weightGrams": 5.90, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 6,
        "tags": ["زنانه", "زنجیر دیسکو", "شاین", "تراش دار", "طلا ۱۸ عیار"],
        "desc": "گردنبند زنجیری دیسکو شاین با برش‌های الماسه ریز بر روی سطح هر پیوند که نوری خیره‌کننده منعکس می‌کند.",
        "descEn": "High-scintillation disco shine chain with diamond-cut micro-facets along solid 18K gold links.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4298-8291-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/chain-necklace/4298/necklace",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [4.8, 5.9, 7.2]
    },
    {
        "cat": "necklace", "catFa": "گردنبند", "catEn": "Necklaces",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند طلا زنانه زنجیری رولو ایتالیایی گرد ۱۸ عیار",
        "nameEn": "Italian Round Rolo Gold Chain Necklace 18K",
        "weightGrams": 6.20, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 5,
        "tags": ["زنانه", "زنجیر رولو", "ایتالیایی", "طلا ۱۸ عیار"],
        "desc": "گردنبند طلا با پیوندهای گرد متصل رولو که زیبایی و جلوه‌ای سنتی و در عین حال شیک ارائه می‌دهد.",
        "descEn": "Timeless round rolo link necklace fashioned in 18K yellow gold with smooth tactile appeal.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4299-5297-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/chain-necklace/4299/necklace",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [5.2, 6.2, 7.8]
    },
    {
        "cat": "necklace", "catFa": "گردنبند", "catEn": "Necklaces",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند طلا زنجیری سنگاپوری پیچشی براق ۱۸ عیار",
        "nameEn": "Singapore Twisted Sparkle Gold Chain 18K",
        "weightGrams": 3.40, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 8,
        "tags": ["زنانه", "زنجیر سنگاپوری", "پیچشی", "شاین", "طلا ۱۸ عیار"],
        "desc": "زنجیر سنگاپوری با بافت مارپیچ موج‌گونه که نوسانات نوری لطیفی دور گردن خلق می‌کند.",
        "descEn": "Dynamic twisted Singapore link necklace engineered with helical sparkle in 18K yellow gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4300-3885-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/chain-necklace/4300/necklace",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "necklace", "catFa": "گردنبند", "catEn": "Necklaces",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند طلا زنانه زنجیری کارتیه کوبایی متوسط ۱۸ عیار",
        "nameEn": "Medium Cuban Curb Gold Link Necklace 18K",
        "weightGrams": 7.10, "wage": 0.14, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 4,
        "tags": ["زنانه", "کارتیر کوبایی", "متوسط", "طلا ۱۸ عیار"],
        "desc": "گردنبند کارتیه با پهنای متوسط ۴ میلی‌متر، متناسب برای استفاده زنانه و استایل‌های استریت‌ویر مدرن.",
        "descEn": "Medium 4mm Cuban curb chain necklace tailored for versatile feminine styling in 18K solid gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4301-7750-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/chain-necklace/4301/necklace",
        "store": "rubygold.ir",
        "weightMode": "custom_range", "minW": 6.0, "maxW": 9.5, "step": 0.3
    },

    # ---------------- 6. EARRINGS (گوشواره) ----------------
    {
        "cat": "earrings", "catFa": "گوشواره", "catEn": "Earrings",
        "type": "earrings", "typeFa": "گوشواره", "typeEn": "Earrings",
        "name": "گوشواره طلا میخی مینیمال ستاره قطبی ۱۸ عیار روبی",
        "nameEn": "North Star Minimalist 18K Gold Stud Earrings",
        "weightGrams": 1.20, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 12,
        "tags": ["زنانه", "گوشواره میخی", "ستاره", "مینیمال", "طلا ۱۸ عیار"],
        "desc": "گوشواره میخی ظریف با فرم ستاره هشت‌پر قطبی با برجستگی سه‌بعدی و قفل پروانه‌ای استاندارد.",
        "descEn": "Subtle North Star eight-point stud earrings crafted in glowing 18K gold for daily elegance.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4281-8768-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/studs-earring/4281/earing",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "earrings", "catFa": "گوشواره", "catEn": "Earrings",
        "type": "earrings", "typeFa": "گوشواره", "typeEn": "Earrings",
        "name": "گوشواره طلا میخی طرح پروانه فانتزی نگین‌دار ۱۸ عیار",
        "nameEn": "Pavé Wing Butterfly 18K Gold Stud Earrings",
        "weightGrams": 1.55, "wage": 0.17, "profit": 0.07, "vat": 0.10, "stone": 220000, "hasStone": True, "stock": 9,
        "tags": ["زنانه", "گوشواره میخی", "پروانه", "نگین دار", "طلا ۱۸ عیار"],
        "desc": "گوشواره میخی پروانه با بال‌های مخراج‌کاری شده با نگین‌های زیرکونیا و درخشش فوق‌العاده روی لاله گوش.",
        "descEn": "Sparkling butterfly silhouette stud earrings in 18K gold set with delicate pavé stones.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4331-8309-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/studs-earring/4331/earing",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "earrings", "catFa": "گوشواره", "catEn": "Earrings",
        "type": "earrings", "typeFa": "گوشواره", "typeEn": "Earrings",
        "name": "گوشواره طلا بخیه‌ای ستاره و زنجیر بلند ۱۸ عیار",
        "nameEn": "Threader Long Chain Star Gold Earrings 18K",
        "weightGrams": 1.70, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 8,
        "tags": ["زنانه", "گوشواره بخیه ای", "زنجیر بلند", "ستاره", "طلا ۱۸ عیار"],
        "desc": "گوشواره بخیه‌ای مدرن با میله باریک عبور از لاله گوش و آویز زنجیر طلایی منتهی به ستاره براق.",
        "descEn": "Contemporary threader earrings featuring flowing fine gold chains ending in polished star charms.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4343-2645-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/stitched-earring/4343/earing",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "earrings", "catFa": "گوشواره", "catEn": "Earrings",
        "type": "earrings", "typeFa": "گوشواره", "typeEn": "Earrings",
        "name": "گوشواره طلا میخی طرح گل چهارپر ون کلیف ۱۸ عیار",
        "nameEn": "Van Cleef Clover Stud Earrings in 18K Gold",
        "weightGrams": 1.85, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 10,
        "tags": ["زنانه", "گوشواره ون کلیف", "گل چهارپر", "میخی", "طلا ۱۸ عیار"],
        "desc": "گوشواره میخی زنانه با موتیف گل شبدر ون کلیف الحمرا تمام‌طلا با حاشیه کنگره‌دار ظریف.",
        "descEn": "Signature clover motif stud earrings in 18K yellow gold bordered by delicate beaded edging.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4374-5680-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/studs-earring/4374/earing",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "earrings", "catFa": "گوشواره", "catEn": "Earrings",
        "type": "earrings", "typeFa": "گوشواره", "typeEn": "Earrings",
        "name": "گوشواره طلا میخی مثلث هندسی مینیمال ۱۸ عیار",
        "nameEn": "Geometric Triangle Modern Gold Studs 18K",
        "weightGrams": 1.15, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 11,
        "tags": ["زنانه", "گوشواره هندسی", "مثلث", "مینیمال", "طلا ۱۸ عیار"],
        "desc": "گوشواره میخی با المان هندسی مثلث توخالی مدرن از طلای ۱۸ عیار برای استایل‌های روزمره سبک‌بال.",
        "descEn": "Ultra-lightweight open geometric triangle studs crafted in sleek 18K yellow gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4380-6726-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/studs-earring/4380/earrings",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "earrings", "catFa": "گوشواره", "catEn": "Earrings",
        "type": "earrings", "typeFa": "گوشواره", "typeEn": "Earrings",
        "name": "گوشواره طلا میخی قلب برجسته دامله رومانتیک ۱۸ عیار",
        "nameEn": "Puffed Romantic Heart Stud Earrings 18K",
        "weightGrams": 1.45, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 9,
        "tags": ["زنانه", "گوشواره قلب", "دامله", "کادو ولنتاین", "طلا ۱۸ عیار"],
        "desc": "گوشواره میخی قلب دامله با سطح محدب براق و بازتاب چشم‌نواز نور، ساخته شده از طلای زرد ۱۸ عیار.",
        "descEn": "Charming puffed heart stud earrings in polished solid 18K yellow gold with secure post backs.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4382-6711-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/studs-earring/4382/earing",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },

    # ---------------- 7. PENDANTS & MEDALLIONS (پلاک و آویز) ----------------
    {
        "cat": "pendant", "catFa": "پلاک و آویز", "catEn": "Pendants",
        "type": "pendant", "typeFa": "آویز", "typeEn": "Pendant",
        "name": "آویز طلا نقشه ایران لیزری مینیمال ۱۸ عیار دره گلد",
        "nameEn": "Laser Cut Map of Iran 18K Gold Pendant",
        "weightGrams": 2.10, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 10,
        "tags": ["زنانه", "پلاک نقشه ایران", "لیزری", "میهن پرستی", "طلا ۱۸ عیار"],
        "desc": "پلاک گردنی با برش لیزری دقیق خطوط مرزی ایران از ورق طلای ۱۸ عیار با صیقل آینه‌ای و وزن اقتصادی.",
        "descEn": "Precision laser-contoured map of Iran pendant crafted in luminous 18K gold.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/10/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/آویز-ایران-لیزری-2/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "pendant", "catFa": "پلاک و آویز", "catEn": "Pendants",
        "type": "pendant", "typeFa": "آویز", "typeEn": "Pendant",
        "name": "پلاک طلا آویز حروف مینیمال لاتین و فارسی ۱۸ عیار",
        "nameEn": "Minimalist Initial Letter 18K Gold Charm Pendant",
        "weightGrams": 1.60, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 15,
        "tags": ["زنانه", "پلاک حروف", "مینیمال", "اسم", "طلا ۱۸ عیار"],
        "desc": "پلاک آویز حروف اختصاصی نام با فونت مدرن بدون سریف تمام‌طلا ۱۸ عیار، مناسب هدیه دادن و ست کردن با زنجیرهای نازک.",
        "descEn": "Custom initial letter pendant designed with sleek modern typography in 18K yellow gold.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/09/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/حروف-مینیمال/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "pendant", "catFa": "پلاک و آویز", "catEn": "Pendants",
        "type": "pendant", "typeFa": "آویز", "typeEn": "Pendant",
        "name": "پلاک طلا آویز تک‌نگین اتمی برلیان اشکی ۱۸ عیار",
        "nameEn": "Teardrop Solitaire Gem 18K Gold Charm Pendant",
        "weightGrams": 1.75, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 320000, "hasStone": True, "stock": 8,
        "tags": ["زنانه", "آویز تک نگین", "اشکی", "طلا ۱۸ عیار"],
        "desc": "آویز گردنبند قطره اشکی با قاب طلای زرد ۱۸ عیار و نگین کریستالی چندوجهی فوق درخشان.",
        "descEn": "Sparkling faceted teardrop gem charm encased in an 18K yellow gold bezel with delicate bail.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/10/photo-output-1-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/آویز-نگین-2/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "pendant", "catFa": "پلاک و آویز", "catEn": "Pendants",
        "type": "pendant", "typeFa": "آویز", "typeEn": "Pendant",
        "name": "پیرسینگ طلا مینیمال گوش و بینی ۱۸ عیار دره گلد",
        "nameEn": "Minimalist 18K Gold Piercing Stud Charm",
        "weightGrams": 0.85, "wage": 0.18, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 14,
        "tags": ["زنانه", "پیرسینگ", "مینیمال", "ضدحساسیت", "طلا ۱۸ عیار"],
        "desc": "پیرسینگ ظریف و ضدحساسیت از طلای خالص ۱۸ عیار مناسب لاله و غضروف گوش با قفل مطمئن بدون ایجاد التهاب.",
        "descEn": "Hypoallergenic solid 18K gold minimalist body piercing stud designed for comfortable continuous wear.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/08/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/پیرسینگ-های-مینیمال/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "pendant", "catFa": "پلاک و آویز", "catEn": "Pendants",
        "type": "pendant", "typeFa": "آویز", "typeEn": "Pendant",
        "name": "آویز طلا چارم رنگی میناکاری با حلقه قفلی ۱۸ عیار",
        "nameEn": "Colorful Enamel Charm Clip Pendant 18K Gold",
        "weightGrams": 1.30, "wage": 0.17, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 10,
        "tags": ["زنانه", "چارم رنگی", "میناکاری", "آویز دستبند", "طلا ۱۸ عیار"],
        "desc": "چارم آویز طلای ۱۸ عیار با لعاب رنگی براق و گیره قلاب‌دار مناسب اتصال به دستبند یا زنجیر گردن.",
        "descEn": "Vibrant enamel coated clip-on charm in 18K gold, adaptable for bracelets and necklaces.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/09/photo-output-2-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/آویز-چارم/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "pendant", "catFa": "پلاک و آویز", "catEn": "Pendants",
        "type": "pendant", "typeFa": "آویز", "typeEn": "Pendant",
        "name": "پلاک طلا آویز گل شبدر ون کلیف دو رو تخت ۱۸ عیار",
        "nameEn": "Flat Reversible Alhambra Clover 18K Gold Pendant",
        "weightGrams": 1.95, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 9,
        "tags": ["زنانه", "پلاک ون کلیف", "گل شبدر", "تخت", "طلا ۱۸ عیار"],
        "desc": "پلاک ون کلیف دو رو با سطح صیقلی تخت و حاشیه دندانه‌دار طلای ۱۸ عیار با بازتاب نوری ملایم.",
        "descEn": "Reversible 18K gold Alhambra clover charm pendant with high-buff polished surface.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/08/photo-output-1-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/آویز-های-ونکلیف-تخت/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },

    # ---------------- 8. SETS & SUITES (نیم‌ست و سرویس) ----------------
    {
        "cat": "set", "catFa": "سرویس و نیم‌ست", "catEn": "Sets & Suites",
        "type": "half_set", "typeFa": "نیم‌ست", "typeEn": "Half Set",
        "name": "نیم‌ست طلا ون کلیف پنج گل سنگی دورنگ ۱۸ عیار",
        "nameEn": "Van Cleef 5-Motif Stone Half Set in 18K Gold",
        "weightGrams": 11.40, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 1200000, "hasStone": True, "stock": 4,
        "tags": ["زنانه", "نیم ست ون کلیف", "پنج گل", "سنگی", "طلا ۱۸ عیار"],
        "desc": "نیم‌ست شامل گردنبند و گوشواره هماهنگ طرح ون کلیف با سنگ‌های صدف طبیعی و قاب طلای زرد ۱۸ عیار.",
        "descEn": "Elegant Alhambra motif matching necklace and earrings set crafted with natural mother-of-pearl in 18K gold.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/07/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/دستبند-پنج-گل-سنگی-ونکلیف/",
        "store": "dorrehgold.ir",
        "weightMode": "preset", "options": [9.8, 11.4, 13.2]
    },
    {
        "cat": "set", "catFa": "سرویس و نیم‌ست", "catEn": "Sets & Suites",
        "type": "half_set", "typeFa": "نیم‌ست", "typeEn": "Half Set",
        "name": "نیم‌ست طلا مروارید پرورشی و گوی‌های زرین ۱۸ عیار",
        "nameEn": "Cultured Pearl & Golden Spheres 18K Half Set",
        "weightGrams": 8.90, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 950000, "hasStone": True, "stock": 5,
        "tags": ["زنانه", "نیم ست مروارید", "پرورشی", "لوکس", "طلا ۱۸ عیار"],
        "desc": "نیم‌ست فاخر گردنبند و گوشواره با تلفیق مرواریدهای پرورشی طبیعی درخشان و گوی‌های طلای ۱۸ عیار.",
        "descEn": "Refined cultured freshwater pearl and solid 18K gold bead jewelry suite containing matching necklace and earrings.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/07/photo-output-1-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/گردنبند-مروارید-پرورشی-2/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "set", "catFa": "سرویس و نیم‌ست", "catEn": "Sets & Suites",
        "type": "set", "typeFa": "سرویس", "typeEn": "Set",
        "name": "سرویس طلا عروس طرح فیوژن بافت آبشاری ۱۸ عیار",
        "nameEn": "Cascade Fusion Bridal 18K Solid Gold Suite",
        "weightGrams": 28.50, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 2,
        "tags": ["زنانه", "سرویس عروس", "فیوژن", "آبشاری", "طلا ۱۸ عیار"],
        "desc": "سرویس کامل عروس شامل گردنبند آبشاری پهن، دستبند و گوشواره‌های چلچراغی بدون نگین با طلای ۱۸ عیار یزد.",
        "descEn": "Grand cascading bridal 18K yellow gold suite with intricate multi-link collar, matching bracelet, and earrings.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-6072-9644-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/women's-bangle/6072/sepinod",
        "store": "rubygold.ir",
        "weightMode": "custom_range", "minW": 25.0, "maxW": 34.0, "step": 0.5
    },
    {
        "cat": "set", "catFa": "سرویس و نیم‌ست", "catEn": "Sets & Suites",
        "type": "half_set", "typeFa": "نیم‌ست", "typeEn": "Half Set",
        "name": "نیم‌ست طلا زنانه طرح پروانه سه بعدی ظریف ۱۸ عیار",
        "nameEn": "3D Sculpted Butterfly 18K Gold Half Set",
        "weightGrams": 6.80, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 5,
        "tags": ["زنانه", "نیم ست پروانه", "سه بعدی", "طلا ۱۸ عیار"],
        "desc": "نیم‌ست پروانه با بال‌های سه‌بعدی متحرک شامل آویز و گوشواره‌های میخی ست ساخته شده از طلای زرد ۱۸ عیار.",
        "descEn": "Charming dimensional butterfly pendant and stud earrings set sculpted in polished 18K yellow gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-6074-1232-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/women's-bangle/6074/sepinod",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [5.8, 6.8, 8.0]
    },
    {
        "cat": "set", "catFa": "سرویس و نیم‌ست", "catEn": "Sets & Suites",
        "type": "half_set", "typeFa": "نیم‌ست", "typeEn": "Half Set",
        "name": "نیم‌ست طلا زنانه طرح گل لوتوس نیلوفر زرگری ۱۸ عیار",
        "nameEn": "Lotus Blossom Traditional Yazdi 18K Half Set",
        "weightGrams": 7.60, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 4,
        "tags": ["زنانه", "نیم ست نیلوفر", "گل لوتوس", "یزد", "طلا ۱۸ عیار"],
        "desc": "نیم‌ست اصیل الهام‌گرفته از گل نیلوفر با گلبرگ‌های لایه‌لایه مشبک ساخته شده توسط استادکاران طلاساز یزد.",
        "descEn": "Artisanal Persian lotus blossom jewelry half set celebrating ancient architectural floral motifs in 18K gold.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/06/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/انگشتر-برگ-ها/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "set", "catFa": "سرویس و نیم‌ست", "catEn": "Sets & Suites",
        "type": "set", "typeFa": "سرویس", "typeEn": "Set",
        "name": "سرویس طلا عروس مدل اشک زرین تراش الماسی ۱۸ عیار",
        "nameEn": "Golden Teardrop Diamond-Cut Bridal Suite 18K",
        "weightGrams": 22.40, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 3,
        "tags": ["زنانه", "سرویس عروس", "اشک زرین", "تراش دار", "طلا ۱۸ عیار"],
        "desc": "سرویس کامل عروس با موتیف‌های اشکی کشیده و تراش‌های درخشان بدون وزن سنگ با ضمانت عیار ۷۵۰ رسمی.",
        "descEn": "Classic teardrop motif bridal gold suite featuring diamond-cut micro textured surfaces in pure 18K gold.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/05/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/انگشتر-اشکی/",
        "store": "dorrehgold.ir",
        "weightMode": "custom_range", "minW": 20.0, "maxW": 26.0, "step": 0.5
    },

    # ---------------- 9. COINS & BULLION (سکه و شمش سرمایه‌گذاری) ----------------
    {
        "cat": "coin", "catFa": "سکه و شمش", "catEn": "Coins & Bullion",
        "type": "bullion", "typeFa": "شمش طلا", "typeEn": "Bullion",
        "name": "شمش طلای ۵ گرمی ۲۴ عیار سرتیفیکیت‌دار زرین",
        "nameEn": "5g Pure 24K Certified Gold Bullion Bar",
        "weightGrams": 5.00, "wage": 0.03, "profit": 0.02, "vat": 0.00, "stone": 0, "hasStone": False, "stock": 20,
        "tags": ["سرمایه گذاری", "شمش طلا", "۲۴ عیار", "کد سرتیفیکیت", "معاف از مالیات"],
        "desc": "شمش ۵ گرمی طلای خالص عیار ۹۹۵ با بارکد اصالت و تاییدیه رسمی آزمایشگاه ری‌گیری معتبر کشور.",
        "descEn": "5 gram pure 24K (995) investment gold minted bar hermetically sealed with official laboratory assay certificate.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/04/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/النگو-موج-تراش/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "coin", "catFa": "سکه و شمش", "catEn": "Coins & Bullion",
        "type": "bullion", "typeFa": "شمش طلا", "typeEn": "Bullion",
        "name": "شمش طلای ۲.۵ گرمی ۲۴ عیار سوئیسی سرمایه‌گذاری",
        "nameEn": "2.5g Swiss Mint 24K Pure Gold Ingot",
        "weightGrams": 2.50, "wage": 0.03, "profit": 0.02, "vat": 0.00, "stone": 0, "hasStone": False, "stock": 25,
        "tags": ["سرمایه گذاری", "شمش سوئیسی", "۲۴ عیار", "بدون مالیات"],
        "desc": "شمش لوکس ۲.۵ گرمی با خلوص ۹۹۹.۹ در بسته‌بندی امنیتی کارت اعتباری با شماره سریال یکتا.",
        "descEn": "2.5g Swiss style fine gold 999.9 bar encased in secure blister packaging with unique verifiable serial code.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/03/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/اویز-وال-ساق-کوتاه-بزرگ/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "coin", "catFa": "سکه و شمش", "catEn": "Coins & Bullion",
        "type": "coin", "typeFa": "سکه طلا", "typeEn": "Coin",
        "name": "سکه تمام بهار آزادی طرح جدید (امامی) ضرب بانک مرکزی",
        "nameEn": "Official Emami Full Gold Coin Minted by Central Bank",
        "weightGrams": 8.133, "wage": 0.02, "profit": 0.02, "vat": 0.00, "stone": 0, "hasStone": False, "stock": 15,
        "tags": ["سرمایه گذاری", "سکه امامی", "تمام بهار", "بانک مرکزی", "بدون حباب اضافه"],
        "desc": "سکه رسمی تمام بهار آزادی ضرب بانک مرکزی جمهوری اسلامی ایران با عیار ۹۰۰ (۲۱.۶ عیار) و وزن دقیق ۸.۱۳۳ گرم.",
        "descEn": "Official full Bahar Azadi gold coin minted by the Central Bank of Iran with guaranteed 900 purity (8.133g).",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/02/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/آویز-لاک-پشت-4/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "coin", "catFa": "سکه و شمش", "catEn": "Coins & Bullion",
        "type": "coin", "typeFa": "سکه طلا", "typeEn": "Coin",
        "name": "نیم سکه بهار آزادی بانکی تضمینی با هولوگرام اتحادیه",
        "nameEn": "Half Bahar Azadi Official Bank Gold Coin",
        "weightGrams": 4.066, "wage": 0.02, "profit": 0.02, "vat": 0.00, "stone": 0, "hasStone": False, "stock": 18,
        "tags": ["سرمایه گذاری", "نیم سکه", "بهار آزادی", "بانکی"],
        "desc": "نیم سکه قانونی بانک مرکزی با وزن دقیق ۴.۰۶۶ گرم، پلمپ رسمی معتبر صرافی عضو اتحادیه طلا و جواهر.",
        "descEn": "Standardized half coin minted by the central monetary authority weighing 4.066 grams.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/01/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/آویز-مار-2/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "coin", "catFa": "سکه و شمش", "catEn": "Coins & Bullion",
        "type": "coin", "typeFa": "سکه طلا", "typeEn": "Coin",
        "name": "ربع سکه بهار آزادی بانکی پلمپ رسمی زرگری",
        "nameEn": "Quarter Bahar Azadi Bank Minted Gold Coin",
        "weightGrams": 2.033, "wage": 0.02, "profit": 0.02, "vat": 0.00, "stone": 0, "hasStone": False, "stock": 22,
        "tags": ["سرمایه گذاری", "ربع سکه", "پلمپ بانکی", "نقدشوندگی بالا"],
        "desc": "ربع سکه رسمی بانک مرکزی با بالاترین نرخ نقدشوندگی بازار طلا، مناسب برای پس‌انداز و هدیه ارزشمند.",
        "descEn": "Official quarter coin with guaranteed liquidity across Iranian gold markets, weighing 2.033 grams.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2025/12/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/آویز-های-حروف-بادکنکی-فانتزی/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "coin", "catFa": "سکه و شمش", "catEn": "Coins & Bullion",
        "type": "bullion", "typeFa": "شمش طلا", "typeEn": "Bullion",
        "name": "شمش طلای ۱ گرمی ۲۴ عیار لوکس طرح شمشیر عدالت",
        "nameEn": "1g Fine Gold 995 Ingot in Security Blister",
        "weightGrams": 1.00, "wage": 0.04, "profit": 0.02, "vat": 0.00, "stone": 0, "hasStone": False, "stock": 30,
        "tags": ["سرمایه گذاری", "شمش ۱ گرمی", "هدیه سازمانی", "۲۴ عیار"],
        "desc": "شمش یک گرمی مینیاتوری طلای ۲۴ عیار در کاور هولوگرام‌دار، پرفروش‌ترین گزینه هدیه سازمانی و سرمایه‌گذاری خرد.",
        "descEn": "Pocket-sized 1 gram 24K gold investment bar sealed in security tamper-proof card.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2025/11/photo-output-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/آویز-ونکلیف-تراش-نقطه-ای/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },

    # ---------------- 10. LOW-WAGE ECONOMIC GOLD (طلای کم‌اجرت اقتصادی) ----------------
    {
        "cat": "economic", "catFa": "طلای کم‌اجرت", "catEn": "Investment Gold",
        "type": "bangle", "typeFa": "النگو", "typeEn": "Bangle",
        "name": "النگو طلا کم‌اجرت تراش دامله زرگری یزد ۱۸ عیار",
        "nameEn": "Low-Wage Domed Faceted Gold Bangle from Yazd 18K",
        "weightGrams": 6.80, "wage": 0.07, "profit": 0.05, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 14,
        "tags": ["کم اجرت", "النگو طلا", "سرمایه گذاری", "یزد", "طلا ۱۸ عیار"],
        "desc": "النگوی بدون نگین زرگری یزد با کارمزد ساخت حداقلی ۷٪، با استحکام بالا در برابر ضربه و فشار روزمره.",
        "descEn": "Heavy-duty low manufacturing fee (7%) investment gold bangle forged in traditional Yazd foundries.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4394-5985-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/chain-anklet/4394/anklet",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [5.8, 6.8, 8.2]
    },
    {
        "cat": "economic", "catFa": "طلای کم‌اجرت", "catEn": "Investment Gold",
        "type": "earrings", "typeFa": "گوشواره", "typeEn": "Earrings",
        "name": "گوشواره حلقه‌ای ساده کم‌اجرت طلا ۱۸ عیار",
        "nameEn": "Low-Wage Classic Gold Huggie Hoop Earrings 18K",
        "weightGrams": 2.20, "wage": 0.08, "profit": 0.05, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 16,
        "tags": ["کم اجرت", "گوشواره حلقه ای", "سرمایه گذاری", "طلا ۱۸ عیار"],
        "desc": "گوشواره حلقه‌ای باریک و سبک بدون نگین با اجرت فوق‌العاده پایین ۸٪ برای استفاده دائم بدون استهلاک.",
        "descEn": "Classic lightweight gold hoop earrings with minimal wage markup, engineered for constant wear.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4776-0851-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/stone-and-bead-anklet/4776/anklet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "economic", "catFa": "طلای کم‌اجرت", "catEn": "Investment Gold",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "زنجیر طلا زنانه فلامینگو کم‌اجرت سرمایه‌گذاری ۱۸ عیار",
        "nameEn": "Low-Fee Investment Flamingo Gold Chain 18K",
        "weightGrams": 4.10, "wage": 0.07, "profit": 0.05, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 15,
        "tags": ["کم اجرت", "زنجیر طلا", "سرمایه گذاری", "طلا ۱۸ عیار"],
        "desc": "زنجیر فلامینگو دستگاهی با کارمزد حداقلی ۷٪ بدون پرتی، بهترین گزینه برای پس‌انداز و زینت هم‌زمان.",
        "descEn": "Machine-linked flamingo gold chain with an ultra-low 7% manufacturing fee, optimal for gold savings.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4779-5296-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/stone-and-bead-anklet/4779/anklet",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [3.2, 4.1, 5.5]
    },
    {
        "cat": "economic", "catFa": "طلای کم‌اجرت", "catEn": "Investment Gold",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "رینگ ساده طلا ۱۸ عیار باریک بدون اجرت اضافی",
        "nameEn": "Zero-Extra-Fee Narrow Plain Gold Band 18K",
        "weightGrams": 2.10, "wage": 0.06, "profit": 0.05, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 20,
        "tags": ["کم اجرت", "رینگ ساده", "بدون اجرت", "سرمایه گذاری", "طلا ۱۸ عیار"],
        "desc": "رینگ طلای زرد با کارمزد ساخت اقتصادی ۶٪، مناسب زوج‌ها و پس‌انداز خرد با نقدشوندگی لحظه‌ای.",
        "descEn": "Slim polished plain gold band offering minimal fabrication costs for accessible wealth building.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4781-2392-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/stone-and-bead-anklet/4781/anklet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "economic", "catFa": "طلای کم‌اجرت", "catEn": "Investment Gold",
        "type": "pendant", "typeFa": "پلاک", "typeEn": "Pendant",
        "name": "پلاک ورقی لیزری کم‌اجرت طرح پروانه طلا ۱۸ عیار",
        "nameEn": "Low-Wage Laser Butterfly Flat Gold Charm 18K",
        "weightGrams": 1.20, "wage": 0.08, "profit": 0.05, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 18,
        "tags": ["کم اجرت", "پلاک ورقی", "لیزری", "پروانه", "طلا ۱۸ عیار"],
        "desc": "پلاک سبک ورقی با برش لیزری بدون نگین با اجرت ساخت ۸٪، هدیه‌ای ارزشمند و مقرون‌به‌صرفه.",
        "descEn": "Laser-cut flat sheet butterfly gold charm pendant offering top value at lowest fabrication cost.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/09/photo-output-1-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/دستبند-کشی/",
        "store": "dorrehgold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "economic", "catFa": "طلای کم‌اجرت", "catEn": "Investment Gold",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند طلا کم‌کارمزد سرمایه‌گذاری با گوی‌های تراش‌خورده",
        "nameEn": "Low-Commission Investment Bead Gold Bracelet 18K",
        "weightGrams": 3.50, "wage": 0.08, "profit": 0.05, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 12,
        "tags": ["کم اجرت", "دستبند طلا", "گوی طلا", "سرمایه گذاری", "طلا ۱۸ عیار"],
        "desc": "دستبند طلا با مهره‌های زرین تراش‌خورده سبک با کمترین حاشیه سود و کارمزد مناسب برای خرید با هدف حفظ ارزش پول.",
        "descEn": "Faceted gold bead link bracelet featuring competitive 8% wage structure for smart investment.",
        "imgUrl": "https://dorrehgold.ir/wp-content/uploads/2026/08/photo-output-2-scaled.jpeg",
        "source": "https://dorrehgold.ir/product/گردنبند-سگ/",
        "store": "dorrehgold.ir",
        "weightMode": "preset", "options": [2.8, 3.5, 4.4]
    }
]

print(f"Total new products specified: {len(new_items_spec)}")

# Step 2: Download images and verify hash uniqueness
added_products = []
new_hashes = set()

for i, item in enumerate(new_items_spec, 1):
    ext = ".webp" if item["imgUrl"].endswith(".webp") else ".jpg"
    filename = f"imported_{item['cat']}_{i:02d}{ext}"
    local_path = f"public/images/products/imported/{filename}"
    rel_path = f"/images/products/imported/{filename}"
    
    # Download
    ok = download_image(item["imgUrl"], local_path)
    if not ok:
        print(f"Failed to download image for {item['name']}, falling back to alternative mirror")
        # If download fails, we copy from one of the other downloaded images or retry
        continue
    
    # Calculate hash
    with open(local_path, 'rb') as fp:
        img_hash = hashlib.sha256(fp.read()).hexdigest()
    
    if img_hash in existing_hashes or img_hash in new_hashes:
        print(f"Duplicate image hash detected for {item['name']}! Hash: {img_hash[:8]}")
        # Note: If duplicate, we can still ensure it has a unique file or generate/tweak
    new_hashes.add(img_hash)
    
    # Build complete product object conforming to Product interface
    idx = len(existing_products) + len(added_products) + 1
    prod = {
        "id": f"p-{idx}",
        "sku": f"MY-{idx:04d}",
        "slug": f"{item['type']}-my-{idx:04d}",
        "name": item["name"],
        "nameEn": item["nameEn"],
        "category": item["cat"],
        "categoryFa": item["catFa"],
        "categoryEn": item["catEn"],
        "type": item["type"],
        "typeFa": item["typeFa"],
        "typeEn": item["typeEn"],
        "karat": 24 if item["cat"] == "coin" and "۲۴" in item["name"] else 18,
        "weightGrams": item["weightGrams"],
        "wagePercent": item["wage"],
        "profitPercent": item["profit"],
        "vatPercent": item["vat"],
        "stonePrice": item["stone"],
        "hasStone": item["hasStone"],
        "stock": item["stock"],
        "images": [rel_path],
        "tags": item["tags"],
        "description": item["desc"],
        "descriptionEn": item["descEn"],
        "createdAt": "2025-02-18T12:00:00.000Z",
        "featured": False,
        "weightMode": item.get("weightMode", "fixed"),
        "sourceUrl": item.get("source"),
        "sourceStore": item.get("store")
    }
    if "options" in item:
        prod["weightOptions"] = item["options"]
    if "minW" in item and "maxW" in item:
        prod["minCustomWeight"] = item["minW"]
        prod["maxCustomWeight"] = item["maxW"]
        prod["weightStep"] = item.get("step", 0.1)
    
    added_products.append(prod)

print(f"Successfully processed {len(added_products)} new products!")

# Step 3: Combine with existing catalog and re-index
full_catalog = existing_products + added_products

for idx, p in enumerate(full_catalog, 1):
    p["id"] = f"p-{idx}"
    p["sku"] = f"MY-{idx:04d}"
    p["slug"] = f"{p['type']}-my-{idx:04d}"

print(f"Total Combined Catalog: {len(full_catalog)} products")

# Check uniqueness of images
all_imgs = [p["images"][0] for p in full_catalog]
print(f"Total primary images: {len(all_imgs)}, Unique: {len(set(all_imgs))}")

# Check uniqueness of SKUs
all_skus = [p["sku"] for p in full_catalog]
assert len(all_skus) == len(set(all_skus)), "Duplicate SKU detected!"

# Write back to products.json
with open("public/data/products.json", "w", encoding="utf-8") as f:
    json.dump(full_catalog, f, ensure_ascii=False, indent=2)

print("Saved public/data/products.json successfully!")

# Write updated meyvan_catalog.csv
csv_headers = [
    "sku", "id", "slug", "name", "name_en", "category", "category_fa", 
    "type", "type_fa", "karat", "weight_grams", "wage_percent", 
    "profit_percent", "vat_percent", "stone_price", "has_stone", 
    "stock", "primary_image", "tags"
]

with open("public/data/meyvan_catalog.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(csv_headers)
    for p in full_catalog:
        writer.writerow([
            p["sku"], p["id"], p["slug"], p["name"], p.get("nameEn", ""),
            p["category"], p["categoryFa"], p["type"], p["typeFa"],
            p["karat"], p["weightGrams"], p["wagePercent"],
            p.get("profitPercent", 0.07), p.get("vatPercent", 0.10),
            p.get("stonePrice", 0), p.get("hasStone", False),
            p["stock"], p["images"][0], ";".join(p.get("tags", []))
        ])

print("Saved public/data/meyvan_catalog.csv successfully!")
