import urllib.request
import json
import hashlib
import os

with open('public/data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Current products in json: {len(products)}")

existing_hashes = set()
for p in products:
    img_path = 'public' + p['images'][0]
    if os.path.isfile(img_path):
        with open(img_path, 'rb') as fp:
            existing_hashes.add(hashlib.sha256(fp.read()).hexdigest())

def download_image(url, target_path):
    headers = {'User-Agent': 'Mozilla/5.0'}
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
        print(f"Error {url}: {e}")
    return False

extra_10 = [
    {
        "cat": "pendant", "catFa": "پلاک و آویز", "catEn": "Pendants",
        "type": "pendant", "typeFa": "آویز", "typeEn": "Pendant",
        "name": "مدال طلا آویز گل رز برجسته سه بعدی ۱۸ عیار روبی",
        "nameEn": "3D Sculpted Rose Motif 18K Gold Pendant",
        "weightGrams": 2.60, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 9,
        "tags": ["زنانه", "مدال گل رز", "سه بعدی", "طلا ۱۸ عیار", "روبی"],
        "desc": "آویز گردنبند طلا با نقش گل رز مینیاتوری با گلبرگ‌های باز شده سه‌بعدی و سطح ساتن‌مات با طلا ۱۸ عیار.",
        "descEn": "Delicate 3D sculpted blooming rose flower pendant in satin-finish 18K yellow gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4326-7527-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/pendant/4326/pendant",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "necklace", "catFa": "گردنبند", "catEn": "Necklaces",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند طلا زنانه کارتیه با مدال پیچی دوبل ۱۸ عیار",
        "nameEn": "Cartier Double Screw Motif 18K Gold Necklace",
        "weightGrams": 5.40, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 6,
        "tags": ["زنانه", "گردنبند کارتیه", "دوبل", "پیچی", "طلا ۱۸ عیار"],
        "desc": "گردنبند کارتیه با دو حلقه نمادین درهم‌تنیده با زنجیر پیوندی مستحکم از طلای زرد ۱۸ عیار.",
        "descEn": "Signature Cartier double interlocking screw motif pendant on an 18K gold cable link chain.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4329-9991-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/cartier-necklace/4329/necklace",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [4.6, 5.4, 6.5]
    },
    {
        "cat": "necklace", "catFa": "گردنبند", "catEn": "Necklaces",
        "type": "necklace", "typeFa": "گردنبند", "typeEn": "Necklace",
        "name": "گردنبند طلا ون کلیف تک موتیف صدف با زنجیر طلا ۱۸ عیار",
        "nameEn": "Van Cleef Alhambra Single Motif Mother-of-Pearl Necklace 18K",
        "weightGrams": 4.10, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 750000, "hasStone": True, "stock": 7,
        "tags": ["زنانه", "گردنبند ون کلیف", "صدف طبیعی", "طلا ۱۸ عیار"],
        "desc": "گردنبند ون کلیف با تک گل شبدر از صدف طبیعی رنگین‌کمانی و حاشیه گوی‌های طلایی ۱۸ عیار.",
        "descEn": "Luminous Van Cleef single motif Alhambra necklace with natural mother-of-pearl in 18K gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4330-4939-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/vancleef-necklace/4330/necklace",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "ring", "catFa": "انگشتر", "catEn": "Rings",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "انگشتر طلا زنانه کارتیه پیچشی ضخیم ۱۸ عیار روبی",
        "nameEn": "Cartier Bold Screw Accent Band Ring 18K",
        "weightGrams": 4.70, "wage": 0.15, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 8,
        "tags": ["زنانه", "انگشتر کارتیه", "پیچشی", "ضخیم", "طلا ۱۸ عیار"],
        "desc": "انگشتر کارتیه با ضخامت بالا و نقوش مهندسی پیچ با درخشش آینه‌ای و وزن طلای ۱۸ عیار استاندارد.",
        "descEn": "Bold width Cartier-style screw motif band ring forged in solid 18K yellow gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4327-5361-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/cartier-ring/4327/ring",
        "store": "rubygold.ir",
        "weightMode": "custom_range", "minW": 4.0, "maxW": 6.2, "step": 0.2
    },
    {
        "cat": "ring", "catFa": "انگشتر", "catEn": "Rings",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "انگشتر طلا زنانه نگین‌دار طرح موج و تک‌نگین برلیان ۱۸ عیار",
        "nameEn": "Wave Solitaire Accent 18K Gold Ring",
        "weightGrams": 3.10, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 350000, "hasStone": True, "stock": 6,
        "tags": ["زنانه", "انگشتر نگین دار", "موج", "تک نگین", "طلا ۱۸ عیار"],
        "desc": "انگشتر شیک با رکاب فرم موج روان و نگین زیرکونیای تراش برلیان در کانون مرکزی با طلای ۱۸ عیار.",
        "descEn": "Contemporary undulating wave shank ring centered with a brilliant cut round accent gem in 18K gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4335-0421-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/stone's-ring/4335/ring",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "ring", "catFa": "انگشتر", "catEn": "Rings",
        "type": "ring", "typeFa": "انگشتر", "typeEn": "Ring",
        "name": "انگشتر طلا زنانه با نگین مروارید سفید ساوت‌سی ۱۸ عیار",
        "nameEn": "Lustrous South Sea Pearl 18K Gold Solitaire Ring",
        "weightGrams": 3.80, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 850000, "hasStone": True, "stock": 5,
        "tags": ["زنانه", "انگشتر مروارید", "ساوت سی", "لوکس", "طلا ۱۸ عیار"],
        "desc": "انگشتر سلطنتی با مروارید گرد سفید بر بستر رکاب طلای زرد ۱۸ عیار، نمادی از اصالت و وقار زنانه.",
        "descEn": "Graceful solitaire 18K gold ring mounted with a flawless lustrous white pearl orb.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4345-6089-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/stone's-ring/4345/ring",
        "store": "rubygold.ir",
        "weightMode": "preset", "options": [3.2, 3.8, 4.5]
    },
    {
        "cat": "bracelet", "catFa": "دستبند و النگو", "catEn": "Bracelets",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند چرم طوسی طبیعی زنانه با پلاک قلب طلا ۱۸ عیار",
        "nameEn": "Women's Grey Leather Bracelet with 18K Gold Heart Motif",
        "weightGrams": 2.70, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 9,
        "tags": ["زنانه", "دستبند چرم", "چرم طوسی", "پلاک قلب", "طلا ۱۸ عیار"],
        "desc": "دستبند دخترانه با بند چرم ملایم طوسی مات و پلاک قلبی از طلای ۱۸ عیار با قفل ضامن‌دار استیل.",
        "descEn": "Modern matte grey leather bracelet centered with an 18K solid yellow gold heart charm.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4340-6948-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/leather-bracelet/4340/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "bracelet", "catFa": "دستبند و النگو", "catEn": "Bracelets",
        "type": "bracelet", "typeFa": "دستبند", "typeEn": "Bracelet",
        "name": "دستبند مهره‌ای بافت ابریشمی با المان مکعبی طلا ۱۸ عیار",
        "nameEn": "Silken Cord Bracelet with 18K Gold Geometric Cube Beads",
        "weightGrams": 1.90, "wage": 0.17, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 11,
        "tags": ["زنانه", "دستبند مهره ای", "ابریشمی", "مکعب طلا", "طلا ۱۸ عیار"],
        "desc": "دستبند دست‌بافت با نخ ابریشم ضدآب و مکعب‌های طلای ۱۸ عیار تراش خورده با قابلیت تنظیم سایز آسان.",
        "descEn": "Hand-knotted waterproof silk cord bracelet strung with 18K faceted gold cube beads.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4361-2424-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/thread-bracelet/4361/bracelet",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "earrings", "catFa": "گوشواره", "catEn": "Earrings",
        "type": "earrings", "typeFa": "گوشواره", "typeEn": "Earrings",
        "name": "گوشواره طلا میخی برگ زیتون مینیمال ۱۸ عیار روبی",
        "nameEn": "Olive Leaf 18K Gold Minimalist Stud Earrings",
        "weightGrams": 1.35, "wage": 0.16, "profit": 0.07, "vat": 0.10, "stone": 0, "hasStone": False, "stock": 12,
        "tags": ["زنانه", "گوشواره میخی", "برگ زیتون", "مینیمال", "طلا ۱۸ عیار"],
        "desc": "گوشواره میخی ظریف با فرم برگ‌های زیتون نماد صلح با طلای ۱۸ عیار زرد با قفل سوزنی استاندارد.",
        "descEn": "Delicate curved olive leaf stud earrings sculpted in radiant 18K yellow gold with butterfly backs.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4429-9005-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/studs-earring/4429/earing",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    },
    {
        "cat": "earrings", "catFa": "گوشواره", "catEn": "Earrings",
        "type": "earrings", "typeFa": "گوشواره", "typeEn": "Earrings",
        "name": "گوشواره طلا میخی ماه و ستاره نگین‌دار آسمانی ۱۸ عیار",
        "nameEn": "Celestial Moon & Star 18K Gold Stud Earrings",
        "weightGrams": 1.60, "wage": 0.17, "profit": 0.07, "vat": 0.10, "stone": 250000, "hasStone": True, "stock": 10,
        "tags": ["زنانه", "گوشواره ماه و ستاره", "نگین دار", "آسمانی", "طلا ۱۸ عیار"],
        "desc": "گوشواره نامتقارن جذاب با یک لنگه هلال ماه و یک لنگه ستاره نگین‌دار از طلای زرد ۱۸ عیار.",
        "descEn": "Charming mismatched celestial crescent moon and pavé star stud earrings in solid 18K gold.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4430-4565-Size.webp",
        "source": "https://www.rubygold.ir/fa/product/studs-earring/4430/earing",
        "store": "rubygold.ir",
        "weightMode": "fixed"
    }
]

added = []
for i, item in enumerate(extra_10, 51):
    ext = ".webp" if item["imgUrl"].endswith(".webp") else ".jpg"
    filename = f"imported_extra_{item['cat']}_{i:02d}{ext}"
    local_path = f"public/images/products/imported/{filename}"
    rel_path = f"/images/products/imported/{filename}"
    
    ok = download_image(item["imgUrl"], local_path)
    if not ok:
        print(f"Failed extra: {item['name']}")
        continue
    
    with open(local_path, 'rb') as fp:
        img_hash = hashlib.sha256(fp.read()).hexdigest()
    
    if img_hash in existing_hashes:
        print(f"Warning: Hash duplicate in extra {item['name']}")
    existing_hashes.add(img_hash)
    
    idx = len(products) + len(added) + 1
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
        "karat": 18,
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
        "createdAt": "2025-02-19T14:00:00.000Z",
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
    added.append(prod)

print(f"Successfully downloaded and added {len(added)} extra products!")

full_catalog = products + added

for idx, p in enumerate(full_catalog, 1):
    p["id"] = f"p-{idx}"
    p["sku"] = f"MY-{idx:04d}"
    p["slug"] = f"{p['type']}-my-{idx:04d}"

print(f"TOTAL CATALOG: {len(full_catalog)} products (Exactly {len(full_catalog) - 55} newly imported)")

# Verify uniqueness of primary images and SKUs
all_imgs = [p["images"][0] for p in full_catalog]
assert len(all_imgs) == len(set(all_imgs)), f"Duplicate image paths: {len(all_imgs)} vs {len(set(all_imgs))}"

all_skus = [p["sku"] for p in full_catalog]
assert len(all_skus) == len(set(all_skus)), f"Duplicate SKUs: {len(all_skus)} vs {len(set(all_skus))}"

with open("public/data/products.json", "w", encoding="utf-8") as f:
    json.dump(full_catalog, f, ensure_ascii=False, indent=2)

print("Saved public/data/products.json successfully!")

import csv
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
