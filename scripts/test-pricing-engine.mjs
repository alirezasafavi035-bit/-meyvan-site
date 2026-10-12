#!/usr/bin/env node
/**
 * Automated Test Suite for MEYVAN Gold Pricing Engine
 * Validates math precision, karat conversion, tax rules, wage methods, and reconciliation.
 */

import {
  calculateProductPrice,
  getGoldPriceForKarat,
  DEFAULT_PRICING_CONFIG,
  createInvoiceRecord
} from '../src/utils/pricing.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAILED: ${message}`);
  }
}

console.log('\n=== Testing MEYVAN Pricing Engine ===\n');

// 1. Karat Conversion
console.log('1. Karat Conversion:');
const p18 = 4000000;
assert(getGoldPriceForKarat(p18, 18) === 4000000, '18k returns reference price unmodified');
assert(getGoldPriceForKarat(p18, 24) === Math.round((24 / 18) * 4000000), '24k converts with ratio 24/18');
assert(getGoldPriceForKarat(p18, 21) === Math.round((21 / 18) * 4000000), '21k converts with ratio 21/18');

// 2. Standard 18k Product Pricing
console.log('\n2. Standard 18k Product Calculation:');
const testProduct1 = {
  id: 'test-1',
  sku: 'TST-001',
  slug: 'test-ring',
  name: 'انگشتر تست',
  category: 'minimal',
  categoryFa: 'مینیمال',
  type: 'ring',
  typeFa: 'انگشتر',
  karat: 18,
  weightGrams: 2.5,
  wagePercent: 0.15, // 15%
  profitPercent: 0.07, // 7%
  vatPercent: 0.09, // 9%
  stonePrice: 0,
  hasStone: false,
  stock: 2,
  images: [],
  tags: [],
  description: '',
  createdAt: ''
};

const res1 = calculateProductPrice(testProduct1, { gold18PerGram: 5000000 });
// Expected:
// rawGold = 2.5 * 5000000 = 12,500,000
// wage = 12,500,000 * 0.15 = 1,875,000
// profit = (12,500,000 + 1,875,000) * 0.07 = 14,375,000 * 0.07 = 1,006,250
// vat = (1,875,000 + 1,006,250) * 0.09 = 2,881,250 * 0.09 = 259,313 (approx before rounding reconciliation)
assert(res1.rawGoldPrice === 12500000, 'Raw gold price is 12,500,000');
assert(res1.wageAmount === 1875000, 'Wage amount is 1,875,000');
assert(res1.profitAmount === 1006250, 'Profit is 1,006,250');
assert(res1.isReconciled, 'Price breakdown reconciles perfectly with total');

// 3. Tax Rule: Only Wage + Profit (Iranian Law) vs Total
console.log('\n3. Configurable Tax Base:');
const resVatOnlyWageProfit = calculateProductPrice(testProduct1, {
  gold18PerGram: 5000000,
  vatBase: 'wage_and_profit',
  defaultVatPercent: 0.09
});
const resVatTotal = calculateProductPrice(testProduct1, {
  gold18PerGram: 5000000,
  vatBase: 'total',
  defaultVatPercent: 0.09
});
const resVatNone = calculateProductPrice(testProduct1, {
  gold18PerGram: 5000000,
  vatBase: 'none'
});
assert(resVatOnlyWageProfit.vatAmount < resVatTotal.vatAmount, 'VAT on wage+profit is strictly less than VAT on total');
assert(resVatNone.vatAmount === 0, 'VAT on none is 0');

// 4. Fixed per-gram Wage Method
console.log('\n4. Wage Method Options:');
const testProductFixed = {
  ...testProduct1,
  wageMethod: 'fixed_per_gram',
  wagePerGram: 400000 // 400,000 T per gram
};
const resFixed = calculateProductPrice(testProductFixed, { gold18PerGram: 5000000 });
assert(resFixed.wageAmount === 2.5 * 400000, 'Fixed wage per gram is weight * wagePerGram');

// 5. Zero and Boundary Weights
console.log('\n5. Boundary Conditions:');
const testProductZero = { ...testProduct1, weightGrams: 0 };
const resZero = calculateProductPrice(testProductZero);
assert(resZero.rawGoldPrice === 0, 'Zero weight results in 0 raw gold');
assert(resZero.totalPrice === 0, 'Zero weight results in 0 total');

// 6. Invoice Consistency
console.log('\n6. Invoice Engine Consistency:');
const invoice = createInvoiceRecord({
  items: [{ product: testProduct1, quantity: 2, addedAt: Date.now() }],
  pricingConfig: { ...DEFAULT_PRICING_CONFIG, gold18PerGram: 5000000 }
});
assert(invoice.items.length === 1, 'Invoice contains 1 item row');
assert(invoice.items[0].quantity === 2, 'Quantity is 2');
assert(invoice.totals.totalPayable === invoice.items[0].unitTotalPrice * 2, 'Invoice line and total match exact product price * 2');

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All pricing engine tests PASSED!\n');
}
