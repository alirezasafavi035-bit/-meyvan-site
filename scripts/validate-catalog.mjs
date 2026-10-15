#!/usr/bin/env node
/**
 * MEYVAN Catalog Validator
 * Validates data integrity of public/data/products.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const catalogPath = path.join(ROOT_DIR, 'public', 'data', 'products.json');

if (!fs.existsSync(catalogPath)) {
  console.error(`Error: Catalog file not found at ${catalogPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(catalogPath, 'utf-8');
const products = JSON.parse(raw);

console.log(`Validating ${products.length} products...`);

if (products.length !== 500) {
  console.error(`Failed: Expected 500 products, found ${products.length}`);
  process.exit(1);
}

const skus = new Set();
const slugs = new Set();
const validKarats = new Set([18, 21, 24]);
const validCategories = new Set([
  'earrings',
  'ring',
  'necklace',
  'bracelet',
  'set',
  'coin',
  'pendant',
  'men',
  'kids',
  'economic',
  'minimal',
  'everyday',
  'heavy',
  'jewelry'
]);

let errors = 0;

for (let i = 0; i < products.length; i++) {
  const p = products[i];
  if (!p.sku || skus.has(p.sku)) {
    console.error(`Duplicate or missing SKU at index ${i}: ${p.sku}`);
    errors++;
  }
  skus.add(p.sku);

  if (!p.slug || slugs.has(p.slug)) {
    console.error(`Duplicate or missing slug at index ${i}: ${p.slug}`);
    errors++;
  }
  slugs.add(p.slug);

  if (!p.weightGrams || p.weightGrams <= 0) {
    console.error(`Invalid weight for product ${p.sku}: ${p.weightGrams}`);
    errors++;
  }

  if (!validKarats.has(p.karat)) {
    console.error(`Invalid karat for product ${p.sku}: ${p.karat}`);
    errors++;
  }

  if (!validCategories.has(p.category)) {
    console.error(`Invalid category for product ${p.sku}: ${p.category}`);
    errors++;
  }

  if (p.wagePercent < 0 || p.wagePercent > 1) {
    console.error(`Invalid wagePercent for product ${p.sku}: ${p.wagePercent}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`Validation failed with ${errors} errors.`);
  process.exit(1);
}

console.log('Catalog validation PASSED! All 500 products are valid and unique.');
