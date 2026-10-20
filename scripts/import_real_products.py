#!/usr/bin/env python3
"""
MEYVAN Gold & Jewelry - Real Product Importer from Dorreh Gold
Extracts real, verifiable gold jewelry products, downloads actual high-res photos,
and formats them for seamless integration into MEYVAN's catalog.
"""

import urllib.request
import urllib.parse
import json
import re
import html
import os
import sys

DEST_IMG_DIR = os.path.join(os.getcwd(), 'public', 'images', 'products', 'dorreh')
os.makedirs(DEST_IMG_DIR, exist_ok=True)

SITEMAP_URL = 'https://dorrehgold.ir/wp-sitemap-posts-product-1.xml'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fa,en;q=0.9',
}

def fetch_url(url, timeout=15):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()

def download_image(url, local_filename):
    dest_path = os.path.join(DEST_IMG_DIR, local_filename)
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        return f"/images/products/dorreh/{local_filename}"
    
    try:
        data = fetch_url(url, timeout=20)
        if len(data) > 1000:
            with open(dest_path, 'wb') as f:
                f.write(data)
            print(f"  [IMG DOWNLOADED] {local_filename} ({len(data)} bytes)")
            return f"/images/products/dorreh/{local_filename}"
        else:
            print(f"  [IMG TOO SMALL] {url} -> {len(data)} bytes")
            return None
    except Exception as e:
        print(f"  [IMG ERROR] Failed to download {url}: {e}")
        return None

def main():
    print("=== Step 1: Reading Sitemap ===")
    try:
        sitemap_xml = fetch_url(SITEMAP_URL).decode('utf-8')
    except Exception as e:
        print(f"Fatal error fetching sitemap: {e}")
        sys.exit(1)

    urls = re.findall(r'<loc>(https://dorrehgold.ir/product/[^<]+)</loc>', sitemap_xml)
    print(f"Total candidate URLs: {len(urls)}")

    candidates = [
        # Earrings
        'https://dorrehgold.ir/product/%da%af%d9%88%d8%b4%d9%88%d8%a7%d8%b1%d9%87-%d9%85%db%8c%d8%ae%db%8c-%d8%aa%d9%88%d9%be%db%8c/',
        'https://dorrehgold.ir/product/%da%af%d9%88%d8%b4%d9%88%d8%a7%d8%b1%d9%87-%d9%be%db%8c%da%86%db%8c-%d8%af%d8%a7%d9%85%d9%84%d9%87/',
        'https://dorrehgold.ir/product/%da%af%d9%88%d8%b4%d9%88%d8%a7%d8%b1%d9%87-%d8%a8%db%8c%d8%b6%db%8c-%da%af%d9%88%db%8c/',
        # Rings
        'https://dorrehgold.ir/product/%d8%a7%d9%86%da%af%d8%b4%d8%aa%d8%b1-%d9%88%d9%86%da%a9%d9%84%db%8c%d9%81-%d8%b7%d9%84%d8%a7-%d8%b3%d9%81%db%8c%d8%af/',
        'https://dorrehgold.ir/product/%d8%a7%d9%86%da%af%d8%b4%d8%aa%d8%b1-%d9%be%d8%a7%d9%be%db%8c%d9%88%d9%86/',
        'https://dorrehgold.ir/product/%d8%a7%d9%86%da%af%d8%b4%d8%aa%d8%b1-%d9%86%d9%82%d8%b7%d9%87-%d8%ae%d8%b7/',
        'https://dorrehgold.ir/product/%d8%a7%d9%86%da%af%d8%b4%d8%aa%d8%b1-love/',
        # Necklaces
        'https://dorrehgold.ir/product/%da%af%d8%b1%d8%af%d9%86%d8%a8%d9%86%d8%af-%da%af%d9%88%db%8c-%d8%aa%d8%b1%d8%a7%d8%b4/',
        'https://dorrehgold.ir/product/%da%af%d8%b1%d8%af%d9%86%d8%a8%d9%86%d8%af-%d8%af%d8%b1%db%8c%d9%85-%da%a9%da%86%d8%b1/',
        'https://dorrehgold.ir/product/%da%af%d8%b1%d8%af%d9%86%d8%a8%d9%86%d8%af-%d9%be%d8%b1%d9%88%d8%a7%d9%86%d9%87-%d8%b3%d9%86%da%af-%d8%b5%d9%88%d8%b1%d8%aa%db%8c/',
        # Bracelets & Bangles
        'https://dorrehgold.ir/product/%d8%af%d8%b3%d8%aa%d8%a8%d9%86%d8%af-%da%af%d9%88%db%8c-%d8%a7%d9%84%d8%a8%d8%b1%d9%86%d8%a7%d8%af%d9%88-%d8%b3%d9%87-%d8%b1%d9%86%da%af/',
        'https://dorrehgold.ir/product/%d8%af%d8%b3%d8%aa%d8%a8%d9%86%d8%af-%da%a9%d8%a7%d8%b1%d8%aa%db%8c%d9%87/',
        'https://dorrehgold.ir/product/%d8%a8%d9%86%da%af%d9%84-%d9%be%db%8c%da%86-%da%a9%d8%a7%d8%b1%d8%aa%db%8c%d9%87/',
        # Pendants
        'https://dorrehgold.ir/product/%d8%a2%d9%88%db%8c%d8%b2-%d9%85%d8%a7%d9%87/',
        'https://dorrehgold.ir/product/%d8%a2%d9%88%db%8c%d8%b2-%d9%81%d8%b1%d8%b4%d8%aa%d9%87-3/',
        'https://dorrehgold.ir/product/%d8%a2%d9%88%db%8c%d8%b2-%d9%82%d9%84%d8%a8-%d8%aa%d9%88-%d8%ae%d8%a7%d9%84%db%8c/'
    ]

    scraped_products = []

    for idx, u in enumerate(candidates):
        try:
            print(f"\nProcessing [{idx+1}/{len(candidates)}]: {u}")
            raw_html = fetch_url(u).decode('utf-8')

            # Title
            title_m = re.search(r'<h1[^>]*class=\"[^\"]*product_title[^\"]*\"[^>]*>(.*?)</h1>', raw_html, re.DOTALL)
            if not title_m:
                print("  Skipping: No title found")
                continue
            title = html.unescape(re.sub(r'<[^>]+>', '', title_m.group(1))).strip()

            # Weight extraction
            weight = None
            var_match = re.search(r'data-product_variations=\"([^\"]+)\"', raw_html)
            image_urls = []
            orig_price = None

            if var_match:
                unescaped = html.unescape(var_match.group(1))
                try:
                    variations = json.loads(unescaped)
                    for v in variations:
                        if v.get('weight') and not weight:
                            try:
                                weight = float(v.get('weight'))
                            except:
                                pass
                        if v.get('display_price') and not orig_price:
                            orig_price = float(v.get('display_price'))
                        img_url = v.get('image', {}).get('url') or v.get('image', {}).get('src')
                        if img_url and img_url not in image_urls:
                            image_urls.append(img_url)
                except Exception as e:
                    print(f"  Var parse err: {e}")

            if not weight:
                w_m = re.search(r'([0-9]+(?:[\.\/][0-9]+)?)\s*گرم', raw_html)
                if w_m:
                    weight = float(w_m.group(1).replace('/', '.'))

            # Additional gallery images
            gallery_matches = re.findall(r'<div[^>]*class=\"[^\"]*woocommerce-product-gallery__image[^\"]*\"[^>]*data-thumb=\"([^\"]+)\"', raw_html)
            for gm in gallery_matches:
                full_cand = gm.replace('-150x200', '').replace('-150x150', '').replace('-300x300', '').replace('-600x800', '')
                if full_cand not in image_urls:
                    image_urls.append(full_cand)
                if gm not in image_urls:
                    image_urls.append(gm)

            # If still no images, check og:image or wp-post-image
            if not image_urls:
                og_img = re.search(r'<meta property=\"og:image\" content=\"([^\"]+)\"', raw_html)
                if og_img:
                    image_urls.append(og_img.group(1))

            # Short description
            desc_m = re.search(r'<div[^>]*class=\"[^\"]*woocommerce-product-details__short-description[^\"]*\"[^>]*>(.*?)</div>', raw_html, re.DOTALL)
            desc = html.unescape(re.sub(r'<[^>]+>', ' ', desc_m.group(1))).strip() if desc_m else ''

            if not weight:
                print(f"  Skipping: weight could not be strictly verified")
                continue

            if not image_urls:
                print(f"  Skipping: no images found")
                continue

            print(f"  Verified: {title} | Weight: {weight}g | Images found: {len(image_urls)}")

            # Download images locally
            slug_en = re.sub(r'[^a-zA-Z0-9]', '_', u.split('/')[-2])
            if not slug_en or len(slug_en) < 3:
                slug_en = f"item_{idx+1}"

            local_images = []
            for img_i, remote_img in enumerate(image_urls[:3]):
                ext = '.jpg'
                if '.png' in remote_img.lower():
                    ext = '.png'
                elif '.webp' in remote_img.lower():
                    ext = '.webp'
                img_name = f"dorreh_{slug_en}_{img_i+1}{ext}"
                local_path = download_image(remote_img, img_name)
                if local_path:
                    local_images.append(local_path)

            if not local_images:
                print(f"  Skipping: image download failed")
                continue

            # Determine category & type
            title_lower = title.lower()
            category = 'ring'
            categoryFa = 'انگشتر'
            ptype = 'ring'
            ptypeFa = 'انگشتر'

            if any(k in title_lower for k in ['گوشواره', 'بخیه']):
                category = 'earrings'
                categoryFa = 'گوشواره'
                ptype = 'earrings'
                ptypeFa = 'گوشواره'
            elif any(k in title_lower for k in ['گردنبند', 'زنجیر', 'طوق']):
                category = 'necklace'
                categoryFa = 'گردنبند'
                ptype = 'necklace'
                ptypeFa = 'گردنبند'
            elif any(k in title_lower for k in ['دستبند', 'النگو', 'بنگل', 'پابند']):
                category = 'bracelet'
                categoryFa = 'دستبند'
                ptype = 'bracelet'
                ptypeFa = 'دستبند'
                if 'بنگل' in title_lower:
                    ptype = 'bangle'
                    ptypeFa = 'النگو و بنگل'
            elif any(k in title_lower for k in ['آویز', 'پلاک', 'مدال']):
                category = 'pendant'
                categoryFa = 'آویز و پلاک'
                ptype = 'pendant'
                ptypeFa = 'آویز'
            elif any(k in title_lower for k in ['سرویس', 'نیم‌ست']):
                category = 'set'
                categoryFa = 'نیم‌ست'
                ptype = 'half_set'
                ptypeFa = 'نیم‌ست'

            # Determine tags
            tags = [categoryFa, ptypeFa, '۱۸ عیار', 'طلای استاندارد ۷۵۰', 'کالکشن معاصر']
            has_stone = False
            stone_price = 0
            if any(k in title_lower for k in ['سنگ', 'نگین', 'مروارید', 'صدف', 'فیروزه']):
                has_stone = True
                tags.append('نگین‌دار')
            else:
                tags.append('بدون نگین')

            if weight <= 1.5:
                tags.append('مینیمال')
            elif weight >= 5.0:
                tags.append('سنگین و مجلسی')

            # Build description
            clean_desc = desc if desc else f"ساخته شده از طلای خالص ۱۸ عیار با کد استاندارد ۷۵۰ و طراحی دقیق کارگاهی. با فاکتور رسمی اتحادیه طلا و جواهر و شناسنامه اصالت میوان."

            scraped_products.append({
                'sourceTitle': title,
                'weightGrams': weight,
                'category': category,
                'categoryFa': categoryFa,
                'type': ptype,
                'typeFa': ptypeFa,
                'localImages': local_images,
                'remoteImages': image_urls,
                'hasStone': has_stone,
                'stonePrice': stone_price,
                'tags': tags,
                'desc': clean_desc,
                'sourceUrl': u,
                'originalPrice': orig_price
            })

        except Exception as e:
            print(f"Error processing {u}: {e}")

    print(f"\nSuccessfully scraped and verified {len(scraped_products)} products!")
    with open('scripts/scraped_dorreh_products.json', 'w', encoding='utf-8') as f:
        json.dump(scraped_products, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main()
