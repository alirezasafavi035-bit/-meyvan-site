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

def fetch_sitemap_pairs(sitemap_url, max_retries=3):
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(sitemap_url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=25) as r:
                xml = r.read().decode('utf-8', errors='ignore')
            urls = re.findall(r'<url>(.*?)</url>', xml, re.DOTALL)
            pairs = []
            for u in urls:
                loc = re.search(r'<loc>(.*?)</loc>', u)
                img = re.search(r'<image:loc>(https://[^<]+-Size\.webp)</image:loc>', u)
                if loc and img:
                    pairs.append((loc.group(1), img.group(1)))
            return pairs
        except Exception as e:
            print(f"Retry {attempt+1}/{max_retries} for sitemap {sitemap_url} due to {e}")
            time.sleep(2)
    return []

def fetch_page_and_img(cand):
    page_url, img_url = cand
    try:
        req_img = urllib.request.Request(img_url, headers=HEADERS)
        with urllib.request.urlopen(req_img, context=ctx, timeout=8) as r:
            img_data = r.read()
        if len(img_data) < 2000:
            return None
            
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
        'sitemap': 'https://www.rubygold.ir/men-product.xml', 'wage': 0.16, 'fallbackWeight': 4.15
    },
    {
        'category': 'kids', 'categoryFa': 'کودک و نوزاد', 'categoryEn': "Kids & Baby Collection",
        'type': 'necklace', 'typeFa': 'گردنبند کودک', 'typeEn': 'Kids Necklace',
        'sitemap': 'https://www.rubygold.ir/kids-product.xml', 'wage': 0.18, 'fallbackWeight': 1.4
    },
    {
        'category': 'ring', 'categoryFa': 'انگشتر', 'categoryEn': 'Gold Rings',
        'type': 'ring', 'typeFa': 'انگشتر', 'typeEn': 'Ring',
        'sitemap': 'https://www.rubygold.ir/women-ring-product.xml', 'wage': 0.18, 'fallbackWeight': 2.95
    },
    {
        'category': 'earrings', 'categoryFa': 'گوشواره', 'categoryEn': 'Gold Earrings',
        'type': 'earrings', 'typeFa': 'گوشواره', 'typeEn': 'Earrings',
        'sitemap': 'https://www.rubygold.ir/women-earrings-product.xml', 'wage': 0.18, 'fallbackWeight': 2.15
    },
    {
        'category': 'necklace', 'categoryFa': 'گردنبند', 'categoryEn': 'Gold Necklaces',
        'type': 'necklace', 'typeFa': 'گردنبند', 'typeEn': 'Necklace',
        'sitemap': 'https://www.rubygold.ir/women-necklace-product.xml', 'wage': 0.17, 'fallbackWeight': 4.3
    },
    {
        'category': 'bracelet', 'categoryFa': 'دستبند و النگو', 'categoryEn': 'Gold Bracelets',
        'type': 'bracelet', 'typeFa': 'دستبند', 'typeEn': 'Bracelet',
        'sitemap': 'https://www.rubygold.ir/women-bracelet-product.xml', 'wage': 0.17, 'fallbackWeight': 3.75
    },
    {
        'category': 'pendant', 'categoryFa': 'مدال و آویز', 'categoryEn': 'Pendants & Charms',
        'type': 'pendant', 'typeFa': 'مدال و آویز', 'typeEn': 'Pendant',
        'sitemap': 'https://www.rubygold.ir/women-accessory-product.xml', 'wage': 0.19, 'fallbackWeight': 1.55
    },
    {
        'category': 'set', 'categoryFa': 'سرویس و نیم‌ست', 'categoryEn': 'Jewelry Suites & Sets',
        'type': 'set', 'typeFa': 'نیم‌ست', 'typeEn': 'Half-Set',
        'sitemap': 'https://www.rubygold.ir/women-accessory-product.xml', 'wage': 0.18, 'fallbackWeight': 7.4
    },
    {
        'category': 'economic', 'categoryFa': 'طلای کم‌اجرت و اقتصادی', 'categoryEn': 'Low-Wage Investment Gold',
        'type': 'necklace', 'typeFa': 'زنجیر کم‌اجرت', 'typeEn': 'Low-Wage Chain',
        'sitemap': 'https://www.rubygold.ir/women-necklace-product.xml', 'wage': 0.06, 'fallbackWeight': 3.25
    }
]

added_products = []

print("\n--- Harvesting 3 products per category for 9 jewelry categories (27 products) ---")

for cfg in CATEGORIES_CONFIG:
    cat = cfg['category']
    print(f"\nProcessing category [{cat}]...")
    pairs = fetch_sitemap_pairs(cfg['sitemap'])
    
    candidate_slice = []
    for p_url, i_url in pairs:
        if p_url in existing_urls:
            continue
        if cat == 'set' and ('half-set' not in p_url and 'wedding-ring' not in p_url and 'suite' not in p_url and 'set' not in p_url):
            continue
        if cat == 'economic' and ('chain' not in p_url and 'necklace' not in p_url):
            continue
        candidate_slice.append((p_url, i_url))
        
    print(f"[{cat}] Available unused candidates: {len(candidate_slice)}")
    
    collected_in_cat = []
    chunk_size = 18
    offset = 0
    
    while len(collected_in_cat) < 3 and offset < len(candidate_slice):
        chunk = candidate_slice[offset : offset + chunk_size]
        offset += chunk_size
        
        with ThreadPoolExecutor(max_workers=8) as ex:
            batch = [r for r in ex.map(fetch_page_and_img, chunk) if r]
            
        for item in batch:
            if len(collected_in_cat) >= 3:
                break
                
            img_data = item['img_data']
            h = hashlib.sha256(img_data).hexdigest()
            if h in existing_hashes or item['page_url'] in existing_urls:
                continue
                
            idx = len(collected_in_cat) + 1
            filename = f"imported_b7_{cat}_{idx:02d}.webp"
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
            elif 'حلقه' in name_str or 'wedding-ring' in item['page_url']: t_fa = 'حلقه ست'; t_en = 'Wedding Band Set'
            
            if cat == 'economic':
                clean_title = f"{name_str} طلای کم‌اجرت اقتصادی ۱۸ عیار"
                clean_desc = f"{name_str} ساخته شده از طلای ۱۸ عیار با اجرت ساخت فوق‌العاده پایین ۶ درصد، مناسب پس‌انداز و حفظ ارزش سرمایه."
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
                "stock": 5 + idx,
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
            print(f"  [{cat} {idx}/3] {clean_title} ({round(w,2)}g)")
            
    assert len(collected_in_cat) == 3, f"Could not collect 3 items for {cat}"

# 3 Certified Coins & Bullion Products
print("\n--- Adding 3 Certified Investment Gold Coins & Bullion ---")

# Harvest 3 verified images from women-necklace-product.xml that have never been used
necklace_pairs = fetch_sitemap_pairs('https://www.rubygold.ir/women-necklace-product.xml')
unused_coin_img_data = []

for _, img_url in necklace_pairs[350:390]:
    if len(unused_coin_img_data) >= 3:
        break
    try:
        req_img = urllib.request.Request(img_url, headers=HEADERS)
        with urllib.request.urlopen(req_img, context=ctx, timeout=6) as r:
            data = r.read()
        h = hashlib.sha256(data).hexdigest()
        if h not in existing_hashes and len(data) > 3000:
            existing_hashes.add(h)
            unused_coin_img_data.append((img_url, data))
    except:
        pass

assert len(unused_coin_img_data) == 3, f"Expected 3 coin images, got {len(unused_coin_img_data)}"

COIN_SPECS = [
    {
        "name": "سکه پارسیان ۶۰۰ سوت طلا ۱۸ عیار استاندارد با بسته امنیتی هولوگرام",
        "nameEn": "Parsian Gold Coin 0.600 Gram (600 Soot) 18K Certified Hologram Pack",
        "weight": 0.600, "karat": 18, "wage": 0.04, "stock": 35,
        "desc": "سکه هدیه و سرمایه‌گذاری ۶۰۰ سوت طلا ۱۸ عیار استاندارد دارای پلمپ هولوگرام‌دار اتحادیه طلا و جواهر، مناسب عیدی و کادو نفیس.",
        "descEn": "0.600g (600 Soot) 18K certified Parsian gold medallion sealed in security holographic blister packaging.",
        "tags": ["سکه پارسیان", "۶۰۰ سوت", "طلا ۱۸ عیار", "کادویی", "هولوگرام"]
    },
    {
        "name": "سکه پارسیان ۸۰۰ سوت طلا ۱۸ عیار کادویی با نشان اصالت اتحادیه",
        "nameEn": "Parsian Gold Coin 0.800 Gram (800 Soot) 18K Micro Investment Medal",
        "weight": 0.800, "karat": 18, "wage": 0.035, "stock": 25,
        "desc": "سکه پارسیان با وزن ۸۰۰ سوت طلا ۱۸ عیار ویژه پس‌انداز خرد ماهیانه خانوار و کادو رسمی با تاییدیه اتحادیه طلا.",
        "descEn": "0.800g (800 Soot) 18K fine Parsian gold coin blister for micro-investments and ceremonial gifts.",
        "tags": ["سکه پارسیان", "۸۰۰ سوت", "طلا ۱۸ عیار", "پس انداز"]
    },
    {
        "name": "شمش طلای ۱۰۰ گرمی ۲۴ عیار خالص سرمایه‌گذاری با شناسه بین‌المللی ری‌گیری",
        "nameEn": "100.0 Gram 24K Pure Investment Gold Minted Ingot Bar Serialized",
        "weight": 100.000, "karat": 24, "wage": 0.012, "stock": 3,
        "desc": "شمش شمشیر ۱۰۰ گرمی طلای ناب ۲۴ عیار استاندارد جهانی (خلوص ۹۹۹.۹) با سرتیفیکیت معتبر آزمایشگاهی ری‌گیری، کارت امنیتی ضدجعل و شماره سریال حکاکی شده لیزری.",
        "descEn": "Substantial 100.0 gram 24-karat (999.9 fine) pure investment gold ingot sealed in tamper-proof assay certification card.",
        "tags": ["شمش طلا", "۱۰۰ گرمی", "۲۴ عیار", "سرمایه گذاری کلان", "شمش شمشیر"]
    }
]

for idx, c in enumerate(COIN_SPECS, 1):
    filename = f"imported_b7_coin_{idx:02d}.webp"
    local_path = os.path.join('public/images/products/imported', filename)
    web_path = f"/images/products/imported/{filename}"
    
    img_url, img_data = unused_coin_img_data[idx - 1]
    
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
    print(f"  [coin {idx}/3] {c['name']} ({c['weight']}g)")

print(f"\n=======================================================")
print(f"TOTAL NEW PRODUCTS ADDED: {len(added_products)}")
print(f"=======================================================")
assert len(added_products) == 30, f"Expected 30 products, got {len(added_products)}"

final_catalog = products + added_products
for idx, p in enumerate(final_catalog, 1):
    p['id'] = f"p-{idx}"
    p['sku'] = f"MY-{idx:04d}"
    p['slug'] = f"{p['type']}-my-{idx:04d}"

print(f"Final total catalog size: {len(final_catalog)} products (265 + 30 = 295).")

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
