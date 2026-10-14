#!/usr/bin/env node
/**
 * MEYVAN Jewelry Catalog Generator
 * Generates 500 realistic gold and jewelry products with deterministic seeded PRNG.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Linear congruential generator for reproducible deterministic catalog
let seed = 1337420;
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

const CATEGORIES = [
  { key: 'minimal', fa: 'مینیمال', count: 100, minW: 1.0, maxW: 3.0, minWage: 0.14, maxWage: 0.20, stoneRate: 0.1 },
  { key: 'economic', fa: 'اقتصادی', count: 90, minW: 1.0, maxW: 4.0, minWage: 0.11, maxWage: 0.16, stoneRate: 0.05 },
  { key: 'everyday', fa: 'روزمره', count: 100, minW: 2.0, maxW: 8.0, minWage: 0.13, maxWage: 0.19, stoneRate: 0.15 },
  { key: 'heavy', fa: 'سنگین', count: 70, minW: 10.0, maxW: 60.0, minWage: 0.08, maxWage: 0.14, stoneRate: 0.05 },
  { key: 'set', fa: 'سرویس', count: 70, minW: 15.0, maxW: 80.0, minWage: 0.18, maxWage: 0.25, stoneRate: 0.35 },
  { key: 'jewelry', fa: 'جواهر', count: 70, minW: 2.0, maxW: 15.0, minWage: 0.20, maxWage: 0.28, stoneRate: 0.95 },
];

const TYPES_BY_CAT = {
  minimal: [
    { key: 'ring', fa: 'انگشتر' },
    { key: 'necklace', fa: 'گردنبند' },
    { key: 'pendant', fa: 'آویز' },
    { key: 'earrings', fa: 'گوشواره' },
    { key: 'bracelet', fa: 'دستبند' },
    { key: 'anklet', fa: 'پابند' },
  ],
  economic: [
    { key: 'pendant', fa: 'آویز' },
    { key: 'earrings', fa: 'گوشواره' },
    { key: 'ring', fa: 'انگشتر' },
    { key: 'bracelet', fa: 'دستبند' },
    { key: 'necklace', fa: 'گردنبند' },
  ],
  everyday: [
    { key: 'bracelet', fa: 'دستبند' },
    { key: 'necklace', fa: 'گردنبند' },
    { key: 'ring', fa: 'انگشتر' },
    { key: 'earrings', fa: 'گوشواره' },
    { key: 'bangle', fa: 'النگو' },
  ],
  heavy: [
    { key: 'bangle', fa: 'النگو' },
    { key: 'bracelet', fa: 'دستبند' },
    { key: 'necklace', fa: 'گردنبند' },
    { key: 'ring', fa: 'انگشتر' },
  ],
  set: [
    { key: 'set', fa: 'سرویس کامل' },
    { key: 'half_set', fa: 'نیم‌ست' },
  ],
  jewelry: [
    { key: 'ring', fa: 'انگشتر' },
    { key: 'necklace', fa: 'گردنبند' },
    { key: 'earrings', fa: 'گوشواره' },
    { key: 'half_set', fa: 'نیم‌ست' },
    { key: 'bracelet', fa: 'دستبند' },
  ]
};

const NOUNS = [
  'پرنیان', 'نگین‌رخ', 'خورشید', 'مهتاب', 'آوا', 'باروک', 'سولاریس', 'شهبانو',
  'ونکلیف', 'کارتیه', 'تیفانی', 'ترینیتی', 'میوان', 'گندم', 'انار', 'اسلیمی',
  'ترنج', 'شباهنگ', 'یاقوت', 'زمرد', 'الماس', 'فیروزه', 'گلنار', 'فلورا',
  'سولیتیر', 'آناهیتا', 'ترمه', 'رویا', 'سپهر', 'آمیتیست', 'پوپک', 'مهرگان',
  'آتشین', 'برلیان', 'افرا', 'نیلوفر', 'آترین', 'ماهک', 'چوگان', 'شمس'
];

const DESCRIPTIONS = [
  'طراحی مدرن و ارگونومیک با پرداخت آینه‌ای براق و استحکام بالا برای استفاده روزانه.',
  'هنر دست استادکاران سنتی یزد با الهام از نقوش معماری کویر و ظرافت بی‌نظیر.',
  'الگوی مینیمال مناسب استایل‌های معاصر، با عیار استاندارد و درخشش چشم‌نواز.',
  'ساخته شده از طلای خالص ۱۸ عیار با فاکتور رسمی اتحادیه و شناسنامه معتبر میوان.',
  'ترکیب کلاسیک خطوط منحنی و تراش دقیق که جلوه‌ای لوکس و ماندگار خلق می‌کند.',
  'دارای قفل مطمئن و استاندارد، ضدحساسیت و بسیار شیک برای موقعیت‌های خاص.'
];

const products = [];
let skuCounter = 1;

for (const cat of CATEGORIES) {
  for (let i = 0; i < cat.count; i++) {
    const sku = `MY-${String(skuCounter).padStart(4, '0')}`;
    const typeObj = pick(TYPES_BY_CAT[cat.key]);
    const noun = pick(NOUNS);
    const noun2 = pick(NOUNS);
    const name = `${typeObj.fa} طلا ${noun} ${noun !== noun2 ? noun2 : 'لوکس'}`;
    const slug = `${typeObj.key}-${cat.key}-${noun.toLowerCase()}-${skuCounter}`;

    // Karat distribution (18k standard, 21k for heavy traditional Yazdi gold)
    const karatRoll = random();
    let karat = 18;
    if (cat.key === 'heavy' && karatRoll > 0.75) {
      karat = 21;
    }

    const weightGrams = randRange(cat.minW, cat.maxW, 2);
    const wagePercent = randRange(cat.minWage, cat.maxWage, 2);
    const profitPercent = 0.07; // standard 7%
    const vatPercent = 0.10; // 10% on wage + profit

    // Stone price
    const hasStone = random() < cat.stoneRate;
    let stonePrice = 0;
    if (hasStone) {
      stonePrice = randInt(1, 15) * 500000; // 500k to 7.5M Tomans
    }

    const stock = randInt(1, 6);
    const featured = random() < 0.12;

    const tags = [cat.fa, typeObj.fa, `${karat} عیار`];
    if (hasStone) tags.push('نگین‌دار');
    else tags.push('بدون نگین');
    if (featured) tags.push('پیشنهاد ویژه');

    // High resolution product images matching category and item
    let primaryImage = '/images/products/ring.jpg';
    let secondaryImage = '/images/products/signature.jpg';

    if (name.includes('انار') || name.includes('فیروزه')) {
      primaryImage = '/images/products/pomegranate_turquoise.jpg';
      secondaryImage = '/images/products/earrings.jpg';
    } else if (typeObj.key === 'ring') {
      primaryImage = '/images/products/ring.jpg';
      secondaryImage = '/images/products/signature.jpg';
    } else if (typeObj.key === 'necklace' || typeObj.key === 'pendant') {
      primaryImage = '/images/products/necklace.jpg';
      secondaryImage = '/images/products/signature.jpg';
    } else if (typeObj.key === 'earrings') {
      primaryImage = '/images/products/earrings.jpg';
      secondaryImage = '/images/products/pomegranate_turquoise.jpg';
    } else if (typeObj.key === 'bracelet' || typeObj.key === 'bangle' || typeObj.key === 'anklet') {
      primaryImage = '/images/products/bracelet.jpg';
      secondaryImage = '/images/products/signature.jpg';
    } else if (typeObj.key === 'set' || typeObj.key === 'half_set') {
      primaryImage = '/images/products/set.jpg';
      secondaryImage = '/images/products/signature.jpg';
    }

    products.push({
      id: `p-${skuCounter}`,
      sku,
      slug,
      name,
      category: cat.key,
      categoryFa: cat.fa,
      type: typeObj.key,
      typeFa: typeObj.fa,
      karat,
      weightGrams,
      wagePercent,
      profitPercent,
      vatPercent,
      stonePrice,
      hasStone,
      stock,
      images: [
        primaryImage,
        secondaryImage
      ],
      tags,
      description: pick(DESCRIPTIONS),
      createdAt: new Date(Date.now() - randInt(1, 180) * 86400000).toISOString(),
      featured
    });

    skuCounter++;
  }
}

// Ensure output directories
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
  ...products.slice(0, 150).map(p => `https://meyvan.ir/#/product/${p.slug}`)
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
