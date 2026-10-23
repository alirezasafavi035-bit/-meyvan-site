import urllib.request
import ssl
import hashlib
import json
import os
import re
import csv
import time
from concurrent.futures import ThreadPoolExecutor

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

os.makedirs('public/images/products/imported', exist_ok=True)

# 1. Load existing products
with open('public/data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Starting catalog size: {len(products)}")

existing_hashes = set()
existing_urls = set()

for p in products:
    if 'sourceUrl' in p and p['sourceUrl']:
        existing_urls.add(p['sourceUrl'])
    for img in p.get('images', []):
        path = 'public' + img
        if os.path.isfile(path):
            with open(path, 'rb') as fp:
                existing_hashes.add(hashlib.sha256(fp.read()).hexdigest())

print(f"Existing unique hashes: {len(existing_hashes)}")

def fetch_sitemap_pairs(sitemap_url):
    req = urllib.request.Request(sitemap_url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=12) as r:
        xml = r.read().decode('utf-8', errors='ignore')
    urls = re.findall(r'<url>(.*?)</url>', xml, re.DOTALL)
    pairs = []
    for u in urls:
        loc = re.search(r'<loc>(.*?)</loc>', u)
        img = re.search(r'<image:loc>(https://[^<]+-Size\.webp)</image:loc>', u)
        if loc and img:
            pairs.append((loc.group(1), img.group(1)))
    return pairs

def fetch_page_and_img(cand):
    page_url, img_url = cand
    try:
        # fetch img
        req_img = urllib.request.Request(img_url, headers=HEADERS)
        with urllib.request.urlopen(req_img, context=ctx, timeout=8) as r:
            img_data = r.read()
        if len(img_data) < 2000:
            return None
            
        # fetch page
        req_page = urllib.request.Request(page_url, headers=HEADERS)
        with urllib.request.urlopen(req_page, context=ctx, timeout=8) as r:
            html = r.read().decode('utf-8', errors='ignore')
            
        title_match = re.search(r'<title>(.*?)</title>', html)
        title = title_match.group(1) if title_match else ''
        
        clean_name = re.sub(r'گالری روبی\s*\|\s*', '', title)
        clean_name = re.sub(r'\s*\|\s*تلفیق درخشش.*$', '', clean_name)
        clean_name = re.sub(r'\s*-\s*روبی گالری.*$', '', clean_name)
        clean_name = re.sub(r'\s*\|\s*مناسب برای.*$', '', clean_name)
        clean_name = re.sub(r'\s*\|\s*روبی.*$', '', clean_name)
        clean_name = re.sub(r'\s*&#8211;.*$', '', clean_name)
        clean_name = clean_name.strip()
        
        weight = 0.0
        wm = re.search(r'class="[^"]*perstiannumber[^"]*"[^>]*>\s*([\d\.]+)\s*</span>', html)
        if wm:
            try:
                weight = float(wm.group(1))
            except:
                pass
                
        return {
            'page_url': page_url,
            'img_url': img_url,
            'img_data': img_data,
            'name': clean_name,
            'weight': weight
        }
    except Exception:
        return None

CATEGORIES_CONFIG = [
    {
        'category': 'men', 'categoryFa': 'مردانه', 'categoryEn': "Men's Collection",
        'type': 'bracelet', 'typeFa': 'دستبند مردانه', 'typeEn': "Men's Bracelet",
        'sitemap': 'https://www.rubygold.ir/men-product.xml', 'wage': 0.16, 'fallbackWeight': 4.5
    },
    {
        'category': 'kids', 'categoryFa': 'کودک و نوزاد', 'categoryEn': "Kids & Baby Collection",
        'type': 'necklace', 'typeFa': 'گردنبند کودک', 'typeEn': 'Kids Necklace',
        'sitemap': 'https://www.rubygold.ir/kids-product.xml', 'wage': 0.18, 'fallbackWeight': 1.6
    },
    {
        'category': 'ring', 'categoryFa': 'انگشتر', 'categoryEn': 'Gold Rings',
        'type': 'ring', 'typeFa': 'انگشتر', 'typeEn': 'Ring',
        'sitemap': 'https://www.rubygold.ir/women-ring-product.xml', 'wage': 0.18, 'fallbackWeight': 3.2
    },
    {
        'category': 'earrings', 'categoryFa': 'گوشواره', 'categoryEn': 'Gold Earrings',
        'type': 'earrings', 'typeFa': 'گوشواره', 'typeEn': 'Earrings',
        'sitemap': 'https://www.rubygold.ir/women-earrings-product.xml', 'wage': 0.18, 'fallbackWeight': 2.4
    },
    {
        'category': 'necklace', 'categoryFa': 'گردنبند', 'categoryEn': 'Gold Necklaces',
        'type': 'necklace', 'typeFa': 'گردنبند', 'typeEn': 'Necklace',
        'sitemap': 'https://www.rubygold.ir/women-necklace-product.xml', 'wage': 0.17, 'fallbackWeight': 4.8
    },
    {
        'category': 'bracelet', 'categoryFa': 'دستبند و النگو', 'categoryEn': 'Gold Bracelets',
        'type': 'bracelet', 'typeFa': 'دستبند', 'typeEn': 'Bracelet',
        'sitemap': 'https://www.rubygold.ir/women-bracelet-product.xml', 'wage': 0.17, 'fallbackWeight': 4.1
    },
    {
        'category': 'pendant', 'categoryFa': 'مدال و آویز', 'categoryEn': 'Pendants & Charms',
        'type': 'pendant', 'typeFa': 'مدال و آویز', 'typeEn': 'Pendant',
        'sitemap': 'https://www.rubygold.ir/women-accessory-product.xml', 'wage': 0.19, 'fallbackWeight': 1.8
    },
    {
        'category': 'set', 'categoryFa': 'سرویس و نیم‌ست', 'categoryEn': 'Jewelry Suites & Sets',
        'type': 'set', 'typeFa': 'نیم‌ست', 'typeEn': 'Half-Set',
        'sitemap': 'https://www.rubygold.ir/women-accessory-product.xml', 'wage': 0.18, 'fallbackWeight': 8.5
    },
    {
        'category': 'economic', 'categoryFa': 'طلای کم‌اجرت و اقتصادی', 'categoryEn': 'Low-Wage Investment Gold',
        'type': 'necklace', 'typeFa': 'زنجیر کم‌اجرت', 'typeEn': 'Low-Wage Chain',
        'sitemap': 'https://www.rubygold.ir/women-necklace-product.xml', 'wage': 0.06, 'fallbackWeight': 3.6
    }
]

added_products = []

print("\n--- Harvesting 5 products per category for 9 jewelry categories (45 products) ---")

for cfg in CATEGORIES_CONFIG:
    cat = cfg['category']
    print(f"\nProcessing category [{cat}]...")
    pairs = fetch_sitemap_pairs(cfg['sitemap'])
    
    # Filter candidates not already used
    candidate_slice = []
    for p_url, i_url in pairs:
        if p_url in existing_urls:
            continue
        if cat == 'set' and ('half-set' not in p_url and 'suite' not in p_url and 'set' not in p_url):
            continue
        if cat == 'economic' and ('chain' not in p_url and 'necklace' not in p_url):
            continue
        candidate_slice.append((p_url, i_url))
        
    print(f"[{cat}] Available unused candidates: {len(candidate_slice)}")
    
    collected_in_cat = []
    chunk_size = 15
    offset = 0
    
    while len(collected_in_cat) < 5 and offset < len(candidate_slice):
        chunk = candidate_slice[offset : offset + chunk_size]
        offset += chunk_size
        
        with ThreadPoolExecutor(max_workers=8) as ex:
            batch = [r for r in ex.map(fetch_page_and_img, chunk) if r]
            
        for item in batch:
            if len(collected_in_cat) >= 5:
                break
                
            img_data = item['img_data']
            h = hashlib.sha256(img_data).hexdigest()
            if h in existing_hashes or item['page_url'] in existing_urls:
                continue
                
            idx = len(collected_in_cat) + 1
            filename = f"imported_b4_{cat}_{idx:02d}.webp"
            local_path = os.path.join('public/images/products/imported', filename)
            web_path = f"/images/products/imported/{filename}"
            
            with open(local_path, 'wb') as fp:
                fp.write(img_data)
                
            existing_hashes.add(h)
            existing_urls.add(item['page_url'])
            
            w = item['weight']
            if w <= 0.2 or w > 60.0:
                w = cfg['fallbackWeight']
                
            name_str = item['name']
            if not name_str or len(name_str) < 4:
                name_str = f"{cfg['typeFa']} طلای ۱۸ عیار"
                
            t_fa = cfg['typeFa']
            t_en = cfg['typeEn']
            if 'انگشتر' in name_str: t_fa = 'انگشتر'; t_en = 'Ring'
            elif 'دستبند' in name_str: t_fa = 'دستبند'; t_en = 'Bracelet'
            elif 'گردنبند' in name_str: t_fa = 'گردنبند'; t_en = 'Necklace'
            elif 'گوشواره' in name_str: t_fa = 'گوشواره'; t_en = 'Earrings'
            elif 'آویز' in name_str or 'پلاک' in name_str: t_fa = 'مدال و آویز'; t_en = 'Pendant'
            elif 'نیم ست' in name_str or 'سرویس' in name_str: t_fa = 'نیم‌ست'; t_en = 'Half-Set'
            
            if cat == 'economic':
                clean_title = f"{name_str} طلای کم‌اجرت اقتصادی ۱۸ عیار"
                clean_desc = f"{name_str} ساخته شده از طلای ۱۸ عیار با اجرت ساخت بسیار پایین ۶ درصد، مناسب پس‌انداز و حفظ ارزش سرمایه."
                en_title = f"Low-Wage Economic 18K Gold {t_en}"
            else:
                clean_title = f"{name_str} طلا ۱۸ عیار میوان"
                clean_desc = f"{name_str} ساخته شده از طلای ۱۸ عیار استاندارد ۷۵۰ با طراحی چشم‌نواز و درخشان زرگری میوان."
                en_title = f"{cfg['categoryEn']} - {t_en} 18K Solid Gold"
                
            prod_obj = {
                "id": f"p-{len(products) + len(added_products) + 1}",
                "sku": f"MY-{(len(products) + len(added_products) + 1):04d}",
                "slug": f"{cfg['type']}-my-{(len(products) + len(added_products) + 1):04d}",
                "name": clean_title,
                "nameEn": en_title,
                "category": cat,
                "categoryFa": cfg['categoryFa'],
                "categoryEn": cfg['categoryEn'],
                "type": cfg['type'],
                "typeFa": t_fa,
                "typeEn": t_en,
                "karat": 18,
                "weightGrams": round(w, 2),
                "wagePercent": cfg['wage'],
                "profitPercent": 0.07,
                "vatPercent": 0.10,
                "stonePrice": 0,
                "hasStone": False,
                "stock": 6 + idx,
                "tags": [cfg['categoryFa'], t_fa, "طلا ۱۸ عیار", "دست ساز", "میوان"],
                "description": clean_desc,
                "descriptionEn": f"Exquisite 18K solid yellow gold {t_en.lower()} with certified purity and artisan polish.",
                "weightMode": "fixed" if w <= 2.0 else "preset",
                "weightOptions": [round(w * 0.85, 2), round(w, 2), round(w * 1.25, 2)] if w > 2.0 else [],
                "images": [web_path],
                "featured": idx == 1,
                "sourceUrl": item['page_url'],
                "sourceStore": "rubygold.ir"
            }
            collected_in_cat.append(prod_obj)
            added_products.append(prod_obj)
            print(f"  [{cat} {idx}/5] {clean_title} ({round(w,2)}g)")
            
    assert len(collected_in_cat) == 5, f"Could not collect 5 items for {cat}"

# 5 Certified Coins & Bullion Products
print("\n--- Adding 5 Certified Investment Gold Coins & Bullion ---")

COIN_SPECS = [
    {
        "name": "سکه پارسیان ۱ گرمی طلا ۱۸ عیار استاندارد با نشان عیارسنجی اتحادیه",
        "nameEn": "Parsian Gold Coin 1.000 Gram 18K Certified with Hologram",
        "weight": 1.000, "karat": 18, "wage": 0.03, "stock": 25,
        "desc": "سکه کادویی و سرمایه‌گذاری پارسیان با وزن دقیق ۱.۰۰۰ گرم طلای ۱۸ عیار استاندارد دارای هولوگرام اطمینان اتحادیه طلا و جواهر.",
        "descEn": "Certified 1.000g 18K Parsian gold medallion with holographic authentication seal.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12505-4642-Size.webp",
        "tags": ["سکه پارسیان", "یک گرمی", "طلا ۱۸ عیار", "اتحادیه طلا", "کادوئی"]
    },
    {
        "name": "سکه پارسیان ۱.۵ گرمی طلا ۱۸ عیار ممتاز سرمایه‌گذاری با پلمپ امنیتی",
        "nameEn": "Parsian Gold Coin 1.500 Grams 18K Certified Security Blister",
        "weight": 1.500, "karat": 18, "wage": 0.03, "stock": 18,
        "desc": "سکه پارسیان با وزن ۱.۵۰۰ گرم طلای ۷۵۰ استاندارد با وکیوم امنیتی برجسته و مناسب هدیه نفیس و پس‌انداز مستمر خانوار.",
        "descEn": "1.500g 18K Parsian gold coin medallion in certified tamper-proof casing.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12507-2282-Size.webp",
        "tags": ["سکه پارسیان", "یک و نیم گرم", "طلا ۱۸ عیار", "سرمایه گذاری"]
    },
    {
        "name": "سکه پارسیان ۲ گرمی طلا ۱۸ عیار اعلا با کد ملی استاندارد اتحادیه",
        "nameEn": "Parsian Gold Coin 2.000 Grams 18K Standard Guild Pack",
        "weight": 2.000, "karat": 18, "wage": 0.03, "stock": 14,
        "desc": "سکه پارسیان ۲ گرمی از شمش طلای ۱۸ عیار با خلوص استاندارد ۷۵۰ و پلمپ امنیتی با تاییدیه اتحادیه کشوری طلا و جواهر.",
        "descEn": "2.000g standard 18K gold Parsian coin sealed with national guild authenticity certificate.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12509-5077-Size.webp",
        "tags": ["سکه پارسیان", "دو گرمی", "طلا ۱۸ عیار", "پلمپ رسمی", "پس انداز"]
    },
    {
        "name": "شمش طلای ۲.۵ گرمی ۲۴ عیار خالص سرمایه‌گذاری با سرتیفیکیت و QR اصالت",
        "nameEn": "2.5 Gram 24K Pure Gold Investment Bullion Bar with QR Assay",
        "weight": 2.500, "karat": 24, "wage": 0.04, "stock": 12,
        "desc": "شمش طلای ۲۴ عیار سوئیسی با خلوص ۹۹۵/۱۰۰۰ به وزن ۲.۵ گرم در بسته‌بندی سرتیفای‌شده با شماره سریال یکتا و کد اعتبارسنجی QR.",
        "descEn": "2.5 gram 24-karat investment grade pure gold minted bullion bar with assay certificate and unique serial code.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12590-1519-Size.webp",
        "tags": ["شمش طلا", "۲۴ عیار", "۲.۵ گرم", "شمش سوئیسی", "سرمایه گذاری طلای ۲۴"]
    },
    {
        "name": "شمش طلای ۱۰ گرمی ۲۴ عیار ممتاز سرمایه‌گذاری با شناسه لیزری اصالت کالا",
        "nameEn": "10.0 Gram 24K Pure Investment Gold Bullion Bar Serialized",
        "weight": 10.000, "karat": 24, "wage": 0.02, "stock": 8,
        "desc": "شمش فاخر ۱۰ گرمی طلای خالص ۲۴ عیار (۹۹۹) استاندارد بین‌المللی با شماره سریال اختصاصی حک شده لیزری و بسته وکیوم پلمپ ضد دستکاری.",
        "descEn": "Premium 10.0 gram 24K (999 purity) fine investment gold bullion bar with laser-etched serial number and security packaging.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12592-7689-Size.webp",
        "tags": ["شمش ۱۰ گرمی", "۲۴ عیار", "شمش طلا", "سرمایه گذاری کلان", "طلای خالص"]
    }
]

for idx, c in enumerate(COIN_SPECS, 1):
    filename = f"imported_b4_coin_{idx:02d}.webp"
    local_path = os.path.join('public/images/products/imported', filename)
    web_path = f"/images/products/imported/{filename}"
    
    req_img = urllib.request.Request(c['imgUrl'], headers=HEADERS)
    with urllib.request.urlopen(req_img, context=ctx, timeout=8) as r:
        img_data = r.read()
        
    h = hashlib.sha256(img_data).hexdigest()
    assert h not in existing_hashes, f"Coin hash collision for {c['imgUrl']}"
    existing_hashes.add(h)
    
    with open(local_path, 'wb') as fp:
        fp.write(img_data)
        
    prod_obj = {
        "id": f"p-{len(products) + len(added_products) + 1}",
        "sku": f"MY-{(len(products) + len(added_products) + 1):04d}",
        "slug": f"coin-my-{(len(products) + len(added_products) + 1):04d}",
        "name": c['name'],
        "nameEn": c['nameEn'],
        "category": "coin",
        "categoryFa": "سکه و شمش",
        "categoryEn": "Coins & Bullion",
        "type": "coin" if "سکه" in c['name'] else "bullion",
        "typeFa": "سکه طلا" if "سکه" in c['name'] else "شمش طلا",
        "typeEn": "Gold Coin" if "سکه" in c['name'] else "Bullion Bar",
        "karat": c['karat'],
        "weightGrams": c['weight'],
        "wagePercent": c['wage'],
        "profitPercent": 0.05 if c['karat'] == 24 else 0.02,
        "vatPercent": 0 if c['karat'] == 24 else 0.10,
        "stonePrice": 0,
        "hasStone": False,
        "stock": c['stock'],
        "tags": c['tags'],
        "description": c['desc'],
        "descriptionEn": c['descEn'],
        "weightMode": "fixed",
        "weightOptions": [],
        "images": [web_path],
        "featured": True,
        "sourceUrl": "https://cbi.ir/page/gold-coins",
        "sourceStore": "centralbank"
    }
    added_products.append(prod_obj)
    print(f"  [coin {idx}/5] {c['name']} ({c['weight']}g)")

print(f"\n=======================================================")
print(f"TOTAL NEW PRODUCTS ADDED: {len(added_products)}")
print(f"=======================================================")
assert len(added_products) == 50, f"Expected 50 products, got {len(added_products)}"

final_catalog = products + added_products
for idx, p in enumerate(final_catalog, 1):
    p['id'] = f"p-{idx}"
    p['sku'] = f"MY-{idx:04d}"
    p['slug'] = f"{p['type']}-my-{idx:04d}"

print(f"Final total catalog size: {len(final_catalog)} products (155 + 50 = 205).")

# Verify zero duplicates
all_imgs = [p['images'][0] for p in final_catalog]
assert len(all_imgs) == len(set(all_imgs)), f"Duplicate images in catalog! {len(all_imgs)} vs {len(set(all_imgs))}"
all_skus = [p['sku'] for p in final_catalog]
assert len(all_skus) == len(set(all_skus)), f"Duplicate SKUs in catalog!"

with open('public/data/products.json', 'w', encoding='utf-8') as f:
    json.dump(final_catalog, f, ensure_ascii=False, indent=2)

print("Updated public/data/products.json successfully!")

# CSV export
csv_headers = [
    "sku", "id", "slug", "name", "name_en", "category", "category_fa", 
    "type", "type_fa", "karat", "weight_grams", "wage_percent", 
    "profit_percent", "vat_percent", "stone_price", "has_stone", 
    "stock", "primary_image", "tags"
]

with open('public/data/meyvan_catalog.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(csv_headers)
    for p in final_catalog:
        writer.writerow([
            p['sku'], p['id'], p['slug'], p['name'], p.get('nameEn', ''),
            p['category'], p['categoryFa'], p['type'], p['typeFa'],
            p['karat'], p['weightGrams'], p['wagePercent'],
            p.get('profitPercent', 0.07), p.get('vatPercent', 0.10),
            p.get('stonePrice', 0), p.get('hasStone', False),
            p['stock'], p['images'][0], ';'.join(p.get('tags', []))
        ])

print("Updated public/data/meyvan_catalog.csv successfully!")
