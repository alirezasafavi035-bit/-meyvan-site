#!/usr/bin/env python3
"""
MEYVAN - Safe Catalog Integrator for Imported Real Products
Integrates verified products into public/data/products.json with full schema compliance,
unique SKUs, multi-angle imagery, and pricing engine compatibility.
"""

import json
import shutil
import os
import re

CATALOG_PATH = 'public/data/products.json'
BACKUP_PATH = 'public/data/products.backup.json'
SCRAPED_PATH = 'scripts/scraped_dorreh_products.json'

def main():
    print("=== Step 1: Backing up Catalog ===")
    shutil.copyfile(CATALOG_PATH, BACKUP_PATH)
    print(f"Backed up {CATALOG_PATH} to {BACKUP_PATH}")

    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        existing_products = json.load(f)

    with open(SCRAPED_PATH, 'r', encoding='utf-8') as f:
        scraped_items = json.load(f)

    print(f"Existing products: {len(existing_products)}")
    print(f"Scraped verified items: {len(scraped_items)}")

    existing_skus = set(p['sku'] for p in existing_products)
    existing_slugs = set(p['slug'] for p in existing_products)

    new_products = []
    start_sku_num = 501

    for idx, item in enumerate(scraped_items):
        sku = f"MY-{start_sku_num + idx:04d}"
        
        # Clean slug
        title_latin = {
            'گوشواره میخی توپی': 'earrings-dorreh-stud-ball',
            'گوشواره پیچی دامله': 'earrings-dorreh-dome-screw',
            'گوشواره بیضی گوی': 'earrings-dorreh-oval-bead',
            'انگشتر ونکلیف طلا سفید': 'ring-dorreh-vancleef-whitegold',
            'انگشتر پاپیون': 'ring-dorreh-ribbon-bow',
            'انگشتر طرح مینیمال': 'ring-dorreh-minimal-love',
            'گردنبند گوی تراش': 'necklace-dorreh-faceted-bead',
            'دستبند گوی البرنادو سه رنگ': 'bracelet-dorreh-albernado-tricolor',
            'دستبند کارتیه': 'bracelet-dorreh-cartier-chain',
            'بنگل پیچ کارتیه': 'bracelet-dorreh-cartier-screw-bangle',
            'آویز ماه': 'pendant-dorreh-crescent-moon',
            'آویز فرشته': 'pendant-dorreh-angel-charm',
            'آویز قلب تو خالی': 'pendant-dorreh-hollow-heart',
            'سرویس ونکلیف تراش ریز سیلور': 'set-dorreh-vancleef-silvercut',
            'سرویس دایره طلایی': 'set-dorreh-golden-circle-suite',
            'طوق ستاره': 'necklace-dorreh-star-choker'
        }.get(item['sourceTitle'], f"gold-dorreh-{item['category']}-{start_sku_num + idx}")

        slug = f"{title_latin}-{start_sku_num + idx}"

        # Ensure unique SKU and slug
        if sku in existing_skus:
            raise ValueError(f"Duplicate SKU generated: {sku}")
        if slug in existing_slugs:
            raise ValueError(f"Duplicate slug generated: {slug}")

        existing_skus.add(sku)
        existing_slugs.add(slug)

        # Name with MEYVAN 18k branding
        raw_name = item['sourceTitle']
        if 'طلا' not in raw_name:
            clean_name = f"{raw_name} طلا ۱۸ عیار"
        else:
            clean_name = f"{raw_name} ۱۸ عیار"

        w = item['weightGrams']
        min_w = max(0.4, round(w * 0.6, 2))
        max_w = round(w * 1.8, 2)
        step = 0.05 if w <= 2.0 else 0.1

        # Wage percentage
        wage = 0.16
        if item['category'] == 'bracelet' and item['type'] == 'bangle':
            wage = 0.18
        elif item['category'] == 'earrings' and w < 1.0:
            wage = 0.17
        elif item['category'] == 'pendant' and w < 1.0:
            wage = 0.15
        elif item['category'] == 'set':
            wage = 0.16
        elif item['category'] == 'necklace' and w > 4.0:
            wage = 0.15

        # Tags
        tags = item.get('tags', [])
        tags.extend(['کالکشن جدید', 'وارداتی معتبر', 'دره گلد', '۱۸ عیار استاندارد'])
        tags = list(dict.fromkeys(tags)) # unique

        prod_record = {
            "id": f"p-{start_sku_num + idx}",
            "sku": sku,
            "slug": slug,
            "name": clean_name,
            "category": item['category'],
            "categoryFa": item['categoryFa'],
            "type": item['type'],
            "typeFa": item['typeFa'],
            "karat": 18,
            "weightGrams": w,
            "wagePercent": wage,
            "profitPercent": 0.07,
            "vatPercent": 0.10,
            "stonePrice": item.get('stonePrice', 0),
            "hasStone": item.get('hasStone', False),
            "stock": 3,
            "images": item['localImages'],
            "tags": tags,
            "description": f"طلای ۱۸ عیار استاندارد با کد خلوص ۷۵۰. {item['desc']} همراه با فاکتور رسمی اتحادیه طلا و جواهر و شناسنامه هولوگرام‌دار اصالت میوان.",
            "createdAt": "2026-10-20T13:45:00.000Z",
            "featured": True,
            "weightMode": "custom_range",
            "minCustomWeight": min_w,
            "maxCustomWeight": max_w,
            "weightStep": step,
            "weightOptions": [min_w, w, max_w],
            "sourceUrl": item['sourceUrl'],
            "sourceStore": "دره گلد (dorrehgold.ir)"
        }
        new_products.append(prod_record)

    full_catalog = existing_products + new_products
    print(f"New total products in catalog: {len(full_catalog)}")

    with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(full_catalog, f, ensure_ascii=False, indent=2)

    print(f"Successfully integrated {len(new_products)} imported products into {CATALOG_PATH}!")

if __name__ == '__main__':
    main()
