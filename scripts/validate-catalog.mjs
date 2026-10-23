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

// Configuration
const MIN_PRODUCTS = 100; // Safe threshold for MEYVAN's curated 115-item catalog

if (!fs.existsSync(catalogPath)) {
  console.error(`[Validator] Error: Catalog file not found at ${catalogPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(catalogPath, 'utf-8');
let products;
try {
  products = JSON.parse(raw);
} catch (err) {
  console.error(`[Validator] Error: Failed to parse JSON from ${catalogPath}: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(products)) {
  console.error(`[Validator] Error: Expected JSON array of products in ${catalogPath}, found ${typeof products}`);
  process.exit(1);
}

console.log(`[Validator] File read: ${catalogPath}`);
console.log(`[Validator] Counted: ${products.length} products`);
console.log(`[Validator] Minimum expected: ${MIN_PRODUCTS} products`);

if (products.length < MIN_PRODUCTS) {
  console.error(
    `[Validator] Failed: Expected at least ${MIN_PRODUCTS} products in ${catalogPath}, but found ${products.length}.`
  );
  process.exit(1);
}

const skus = new Set();
const slugs = new Set();
const validKarats = new Set([18, 21, 21.6, 24]);
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
    console.error(`[Validator] Duplicate or missing SKU at index ${i}: ${p.sku}`);
    errors++;
  }
  skus.add(p.sku);

  if (!p.slug || slugs.has(p.slug)) {
    console.error(`[Validator] Duplicate or missing slug at index ${i}: ${p.slug}`);
    errors++;
  }
  slugs.add(p.slug);

  if (!p.weightGrams || p.weightGrams <= 0) {
    console.error(`[Validator] Invalid weight for product ${p.sku}: ${p.weightGrams}`);
    errors++;
  }

  if (!validKarats.has(p.karat)) {
    console.error(`[Validator] Invalid karat for product ${p.sku}: ${p.karat}`);
    errors++;
  }

  if (!validCategories.has(p.category)) {
    console.error(`[Validator] Invalid category for product ${p.sku}: ${p.category}`);
    errors++;
  }

  if (p.wagePercent < 0 || p.wagePercent > 1) {
    console.error(`[Validator] Invalid wagePercent for product ${p.sku}: ${p.wagePercent}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`[Validator] Validation failed with ${errors} errors.`);
  process.exit(1);
}

console.log(`[Validator] Catalog validation PASSED! All ${products.length} products in ${catalogPath} are valid, unique, and conform to schema.`);
