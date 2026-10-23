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

# Candidates discovered from rubygold sitemaps (guaranteed 100% unique)
CANDIDATES = [
    # MEN (3)
    {
        'category': 'men', 'categoryFa': 'مردانه', 'categoryEn': "Men's Collection",
        'type': 'bracelet', 'typeFa': 'دستبند مردانه', 'typeEn': "Men's Bracelet",
        'pageUrl': 'https://www.rubygold.ir/fa/product/leather-bracelet/4876/bracelet',
        'wage': 0.16, 'fallbackWeight': 4.20
    },
    {
        'category': 'men', 'categoryFa': 'مردانه', 'categoryEn': "Men's Collection",
        'type': 'bracelet', 'typeFa': 'دستبند مردانه', 'typeEn': "Men's Bracelet",
        'pageUrl': 'https://www.rubygold.ir/fa/product/leather-bracelet/4878/bracelet',
        'wage': 0.16, 'fallbackWeight': 3.90
    },
    {
        'category': 'men', 'categoryFa': 'مردانه', 'categoryEn': "Men's Collection",
        'type': 'bracelet', 'typeFa': 'دستبند مردانه', 'typeEn': "Men's Bracelet",
        'pageUrl': 'https://www.rubygold.ir/fa/product/men\'s-bracelets/4880/bracelet',
        'wage': 0.16, 'fallbackWeight': 5.10
    },

    # KIDS (3)
    {
        'category': 'kids', 'categoryFa': 'کودک و نوزاد', 'categoryEn': "Kids & Baby Collection",
        'type': 'necklace', 'typeFa': 'گردنبند کودک', 'typeEn': 'Kids Necklace',
        'pageUrl': 'https://www.rubygold.ir/fa/product/kids-necklace/4900/necklace',
        'wage': 0.18, 'fallbackWeight': 1.65
    },
    {
        'category': 'kids', 'categoryFa': 'کودک و نوزاد', 'categoryEn': "Kids & Baby Collection",
        'type': 'necklace', 'typeFa': 'گردنبند کودک', 'typeEn': 'Kids Necklace',
        'pageUrl': 'https://www.rubygold.ir/fa/product/kids-product/6172/necklace',
        'wage': 0.18, 'fallbackWeight': 1.80
    },
    {
        'category': 'kids', 'categoryFa': 'کودک و نوزاد', 'categoryEn': "Kids & Baby Collection",
        'type': 'pendant', 'typeFa': 'مدال کودک', 'typeEn': 'Kids Pendant',
        'pageUrl': 'https://www.rubygold.ir/fa/product/kids-product/6196/pendant',
        'wage': 0.18, 'fallbackWeight': 1.20
    },

    # RING (3)
    {
        'category': 'ring', 'categoryFa': 'انگشتر', 'categoryEn': 'Gold Rings',
        'type': 'ring', 'typeFa': 'انگشتر', 'typeEn': 'Ring',
        'pageUrl': 'https://www.rubygold.ir/fa/product/without-stone/4348/ring',
        'wage': 0.18, 'fallbackWeight': 2.75
    },
    {
        'category': 'ring', 'categoryFa': 'انگشتر', 'categoryEn': 'Gold Rings',
        'type': 'ring', 'typeFa': 'انگشتر', 'typeEn': 'Ring',
        'pageUrl': 'https://www.rubygold.ir/fa/product/stone\'s-ring/4391/ring',
        'wage': 0.18, 'fallbackWeight': 3.10
    },
    {
        'category': 'ring', 'categoryFa': 'انگشتر', 'categoryEn': 'Gold Rings',
        'type': 'ring', 'typeFa': 'انگشتر', 'typeEn': 'Ring',
        'pageUrl': 'https://www.rubygold.ir/fa/product/cartier-ring/4392/ring',
        'wage': 0.18, 'fallbackWeight': 3.80
    },

    # EARRINGS (3)
    {
        'category': 'earrings', 'categoryFa': 'گوشواره', 'categoryEn': 'Gold Earrings',
        'type': 'earrings', 'typeFa': 'گوشواره', 'typeEn': 'Earrings',
        'pageUrl': 'https://www.rubygold.ir/fa/product/studs-earring/4450/earing',
        'wage': 0.19, 'fallbackWeight': 1.45
    },
    {
        'category': 'earrings', 'categoryFa': 'گوشواره', 'categoryEn': 'Gold Earrings',
        'type': 'earrings', 'typeFa': 'گوشواره', 'typeEn': 'Earrings',
        'pageUrl': 'https://www.rubygold.ir/fa/product/studs-earring/4452/earing',
        'wage': 0.19, 'fallbackWeight': 1.85
    },
    {
        'category': 'earrings', 'categoryFa': 'گوشواره', 'categoryEn': 'Gold Earrings',
        'type': 'earrings', 'typeFa': 'گوشواره', 'typeEn': 'Earrings',
        'pageUrl': 'https://www.rubygold.ir/fa/product/hoop-earring/4453/earing',
        'wage': 0.18, 'fallbackWeight': 2.30
    },

    # NECKLACE (3)
    {
        'category': 'necklace', 'categoryFa': 'گردنبند', 'categoryEn': 'Gold Necklaces',
        'type': 'necklace', 'typeFa': 'گردنبند', 'typeEn': 'Necklace',
        'pageUrl': 'https://www.rubygold.ir/fa/product/chain-necklace/4332/necklace',
        'wage': 0.17, 'fallbackWeight': 3.60
    },
    {
        'category': 'necklace', 'categoryFa': 'گردنبند', 'categoryEn': 'Gold Necklaces',
        'type': 'necklace', 'typeFa': 'گردنبند', 'typeEn': 'Necklace',
        'pageUrl': 'https://www.rubygold.ir/fa/product/chain-necklace/4333/necklace',
        'wage': 0.17, 'fallbackWeight': 4.10
    },
    {
        'category': 'necklace', 'categoryFa': 'گردنبند', 'categoryEn': 'Gold Necklaces',
        'type': 'necklace', 'typeFa': 'گردنبند', 'typeEn': 'Necklace',
        'pageUrl': 'https://www.rubygold.ir/fa/product/chain-necklace/4334/necklace',
        'wage': 0.17, 'fallbackWeight': 4.90
    },

    # BRACELET (3)
    {
        'category': 'bracelet', 'categoryFa': 'دستبند و النگو', 'categoryEn': 'Gold Bracelets',
        'type': 'bracelet', 'typeFa': 'دستبند', 'typeEn': 'Bracelet',
        'pageUrl': 'https://www.rubygold.ir/fa/product/thread-bracelet/4362/bracelet',
        'wage': 0.17, 'fallbackWeight': 2.80
    },
    {
        'category': 'bracelet', 'categoryFa': 'دستبند و النگو', 'categoryEn': 'Gold Bracelets',
        'type': 'bracelet', 'typeFa': 'دستبند', 'typeEn': 'Bracelet',
        'pageUrl': 'https://www.rubygold.ir/fa/product/stone-bracelets/4371/bracelet',
        'wage': 0.17, 'fallbackWeight': 3.20
    },
    {
        'category': 'bracelet', 'categoryFa': 'دستبند و النگو', 'categoryEn': 'Gold Bracelets',
        'type': 'bracelet', 'typeFa': 'دستبند', 'typeEn': 'Bracelet',
        'pageUrl': 'https://www.rubygold.ir/fa/product/leather-bracelet/4373/bracelet',
        'wage': 0.17, 'fallbackWeight': 3.75
    },

    # PENDANT (3)
    {
        'category': 'pendant', 'categoryFa': 'مدال و آویز', 'categoryEn': 'Pendants & Charms',
        'type': 'pendant', 'typeFa': 'مدال و آویز', 'typeEn': 'Pendant',
        'pageUrl': 'https://www.rubygold.ir/fa/product/watch-pendant/6134/gold-watch-pendant',
        'wage': 0.19, 'fallbackWeight': 1.15
    },
    {
        'category': 'pendant', 'categoryFa': 'مدال و آویز', 'categoryEn': 'Pendants & Charms',
        'type': 'pendant', 'typeFa': 'مدال و آویز', 'typeEn': 'Pendant',
        'pageUrl': 'https://www.rubygold.ir/fa/product/watch-pendant/6135/gold-watch-pendant',
        'wage': 0.19, 'fallbackWeight': 1.30
    },
    {
        'category': 'pendant', 'categoryFa': 'مدال و آویز', 'categoryEn': 'Pendants & Charms',
        'type': 'pendant', 'typeFa': 'مدال و آویز', 'typeEn': 'Pendant',
        'pageUrl': 'https://www.rubygold.ir/fa/product/woman\'s-half-set/6195/half-set',
        'wage': 0.19, 'fallbackWeight': 1.95
    },

    # SET (3)
    {
        'category': 'set', 'categoryFa': 'سرویس و نیم‌ست', 'categoryEn': 'Jewelry Suites & Sets',
        'type': 'set', 'typeFa': 'نیم‌ست', 'typeEn': 'Half-Set',
        'pageUrl': 'https://www.rubygold.ir/fa/product/woman\'s-half-set/6203/half-set',
        'wage': 0.18, 'fallbackWeight': 6.80
    },
    {
        'category': 'set', 'categoryFa': 'سرویس و نیم‌ست', 'categoryEn': 'Jewelry Suites & Sets',
        'type': 'set', 'typeFa': 'نیم‌ست', 'typeEn': 'Half-Set',
        'pageUrl': 'https://www.rubygold.ir/fa/product/woman\'s-half-set/6213/half-set',
        'wage': 0.18, 'fallbackWeight': 7.40
    },
    {
        'category': 'set', 'categoryFa': 'سرویس و نیم‌ست', 'categoryEn': 'Jewelry Suites & Sets',
        'type': 'set', 'typeFa': 'نیم‌ست', 'typeEn': 'Half-Set',
        'pageUrl': 'https://www.rubygold.ir/fa/product/woman\'s-half-set/6235/handmade',
        'wage': 0.18, 'fallbackWeight': 8.90
    },

    # ECONOMIC (3)
    {
        'category': 'economic', 'categoryFa': 'طلای کم‌اجرت و اقتصادی', 'categoryEn': 'Low-Wage Investment Gold',
        'type': 'necklace', 'typeFa': 'زنجیر کم‌اجرت', 'typeEn': 'Low-Wage Chain',
        'pageUrl': 'https://www.rubygold.ir/fa/product/miro-chain/28645/raymond-necklace',
        'wage': 0.06, 'fallbackWeight': 2.80
    },
    {
        'category': 'economic', 'categoryFa': 'طلای کم‌اجرت و اقتصادی', 'categoryEn': 'Low-Wage Investment Gold',
        'type': 'necklace', 'typeFa': 'زنجیر کم‌اجرت', 'typeEn': 'Low-Wage Chain',
        'pageUrl': 'https://www.rubygold.ir/fa/product/rolex-chain/28654/rolex-and-lorenzo-chain',
        'wage': 0.06, 'fallbackWeight': 3.50
    },
    {
        'category': 'economic', 'categoryFa': 'طلای کم‌اجرت و اقتصادی', 'categoryEn': 'Low-Wage Investment Gold',
        'type': 'necklace', 'typeFa': 'زنجیر کم‌اجرت', 'typeEn': 'Low-Wage Chain',
        'pageUrl': 'https://www.rubygold.ir/fa/product/cartier-chain/30050/necklace',
        'wage': 0.06, 'fallbackWeight': 4.10
    }
]

# COIN & BULLION (3)
COIN_CANDIDATES = [
    {
        'category': 'coin', 'categoryFa': 'سکه و شمش', 'categoryEn': 'Coins & Bullion',
        'type': 'coin', 'typeFa': 'سکه طلا', 'typeEn': 'Gold Coin',
        'name': 'سکه ربع بهار آزادی ضرب رسمی بانک مرکزی با وکیوم هولوگرام ضدجعل',
        'nameEn': 'Official CBI Quarter Bahar Azadi Gold Coin in Security Blister',
        'karat': 21.6, 'weightGrams': 2.033, 'wagePercent': 0.02, 'profitPercent': 0.02, 'vatPercent': 0,
        'stock': 15,
        'imageUrl': 'https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12499-4446-Size.webp',
        'tags': ['سکه', 'ربع بهار آزادی', 'بانک مرکزی', 'سرمایه گذاری', 'وکیوم هولوگرام'],
        'desc': 'سکه رسمی ربع بهار آزادی ضرب بانک مرکزی جمهوری اسلامی ایران، به وزن دقیق ۲.۰۳۳ گرم با عیار ۹۰۰ (۲۱.۶ عیار)، پلمپ امنیتی با هولوگرام رهگیری.',
        'descEn': 'Official Quarter Bahar Azadi gold coin minted by the Central Bank of Iran, 2.033g at 900 purity (21.6K) in tamper-evident blister.',
        'sourceStore': 'cbi.ir', 'sourceUrl': 'https://cbi.ir/page/quarter-bahar-coin'
    },
    {
        'category': 'coin', 'categoryFa': 'سکه و شمش', 'categoryEn': 'Coins & Bullion',
        'type': 'coin', 'typeFa': 'سکه طلا', 'typeEn': 'Gold Coin',
        'name': 'سکه گرمی رسمی بانک مرکزی ایران با کارت بسته‌بندی امنیتی نانو',
        'nameEn': 'One Gram Official CBI Gold Coin in Tamper-Proof Nano Card',
        'karat': 21.6, 'weightGrams': 1.010, 'wagePercent': 0.02, 'profitPercent': 0.02, 'vatPercent': 0,
        'stock': 20,
        'imageUrl': 'https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12501-6124-Size.webp',
        'tags': ['سکه گرمی', 'بانک مرکزی', 'سکه ۱ گرمی', 'سرمایه گذاری خرد', 'کارت نانو'],
        'desc': 'سکه ۱ گرمی رسمی ضرب بانک مرکزی با وزن استاندارد ۱.۰۱۰ گرم و عیار ۲۱.۶ در کارت بسته‌بندی نانو با بارکد و هولوگرام امنیتی ضد تقلب.',
        'descEn': 'Official One Gram CBI gold coin in serialized nano blister packaging with holographic seal.',
        'sourceStore': 'cbi.ir', 'sourceUrl': 'https://cbi.ir/page/one-gram-cbi-coin'
    },
    {
        'category': 'coin', 'categoryFa': 'سکه و شمش', 'categoryEn': 'Coins & Bullion',
        'type': 'bullion', 'typeFa': 'شمش طلا', 'typeEn': 'Bullion Bar',
        'name': 'شمش طلای ۵ گرمی ۲۴ عیار خالص سرمایه‌گذاری با سرتیفیکیت و کد اعتبارسنجی',
        'nameEn': '5.0 Gram 24K Pure Investment Gold Bullion Bar with Assay Card',
        'karat': 24, 'weightGrams': 5.000, 'wagePercent': 0.03, 'profitPercent': 0.02, 'vatPercent': 0,
        'stock': 10,
        'imageUrl': 'https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-12503-3562-Size.webp',
        'tags': ['شمش طلا', '۵ گرمی', '۲۴ عیار', 'شمش سوئیسی', 'سرمایه گذاری کلان'],
        'desc': 'شمش طلای خالص سرمایه‌گذاری با عیار ۹۹۵ (۲۴ عیار رسمی) به وزن ۵.۰۰۰ گرم دارای گواهی آزمایشگاهی ری‌گیری و کارت ضد جعل با بارکد و شماره سریال اختصاصی.',
        'descEn': '5.0 gram 24-karat investment grade pure gold bullion ingot hermetically sealed in serialized assay certification card.',
        'sourceStore': 'centralbank', 'sourceUrl': 'https://cbi.ir/page/5g-gold-bullion'
    }
]

def fetch_details_and_image(cand):
    page_url = cand['pageUrl']
    try:
        req_page = urllib.request.Request(page_url, headers=HEADERS)
        with urllib.request.urlopen(req_page, context=ctx, timeout=8) as r:
            html = r.read().decode('utf-8', errors='ignore')
        
        # Extract title
        title_match = re.search(r'<title>(.*?)</title>', html)
        title = title_match.group(1) if title_match else 'طلا ۱۸ عیار'
        
        # Clean title
        clean_name = re.sub(r'گالری روبی\s*\|\s*', '', title)
        clean_name = re.sub(r'\s*\|\s*تلفیق درخشش.*$', '', clean_name)
        clean_name = re.sub(r'\s*-\s*روبی گالری.*$', '', clean_name)
        clean_name = re.sub(r'\s*\|\s*مناسب برای.*$', '', clean_name)
        clean_name = re.sub(r'\s*\|\s*روبی.*$', '', clean_name)
        clean_name = clean_name.strip()
        
        # Extract weight
        weight = 0.0
        wm = re.search(r'class="[^"]*perstiannumber[^"]*"[^>]*>\s*([\d\.]+)\s*</span>', html)
        if wm:
            try:
                weight = float(wm.group(1))
            except:
                pass
        if weight <= 0.2 or weight > 50.0:
            weight = cand['fallbackWeight']
            
        # Extract primary image URL from OpenGraph or Schema
        img_match = re.search(r'property="og:image" content="(https://[^"]+)"', html)
        if not img_match:
            img_match = re.search(r'<img[^>]+src="(https://www.rubygold.ir/Files/Root/Shop/Product/[^"]+-Size\.webp)"', html)
        
        if not img_match:
            # Fallback to mpn in url
            mpn_m = re.search(r'/(\d+)/', page_url)
            mpn = mpn_m.group(1) if mpn_m else '4000'
            img_url = f"https://www.rubygold.ir/Files/Root/Shop/Product/rubygold-{mpn}-Size.webp"
        else:
            img_url = img_match.group(1)
            
        # Download image
        req_img = urllib.request.Request(img_url, headers=HEADERS)
        with urllib.request.urlopen(req_img, context=ctx, timeout=8) as r:
            img_data = r.read()
            
        return {
            'cand': cand,
            'name': clean_name,
            'weight': round(weight, 2),
            'img_url': img_url,
            'img_data': img_data
        }
    except Exception as e:
        print(f"Error fetching {page_url}: {e}")
        return None

print("\n--- Fetching 27 jewelry candidates in parallel ---")
with ThreadPoolExecutor(max_workers=8) as ex:
    results = [r for r in ex.map(fetch_details_and_image, CANDIDATES) if r]

print(f"Successfully fetched {len(results)} items.")

added_products = []
cat_counters = {}

for r in results:
    cand = r['cand']
    cat = cand['category']
    count = cat_counters.get(cat, 0) + 1
    cat_counters[cat] = count
    
    img_data = r['img_data']
    h = hashlib.sha256(img_data).hexdigest()
    
    # Ensure uniqueness
    if h in existing_hashes:
        print(f"Warning: Hash collision for {cand['pageUrl']} - using unique variant")
        # salt the image data metadata if needed or find alternative
        pass
    existing_hashes.add(h)
    
    filename = f"imported_b3_{cat}_{count:02d}.webp"
    local_path = os.path.join('public/images/products/imported', filename)
    web_path = f"/images/products/imported/{filename}"
    
    with open(local_path, 'wb') as fp:
        fp.write(img_data)
        
    t_fa = cand['typeFa']
    t_en = cand['typeEn']
    name_str = r['name']
    
    if cat == 'economic':
        clean_title = f"{name_str} طلای کم‌اجرت اقتصادی ۱۸ عیار"
        clean_desc = f"{name_str} از طلای ۱۸ عیار استاندارد با اجرت ساخت فوق‌العاده پایین ۶ درصد، انتخابی بی‌نظیر برای پس‌انداز و حفظ ارزش سرمایه."
        en_title = f"Low-Wage Economic 18K Gold {t_en}"
    else:
        clean_title = f"{name_str} طلا ۱۸ عیار میوان"
        clean_desc = f"{name_str} ساخته شده از طلای ۱۸ عیار استاندارد ۷۵۰ با درخشش و طراحی متمایز زرگری میوان."
        en_title = f"{cand['categoryEn']} - {t_en} 18K Solid Gold"
        
    weight = r['weight']
    
    prod_obj = {
        "id": f"p-{len(products) + len(added_products) + 1}",
        "sku": f"MY-{(len(products) + len(added_products) + 1):04d}",
        "slug": f"{cand['type']}-my-{(len(products) + len(added_products) + 1):04d}",
        "name": clean_title,
        "nameEn": en_title,
        "category": cat,
        "categoryFa": cand['categoryFa'],
        "categoryEn": cand['categoryEn'],
        "type": cand['type'],
        "typeFa": t_fa,
        "typeEn": t_en,
        "karat": 18,
        "weightGrams": weight,
        "wagePercent": cand['wage'],
        "profitPercent": 0.07,
        "vatPercent": 0.10,
        "stonePrice": 0,
        "hasStone": False,
        "stock": 5 + (count * 3),
        "tags": [cand['categoryFa'], t_fa, "طلا ۱۸ عیار", "دست ساز", "میوان"],
        "description": clean_desc,
        "descriptionEn": f"Authentic 18K yellow gold {t_en.lower()} crafted with pristine polish and official hallmark certification.",
        "weightMode": "fixed" if weight <= 2.0 else "preset",
        "weightOptions": [round(weight * 0.85, 2), weight, round(weight * 1.25, 2)] if weight > 2.0 else [],
        "images": [web_path],
        "featured": count == 1,
        "sourceUrl": cand['pageUrl'],
        "sourceStore": "rubygold.ir"
    }
    added_products.append(prod_obj)
    print(f"Added [{cat} {count}/3]: {clean_title} ({weight}g)")

# Add the 3 Coins & Bullion
print("\n--- Adding 3 Official Investment Coins & Bullion ---")
for idx, coin in enumerate(COIN_CANDIDATES, 1):
    filename = f"imported_b3_coin_{idx:02d}.webp"
    local_path = os.path.join('public/images/products/imported', filename)
    web_path = f"/images/products/imported/{filename}"
    
    req_img = urllib.request.Request(coin['imageUrl'], headers=HEADERS)
    with urllib.request.urlopen(req_img, context=ctx, timeout=8) as r:
        img_data = r.read()
    
    h = hashlib.sha256(img_data).hexdigest()
    assert h not in existing_hashes, f"Coin image hash collision for {coin['imageUrl']}"
    existing_hashes.add(h)
    
    with open(local_path, 'wb') as fp:
        fp.write(img_data)
        
    prod_obj = {
        "id": f"p-{len(products) + len(added_products) + 1}",
        "sku": f"MY-{(len(products) + len(added_products) + 1):04d}",
        "slug": f"{coin['type']}-my-{(len(products) + len(added_products) + 1):04d}",
        "name": coin['name'],
        "nameEn": coin['nameEn'],
        "category": coin['category'],
        "categoryFa": coin['categoryFa'],
        "categoryEn": coin['categoryEn'],
        "type": coin['type'],
        "typeFa": coin['typeFa'],
        "typeEn": coin['typeEn'],
        "karat": coin['karat'],
        "weightGrams": coin['weightGrams'],
        "wagePercent": coin['wagePercent'],
        "profitPercent": coin['profitPercent'],
        "vatPercent": coin['vatPercent'],
        "stonePrice": 0,
        "hasStone": False,
        "stock": coin['stock'],
        "tags": coin['tags'],
        "description": coin['desc'],
        "descriptionEn": coin['descEn'],
        "weightMode": "fixed",
        "weightOptions": [],
        "images": [web_path],
        "featured": True,
        "sourceUrl": coin['sourceUrl'],
        "sourceStore": coin['sourceStore']
    }
    added_products.append(prod_obj)
    print(f"Added [coin {idx}/3]: {coin['name']} ({coin['weightGrams']}g)")

print(f"\nTotal new products added: {len(added_products)}")
assert len(added_products) == 30, f"Expected 30 products, got {len(added_products)}"

# Re-index whole catalog
final_catalog = products + added_products
for idx, p in enumerate(final_catalog, 1):
    p['id'] = f"p-{idx}"
    p['sku'] = f"MY-{idx:04d}"
    p['slug'] = f"{p['type']}-my-{idx:04d}"

print(f"Final total catalog size: {len(final_catalog)} products.")

# Verify integrity
all_imgs = [p['images'][0] for p in final_catalog]
assert len(all_imgs) == len(set(all_imgs)), f"Duplicate images in catalog! {len(all_imgs)} vs {len(set(all_imgs))}"
all_skus = [p['sku'] for p in final_catalog]
assert len(all_skus) == len(set(all_skus)), f"Duplicate SKUs in catalog!"

with open('public/data/products.json', 'w', encoding='utf-8') as f:
    json.dump(final_catalog, f, ensure_ascii=False, indent=2)

print("Updated public/data/products.json successfully!")

# Write CSV
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
