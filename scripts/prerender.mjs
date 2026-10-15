#!/usr/bin/env node
/**
 * MEYVAN Cloudflare Pages Pre-renderer
 * Generates static SEO and OpenGraph enriched entry points for products and categories.
 * Run after `vite build` during Cloudflare Pages deployment.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PRODUCTS_FILE = path.join(ROOT_DIR, 'public', 'data', 'products.json');

if (!fs.existsSync(DIST_DIR)) {
  console.log('Skipping prerender: dist directory does not exist yet. Run vite build first.');
  process.exit(0);
}

const templatePath = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(templatePath)) {
  console.error('Error: dist/index.html template not found.');
  process.exit(1);
}

const indexHtmlTemplate = fs.readFileSync(templatePath, 'utf-8');

if (!fs.existsSync(PRODUCTS_FILE)) {
  console.error(`Error: Products data not found at ${PRODUCTS_FILE}`);
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`Starting SEO pre-rendering for ${products.length} products...`);

let generatedCount = 0;

for (const product of products) {
  const productDir = path.join(DIST_DIR, 'product', product.slug);
  fs.mkdirSync(productDir, { recursive: true });

  const productUrl = `https://meyvan.ir/product/${product.slug}`;
  const title = `${product.name} | گالری طلا و جواهر میوان یزد`;
  const description = `خرید آنلاین ${product.name} طلای ${product.karat} عیار به وزن ${product.weightGrams} گرم با محاسبه شفاف قیمت اتحادیه، فاکتور رسمی و ضمانت ۷ روزه میوان یزد.`;
  const imageUrl = `https://meyvan.ir${product.images[0] || '/images/hero.webp'}`;

  // Structured Data (Schema.org)
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [imageUrl],
    description: description,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'MEYVAN | میوان'
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'IRR',
      price: Math.round(product.weightGrams * 25790000 * 10), // Rials
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'میوان',
        item: 'https://meyvan.ir'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.categoryFa,
        item: `https://meyvan.ir/catalog?category=${product.category}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: productUrl
      }
    ]
  };

  let pageHtml = indexHtmlTemplate
    .replace(/<title>.*?<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${productUrl}" />`)
    .replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${imageUrl}" />`);

  // Inject Schemas before </head>
  const schemaScript = `
  <script type="application/ld+json">
    ${JSON.stringify(productSchema, null, 2)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(breadcrumbSchema, null, 2)}
  </script>
</head>`;

  pageHtml = pageHtml.replace('</head>', schemaScript);

  fs.writeFileSync(path.join(productDir, 'index.html'), pageHtml, 'utf-8');
  generatedCount++;
}

console.log(`Pre-rendered ${generatedCount} static product pages for Cloudflare Pages successfully.`);
