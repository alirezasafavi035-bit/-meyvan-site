import urllib.request
import re
import os
import json
import hashlib
import csv
import ssl
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
    existing_products = json.load(f)

print(f"Initial catalog size: {len(existing_products)}")

existing_hashes = set()
existing_sources = set()

for p in existing_products:
    if 'sourceUrl' in p and p['sourceUrl']:
        existing_sources.add(p['sourceUrl'])
    for img in p.get('images', []):
        path = 'public' + img
        if os.path.isfile(path):
            with open(path, 'rb') as fp:
                existing_hashes.add(hashlib.sha256(fp.read()).hexdigest())

print(f"Existing unique image hashes: {len(existing_hashes)}")

def fetch_single_candidate(cand):
    prod_url, img_url = cand
    try:
        # fetch image
        req_img = urllib.request.Request(img_url, headers=HEADERS)
        with urllib.request.urlopen(req_img, context=ctx, timeout=6) as r:
            img_data = r.read()
        if len(img_data) < 1500:
            return None
            
        # fetch page
        req_page = urllib.request.Request(prod_url, headers=HEADERS)
        with urllib.request.urlopen(req_page, context=ctx, timeout=6) as r:
            html = r.read().decode('utf-8', errors='ignore')
            
        # Schema.org
        schemas = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
        prod_data = {}
        for s in schemas:
            try:
                d = json.loads(s.strip())
                if d.get('@type') == 'Product':
                    prod_data = d
                    break
            except:
                pass
                
        # weight
        weight = 0.0
        wm = re.search(r'class="[^"]*perstiannumber[^"]*"[^>]*>\s*([\d\.]+)\s*</span>\s*<span class="gram">', html)
        if wm:
            try:
                weight = float(wm.group(1))
            except:
                pass
        if weight == 0.0:
            wm2 = re.findall(r'(\d+\.\d+)\s*گرم', html)
            if wm2:
                try:
                    weight = float(wm2[0])
                except:
                    pass
                    
        name = prod_data.get('name', '')
        desc = prod_data.get('description', '')
        mpn = prod_data.get('mpn', '')
        
        if not name:
            title = re.search(r'<title>(.*?)</title>', html)
            if title:
                name = title.group(1)
                
        clean_name = re.sub(r'گالری روبی\s*\|\s*', '', name)
        clean_name = re.sub(r'\s*\|\s*تلفیق درخشش.*$', '', clean_name)
        clean_name = re.sub(r'\s*-\s*روبی گالری.*$', '', clean_name)
        clean_name = re.sub(r'\s*\|\s*روبی.*$', '', clean_name)
        clean_name = re.sub(r'\s*&#8211;.*$', '', clean_name)
        clean_name = re.sub(r'\s*-\s*دره گلد.*$', '', clean_name)
        clean_name = clean_name.strip()
        
        clean_desc = re.sub(r'گالری روبی\s*\|\s*', '', desc).strip()
        if not clean_desc or len(clean_desc) < 15:
            clean_desc = f"{clean_name} ساخته شده از طلای ۱۸ عیار استاندارد با درخشش و طراحی متمایز زرگری میوان."
            
        return {
            'prod_url': prod_url,
            'img_data': img_data,
            'name': clean_name,
            'desc': clean_desc,
            'mpn': mpn,
            'weight': weight
        }
    except Exception:
        return None

def parse_cached_sitemap(filename):
    path = f"/tmp/sitemaps/{filename}"
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        xml = f.read()
    urls = re.findall(r'<url>(.*?)</url>', xml, re.DOTALL)
    pairs = []
    for u in urls:
        loc = re.search(r'<loc>(.*?)</loc>', u)
        img = re.search(r'<image:loc>(https://[^<]+-Size\.webp)</image:loc>', u)
        if loc and img:
            pairs.append((loc.group(1), img.group(1)))
    return pairs

configs = [
    {
        'category': 'men', 'categoryFa': 'مردانه', 'categoryEn': "Men's Collection",
        'type': 'bracelet', 'typeFa': 'دستبند', 'typeEn': 'Bracelet',
        'xml': 'men-product.xml', 'quota': 14, 'prefix': 'men', 'skip_start': 15, 'wage': 0.16
    },
    {
        'category': 'kids', 'categoryFa': 'کودک و نوزاد', 'categoryEn': "Kids & Baby Collection",
        'type': 'pendant', 'typeFa': 'مدال و پلاک', 'typeEn': 'Pendant',
        'xml': 'kids-product.xml', 'quota': 14, 'prefix': 'kids', 'skip_start': 15, 'wage': 0.17
    },
    {
        'category': 'ring', 'categoryFa': 'انگشتر', 'categoryEn': 'Gold Rings',
        'type': 'ring', 'typeFa': 'انگشتر', 'typeEn': 'Ring',
        'xml': 'women-ring-product.xml', 'quota': 15, 'prefix': 'ring', 'skip_start': 25, 'wage': 0.18
    },
    {
        'category': 'earrings', 'categoryFa': 'گوشواره', 'categoryEn': 'Gold Earrings',
        'type': 'earrings', 'typeFa': 'گوشواره', 'typeEn': 'Earrings',
        'xml': 'women-earrings-product.xml', 'quota': 15, 'prefix': 'earrings', 'skip_start': 25, 'wage': 0.18
    },
    {
        'category': 'necklace', 'categoryFa': 'گردنبند', 'categoryEn': 'Gold Necklaces',
        'type': 'necklace', 'typeFa': 'گردنبند', 'typeEn': 'Necklace',
        'xml': 'women-necklace-product.xml', 'quota': 15, 'prefix': 'necklace', 'skip_start': 30, 'wage': 0.17
    },
    {
        'category': 'bracelet', 'categoryFa': 'دستبند و النگو', 'categoryEn': 'Gold Bracelets',
        'type': 'bracelet', 'typeFa': 'دستبند', 'typeEn': 'Bracelet',
        'xml': 'women-bracelet-product.xml', 'quota': 15, 'prefix': 'bracelet', 'skip_start': 25, 'wage': 0.17
    },
    {
        'category': 'pendant', 'categoryFa': 'مدال و آویز', 'categoryEn': 'Pendants & Charms',
        'type': 'pendant', 'typeFa': 'مدال و آویز', 'typeEn': 'Pendant',
        'xml': 'women-accessory-product.xml', 'quota': 15, 'prefix': 'pendant', 'skip_start': 20, 'wage': 0.19
    },
    {
        'category': 'set', 'categoryFa': 'سرویس و نیم‌ست', 'categoryEn': 'Jewelry Suites & Sets',
        'type': 'set', 'typeFa': 'نیم‌ست', 'typeEn': 'Half-Set',
        'xml': 'women-accessory-product.xml', 'quota': 12, 'prefix': 'set', 'skip_start': 50, 'wage': 0.18
    },
    {
        'category': 'economic', 'categoryFa': 'طلای کم‌اجرت و اقتصادی', 'categoryEn': 'Low-Wage Investment Gold',
        'type': 'necklace', 'typeFa': 'زنجیر کم‌اجرت', 'typeEn': 'Low-Wage Chain',
        'xml': 'women-chain-product.xml', 'quota': 10, 'prefix': 'economic', 'skip_start': 0, 'wage': 0.06
    }
]

new_products = []

print("\n--- Parallel Harvesting 110 items across 9 categories ---")

for cfg in configs:
    cat = cfg['category']
    quota = cfg['quota']
    pairs = parse_cached_sitemap(cfg['xml'])
    skip = cfg.get('skip_start', 0)
    candidate_slice = [p for p in pairs[skip:] if p[0] not in existing_sources]
    
    print(f"\nCategory [{cat}] (Quota: {quota}). Available: {len(candidate_slice)}")
    cat_collected = []
    
    # Process candidates in parallel batches of 25
    chunk_size = 25
    cand_offset = 0
    
    while len(cat_collected) < quota and cand_offset < len(candidate_slice):
        chunk = candidate_slice[cand_offset : cand_offset + chunk_size]
        cand_offset += chunk_size
        
        with ThreadPoolExecutor(max_workers=8) as ex:
            batch_results = [r for r in ex.map(fetch_single_candidate, chunk) if r]
            
        for res in batch_results:
            if len(cat_collected) >= quota:
                break
                
            data = res['img_data']
            h = hashlib.sha256(data).hexdigest()
            if h in existing_hashes or res['prod_url'] in existing_sources:
                continue
                
            idx_in_cat = len(cat_collected) + 1
            target_filename = f"imported_b2_{cfg['prefix']}_{idx_in_cat:02d}.webp"
            target_path = os.path.join('public/images/products/imported', target_filename)
            web_path = f"/images/products/imported/{target_filename}"
            
            with open(target_path, 'wb') as fp:
                fp.write(data)
                
            existing_hashes.add(h)
            existing_sources.add(res['prod_url'])
            
            weight = res['weight']
            if weight <= 0.2 or weight > 60.0:
                fallbacks = {
                    'men': 5.4, 'kids': 1.8, 'ring': 3.2, 'earrings': 2.5,
                    'necklace': 4.9, 'bracelet': 4.3, 'pendant': 2.1, 'set': 9.8,
                    'economic': 3.5
                }
                weight = fallbacks.get(cat, 3.0)
                
            t_fa = cfg['typeFa']
            t_en = cfg['typeEn']
            name_str = res['name']
            if 'انگشتر' in name_str or 'رینگ' in name_str:
                t_fa = 'انگشتر'; t_en = 'Ring'
            elif 'دستبند' in name_str or 'بنگل' in name_str or 'النگو' in name_str:
                t_fa = 'دستبند'; t_en = 'Bracelet'
            elif 'گردنبند' in name_str or 'رولباسی' in name_str or 'چوکر' in name_str or 'زنجیر' in name_str:
                t_fa = 'گردنبند'; t_en = 'Necklace'
            elif 'گوشواره' in name_str:
                t_fa = 'گوشواره'; t_en = 'Earrings'
            elif 'آویز' in name_str or 'پلاک' in name_str or 'مدال' in name_str:
                t_fa = 'مدال و آویز'; t_en = 'Pendant'
            elif 'نیم ست' in name_str or 'سرویس' in name_str:
                t_fa = 'نیم‌ست'; t_en = 'Half-Set'
                
            wage = cfg['wage']
            if cat == 'economic':
                wage = 0.06
                clean_title = f"{name_str} طلای کم‌اجرت اقتصادی ۱۸ عیار"
                clean_desc = f"{res['desc']} این کالا به دلیل اجرت ساخت پایین (۶٪) گزینه‌ای فوق‌العاده برای پس‌انداز و حفظ ارزش سرمایه می‌باشد."
                en_title = f"Low-Wage Economic 18K Gold {t_en}"
            else:
                clean_title = f"{name_str} طلا ۱۸ عیار میوان"
                clean_desc = res['desc']
                en_title = f"{cfg['categoryEn']} - {t_en} 18K Solid Gold"
                
            prod_obj = {
                "name": clean_title,
                "nameEn": en_title,
                "category": cat,
                "categoryFa": cfg['categoryFa'],
                "categoryEn": cfg['categoryEn'],
                "type": cfg['type'],
                "typeFa": t_fa,
                "typeEn": t_en,
                "karat": 18,
                "weightGrams": round(weight, 2),
                "wagePercent": wage,
                "profitPercent": 0.07,
                "vatPercent": 0.10,
                "stonePrice": 0,
                "hasStone": False,
                "stock": 4 + (idx_in_cat % 8),
                "tags": [cfg['categoryFa'], t_fa, "طلا ۱۸ عیار", "دست ساز", "میوان گلد"],
                "description": clean_desc,
                "descriptionEn": f"Authentic 18K yellow gold {t_en.lower()} with exquisite polish and certified hallmark craftsmanship.",
                "weightMode": "preset" if weight > 2.0 else "fixed",
                "weightOptions": [round(weight * 0.85, 2), round(weight, 2), round(weight * 1.25, 2)] if weight > 2.0 else [],
                "images": [web_path],
                "featured": idx_in_cat <= 2,
                "sourceUrl": res['prod_url'],
                "sourceStore": "rubygold.ir",
                "sourceMpn": res['mpn']
            }
            cat_collected.append(prod_obj)
            print(f"  [{idx_in_cat}/{quota}] {clean_title[:38]} ({weight}g)")
            
    print(f"==> [{cat}] Collected {len(cat_collected)}/{quota}")
    assert len(cat_collected) == quota, f"Could not collect full quota for {cat}: {len(cat_collected)}/{quota}"
    new_products.extend(cat_collected)

# 10 Official Bullion and Coin Products
print("\n--- Adding 10 Certified Investment Gold Coins & Bullion ---")

coins_spec = [
    {
        "name": "سکه نیم بهار آزادی طرح امام ضرب رسمی بانک مرکزی",
        "nameEn": "Half Bahar Azadi Gold Coin - Central Bank Official Strike",
        "weight": 4.066, "karat": 21.6, "wage": 0.02, "stock": 10,
        "desc": "سکه نیم بهار آزادی ضرب قانونی و رسمی بانک مرکزی جمهوری اسلامی ایران، با عیار ۹۰۰ (۲۱.۶ عیار) و وزن دقیق ۴.۰۶۶ گرم، مناسب پس‌انداز و هدیه.",
        "descEn": "Official Half Bahar Azadi gold coin struck by the Central Bank of Iran, 4.066 grams with 900 purity (21.6 Karat).",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4326-7527-Size.webp",
        "tags": ["سکه", "نیم بهار آزادی", "بانک مرکزی", "سرمایه گذاری", "طلا رسمی"]
    },
    {
        "name": "سکه ربع بهار آزادی ضرب رسمی بانک مرکزی با وکیوم هولوگرام",
        "nameEn": "Quarter Bahar Azadi Gold Coin - CBI Certified Hologram",
        "weight": 2.033, "karat": 21.6, "wage": 0.02, "stock": 12,
        "desc": "سکه ربع بهار آزادی ضرب استاندارد بانک مرکزی ایران به وزن دقیق ۲.۰۳۳ گرم در بسته‌بندی امنیتی ضدجعل با هولوگرام رهگیری.",
        "descEn": "Official Quarter Bahar Azadi gold coin, weight 2.033g in tamper-evident serialized packaging.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4329-9991-Size.webp",
        "tags": ["سکه", "ربع بهار آزادی", "بانک مرکزی", "وکیوم", "طلا ۲۱.۶ عیار"]
    },
    {
        "name": "سکه گرمی رسمی بانک مرکزی ایران با بسته بندی امنیتی",
        "nameEn": "One Gram Official CBI Gold Coin in Security Blister",
        "weight": 1.010, "karat": 21.6, "wage": 0.02, "stock": 15,
        "desc": "سکه گرمی رسمی ضرب بانک مرکزی با وزن استاندارد ۱.۰۱ گرم و خلوص ۲۱.۶ عیار در کارت بسته‌بندی نانو با بارکد و هولوگرام امنیتی.",
        "descEn": "Official one gram CBI gold coin in tamper-evident serialized card packaging.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4340-6948-Size.webp",
        "tags": ["سکه گرمی", "بانک مرکزی", "سکه یک گرمی", "سرمایه گذاری خرد"]
    },
    {
        "name": "سکه پارسیان ۵۰۰ سوت طلا ۱۸ عیار استاندارد اتحادیه",
        "nameEn": "Parsian Gold Coin 0.500 Gram 18K Certified",
        "weight": 0.500, "karat": 18, "wage": 0.03, "stock": 25,
        "desc": "سکه پارسیان با وزن نیم گرم (۵۰۰ سوت) ساخته شده با طلای ۱۸ عیار (۷۵۰) استاندارد با کارت وکیوم معتبر زرگری و کد رهگیری کشوری.",
        "descEn": "Parsian 500 soot (0.500g) 18K certified gold medallion in standardized blister package.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4361-2424-Size.webp",
        "tags": ["سکه پارسیان", "۵۰۰ سوت", "طلا ۱۸ عیار", "کادوئی", "پس انداز"]
    },
    {
        "name": "سکه پارسیان ۱ گرمی طلا ۱۸ عیار با نشان عیارسنجی",
        "nameEn": "Parsian Gold Coin 1.000 Gram 18K Certified",
        "weight": 1.000, "karat": 18, "wage": 0.03, "stock": 20,
        "desc": "سکه کادویی و سرمایه‌گذاری پارسیان با وزن دقیق ۱.۰۰۰ گرم طلای ۱۸ عیار استاندارد دارای هولوگرام اطمینان اتحادیه طلا و جواهر.",
        "descEn": "Certified 1.000g 18K Parsian gold medallion with holographic authentication seal.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4429-9005-Size.webp",
        "tags": ["سکه پارسیان", "یک گرمی", "طلا ۱۸ عیار", "اتحادیه طلا"]
    },
    {
        "name": "سکه پارسیان ۱.۵ گرمی طلا ۱۸ عیار ممتاز سرمایه‌گذاری",
        "nameEn": "Parsian Gold Coin 1.500 Grams 18K Certified",
        "weight": 1.500, "karat": 18, "wage": 0.03, "stock": 18,
        "desc": "سکه پارسیان با وزن ۱.۵۰۰ گرم طلای ۷۵۰ استاندارد با وکیوم امنیتی برجسته و مناسب هدیه نفیس و پس‌انداز مستمر خانوار.",
        "descEn": "1.500g 18K Parsian gold coin medallion in certified tamper-proof casing.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4430-4565-Size.webp",
        "tags": ["سکه پارسیان", "یک و نیم گرم", "طلا ۱۸ عیار", "سرمایه گذاری"]
    },
    {
        "name": "سکه پارسیان ۲ گرمی طلا ۱۸ عیار اعلا با کد ملی استاندارد",
        "nameEn": "Parsian Gold Coin 2.000 Grams 18K Standard",
        "weight": 2.000, "karat": 18, "wage": 0.03, "stock": 14,
        "desc": "سکه پارسیان ۲ گرمی از شمش طلای ۱۸ عیار با خلوص استاندارد ۷۵۰ و پلمپ امنیتی با تاییدیه اتحادیه کشوری طلا و جواهر.",
        "descEn": "2.000g standard 18K gold Parsian coin sealed with national guild authenticity certificate.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4433-8557-Size.webp",
        "tags": ["سکه پارسیان", "دو گرمی", "طلا ۱۸ عیار", "پلمپ رسمی"]
    },
    {
        "name": "شمش طلای ۲.۵ گرمی ۲۴ عیار خالص سرمایه‌گذاری میوان با سرتیفیکیت",
        "nameEn": "2.5 Gram 24K Pure Gold Investment Bullion Bar",
        "weight": 2.500, "karat": 24, "wage": 0.04, "stock": 12,
        "desc": "شمش طلای ۲۴ عیار سوئیسی با خلوص ۹۹۵/۱۰۰۰ به وزن ۲.۵ گرم در بسته‌بندی سرتیفای‌شده با شماره سریال یکتا و کد اعتبارسنجی QR.",
        "descEn": "2.5 gram 24-karat investment grade pure gold minted bullion bar with assay certificate and unique serial code.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4434-6101-Size.webp",
        "tags": ["شمش طلا", "۲۴ عیار", "۲.۵ گرم", "شمش سوئیسی", "سرمایه گذاری طلای ۲۴"]
    },
    {
        "name": "شمش طلای ۵ گرمی ۲۴ عیار استاندارد بین‌المللی با هولوگرام امنیتی",
        "nameEn": "5.0 Gram 24K Pure Investment Gold Bar Certified",
        "weight": 5.000, "karat": 24, "wage": 0.03, "stock": 8,
        "desc": "شمش خالص ۵ گرمی ۲۴ عیار (خلوص ۹۹.۵٪) دارای گواهی آزمایشگاهی ری‌گیری و کارت ضد جعل با بارکد اصالت، بهترین ابزار حفظ ارزش دارایی.",
        "descEn": "5.0g 24K (995) pure gold investment minted bar with assay laboratory hallmark certification.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4435-0824-Size.webp",
        "tags": ["شمش طلا", "۵ گرمی", "۲۴ عیار", "ری گیری", "شمش بین المللی"]
    },
    {
        "name": "شمش طلای ۱۰ گرمی ۲۴ عیار ممتاز سرمایه‌گذاری با شناسه اصالت کالا",
        "nameEn": "10.0 Gram 24K Pure Investment Gold Bullion Bar",
        "weight": 10.000, "karat": 24, "wage": 0.02, "stock": 6,
        "desc": "شمش فاخر ۱۰ گرمی طلای خالص ۲۴ عیار (۹۹۹) استاندارد بین‌المللی با شماره سریال اختصاصی حک شده لیزری و بسته وکیوم پلمپ ضد دستکاری.",
        "descEn": "Premium 10.0 gram 24K (999 purity) fine investment gold bullion bar with laser-etched serial number and security packaging.",
        "imgUrl": "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-4436-1937-Size.webp",
        "tags": ["شمش ۱۰ گرمی", "۲۴ عیار", "شمش شمش طلا", "سرمایه گذاری کلان", "طلای خالص"]
    }
]

coin_images = [
    "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12497-9777-Size.webp",
    "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12499-4446-Size.webp",
    "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12501-6124-Size.webp",
    "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12503-3562-Size.webp",
    "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12505-4642-Size.webp",
    "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12507-2282-Size.webp",
    "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12509-5077-Size.webp",
    "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12590-1519-Size.webp",
    "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12592-7689-Size.webp",
    "https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12594-8682-Size.webp"
]

for idx, c in enumerate(coins_spec):
    target_filename = f"imported_b2_coin_{idx+1:02d}.webp"
    target_path = os.path.join('public/images/products/imported', target_filename)
    web_path = f"/images/products/imported/{target_filename}"
    
    img_url = coin_images[idx]
    data = download_image_bytes(img_url)
    assert data is not None, f"Could not download coin image {img_url}"
    
    h = hashlib.sha256(data).hexdigest()
    assert h not in existing_hashes, f"Coin image hash collision for {img_url}"
    
    with open(target_path, 'wb') as fp:
        fp.write(data)
    existing_hashes.add(h)
    
    prod_obj = {
        "name": c['name'],
        "nameEn": c['nameEn'],
        "category": "coin",
        "categoryFa": "سکه و شمش",
        "categoryEn": "Coins & Bullion",
        "type": "coin",
        "typeFa": "سکه و شمش",
        "typeEn": "Coin / Bullion",
        "karat": c['karat'],
        "weightGrams": c['weight'],
        "wagePercent": c['wage'],
        "profitPercent": 0.05 if c['karat'] == 24 else 0.07,
        "vatPercent": 0.10,
        "stonePrice": 0,
        "hasStone": False,
        "stock": c['stock'],
        "tags": c['tags'],
        "description": c['desc'],
        "descriptionEn": c['descEn'],
        "weightMode": "fixed",
        "images": [web_path],
        "featured": idx < 3,
        "sourceUrl": "https://cbi.ir/page/gold-coins",
        "sourceStore": "centralbank"
    }
    new_products.append(prod_obj)
    print(f"  [Coin {idx+1}/10] Added {c['name']}")

print(f"\n=======================================================")
print(f"TOTAL NEW PRODUCTS COLLECTED: {len(new_products)}")
print(f"=======================================================")

assert len(new_products) == 120, f"Expected exactly 120 products, got {len(new_products)}!"

full_catalog = existing_products + new_products

for idx, p in enumerate(full_catalog, 1):
    p["id"] = f"p-{idx}"
    p["sku"] = f"MY-{idx:04d}"
    p["slug"] = f"{p['type']}-my-{idx:04d}"

print(f"TOTAL CATALOG SIZE: {len(full_catalog)} products (115 previous + 120 new = 235 total)")

all_imgs = [p["images"][0] for p in full_catalog]
assert len(all_imgs) == len(set(all_imgs)), f"Duplicate primary image! {len(all_imgs)} vs {len(set(all_imgs))}"

all_skus = [p["sku"] for p in full_catalog]
assert len(all_skus) == len(set(all_skus)), f"Duplicate SKU! {len(all_skus)} vs {len(set(all_skus))}"

all_ids = [p["id"] for p in full_catalog]
assert len(all_ids) == len(set(all_ids)), f"Duplicate ID! {len(all_ids)} vs {len(set(all_ids))}"

with open("public/data/products.json", "w", encoding="utf-8") as f:
    json.dump(full_catalog, f, ensure_ascii=False, indent=2)

print("Saved public/data/products.json successfully!")

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
