#!/usr/bin/env node
/**
 * MEYVAN Jewelry Catalog Generator
 * Generates 500 realistic gold and jewelry products across 10 specialized categories
 * with deterministic seeded PRNG, strictly matched imagery, and Union pricing metadata.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Deterministic linear congruential generator
let seed = 42891337;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function randRange(min, max, decimals = 2) {
  const val = min + random() * (max - min);
  return Number(val.toFixed(decimals));
}

function randInt(min, max) {
  return Math.floor(min + random() * (max - min + 1));
}

function pick(arr) {
  return arr[Math.floor(random() * arr.length)];
}

// 10 Specialized Categories
const CATEGORIES = [
  { key: 'earrings', fa: 'گوشواره', count: 65, minW: 1.0, maxW: 14.5, minWage: 0.13, maxWage: 0.22, defaultType: 'earrings', defaultTypeFa: 'گوشواره' },
  { key: 'ring', fa: 'انگشتر', count: 70, minW: 1.5, maxW: 12.0, minWage: 0.13, maxWage: 0.20, defaultType: 'ring', defaultTypeFa: 'انگشتر' },
  { key: 'necklace', fa: 'گردنبند', count: 65, minW: 2.8, maxW: 32.0, minWage: 0.12, maxWage: 0.21, defaultType: 'necklace', defaultTypeFa: 'گردنبند' },
  { key: 'bracelet', fa: 'دستبند', count: 60, minW: 2.2, maxW: 24.0, minWage: 0.12, maxWage: 0.19, defaultType: 'bracelet', defaultTypeFa: 'دستبند' },
  { key: 'set', fa: 'نیم‌ست', count: 45, minW: 9.0, maxW: 65.0, minWage: 0.17, maxWage: 0.25, defaultType: 'half_set', defaultTypeFa: 'نیم‌ست' },
  { key: 'coin', fa: 'سکه و شمش', count: 35, minW: 0.5, maxW: 50.0, minWage: 0.02, maxWage: 0.06, defaultType: 'coin', defaultTypeFa: 'سکه و شمش' },
  { key: 'pendant', fa: 'آویز و پلاک', count: 50, minW: 0.8, maxW: 7.5, minWage: 0.14, maxWage: 0.20, defaultType: 'pendant', defaultTypeFa: 'آویز و پلاک' },
  { key: 'men', fa: 'محصولات مردانه', count: 35, minW: 3.5, maxW: 28.0, minWage: 0.11, maxWage: 0.17, defaultType: 'bracelet', defaultTypeFa: 'دستبند مردانه' },
  { key: 'kids', fa: 'محصولات بچگانه', count: 35, minW: 0.6, maxW: 3.2, minWage: 0.14, maxWage: 0.18, defaultType: 'pendant', defaultTypeFa: 'طلا کودک' },
  { key: 'economic', fa: 'محصولات کم‌اجرت', count: 40, minW: 1.2, maxW: 18.0, minWage: 0.07, maxWage: 0.12, defaultType: 'bangle', defaultTypeFa: 'طلای کم‌اجرت' },
];

const DESCRIPTIONS = [
  'طراحی مدرن و ارگونومیک با پرداخت آینه‌ای براق و استحکام بالا برای استفاده روزانه.',
  'هنر دست استادکاران سنتی یزد با الهام از نقوش معماری کویر و ظرافت بی‌نظیر.',
  'الگوی مینیمال مناسب استایل‌های معاصر، با عیار استاندارد و درخشش چشم‌نواز.',
  'ساخته شده از طلای خالص با فاکتور رسمی اتحادیه و شناسنامه معتبر میوان.',
  'ترکیب کلاسیک خطوط منحنی و تراش دقیق که جلوه‌ای لوکس و ماندگار خلق می‌کند.',
  'دارای قفل مطمئن و استاندارد، ضدحساسیت و بسیار شیک برای موقعیت‌های خاص.'
];

const GENERAL_NAMES = [
  'پرنیان', 'خورشید', 'مهتاب', 'آوا', 'باروک', 'سولاریس', 'شهبانو',
  'ونکلیف', 'کارتیه', 'تیفانی', 'ترینیتی', 'میوان', 'گندم', 'اسلیمی',
  'ترنج', 'شباهنگ', 'گلنار', 'فلورا', 'سولیتیر', 'آناهیتا', 'ترمه',
  'رویا', 'سپهر', 'پوپک', 'مهرگان', 'آتشین', 'برلیان', 'افرا', 'نیلوفر',
  'آترین', 'ماهک', 'چوگان', 'شمس', 'کویری', 'یزدان', 'نگین‌رخ'
];

const products = [];
let skuCounter = 1;

for (const cat of CATEGORIES) {
  for (let i = 0; i < cat.count; i++) {
    const sku = `MY-${String(skuCounter).padStart(4, '0')}`;
    let typeKey = cat.defaultType;
    let typeFa = cat.defaultTypeFa;

    let karat = 18;
    let weightGrams = randRange(cat.minW, cat.maxW, 2);
    let wagePercent = randRange(cat.minWage, cat.maxWage, 2);
    const profitPercent = 0.07;
    const vatPercent = 0.10;

    let hasStone = false;
    let stonePrice = 0;
    let primaryImage = '';
    let secondaryImage = '/images/products/signature.jpg';
    let name = '';
    let noun = pick(GENERAL_NAMES);

    // Specific category rules to guarantee accurate imagery and naming:
    if (cat.key === 'coin') {
      typeKey = random() > 0.5 ? 'coin' : 'bullion';
      if (typeKey === 'coin') {
        typeFa = 'سکه بانکی';
        const coinTypes = ['تمام بهار آزادی', 'نیم بهار آزادی', 'ربع بهار آزادی', 'گرمی بانکی'];
        name = `سکه ${pick(coinTypes)} میوان`;
        karat = 21; // Bahar Azadi is 900 purity (~21.6k)
        weightGrams = pick([8.13, 4.06, 2.03, 1.01]);
      } else {
        typeFa = 'شمش طلا';
        const weights = [1, 2.5, 5, 10, 20, 50];
        const w = pick(weights);
        weightGrams = w;
        name = `شمش طلا خالص ۲۴ عیار ${w} گرمی میوان`;
        karat = 24;
      }
      wagePercent = randRange(0.02, 0.05, 3);
      primaryImage = '/images/products/coin_bullion.jpg';
      secondaryImage = '/images/products/luxury_packaging.jpg';
    } else if (cat.key === 'men') {
      typeKey = pick(['bracelet', 'ring']);
      typeFa = typeKey === 'bracelet' ? 'دستبند مردانه' : 'انگشتر مردانه';
      name = `${typeFa} طلا و چرم ${noun} مردانه`;
      primaryImage = '/images/products/men_jewelry.jpg';
      secondaryImage = '/images/products/craft_goldsmith.jpg';
    } else if (cat.key === 'kids') {
      typeKey = pick(['pendant', 'bracelet']);
      typeFa = typeKey === 'pendant' ? 'پلاک کودک' : 'دستبند کودک';
      name = `${typeFa} طلا طرح ${pick(['خرس تدی', 'پروانه', 'فرشته', 'ماه و ستاره'])} کودکانه`;
      primaryImage = '/images/products/kids_jewelry.jpg';
      secondaryImage = '/images/products/luxury_packaging.jpg';
    } else if (cat.key === 'pendant') {
      typeKey = 'pendant';
      typeFa = 'آویز و پلاک';
      name = `آویز گردنبند طلا طرح ${noun} اسلیمی یزد`;
      primaryImage = '/images/products/pendant_medallion.jpg';
      secondaryImage = '/images/products/necklace.jpg';
    } else if (cat.key === 'economic') {
      typeKey = pick(['bangle', 'ring', 'pendant']);
      typeFa = typeKey === 'bangle' ? 'النگو' : typeKey === 'ring' ? 'رینگ کم‌اجرت' : 'پلاک کم‌اجرت';
      name = `${typeFa} طلا مینیمال ${noun} (کم‌اجرت)`;
      wagePercent = randRange(0.07, 0.12, 2);
      primaryImage = '/images/products/low_wage_economic.jpg';
      secondaryImage = '/images/products/bracelet.jpg';
    } else if (cat.key === 'earrings') {
      typeKey = 'earrings';
      typeFa = 'گوشواره';
      
      // Determine subtype by weight and style
      if (random() < 0.22) {
        // Turquoise or Pomegranate specialty earring
        hasStone = true;
        stonePrice = randInt(10, 35) * 100000;
        name = `گوشواره طلا انار و فیروزه نیشابور ${noun}`;
        primaryImage = '/images/products/pomegranate_turquoise.jpg';
        secondaryImage = '/images/products/earrings_chandelier.jpg';
      } else if (weightGrams <= 3.2) {
        name = `گوشواره طلا میخی مینیمال ${noun}`;
        primaryImage = '/images/products/earrings_stud.jpg';
        secondaryImage = '/images/products/earrings.jpg';
      } else if (weightGrams >= 6.0) {
        name = `گوشواره طلا آویز مجلسی لوکس ${noun}`;
        if (random() > 0.4) {
          hasStone = true;
          stonePrice = randInt(15, 45) * 100000;
          name = `گوشواره طلا آویز مجلسی با سنگ یاقوت ${noun}`;
        }
        primaryImage = '/images/products/earrings_chandelier.jpg';
        secondaryImage = '/images/products/earrings.jpg';
      } else {
        name = `گوشواره طلا حلقه‌ای ${noun}`;
        primaryImage = '/images/products/earrings.jpg';
        secondaryImage = '/images/products/earrings_stud.jpg';
      }
    } else if (cat.key === 'ring') {
      typeKey = 'ring';
      typeFa = 'انگشتر';
      if (weightGrams > 5.0 || random() > 0.5) {
        name = `انگشتر طلا فاخر و نگین‌دار ${noun}`;
        hasStone = random() > 0.4;
        if (hasStone) stonePrice = randInt(10, 40) * 100000;
        primaryImage = '/images/products/gold_ring_luxury_1791946268061.jpg';
      } else {
        name = `انگشتر طلا ظریف ${noun}`;
        primaryImage = '/images/products/ring.jpg';
      }
      secondaryImage = '/images/products/gold_ring_luxury_1791946268061.jpg';
    } else if (cat.key === 'necklace') {
      typeKey = 'necklace';
      typeFa = 'گردنبند';
      if (weightGrams > 8.0) {
        name = `گردنبند طلا مجلسی تراش‌خورده ${noun}`;
        primaryImage = '/images/products/gold_necklace_pendant_1791946268677.jpg';
      } else {
        name = `گردنبند طلا ظریف زنجیری ${noun}`;
        primaryImage = '/images/products/necklace.jpg';
      }
      secondaryImage = '/images/products/pendant_medallion.jpg';
    } else if (cat.key === 'bracelet') {
      typeKey = random() > 0.4 ? 'bracelet' : 'bangle';
      typeFa = typeKey === 'bangle' ? 'النگو' : 'دستبند';
      if (weightGrams > 7.0) {
        name = `${typeFa} طلا بنگل کارتیه ${noun}`;
        primaryImage = '/images/products/gold_bracelet_bangle_1791946279045.jpg';
      } else {
        name = `${typeFa} طلا زنجیری ${noun}`;
        primaryImage = '/images/products/bracelet.jpg';
      }
      secondaryImage = '/images/products/low_wage_economic.jpg';
    } else if (cat.key === 'set') {
      typeKey = weightGrams > 25.0 ? 'set' : 'half_set';
      typeFa = typeKey === 'set' ? 'سرویس کامل' : 'نیم‌ست';
      if (weightGrams > 20.0) {
        name = `${typeFa} طلا عروس فاخر ${noun}`;
        primaryImage = '/images/products/gold_bridal_set_suite_1791946299635.jpg';
      } else {
        name = `${typeFa} طلا مدرن ${noun}`;
        primaryImage = '/images/products/set.jpg';
      }
      secondaryImage = '/images/products/signature.jpg';
    }

    const slug = `${typeKey}-${cat.key}-${skuCounter}`;

    const tags = [cat.fa, typeFa, `${karat} عیار`];
    if (hasStone) tags.push('نگین‌دار');
    else tags.push('بدون نگین');
    if (wagePercent <= 0.12) tags.push('کم‌اجرت');
    if (weightGrams <= 2.5) tags.push('سبک');
    if (i < 4) tags.push('پیشنهاد ویژه');

    // Dynamic weight customization capabilities
    const isCustomizable = cat.key !== 'coin';
    const minCustomWeight = isCustomizable ? Number(Math.max(0.5, (weightGrams * 0.7)).toFixed(1)) : weightGrams;
    const maxCustomWeight = isCustomizable ? Number((weightGrams * 1.5).toFixed(1)) : weightGrams;

    products.push({
      id: `p-${skuCounter}`,
      sku,
      slug,
      name,
      category: cat.key,
      categoryFa: cat.fa,
      type: typeKey,
      typeFa,
      karat,
      weightGrams,
      wagePercent,
      profitPercent,
      vatPercent,
      stonePrice,
      hasStone,
      stock: randInt(1, 8),
      images: [
        primaryImage,
        secondaryImage
      ],
      tags,
      description: pick(DESCRIPTIONS),
      createdAt: new Date(Date.now() - randInt(1, 150) * 86400000).toISOString(),
      featured: i < 3,
      weightMode: isCustomizable ? 'custom_range' : 'preset',
      minCustomWeight,
      maxCustomWeight,
      weightStep: 0.1,
      weightOptions: isCustomizable ? [minCustomWeight, weightGrams, maxCustomWeight] : [weightGrams]
    });

    skuCounter++;
  }
}

// Ensure output directory exists
const dataDir = path.join(ROOT_DIR, 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write public/data/products.json
const outputPath = path.join(dataDir, 'products.json');
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');

console.log(`Generated ${products.length} products successfully to ${outputPath}`);

// Also generate sitemap.xml
const sitemapUrls = [
  'https://meyvan.ir/',
  'https://meyvan.ir/#/catalog',
  'https://meyvan.ir/#/about',
  'https://meyvan.ir/#/contact',
  'https://meyvan.ir/#/terms',
  'https://meyvan.ir/#/returns',
  'https://meyvan.ir/#/privacy',
  ...products.slice(0, 200).map(p => `https://meyvan.ir/#/product/${p.slug}`)
];

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    url => `  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>${url === 'https://meyvan.ir/' ? '1.0' : url.includes('catalog') ? '0.9' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

fs.writeFileSync(path.join(ROOT_DIR, 'public', 'sitemap.xml'), sitemapContent, 'utf-8');
console.log('Generated public/sitemap.xml successfully.');
