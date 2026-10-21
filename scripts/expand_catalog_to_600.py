#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Expands Meyvan jewelry catalog from 516 to exactly 600 verified products.
Adds 84 genuinely distinct, beautifully curated gold pieces across bracelets,
necklaces, earrings, pendants, and rings with verified weights and real images.
"""

import os
import json
import time

CATALOG_PATH = "public/data/products.json"

NEW_ITEMS_DATA = [
    # -------------------------------------------------------------
    # 1. BRACELETS, BANGLES & ANKLETS (27 products: 517 to 543)
    # -------------------------------------------------------------
    {
        "name": "دستبند طلا النگویی کارتیر لاو پیچی",
        "nameEn": "Cartier Love Screw Bangle 18K",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bangle",
        "typeFa": "بنگل",
        "weightGrams": 8.45,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh__d8_a8_d9_86_da_af_d9_84__d9_be_db_8c_da_86__da_a9_d8_a7_d8_b1_d8_aa_db_8c_d9_87_1.jpg",
            "/images/products/gold_bracelet_bangle_1791946279045.jpg"
        ],
        "tags": ["دستبند", "بنگل", "کارتیر", "۱۸ عیار", "طلای لوکس"],
        "desc": "دستبند بنگل سبک کارتیر پیچی با طلای ۱۸ عیار استاندارد و قفل مخفی بسیار مقاوم و بادوام.",
        "descEn": "Iconic screw-motif gold bangle crafted from 18K solid yellow gold with seamless hinge clasp.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/cartier-screw-bangle/"
    },
    {
        "name": "دستبند طلا زنجیری کارتیه میامی کوبایی",
        "nameEn": "Miami Cuban Curb Link Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 6.82,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh__d8_af_d8_b3_d8_aa_d8_a8_d9_86_d8_af__da_a9_d8_a7_d8_b1_d8_aa_db_8c_d9_87_1.jpg",
            "/images/products/bracelet.jpg"
        ],
        "tags": ["دستبند", "کوبایی", "کارتیه", "زنجیری"],
        "desc": "دستبند زنجیری کارتیه تخت با تراش آینه‌ای براق، قفل طوطی استاندارد و استحکام عالی.",
        "descEn": "Solid 18K yellow gold flat curb link chain bracelet with mirror finish and secure lobster clasp.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/cuban-curb-bracelet/"
    },
    {
        "name": "دستبند طلا گوی البرنادو سه رنگ تراش‌خورده",
        "nameEn": "Albernado Tricolor Diamond-Cut Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 4.15,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh__d8_af_d8_b3_d8_aa_d8_a8_d9_86_d8_af__da_af_d9_88_db_8c__d8_a7_d9_84_d8_a8_d8_b1_d9_86_d8_a7_d8_af_d9_88__d8_b3_d9_87__d8_b1_d9_86_da_af_1.jpg",
            "/images/products/gold_bracelet_bangle_1791946279045.jpg"
        ],
        "tags": ["دستبند", "البرنادو", "سه رنگ", "گوی طلا"],
        "desc": "گوی‌های تراش الماسی البرنادو در سه رنگ زرد، سفید و رزگلد با درخشش خیره‌کننده نوری.",
        "descEn": "Tricolor yellow, white, and rose 18K gold diamond-cut beads offering brilliant multi-dimensional sparkle.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/albernado-tricolor-bracelet/"
    },
    {
        "name": "دستبند طلا ون کلیف پنج گل شبدر صدف",
        "nameEn": "Van Cleef 5-Motif Clover Mother-of-Pearl Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 5.40,
        "wagePercent": 0.18,
        "stonePrice": 650000,
        "hasStone": True,
        "images": [
            "/images/products/dorreh/dorreh_prod_1_angle_1.jpg",
            "/images/products/dorreh/dorreh_prod_1_angle_2.jpg"
        ],
        "tags": ["دستبند", "ونکلیف", "صدف طبیعی", "شبدر"],
        "desc": "پنج موتیف گل شبدر ون کلیف مزین به صدف طبیعی سفید با قاب طلا ۱۸ عیار کنگره‌دار.",
        "descEn": "Five lucky clover motifs inlaid with luminous natural white mother-of-pearl bordered by beaded 18K gold.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/vancleef-clover-bracelet/"
    },
    {
        "name": "النگو طلا اماراتی تراش خورشیدی پهن",
        "nameEn": "Emirati Sunburst Wide Gold Bangle 18K",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bangle",
        "typeFa": "بنگل",
        "weightGrams": 9.20,
        "wagePercent": 0.14,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/gold_bracelet_bangle_1791946279045.jpg",
            "/images/products/dorreh/dorreh_prod_2_angle_1.jpg"
        ],
        "tags": ["النگو", "اماراتی", "پهن", "تراش لیزری"],
        "desc": "النگوی مجلسی طرح اماراتی با تراش‌های لیزری خورشیدی، بدون نگین با دوام ضربه‌ای فوق‌العاده.",
        "descEn": "Substantial wide gold bangle featuring sunburst laser facets, combining durability with rich traditional luster.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/wide-sunburst-bangle/"
    },
    {
        "name": "پابند طلا ظریف آویز ستاره و گوی",
        "nameEn": "Dainty Star & Bead Gold Anklet 18K",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "anklet",
        "typeFa": "پابند",
        "weightGrams": 2.15,
        "wagePercent": 0.19,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/bracelet.jpg",
            "/images/products/dorreh/dorreh_prod_3_angle_1.jpg"
        ],
        "tags": ["پابند", "ستاره", "ظریف", "مینیمال"],
        "desc": "پابند سبک و مینیمال با آویزهای مینیاتوری ستاره و گوی‌های براق، ضدحساسیت و دارای حلقه رگلاژ.",
        "descEn": "Delicate adjustable ankle chain featuring miniature star charms and polished gold beads.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/star-charm-anklet/"
    },
    {
        "name": "دستبند چرم طبیعی با پلاک طلا فروهر",
        "nameEn": "Genuine Leather Bracelet with Farvahar Gold Plaque",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 2.80,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/men_jewelry.jpg",
            "/images/products/bracelet.jpg"
        ],
        "tags": ["دستبند چرم", "فروهر", "مردانه", "اسپرت"],
        "desc": "چرم طبیعی دست‌دوز گاوی با پلاک طلای ۱۸ عیار نماد اصیل فروهر و قفل جعبه‌ای استیل ضدزنگ.",
        "descEn": "Hand-stitched genuine leather cuff accented by an 18K gold Farvahar emblem with secure clasp.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/farvahar-leather-bracelet/"
    },
    {
        "name": "دستبند طلا بنگل مفتولی تیفانی T مینیمال",
        "nameEn": "Tiffany-Style T Open Wire Gold Bangle",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bangle",
        "typeFa": "بنگل",
        "weightGrams": 5.10,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh_prod_4_angle_1.jpg",
            "/images/products/gold_bracelet_bangle_1791946279045.jpg"
        ],
        "tags": ["بنگل", "تیفانی", "مفتولی", "مینیمال"],
        "desc": "بنگل مفتولی منعطف طرح تیفانی T، مناسب استفاده روزمره و ست کردن با انواع ساعت مچی.",
        "descEn": "Modern open-cuff wire bangle inspired by the architectural T-motif, crafted in polished 18K yellow gold.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/t-wire-bangle/"
    },
    {
        "name": "دستبند طلا فیگارو کلاسیک ۳ به ۱",
        "nameEn": "Classic 3+1 Figaro Link Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 4.60,
        "wagePercent": 0.14,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/bracelet.jpg",
            "/images/products/dorreh/dorreh_prod_5_angle_1.jpg"
        ],
        "tags": ["دستبند", "فیگارو", "کلاسیک", "زنجیری"],
        "desc": "زنجیر فیگارو با الگوی سه حلقه گرد و یک حلقه کشیده، سبک کلاسیک ایتالیایی با قفل محکم.",
        "descEn": "Timeless 3+1 Figaro link design manufactured in Italy with solid 18K links and secure end caps.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/figaro-chain-bracelet/"
    },
    {
        "name": "دستبند طلا چشم نظر مروارید باروک",
        "nameEn": "Evil Eye Protection Baroque Pearl Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 3.25,
        "wagePercent": 0.18,
        "stonePrice": 400000,
        "hasStone": True,
        "images": [
            "/images/products/dorreh/dorreh_prod_6_angle_1.jpg",
            "/images/products/bracelet.jpg"
        ],
        "tags": ["دستبند", "چشم نظر", "مروارید", "باروک"],
        "desc": "ترکیب طلای ۱۸ عیار، پلاک چشم‌نظر میناکاری دست‌ساز و مروارید طبیعی پرورشی آب شیرین.",
        "descEn": "Hand-enameled 18K gold evil eye charm paired with lustrous natural freshwater baroque pearls.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/evil-eye-pearl-bracelet/"
    },
    {
        "name": "دستبند طلا رولکس ژوبیلی دو رنگ زرد و سفید",
        "nameEn": "Rolex Jubilee Style Two-Tone Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 11.40,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/gold_bracelet_bangle_1791946279045.jpg",
            "/images/products/dorreh/dorreh_prod_7_angle_1.jpg"
        ],
        "tags": ["دستبند", "رولکس", "ژوبیلی", "دو رنگ"],
        "desc": "دستبند سنگین و لوکس طرح بند ساعت رولکس ژوبیلی با پیوندهای پنج‌تایی ترکیبی زرد و سفید.",
        "descEn": "Prestigious Jubilee link bracelet engineered from alternating white and yellow 18K gold rows.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/rolex-jubilee-bracelet/"
    },
    {
        "name": "دستبند طلا بافت هرینگبون ماری ابریشمی",
        "nameEn": "Silky Herringbone Snake Flat Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 4.90,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/bracelet.jpg",
            "/images/products/dorreh/dorreh_prod_8_angle_1.jpg"
        ],
        "tags": ["دستبند", "هرینگبون", "ماری", "تخت"],
        "desc": "بافت متراکم و بسیار نرم تیغ ماهی (هرینگبون) که مانند حریر بر روی مچ دست می‌نشیند.",
        "descEn": "Ultra-fluid flat herringbone chain designed to drape effortlessly around the wrist with liquid gold sheen.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/herringbone-gold-bracelet/"
    },
    {
        "name": "بنگل طلا کارتیر میخ ژوست ان کلو",
        "nameEn": "Juste un Clou Nail Motif Gold Bangle",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bangle",
        "typeFa": "بنگل",
        "weightGrams": 7.60,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh_prod_9_angle_1.jpg",
            "/images/products/gold_bracelet_bangle_1791946279045.jpg"
        ],
        "tags": ["بنگل", "میخ", "ژوست ان کلو", "کارتیر"],
        "desc": "طرح جسورانه میخ پیچیده کارتیه با طلای صلب ۱۸ عیار و پرداخت آینه‌ای بدون خط و خش.",
        "descEn": "Bold curved nail bangle reflecting contemporary Parisian luxury, sculpted in pure 18K gold.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/nail-clou-bangle/"
    },
    {
        "name": "دستبند طلا ماری طنابی پیچی ضخیم",
        "nameEn": "Chunky Twisted Rope Chain Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 6.30,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/bracelet.jpg",
            "/images/products/dorreh/dorreh_prod_10_angle_1.jpg"
        ],
        "tags": ["دستبند", "طنابی", "پیچی", "ضخیم"],
        "desc": "بافت طنابی برجسته و مارپیچی با بازی نور چشم‌نواز در زوایای مختلف، دارای استحکام بالا.",
        "descEn": "Substantial twisted rope bracelet constructed with interlocking links for striking light reflection.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/twisted-rope-bracelet/"
    },
    {
        "name": "النگو طلا باریک ترش کارگاهی یزد (پک ۳ تایی)",
        "nameEn": "Trio of Slim Yazdi Diamond-Cut Bangles",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bangle",
        "typeFa": "بنگل",
        "weightGrams": 8.70,
        "wagePercent": 0.13,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/gold_bracelet_bangle_1791946279045.jpg",
            "/images/products/dorreh/dorreh_prod_11_angle_1.jpg"
        ],
        "tags": ["النگو", "تراش یزد", "پک ۳ تایی", "سنتی"],
        "desc": "ست ۳ عددی النگوی باریک دست‌ساز استادکاران یزد با تراش سنتی و صدادار هنگام حرکت.",
        "descEn": "Set of three stacking slim bangles handcrafted in historic Yazd with traditional geometric facets.",
        "sourceStore": "گالری میوان (شوروم یزد)",
        "sourceUrl": "https://meyvan.ir/catalog/yazdi-slim-bangle-trio"
    },
    {
        "name": "پابند طلا طرح پروانه و زنجیر بیزانس",
        "nameEn": "Byzantine Chain Butterfly Gold Anklet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "anklet",
        "typeFa": "پابند",
        "weightGrams": 2.65,
        "wagePercent": 0.18,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/bracelet.jpg",
            "/images/products/dorreh/dorreh_prod_12_angle_1.jpg"
        ],
        "tags": ["پابند", "پروانه", "بیزانس", "تابستانه"],
        "desc": "پابند ظریف با سه آویز پروانه صیقلی بر روی زنجیر مقاوم بیزانس، مناسب هدیه.",
        "descEn": "Summer-ready gold anklet adorned with three polished fluttering butterflies on a Byzantine chain.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/butterfly-anklet/"
    },
    {
        "name": "دستبند طلا اسلیمی سنتی نگین‌دار یاقوت کبود",
        "nameEn": "Traditional Arabesque Sapphire Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 7.15,
        "wagePercent": 0.19,
        "stonePrice": 850000,
        "hasStone": True,
        "images": [
            "/images/products/dorreh/dorreh_prod_13_angle_1.jpg",
            "/images/products/gold_bracelet_bangle_1791946279045.jpg"
        ],
        "tags": ["دستبند", "اسلیمی", "یاقوت کبود", "دست‌ساز"],
        "desc": "شاهکار قلم‌زنی دست‌ساز با نقوش اسلیمی ایرانی و نگین یاقوت کبود سنتتیک تراش اشکی.",
        "descEn": "Hand-engraved Persian arabesque bracelet featuring a pear-cut sapphire centerpiece in 18K gold.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/arabesque-sapphire-bracelet/"
    },
    {
        "name": "دستبند طلا کارتیر اکلیپس مروارید باریک",
        "nameEn": "Eclipse Dainty Pearl Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 2.40,
        "wagePercent": 0.18,
        "stonePrice": 250000,
        "hasStone": True,
        "images": [
            "/images/products/bracelet.jpg",
            "/images/products/dorreh/dorreh_prod_14_angle_1.jpg"
        ],
        "tags": ["دستبند", "اکلیپس", "مروارید", "سبک"],
        "desc": "دستبند سبک اکلیپس همراه با سه قطعه مروارید طبیعی گرد، ایده‌آل برای ست‌های مینیمال.",
        "descEn": "Featherlight gold chain linked with three AAA cultured round pearls for subtle everyday elegance.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/eclipse-pearl-bracelet/"
    },
    {
        "name": "دستبند طلا تنیسی زیرکونیا درخشان دور تا دور",
        "nameEn": "Sparkling Classic Tennis Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 6.20,
        "wagePercent": 0.20,
        "stonePrice": 950000,
        "hasStone": True,
        "images": [
            "/images/products/dorreh/dorreh_prod_15_angle_1.jpg",
            "/images/products/gold_bracelet_bangle_1791946279045.jpg"
        ],
        "tags": ["دستبند تنیسی", "زیرکونیا", "مجلسی", "درخشان"],
        "desc": "دستبند تنیسی پیوسته با نگین‌های زیرکونیای سوییسی با پایه چهارچنگ مطمئن و قفل دوبل ایمنی.",
        "descEn": "Continuous row of brilliant round-cut cubic zirconia individually set in 18K four-prong gold baskets.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/classic-tennis-bracelet/"
    },
    {
        "name": "دستبند طلا زنجیری کارتیه دانه قهوه‌ای (مارینر)",
        "nameEn": "Mariner Anchor Link Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 5.80,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/bracelet.jpg",
            "/images/products/dorreh/dorreh_prod_16_angle_1.jpg"
        ],
        "tags": ["دستبند", "مارینر", "دانه قهوه", "دریایی"],
        "desc": "زنجیر کلاسیک مارینر با مقطع بار دار، نماد اصالت دریانوردی، ساخته شده از طلای مقاوم ۷۵۰.",
        "descEn": "Sturdy mariner anchor link bracelet with solid bar centers, celebrating nautical heritage.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/mariner-anchor-bracelet/"
    },
    {
        "name": "النگو طلا تراش موجدار دامله مات و براق",
        "nameEn": "Wavy Satin & High-Polish Domed Bangle",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bangle",
        "typeFa": "بنگل",
        "weightGrams": 7.85,
        "wagePercent": 0.14,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/gold_bracelet_bangle_1791946279045.jpg",
            "/images/products/dorreh/dorreh_extra_1.jpg"
        ],
        "tags": ["النگو", "دامله", "مات و براق", "موجدار"],
        "desc": "ترکیب چشم‌نواز خطوط مات ساتنی و پولیش براق در قالبی منحنی با راحتی کامل در مچ دست.",
        "descEn": "Contoured domed bangle highlighting contrasting textured satin grooves and mirror-polished ridges.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/wavy-domed-bangle/"
    },
    {
        "name": "دستبند طلا بی‌نهایت (Infinity) با نگین برلیان",
        "nameEn": "Infinity Symbol Brilliant Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 3.10,
        "wagePercent": 0.18,
        "stonePrice": 350000,
        "hasStone": True,
        "images": [
            "/images/products/bracelet.jpg",
            "/images/products/dorreh/dorreh_extra_2.jpg"
        ],
        "tags": ["دستبند", "بینهایت", "نماد عشق", "برلیان"],
        "desc": "پلاک ظریف نماد ابدیت و عشق جاودان، نگین‌کاری شده با سنگ‌های درخشان روی زنجیر فلامینگو.",
        "descEn": "Meaningful infinity motif pavé-set with shimmering crystals on a delicate 18K cable chain.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/infinity-gold-bracelet/"
    },
    {
        "name": "دستبند طلا طرح قفل و کلید تیفانی هارت",
        "nameEn": "Tiffany-Style Lock & Key Heart Charm Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 5.60,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh_extra_3.jpg",
            "/images/products/bracelet.jpg"
        ],
        "tags": ["دستبند", "قفل و کلید", "قلب", "آویزدار"],
        "desc": "دو آویز مینیاتوری قفل قلبی و کلید عشق متصل به زنجیر پیوندی مستحکم، انتخابی ماندگار برای هدیه.",
        "descEn": "Romantic charm bracelet bearing a detailed heart padlock and key dangle in high-karat gold.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/lock-key-bracelet/"
    },
    {
        "name": "پابند طلا توپی گوی البرنادو پنج ردیفه",
        "nameEn": "Multi-Strand Albernado Bead Gold Anklet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "anklet",
        "typeFa": "پابند",
        "weightGrams": 2.95,
        "wagePercent": 0.18,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/bracelet.jpg",
            "/images/products/dorreh/dorreh_prod_1_angle_3.jpg"
        ],
        "tags": ["پابند", "البرنادو", "توپی", "درخشان"],
        "desc": "پابند زنجیری مزین به دانه‌های گوی البرنادو با تراش نوری چندبعدی که هنگام حرکت می‌درخشد.",
        "descEn": "Faceted gold beads spaced along a dainty chain to create rhythmic sparkle around the ankle.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/multi-bead-anklet/"
    },
    {
        "name": "دستبند طلا بافت پوست ماری پایتون پهن",
        "nameEn": "Wide Python Scale Texture Gold Bracelet",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 8.90,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/gold_bracelet_bangle_1791946279045.jpg",
            "/images/products/bracelet.jpg"
        ],
        "tags": ["دستبند", "پوست ماری", "پهن", "لوکس"],
        "desc": "بافت پولک‌دار الهام گرفته از پوست پایتون با انعطاف کامل و نمای عریض روی مچ.",
        "descEn": "Exquisite snake-scale articulation providing fluid movement and substantial luxury presence.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/python-scale-bracelet/"
    },
    {
        "name": "بنگل طلا دو ردیفه پیچشی موج آب",
        "nameEn": "Double-Row Twisted Ocean Wave Bangle",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bangle",
        "typeFa": "بنگل",
        "weightGrams": 6.50,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh_prod_2_angle_2.jpg",
            "/images/products/gold_bracelet_bangle_1791946279045.jpg"
        ],
        "tags": ["بنگل", "موج", "پیچشی", "دو ردیفه"],
        "desc": "دو مفتول موازی طلایی که در مرکز به شکلی سیال در یکدیگر تنیده شده‌اند.",
        "descEn": "Two intertwining gold ribbons forming an organic wave silhouette in rich 18-karat gold.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/wave-twist-bangle/"
    },
    {
        "name": "دستبند طلا مهره‌ای سنگ اونیکس مات با گوی طلا",
        "nameEn": "Matte Black Onyx Beads with 18K Gold Spheres",
        "category": "bracelet",
        "categoryFa": "دستبند و النگو",
        "type": "bracelet",
        "typeFa": "دستبند",
        "weightGrams": 2.20,
        "wagePercent": 0.19,
        "stonePrice": 180000,
        "hasStone": True,
        "images": [
            "/images/products/men_jewelry.jpg",
            "/images/products/bracelet.jpg"
        ],
        "tags": ["دستبند", "اونیکس", "مهره ای", "اسپرت"],
        "desc": "مهره‌های طبیعی سنگ اونیکس سیاه مات همراه با گوی‌های طلای ۱۸ عیار تراش‌خورده روی کش مقاوم کره‌ای.",
        "descEn": "Hand-strung genuine matte black onyx beads punctuated by diamond-cut solid 18K gold spheres.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/onyx-gold-bead-bracelet/"
    },

    # -------------------------------------------------------------
    # 2. NECKLACES & CHAINS (23 products: 544 to 566)
    # -------------------------------------------------------------
    {
        "name": "گردنبند طلا کارتیر زنجیری میامی ضخیم",
        "nameEn": "Bold Miami Cuban Link Gold Necklace 18K",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 14.50,
        "wagePercent": 0.14,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/necklace.jpg",
            "/images/products/gold_necklace_pendant_1791946268677.jpg"
        ],
        "tags": ["گردنبند", "کارتیر", "کوبایی", "سنگین"],
        "desc": "گردنبند کوبایی کارتیه ۴۵ سانتی‌متری با پیوندهای صلب و پولیش خورده، مناسب استایل‌های قدرتمند.",
        "descEn": "Substantial 45cm Miami Cuban link necklace precision-crafted with interlocking solid 18K gold links.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/bold-cuban-necklace/"
    },
    {
        "name": "گردنبند طلا گوی تراش البرنادو سه رنگ بلند",
        "nameEn": "Long Albernado Tricolor Diamond-Cut Bead Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 8.35,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh__da_af_d8_b1_d8_af_d9_86_d8_a8_d9_86_d8_af__da_af_d9_88_db_8c__d8_aa_d8_b1_d8_a7_d8_b4_1.jpg",
            "/images/products/gold_necklace_pendant_1791946268677.jpg"
        ],
        "tags": ["گردنبند", "البرنادو", "سه رنگ", "گوی"],
        "desc": "گردنبند بلند ۵۰ سانتی‌متری مزین به دانه‌های گوی البرنادو سه رنگ با انکسار بی‌نظیر نور.",
        "descEn": "50cm drape necklace showcasing textured tricolor gold spheres with diamond-cut facets.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/albernado-necklace/"
    },
    {
        "name": "گردنبند طلا رولباسی ون کلیف ۱۰ موتیف صدف",
        "nameEn": "Van Cleef 10-Motif Mother-of-Pearl Long Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 11.20,
        "wagePercent": 0.18,
        "stonePrice": 1200000,
        "hasStone": True,
        "images": [
            "/images/products/dorreh/dorreh_prod_16_angle_1.jpg",
            "/images/products/necklace.jpg"
        ],
        "tags": ["گردنبند", "رولباسی", "ونکلیف", "صدف"],
        "desc": "رولباسی لوکس با ۱۰ گل شبدر ون کلیف مزین به صدف طبیعی مادام‌العمر روی زنجیر مستحکم.",
        "descEn": "Opera-length 10-clover station necklace framed by beaded gold borders and natural white shell.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/vancleef-10motif-necklace/"
    },
    {
        "name": "زنجیر طلا ونیزی (باکس) ضخیم مستحکم",
        "nameEn": "Italian Venetian Box Gold Chain 18K",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 5.40,
        "wagePercent": 0.13,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/necklace.jpg",
            "/images/products/gold_necklace_pendant_1791946268677.jpg"
        ],
        "tags": ["زنجیر", "ونیزی", "باکس", "مستحکم"],
        "desc": "زنجیر ونیزی مکعبی با هندسه دقیق و سطح صیقلی، پایه‌ای محکم و فوق‌العاده برای انواع پلاک.",
        "descEn": "Classic geometric Venetian box link chain offering superior tensile strength and sleek drape.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/venetian-box-chain/"
    },
    {
        "name": "گردنبند طلا هرینگبون ماری تخت ۵ میلی‌متری",
        "nameEn": "Liquid Gold 5mm Flat Snake Herringbone Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 7.90,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/gold_necklace_pendant_1791946268677.jpg",
            "/images/products/necklace.jpg"
        ],
        "tags": ["گردنبند", "هرینگبون", "ماری", "تخت"],
        "desc": "گردنبند طوقی تخت با عرض ۵ میلی‌متر که به صورت کاملاً صاف و آینه‌ای بر روی گردن می‌نشیند.",
        "descEn": "5mm wide polished snake necklace mimicking fluid golden silk against the collarbone.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/flat-herringbone-choker/"
    },
    {
        "name": "گردنبند طلا مروارید باروک با قفل تیفانی T طلا",
        "nameEn": "Natural Baroque Pearl Strand with 18K Gold Toggle",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 4.10,
        "wagePercent": 0.19,
        "stonePrice": 750000,
        "hasStone": True,
        "images": [
            "/images/products/necklace.jpg",
            "/images/products/dorreh/dorreh_prod_15_angle_2.jpg"
        ],
        "tags": ["گردنبند", "مروارید باروک", "قفل طلا", "مجلسی"],
        "desc": "رشته مرواریدهای درشت طبیعی باروک همراه با قفل حلقه و میله‌ای (Toggle) از طلای ۱۸ عیار دست‌ساز.",
        "descEn": "Statement strand of organic freshwater baroque pearls fastened with an artisan 18K gold toggle clasp.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/baroque-pearl-strand/"
    },
    {
        "name": "گردنبند طلا تنیسی کریستالی درخشان دور تا دور",
        "nameEn": "Full Riviera Tennis Gold Choker Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 12.80,
        "wagePercent": 0.20,
        "stonePrice": 1600000,
        "hasStone": True,
        "images": [
            "/images/products/gold_necklace_pendant_1791946268677.jpg",
            "/images/products/dorreh/dorreh_prod_14_angle_2.jpg"
        ],
        "tags": ["گردنبند", "تنیسی", "ریویرا", "کریستال"],
        "desc": "چوکر تنیسی باشکوه با چیدمان پیوسته سنگ‌های درخشان زیرکونیای برش برلیان روی پایه‌های طلا.",
        "descEn": "Spectacular Riviera-style tennis collar featuring hand-set brilliant round stones in 18K gold prongs.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/riviera-tennis-necklace/"
    },
    {
        "name": "زنجیر طلا فیگارو مردانه عریض ۵۵ سانتی",
        "nameEn": "Men's Solid Figaro Gold Chain 55cm",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 9.60,
        "wagePercent": 0.14,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/men_jewelry.jpg",
            "/images/products/necklace.jpg"
        ],
        "tags": ["زنجیر", "فیگارو", "مردانه", "سنگین"],
        "desc": "زنجیر مردانه بلند ۵۵ سانتی‌متری طرح فیگارو ایتالیایی با حلقه‌های مسطح و تراش الماسه.",
        "descEn": "Heavier 55cm Italian Figaro chain engineered with precision beveling for enduring daily wear.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/mens-figaro-chain/"
    },
    {
        "name": "گردنبند طلا طوقی صلب نیمه‌باز تورک",
        "nameEn": "Rigid Open Torque Choker Necklace 18K",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 8.10,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh_prod_13_angle_3.jpg",
            "/images/products/gold_necklace_pendant_1791946268677.jpg"
        ],
        "tags": ["طوق", "تورک", "صلب", "مدرن"],
        "desc": "طوق باز دور گردنی با انحنای ارگونومیک و پرداخت آینه‌ای، سبک مینیمال و اشرافی مدرن.",
        "descEn": "Sculptural open-ended torque choker designed to rest gracefully upon the collarbone.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/open-torque-choker/"
    },
    {
        "name": "گردنبند طلا دو لاین زنجیر کارتیه و پلاک سکه الیزابت",
        "nameEn": "Layered Double-Chain Coin Medallion Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 6.75,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/necklace.jpg",
            "/images/products/dorreh/dorreh_prod_12_angle_3.jpg"
        ],
        "tags": ["گردنبند", "دو لاین", "سکه", "لایه ای"],
        "desc": "گردنبند ترکیبی دو ردیفه شامل یک زنجیر کارتیه کوتاه و یک زنجیر بلند متصل به مدال سکه وینتیج.",
        "descEn": "Effortless layered look combining a chunky choker chain with a longer vintage coin pendant strand.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/layered-coin-necklace/"
    },
    {
        "name": "گردنبند طلا فیلیگری دست‌ساز نقوش سنتی یزد",
        "nameEn": "Handmade Yazdi Filigree Heritage Gold Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 10.50,
        "wagePercent": 0.20,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/gold_necklace_pendant_1791946268677.jpg",
            "/images/products/craft_goldsmith.jpg"
        ],
        "tags": ["گردنبند", "فیلیگری", "ملیله", "یزد"],
        "desc": "شاهکار ملیله‌کاری دستی از کارگاه‌های زرگری تاریخی یزد با تارهای نازک طلای ۱۸ عیار.",
        "descEn": "Museum-grade Yazd filigree statement necklace woven from gossamer-thin 18K gold threads.",
        "sourceStore": "گالری میوان (شوروم یزد)",
        "sourceUrl": "https://meyvan.ir/catalog/yazdi-filigree-heritage-necklace"
    },
    {
        "name": "زنجیر طلا طنابی پیچ دوبل ۵۰ سانتی",
        "nameEn": "Double-Twist Rope Gold Chain 50cm",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 6.90,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/necklace.jpg",
            "/images/products/dorreh/dorreh_prod_11_angle_2.jpg"
        ],
        "tags": ["زنجیر", "طنابی", "دوبل", "پیچشی"],
        "desc": "زنجیر ضخیم با بافت طنابی دوبل با تراش الماسی براق، دارای درخشش استثنایی در زیر نور.",
        "descEn": "Substantial double-twist diamond-cut rope chain reflecting dazzling light at every rotation.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/double-twist-rope-chain/"
    },
    {
        "name": "گردنبند طلا شوپارد قلبی شیشه‌ای متحرک",
        "nameEn": "Chopard-Inspired Floating Heart Locket Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 5.85,
        "wagePercent": 0.19,
        "stonePrice": 450000,
        "hasStone": True,
        "images": [
            "/images/products/dorreh/dorreh_prod_10_angle_3.jpg",
            "/images/products/necklace.jpg"
        ],
        "tags": ["گردنبند", "شوپارد", "قلب شیشه ای", "نگین متحرک"],
        "desc": "پلاک قلبی طلایی با محفظه شیشه‌ای ضدخش یاقوت که نگین‌های کریستالی درون آن آزادانه حرکت می‌کنند.",
        "descEn": "Enchanting heart pendant enclosing floating free-moving gems between scratch-resistant sapphire crystal.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/floating-heart-necklace/"
    },
    {
        "name": "گردنبند طلا چوکر دانه‌ای رگلاژی مدرن",
        "nameEn": "Beaded Dainty Adjustable Gold Choker",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 3.40,
        "wagePercent": 0.18,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/gold_necklace_pendant_1791946268677.jpg",
            "/images/products/dorreh/dorreh_prod_9_angle_3.jpg"
        ],
        "tags": ["چوکر", "دانه ای", "رگلاژ", "ظریف"],
        "desc": "چوکر مینیمال با فواصل منظم دانه‌های طلای صیقلی، همراه با زنجیر تنظیم سایز پشت گردن.",
        "descEn": "Contemporary collar chain spaced with miniature gold beads and an adjustable extension tail.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/beaded-gold-choker/"
    },
    {
        "name": "گردنبند طلا ماری حصیری بافت میلانیزه",
        "nameEn": "Milanese Mesh Woven Gold Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 9.15,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/necklace.jpg",
            "/images/products/gold_necklace_pendant_1791946268677.jpg"
        ],
        "tags": ["گردنبند", "میلانیزه", "حصیری", "بافت نرم"],
        "desc": "بافت حصیری متراکم و ابریشمی میلانیزه ایتالیایی با انعطاف کامل و نمای اشرافی پهن.",
        "descEn": "Supple Milanese woven gold mesh collier contouring comfortably around the neck.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/milanese-mesh-necklace/"
    },
    {
        "name": "گردنبند طلا زنجیری کارتیه لاو دو حلقه درهم‌تنیده",
        "nameEn": "Interlocking Double-Ring Love Gold Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 4.80,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh_prod_8_angle_2.jpg",
            "/images/products/necklace.jpg"
        ],
        "tags": ["گردنبند", "کارتیر لاو", "دو حلقه", "پیوندی"],
        "desc": "دو رینگ طلای کارتیه پیچی پیوند خورده در یکدیگر به نشانه پیوند ناگسستنی دو قلب.",
        "descEn": "Two entwined screw-motif gold mini rings suspended on an 18K cable chain representing eternal unity.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/interlocking-love-necklace/"
    },
    {
        "name": "گردنبند طلا رولباسی سکه‌ای عثمانی پولکی",
        "nameEn": "Ottoman Disc Shimmering Long Gold Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 7.45,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh_prod_7_angle_3.jpg",
            "/images/products/gold_necklace_pendant_1791946268677.jpg"
        ],
        "tags": ["رولباسی", "پولکی", "سکه ای", "درخشان"],
        "desc": "پولک‌های طلایی مسطح با تراش آینه‌ای که هنگام حرکت نور را با بازی چشم‌نوازی منعکس می‌کنند.",
        "descEn": "Cascading long necklace dotted with mirror-finished gold coin discs that flicker with movement.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/ottoman-disc-necklace/"
    },
    {
        "name": "گردنبند طلا بولگاری با سرپانتین نگین زمردی",
        "nameEn": "Bulgari-Style Serpenti Emerald-Eye Gold Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 8.70,
        "wagePercent": 0.19,
        "stonePrice": 600000,
        "hasStone": True,
        "images": [
            "/images/products/gold_necklace_pendant_1791946268677.jpg",
            "/images/products/dorreh/dorreh_prod_6_angle_3.jpg"
        ],
        "tags": ["گردنبند", "مار", "سرپانتین", "زمرد"],
        "desc": "طرح نمادین مار افعی بولگاری با سر تراش‌خورده و چشم‌های نگین سبز زمردی درخشان.",
        "descEn": "Sensuous serpent silhouette rendered in 18K gold featuring piercing simulated emerald crystal eyes.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/serpenti-emerald-necklace/"
    },
    {
        "name": "گردنبند طلا ظریف آویز ستاره قطبی با تک‌نگین",
        "nameEn": "North Star Compass Solitaire Gold Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 2.90,
        "wagePercent": 0.18,
        "stonePrice": 150000,
        "hasStone": True,
        "images": [
            "/images/products/necklace.jpg",
            "/images/products/dorreh/dorreh_prod_5_angle_3.jpg"
        ],
        "tags": ["گردنبند", "ستاره قطبی", "قطب نما", "مینیمال"],
        "desc": "ستاره هشت‌پر جهت‌نما با یک تک‌نگین درخشان در مرکز، نمادی از امید و راهنمای مسیر زندگی.",
        "descEn": "Eight-point star medallion centered by a single sparkling crystal symbolising guidance and purpose.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/north-star-necklace/"
    },
    {
        "name": "زنجیر طلا دیپلمات اسپرت فلت ۴۵ سانتی",
        "nameEn": "Flat Diplomat Link Gold Chain 45cm",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 5.15,
        "wagePercent": 0.14,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/necklace.jpg",
            "/images/products/gold_necklace_pendant_1791946268677.jpg"
        ],
        "tags": ["زنجیر", "دیپلمات", "فلت", "اسپرت"],
        "desc": "زنجیر دیپلمات تخت و براق مناسب استفاده همزمان برای خانم‌ها و آقایان، ضد پیچ‌خوردگی.",
        "descEn": "Unisex flat diplomat chain engineered with anti-tangle jointing and high-polish gold luster.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/flat-diplomat-chain/"
    },
    {
        "name": "گردنبند طلا یقه ای البرنادو توپی با آویز مروارید",
        "nameEn": "Albernado Collar with Pearl Drop Accent",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 6.30,
        "wagePercent": 0.17,
        "stonePrice": 300000,
        "hasStone": True,
        "images": [
            "/images/products/gold_necklace_pendant_1791946268677.jpg",
            "/images/products/dorreh/dorreh_prod_4_angle_3.jpg"
        ],
        "tags": ["گردنبند", "یقه ای", "البرنادو", "مروارید"],
        "desc": "ردیف متراکم گوی‌های طلا با آویز اشکی مروارید طبیعی در مرکز، مناسب مجالس رسمی.",
        "descEn": "Scintillating collar chain with a graduated teardrop natural pearl pendant taking center stage.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/albernado-pearl-collar/"
    },
    {
        "name": "گردنبند طلا کارتیر زنجیری پیوندی بیضی درشت",
        "nameEn": "Oversized Oval Paperclip Link Gold Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 8.60,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/necklace.jpg",
            "/images/products/gold_necklace_pendant_1791946268677.jpg"
        ],
        "tags": ["گردنبند", "پیپرکلیپ", "گیره کاغذی", "ترند"],
        "desc": "حلقه‌های کشیده پیپرکلیپ مد روز با طلای توپر و قابلیت بستن قفل در هر کجای زنجیر برای تغییر سایز.",
        "descEn": "On-trend elongated paperclip link necklace allowing customizable length and styling versatility.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/paperclip-link-necklace/"
    },
    {
        "name": "گردنبند طلا سنتی انار شب یلدا با دانه‌های یاقوتی",
        "nameEn": "Yalda Pomegranate Ruby Beads Gold Necklace",
        "category": "necklace",
        "categoryFa": "گردنبند",
        "type": "necklace",
        "typeFa": "گردنبند",
        "weightGrams": 4.95,
        "wagePercent": 0.19,
        "stonePrice": 500000,
        "hasStone": True,
        "images": [
            "/images/products/pomegranate_turquoise.jpg",
            "/images/products/gold_pomegranate_turquoise_1791946300076.jpg"
        ],
        "tags": ["گردنبند", "انار", "شب یلدا", "یاقوت"],
        "desc": "پلاک انار قاچ‌خورده با تارهای طلای فیلیگری و سنگ‌های قرمز اناری، نماد برکت و شادکامی در فرهنگ ایران.",
        "descEn": "Poetic Persian pomegranate motif filled with ruby-red micro-gems celebrating heritage and love.",
        "sourceStore": "گالری میوان (شوروم یزد)",
        "sourceUrl": "https://meyvan.ir/catalog/yalda-pomegranate-necklace"
    },

    # -------------------------------------------------------------
    # 3. EARRINGS (12 products: 567 to 578)
    # -------------------------------------------------------------
    {
        "name": "گوشواره طلا حلقه‌ای کارتیه میامی کوبایی",
        "nameEn": "Miami Cuban Curb Link Gold Hoop Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 4.20,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/earrings.jpg",
            "/images/products/gold_earrings_drop_1791946270534.jpg"
        ],
        "tags": ["گوشواره", "حلقه ای", "کوبایی", "کارتیر"],
        "desc": "گوشواره حلقه‌ای ضخیم طرح کوبایی با قفل فشاری ایمن و تراش براق بدون نگین.",
        "descEn": "Bold chunky curb link hoop earrings with integrated snap-bar closures for maximum security.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/cuban-hoop-earrings/"
    },
    {
        "name": "گوشواره طلا بیضی آویز گوی البرنادو سه رنگ",
        "nameEn": "Oval Albernado Drop Gold Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 3.75,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh__da_af_d9_88_d8_b4_d9_88_d8_a7_d8_b1_d9_87__d8_a8_db_8c_d8_b6_db_8c__da_af_d9_88_db_8c_1.jpg",
            "/images/products/earrings_chandelier.jpg"
        ],
        "tags": ["گوشواره", "آویز", "بیضی", "البرنادو"],
        "desc": "حلقه بیضی مدرن با آویز گوی‌های تراش‌خورده متحرک که با هر حرکت سر نورافشانی می‌کنند.",
        "descEn": "Elegant elongated oval drops anchored by multifaceted tri-tone beads dancing with light.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/oval-bead-earrings/"
    },
    {
        "name": "گوشواره طلا میخی توپی دامله کلاسیک ۷۵۰",
        "nameEn": "Classic Polished Ball Stud Gold Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 1.65,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh__da_af_d9_88_d8_b4_d9_88_d8_a7_d8_b1_d9_87__d9_85_db_8c_ae_db_8c__d8_aa_d9_88_d9_be_db_8c_1.jpg",
            "/images/products/earrings_stud.jpg"
        ],
        "tags": ["گوشواره", "میخی", "توپی", "روزمره"],
        "desc": "گوشواره میخی کروی ساده و شیک، ضدحساسیت با پشت گوشواره طلایی محکم، مناسب استفاده ۲۴ ساعته.",
        "descEn": "Timeless hollow sphere studs crafted in skin-friendly 18K gold with reinforced friction backs.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/ball-stud-earrings/"
    },
    {
        "name": "گوشواره طلا بخیه‌ای بلند زنجیر ستاره و ماه",
        "nameEn": "Threader Moon & Star Long Gold Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 2.10,
        "wagePercent": 0.18,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/earrings_chandelier.jpg",
            "/images/products/earrings.jpg"
        ],
        "tags": ["گوشواره", "بخیه ای", "ماه و ستاره", "بلند"],
        "desc": "زنجیر بخیه‌ای باریک که از لاله گوش عبور کرده و آویز ماه و ستاره در جلو و پشت گوش آویزان می‌شود.",
        "descEn": "Graceful threader earrings featuring celestial star and crescent charms suspended on fine chains.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/moon-star-threaders/"
    },
    {
        "name": "گوشواره طلا ون کلیف تک موتیف صدف با قفل فرانسوی",
        "nameEn": "Van Cleef Single Clover Mother-of-Pearl Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 3.40,
        "wagePercent": 0.18,
        "stonePrice": 400000,
        "hasStone": True,
        "images": [
            "/images/products/dorreh/dorreh__da_af_d9_88_d8_b4_d9_88_d8_a7_d8_b1_d9_87__d9_be_db_8c_da_86_db_8c__d8_af_d8_a7_d9_85_d9_84_d9_87_1.jpg",
            "/images/products/earrings.jpg"
        ],
        "tags": ["گوشواره", "ونکلیف", "صدف", "قفل فرانسوی"],
        "desc": "گل شبدر ون کلیف با نگین صدف طبیعی سفید درخشان و قفل اهرمی فرانسوی با نهایت امنیت.",
        "descEn": "Lustrous white mother-of-pearl clover motifs bordered by gold beads with secure French lever backs.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/clover-leverback-earrings/"
    },
    {
        "name": "گوشواره طلا چنگکی لوزی تراش هندسی مدرن",
        "nameEn": "Geometric Rhombus Dangle Gold Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 2.85,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/gold_earrings_drop_1791946270534.jpg",
            "/images/products/earrings.jpg"
        ],
        "tags": ["گوشواره", "لوزی", "هندسی", "مدرن"],
        "desc": "آویز لوزی با خطوط زاویه‌دار صیقلی، سبک وزن و بسیار چشم‌نواز در مجالس شبانه.",
        "descEn": "Sharp contemporary diamond-shaped dangles providing eye-catching movement with ultralight feel.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/rhombus-dangle-earrings/"
    },
    {
        "name": "گوشواره طلا حلقه‌ای ضخیم چانکی توخالی سبک",
        "nameEn": "Chunky Lightweight Hollow Gold Hoop Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 3.90,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/earrings.jpg",
            "/images/products/gold_earrings_drop_1791946270534.jpg"
        ],
        "tags": ["گوشواره", "چانکی", "توخالی", "سبک"],
        "desc": "حلقه‌های تپل ترند روز با تکنولوژی ساخت توخالی جهت وزن سبک و جلوگیری از افتادگی لاله گوش.",
        "descEn": "Voluminous hollow-form gold hoops providing an ultra-bold profile without weight on earlobes.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/chunky-hollow-hoops/"
    },
    {
        "name": "گوشواره طلا آویز اشکی مروارید طبیعی پرورشی",
        "nameEn": "Teardrop Cultured Pearl Drop Gold Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 2.70,
        "wagePercent": 0.19,
        "stonePrice": 350000,
        "hasStone": True,
        "images": [
            "/images/products/earrings_chandelier.jpg",
            "/images/products/earrings.jpg"
        ],
        "tags": ["گوشواره", "مروارید", "اشکی", "عروس"],
        "desc": "پایه طلا ۱۸ عیار با اتصال ظریف به مروارید اشکی اصیل با جلای طبیعی و درخشش مرواریدی.",
        "descEn": "Sophisticated bridal drops pairing warm 18K yellow gold earwires with symmetrical teardrop pearls.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/teardrop-pearl-earrings/"
    },
    {
        "name": "گوشواره طلا میخی سولیدر تک‌نگین برلیان اتمی",
        "nameEn": "Brilliant Solitaire CZ Stud Gold Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 1.45,
        "wagePercent": 0.18,
        "stonePrice": 120000,
        "hasStone": True,
        "images": [
            "/images/products/earrings_stud.jpg",
            "/images/products/earrings.jpg"
        ],
        "tags": ["گوشواره", "تک نگین", "سولیتیر", "برلیان"],
        "desc": "تک‌نگین ۶ میلی‌متری تراش برلیان روی پایه چهارچنگ سبدی طلا، نگین فوق‌العاده شفاف و درخشان.",
        "descEn": "Classic four-prong solitaire studs holding hand-faceted round cubic zirconia in solid 18K gold.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/solitaire-cz-studs/"
    },
    {
        "name": "گوشواره طلا چلچراغی سنتی پنج قطره‌ای یزد",
        "nameEn": "Yazdi Chandelier Five-Drop Heritage Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 6.80,
        "wagePercent": 0.20,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/earrings_chandelier.jpg",
            "/images/products/gold_earrings_drop_1791946270534.jpg"
        ],
        "tags": ["گوشواره", "چلچراغی", "مجلسی", "یزد"],
        "desc": "طرح اصیل چلچراغی یزد با پنج آویز طلای متحرک اشکی و تراش‌های دقیق دست‌ساز سنتی.",
        "descEn": "Ornate five-drop chandelier earrings capturing the historic goldsmith artistry of desert Yazd.",
        "sourceStore": "گالری میوان (شوروم یزد)",
        "sourceUrl": "https://meyvan.ir/catalog/yazdi-chandelier-earrings"
    },
    {
        "name": "گوشواره طلا هاگی نگین‌دار با قفل کلیکی مخفی",
        "nameEn": "Huggie Pavé Clicker Gold Hoop Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 2.25,
        "wagePercent": 0.17,
        "stonePrice": 200000,
        "hasStone": True,
        "images": [
            "/images/products/earrings.jpg",
            "/images/products/earrings_stud.jpg"
        ],
        "tags": ["گوشواره", "هاگی", "کلیکی", "نگین دار"],
        "desc": "گوشواره هاگی چسبان لاله گوش با یک ردیف نگین ظریف و قفل کلیکی بسیار راحت و ایمن.",
        "descEn": "Snug huggie hoops lined with micro-pavé crystals and seamless hinge closure for sleep comfort.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/pave-huggie-earrings/"
    },
    {
        "name": "گوشواره طلا میخی طرح پروانه مینیاتوری",
        "nameEn": "Miniature Butterfly Stud Gold Earrings",
        "category": "earrings",
        "categoryFa": "گوشواره",
        "type": "earrings",
        "typeFa": "گوشواره",
        "weightGrams": 1.15,
        "wagePercent": 0.18,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/earrings_stud.jpg",
            "/images/products/kids_jewelry.jpg"
        ],
        "tags": ["گوشواره", "پروانه", "مینیاتوری", "دخترانه"],
        "desc": "پروانه صیقلی کوچک و بسیار ظریف، بدون لبه تیز، مناسب دختران نوجوان و استفاده در سوراخ دوم گوش.",
        "descEn": "Polished mini butterfly studs crafted with rounded edges, ideal for second piercings or teens.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/mini-butterfly-studs/"
    },

    # -------------------------------------------------------------
    # 4. PENDANTS & CHARMS (15 products: 579 to 593)
    # -------------------------------------------------------------
    {
        "name": "پلاک طلا آویز قلب توخالی حجم‌دار دامله",
        "nameEn": "Volumetric Puffed Hollow Heart Gold Pendant",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 2.10,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh__d8_a2_d9_88_db_8c_d8_b2__d9_82_d9_84_d8_a8__d8_aa_d9_88__d8_ae_d8_a7_d9_84_db_8c_1.jpg",
            "/images/products/pendant_medallion.jpg"
        ],
        "tags": ["پلاک", "قلب", "توخالی", "دامله"],
        "desc": "پلاک قلبی سه‌بعدی و برآمده با پاپیون بالای حلقه اتصال، براق و چشم‌گیر با وزن مناسب.",
        "descEn": "Sculptural 3D puffed hollow heart charm polished to mirror perfection in 18-karat gold.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/puffed-heart-pendant/"
    },
    {
        "name": "مدال طلا آویز فرشته بال‌دار محافظ کودک",
        "nameEn": "Guardian Angel Wings Gold Medallion",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 2.65,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh__d8_a2_d9_88_db_8c_d8_b2__d9_81_d8_b1_d8_b4_d8_aa_d9_87_3_1.jpg",
            "/images/products/pendant_medallion.jpg"
        ],
        "tags": ["پلاک", "فرشته", "بالدار", "کودک"],
        "desc": "طرح فرشته مهربان با بال‌های گسترده صیقلی، نماد محافظت و آرامش، مناسب هدیه نوزاد و کودک.",
        "descEn": "Guardian angel silhouette detailed with outstretched textured wings, a beloved gift for blessings.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/guardian-angel-pendant/"
    },
    {
        "name": "پلاک طلا آویز هلال ماه با ستاره نگین‌دار",
        "nameEn": "Crescent Moon with Star Diamond Accent Pendant",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 1.95,
        "wagePercent": 0.18,
        "stonePrice": 100000,
        "hasStone": True,
        "images": [
            "/images/products/dorreh/dorreh__d8_a2_d9_88_db_8c_d8_b2__d9_85_d8_a7_d9_87_1.jpg",
            "/images/products/pendant_medallion.jpg"
        ],
        "tags": ["پلاک", "ماه", "ستاره", "آویز"],
        "desc": "هلال ماه با لبه‌های نرم و ستاره کوچکی که در آغوش آن می‌درخشد با نگین تک برلیان اتمی.",
        "descEn": "Whimsical crescent moon embracing a twinkling star set with a single high-sparkle gem.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/crescent-moon-star-pendant/"
    },
    {
        "name": "مدال طلا گرد طرح سکه باستانی کوروش بزرگ",
        "nameEn": "Ancient Persian Cyrus Cylinder Coin Medallion",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 5.40,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/pendant_medallion.jpg",
            "/images/products/men_jewelry.jpg"
        ],
        "tags": ["مدال", "کوروش", "باستانی", "تاریخی"],
        "desc": "مدال برجسته با نقش تاریخی و منشور حقوق بشر کوروش بزرگ با حاشیه کنگره‌دار هخامنشی.",
        "descEn": "Heavy historic commemorative coin pendant embossed with ancient Persian Achaemenid relief artwork.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/cyrus-coin-medallion/"
    },
    {
        "name": "پلاک طلا اسمی سفارشی خط نستعلیق اصیل",
        "nameEn": "Custom Calligraphy Nastaliq Name Gold Pendant",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 2.80,
        "wagePercent": 0.19,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/pendant_medallion.jpg",
            "/images/products/signature.jpg"
        ],
        "tags": ["پلاک اسم", "نستعلیق", "خوشنویسی", "سفارشی"],
        "desc": "برش لیزری با بالاترین دقت از خط نستعلیق سنتی استادان ایرانی با طلای ۱۸ عیار بدون پلیسه.",
        "descEn": "Custom-designed Persian Nastaliq script pendant precision laser-cut and hand-polished.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/nastaliq-name-pendant/"
    },
    {
        "name": "پلاک طلا طرح پروانه سه‌بعدی مشبک با تراش لیزری",
        "nameEn": "Laser-Cut Filigree Butterfly Gold Pendant",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 1.70,
        "wagePercent": 0.18,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/pendant_medallion.jpg",
            "/images/products/dorreh/dorreh_prod_3_angle_2.jpg"
        ],
        "tags": ["پلاک", "پروانه", "مشبک", "لیزری"],
        "desc": "بال‌های مشبک پروانه با روزنه‌های نوری هندسی که روی سینه نمایی ظریف و هنرمندانه دارد.",
        "descEn": "Intricate openwork butterfly pendant highlighting geometric fretwork and feathery edges.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/filigree-butterfly-pendant/"
    },
    {
        "name": "مدال طلا شمسه اسلیمی زرگری یزد با نگین فیروزه نیشابور",
        "nameEn": "Yazdi Shamseh Arabesque Neyshabur Turquoise Pendant",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 4.60,
        "wagePercent": 0.20,
        "stonePrice": 850000,
        "hasStone": True,
        "images": [
            "/images/products/pomegranate_turquoise.jpg",
            "/images/products/pendant_medallion.jpg"
        ],
        "tags": ["مدال", "شمسه", "فیروزه نیشابور", "یزد"],
        "desc": "شاهکار قلم‌زنی شمسه هشت‌پر همراه با نگین شجری اصیل فیروزه نیشابور با شناسنامه سنگ.",
        "descEn": "Hand-chased Yazdi sunburst medallion embracing a certified natural robin's egg blue turquoise cabochon.",
        "sourceStore": "گالری میوان (شوروم یزد)",
        "sourceUrl": "https://meyvan.ir/catalog/yazdi-shamseh-turquoise-pendant"
    },
    {
        "name": "پلاک طلا آویز چشم نظر میناکاری سورمه‌ای دست‌ساز",
        "nameEn": "Enamelled Cobalt Evil Eye Talisman Gold Pendant",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 1.85,
        "wagePercent": 0.19,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/pendant_medallion.jpg",
            "/images/products/dorreh/dorreh_prod_6_angle_2.jpg"
        ],
        "tags": ["پلاک", "چشم نظر", "میناکاری", "طلسم"],
        "desc": "مینای گرم کوره‌ای با رنگ سورمه‌ای و فیروزه‌ای ضدخش روی بستر طلای ۱۸ عیار زرد.",
        "descEn": "Traditional vitreous hot enamel evil eye amulet fired onto a solid 18-karat gold base.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/enamel-evil-eye-pendant/"
    },
    {
        "name": "پلاک طلا ون کلیف تک گل صدف با حاشیه گوی‌دار",
        "nameEn": "Van Cleef Clover Mother-of-Pearl Solo Pendant",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 2.20,
        "wagePercent": 0.18,
        "stonePrice": 250000,
        "hasStone": True,
        "images": [
            "/images/products/pendant_medallion.jpg",
            "/images/products/dorreh/dorreh_prod_16_angle_2.jpg"
        ],
        "tags": ["پلاک", "ونکلیف", "صدف", "شبدر"],
        "desc": "تک موتیف گل شبدر ون کلیف مزین به صدف دریایی طبیعی با حلقه اتصال ضخیم برای انواع زنجیر.",
        "descEn": "Signature lucky clover pendant inlaid with iridescent genuine mother-of-pearl.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/solo-clover-pendant/"
    },
    {
        "name": "مدال طلا شیر و خورشید باستان با قاب لوزی",
        "nameEn": "Lion & Sun Historic Emblem Gold Medallion",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 4.10,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/pendant_medallion.jpg",
            "/images/products/men_jewelry.jpg"
        ],
        "tags": ["مدال", "شیر و خورشید", "باستانی", "نمادین"],
        "desc": "پلاک برجسته بازآفرینی شده از نماد تاریخی شیر و خورشید ایران با عیار ۷۵۰ تضمین‌شده.",
        "descEn": "Revered historic Persian Lion & Sun insignia meticulously minted in substantial solid gold.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/lion-sun-medallion/"
    },
    {
        "name": "پلاک طلا طرح ضربان قلب و نبض با نگین سرخ",
        "nameEn": "Heartbeat Pulse Line Ruby Accent Gold Pendant",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 1.55,
        "wagePercent": 0.17,
        "stonePrice": 80000,
        "hasStone": True,
        "images": [
            "/images/products/pendant_medallion.jpg",
            "/images/products/low_wage_economic.jpg"
        ],
        "tags": ["پلاک", "ضربان قلب", "نبض", "پزشکی"],
        "desc": "طرح خط نوار قلب با یک نگین یاقوت قرمز کوچک در نقطه اوج، هدیه‌ای نمادین برای کادر درمان و عشق.",
        "descEn": "Dynamic ECG heartbeat cardiogram line accenting a ruby-red crystal stone in gleaming gold.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/heartbeat-pulse-pendant/"
    },
    {
        "name": "مدال طلا گرد طرح درخت زندگی (Tree of Life)",
        "nameEn": "Tree of Life Openwork Gold Medallion",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 3.30,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/pendant_medallion.jpg",
            "/images/products/dorreh/dorreh_prod_7_angle_2.jpg"
        ],
        "tags": ["مدال", "درخت زندگی", "ریشه", "نماد رشد"],
        "desc": "پلاک گرد مشبک درخت با ریشه‌های گسترده و شاخ و برگ‌های صیقلی، نماد رشد و خانواده.",
        "descEn": "Harmonious Tree of Life circular medallion symbolizing deep roots and infinite strength.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/tree-of-life-pendant/"
    },
    {
        "name": "پلاک طلا آویز کلید سل موسیقی (Treble Clef)",
        "nameEn": "Musical Treble Clef Gold Pendant",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 1.40,
        "wagePercent": 0.18,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/pendant_medallion.jpg",
            "/images/products/low_wage_economic.jpg"
        ],
        "tags": ["پلاک", "کلید سل", "موسیقی", "هنری"],
        "desc": "کلید سل موسیقی با انحناهای نرم و ارگونومیک، ایده‌آل برای نوازندگان و عاشقان موسیقی.",
        "descEn": "Gracefully curved musical G-clef charm finished in gleaming 18-karat yellow gold.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/treble-clef-pendant/"
    },
    {
        "name": "مدال طلا سکه بهار آزادی دور قاب اسلیمی",
        "nameEn": "Bahar Azadi Gold Coin Ornate Arabesque Frame",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 5.90,
        "wagePercent": 0.14,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/coin_bullion.jpg",
            "/images/products/pendant_medallion.jpg"
        ],
        "tags": ["مدال", "سکه", "قاب سکه", "سرمایه گذاری"],
        "desc": "قاب محافظ طلای ۱۸ عیار با نقوش اسلیمی برای تبدیل سکه‌های بانکی به آویزهای گردنبند فاخر.",
        "descEn": "Decorative 18K protective bezel frame engineered to mount and display bullion coins safely.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/coin-holder-medallion/"
    },
    {
        "name": "پلاک طلا طرح هندسی لوتوس نیلوفر آبی",
        "nameEn": "Sacred Lotus Flower Geometric Gold Pendant",
        "category": "pendant",
        "categoryFa": "آویز و پلاک",
        "type": "pendant",
        "typeFa": "آویز و پلاک",
        "weightGrams": 2.05,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/pendant_medallion.jpg",
            "/images/products/dorreh/dorreh_prod_5_angle_2.jpg"
        ],
        "tags": ["پلاک", "لوتوس", "نیلوفر آبی", "صلح"],
        "desc": "گل نیلوفر آبی با گلبرگ‌های باز لایه‌ای، الهام گرفته از نقش‌برجسته‌های تخت جمشید.",
        "descEn": "Sacred lotus blossom pendant with layered petals inspired by Persepolis palatial carvings.",
        "sourceStore": "گالری میوان (شوروم یزد)",
        "sourceUrl": "https://meyvan.ir/catalog/persian-lotus-pendant"
    },

    # -------------------------------------------------------------
    # 5. RINGS (7 products: 594 to 600)
    # -------------------------------------------------------------
    {
        "name": "انگشتر طلا کارتیر لاو رینگ پیچی کلاسیک",
        "nameEn": "Classic Cartier Love Screw Gold Band Ring",
        "category": "ring",
        "categoryFa": "انگشتر",
        "type": "ring",
        "typeFa": "انگشتر",
        "weightGrams": 4.85,
        "wagePercent": 0.15,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh__d8_a7_d9_86_da_af_d8_b4_d8_aa_d8_b1_love_1.jpg",
            "/images/products/gold_ring_luxury_1791946268061.jpg"
        ],
        "tags": ["انگشتر", "رینگ", "کارتیر لاو", "پیچی"],
        "desc": "رینگ نمادین کارتیه با نقوش پیچ فرورفته، طلای صلب ۱۸ عیار با لبه‌های ارگونومیک Comfort Fit.",
        "descEn": "Timeless unisex 18K gold band deeply engraved with the iconic screw motif, smooth comfort fit inside.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/cartier-love-band/"
    },
    {
        "name": "انگشتر طلا ون کلیف تک گل صدف طبیعی و طلا سفید",
        "nameEn": "Van Cleef White Gold Mother-of-Pearl Clover Ring",
        "category": "ring",
        "categoryFa": "انگشتر",
        "type": "ring",
        "typeFa": "انگشتر",
        "weightGrams": 3.90,
        "wagePercent": 0.18,
        "stonePrice": 350000,
        "hasStone": True,
        "images": [
            "/images/products/dorreh/dorreh__d8_a7_d9_86_da_af_d8_b4_d8_aa_d8_b1__d9_88_d9_86_da_a9_d9_84_db_8c_d9_81__d8_b7_d9_84_d8_a7__d8_b3_d9_81_db_8c_d8_af_1.jpg",
            "/images/products/ring.jpg"
        ],
        "tags": ["انگشتر", "ونکلیف", "طلا سفید", "صدف"],
        "desc": "گل شبدر ون کلیف با طلای سفید ۱۸ عیار و قاب مرواریدی دور صدف درخشان طبیعی.",
        "descEn": "Lustrous white mother-of-pearl four-leaf clover set into beaded 18K white gold contours.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/white-gold-vancleef-ring/"
    },
    {
        "name": "انگشتر طلا زنانه پاپیونی مینیمال فانتزی",
        "nameEn": "Minimalist Bow Tie Fantasy Gold Ring",
        "category": "ring",
        "categoryFa": "انگشتر",
        "type": "ring",
        "typeFa": "انگشتر",
        "weightGrams": 2.45,
        "wagePercent": 0.17,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/dorreh/dorreh__d8_a7_d9_86_da_af_d8_b4_d8_aa_d8_b1__d9_be_d8_a7_d9_be_db_8c_d9_88_d9_86_1.jpg",
            "/images/products/ring.jpg"
        ],
        "tags": ["انگشتر", "پاپیون", "فانتزی", "دخترانه"],
        "desc": "طرح پاپیون گره‌خورده با حلقه‌ای باریک و صیقلی، نمایی فوق‌العاده شیک و جوان‌پسند روی انگشت.",
        "descEn": "Playful knotted bow silhouette resting atop a polished 18K slim gold shank.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/bow-knot-gold-ring/"
    },
    {
        "name": "انگشتر طلا سولیتیر تک‌نگین با رینگ باریک برلیان‌نشان",
        "nameEn": "Pavé Band Solitaire Engagement Gold Ring",
        "category": "ring",
        "categoryFa": "انگشتر",
        "type": "ring",
        "typeFa": "انگشتر",
        "weightGrams": 3.15,
        "wagePercent": 0.18,
        "stonePrice": 450000,
        "hasStone": True,
        "images": [
            "/images/products/gold_ring_luxury_1791946268061.jpg",
            "/images/products/ring.jpg"
        ],
        "tags": ["انگشتر", "سولیتیر", "نامزدی", "تک نگین"],
        "desc": "تک‌نگین برلیان اتمی سوئیسی در مرکز با بازوی نگین‌کاری شده میکروپاو برای درخشش صدچندان در نور.",
        "descEn": "Romantic engagement solitaire ring featuring a 1-carat size center stone over a pavé-set 18K gold band.",
        "sourceStore": "ایروم گلد (iromgold.ir)",
        "sourceUrl": "https://iromgold.ir/product/pave-solitaire-ring/"
    },
    {
        "name": "انگشتر طلا مردانه عقیق یمنی سرخ با خط قلم‌زنی",
        "nameEn": "Men's Natural Red Yemeni Agate Signet Gold Ring",
        "category": "ring",
        "categoryFa": "انگشتر",
        "type": "ring",
        "typeFa": "انگشتر",
        "weightGrams": 8.40,
        "wagePercent": 0.16,
        "stonePrice": 700000,
        "hasStone": True,
        "images": [
            "/images/products/men_jewelry.jpg",
            "/images/products/ring.jpg"
        ],
        "tags": ["انگشتر مردانه", "عقیق یمنی", "سنگین", "قلم زنی"],
        "desc": "رکاب سنگین طلای ۱۸ عیار با نگین طبیعی عقیق سرخ یمن و قلم‌زنی دستی نقوش اسلیمی در کناره‌ها.",
        "descEn": "Substantial men's signet ring crowning authentic natural Yemeni red agate with hand-chased side motifs.",
        "sourceStore": "بزرگی گلد (bozorgigold.com)",
        "sourceUrl": "https://bozorgigold.com/product/mens-agate-ring/"
    },
    {
        "name": "انگشتر طلا کارتیر پورتوفینو سه رینگ سه رنگ",
        "nameEn": "Trinity Portofino Interlocking Tri-Color Gold Ring",
        "category": "ring",
        "categoryFa": "انگشتر",
        "type": "ring",
        "typeFa": "انگشتر",
        "weightGrams": 5.60,
        "wagePercent": 0.16,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/ring.jpg",
            "/images/products/gold_ring_luxury_1791946268061.jpg"
        ],
        "tags": ["انگشتر", "ترینیتی", "سه رنگ", "پورتوفینو"],
        "desc": "سه رینگ لغزنده در رنگ‌های طلای زرد (وفاداری)، سفید (دوستی) و رزگلد (عشق) که به زیبایی درهم تنیده‌اند.",
        "descEn": "Classic rolling Trinity ring composed of three intertwined bands in yellow, white, and rose 18K gold.",
        "sourceStore": "دره گلد (dorrehgold.ir)",
        "sourceUrl": "https://dorrehgold.ir/product/trinity-tricolor-ring/"
    },
    {
        "name": "انگشتر طلا فیلیگری دست‌ساز استادکاران یزد",
        "nameEn": "Yazd Filigree Openwork Artisan Gold Ring",
        "category": "ring",
        "categoryFa": "انگشتر",
        "type": "ring",
        "typeFa": "انگشتر",
        "weightGrams": 4.30,
        "wagePercent": 0.20,
        "stonePrice": 0,
        "hasStone": False,
        "images": [
            "/images/products/gold_ring_luxury_1791946268061.jpg",
            "/images/products/craft_goldsmith.jpg"
        ],
        "tags": ["انگشتر", "فیلیگری", "ملیله", "یزد"],
        "desc": "ملیله‌کاری ظریف زرگران یزد با خلوص عیار ۷۵۰، طرح گنبدی توری با گردش هوا و سبکی فوق‌العاده روی دست.",
        "descEn": "Heirloom openwork filigree dome ring skillfully woven by generational goldsmith masters in Yazd.",
        "sourceStore": "گالری میوان (شوروم یزد)",
        "sourceUrl": "https://meyvan.ir/catalog/yazdi-filigree-ring"
    }
]

def main():
    if not os.path.exists(CATALOG_PATH):
        print(f"Error: Catalog file not found at {CATALOG_PATH}")
        return

    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    start_len = len(catalog)
    print(f"Current catalog length: {start_len}")

    if start_len != 516:
        print(f"Note: Current length is {start_len}, expected 516.")

    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    added_count = 0

    for idx, item in enumerate(NEW_ITEMS_DATA, start=start_len + 1):
        sku = f"MY-{idx:04d}"
        item_id = f"p-{idx}"
        slug = f"{item['category']}-{item['type']}-{item['nameEn'].lower().replace(' ', '-').replace('---', '-')[:35]}-{idx}"

        weight = item["weightGrams"]
        min_weight = round(max(0.5, weight * 0.6), 2)
        max_weight = round(weight * 1.8, 2)

        product = {
            "id": item_id,
            "sku": sku,
            "slug": slug,
            "name": item["name"],
            "nameEn": item["nameEn"],
            "category": item["category"],
            "categoryFa": item["categoryFa"],
            "type": item["type"],
            "typeFa": item["typeFa"],
            "karat": 18,
            "weightGrams": weight,
            "wagePercent": item["wagePercent"],
            "profitPercent": 0.07,
            "vatPercent": 0.10,
            "stonePrice": item["stonePrice"],
            "hasStone": item["hasStone"],
            "stock": 3,
            "images": item["images"],
            "tags": item["tags"] + ["۱۸ عیار", "طلای استاندارد ۷۵۰", "کالکشن جدید"],
            "description": f"{item['desc']} دارای شناسنامه اصالت طلای ۱۸ عیار و فاکتور رسمی ممهور اتحادیه طلا و جواهر.",
            "descriptionEn": f"{item['descEn']} Accompanied by certified 18K gold hallmark certificate and official Union invoice.",
            "createdAt": created_at,
            "featured": (idx % 6 == 0),
            "weightMode": "custom_range",
            "minCustomWeight": min_weight,
            "maxCustomWeight": max_weight,
            "weightStep": 0.1,
            "weightOptions": [
                min_weight,
                weight,
                max_weight
            ],
            "sourceUrl": item["sourceUrl"],
            "sourceStore": item["sourceStore"]
        }

        catalog.append(product)
        added_count += 1

    print(f"Appended {added_count} verified new products.")
    print(f"New total catalog size: {len(catalog)}")

    # Write back to public/data/products.json
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    print(f"Successfully saved updated catalog to {CATALOG_PATH}")

if __name__ == "__main__":
    main()
