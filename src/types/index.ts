export type CategoryKey = 'minimal' | 'economic' | 'everyday' | 'heavy' | 'set' | 'jewelry';

export type ProductTypeKey =
  | 'ring'
  | 'necklace'
  | 'pendant'
  | 'earrings'
  | 'bracelet'
  | 'bangle'
  | 'anklet'
  | 'set'
  | 'half_set'
  | 'coin';

export type WageMethod = 'percentage' | 'fixed_per_gram' | 'fixed_per_item';
export type ProfitBase = 'gold_plus_wage' | 'gold_only';
export type VatBase = 'wage_and_profit' | 'total' | 'none';

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: CategoryKey;
  categoryFa: string;
  type: ProductTypeKey;
  typeFa: string;
  karat: 18 | 21 | 24;
  weightGrams: number;
  wageMethod?: WageMethod;
  wagePercent: number; // e.g. 0.16 (16%)
  wagePerGram?: number; // if fixed_per_gram is used
  profitPercent?: number; // e.g. 0.07 (7%)
  vatPercent?: number; // e.g. 0.09 (9%)
  stonePrice: number; // Tomans
  hasStone: boolean;
  stock: number;
  images: string[];
  tags: string[];
  description: string;
  createdAt: string;
  featured?: boolean;
  // Weight customization capabilities (Axis 2)
  weightMode?: 'fixed' | 'preset' | 'custom_range';
  minCustomWeight?: number;
  maxCustomWeight?: number;
  weightStep?: number;
  weightOptions?: number[];
}

export interface PricingConfig {
  gold18PerGram: number; // Tomans per gram
  referenceKarat: 18 | 24;
  defaultProfitPercent: number; // default 0.07 (7%)
  profitBase: ProfitBase; // default 'gold_plus_wage'
  defaultVatPercent: number; // default 0.10 (10% Iranian gold tax law)
  vatBase: VatBase; // default 'wage_and_profit' (Iranian gold tax law)
  currency: 'TOMAN' | 'RIAL';
  roundingUnit: number; // default 1 Toman (Exact)
  priceSource: string;
  updatedAt: string;
  pricingStatus: PriceStatus;
  legalBasisNote: string;
}

export interface PriceBreakdown {
  goldPricePerGram: number; // Tomans
  karat: number;
  weightGrams: number;
  rawGoldPrice: number; // Base metal value
  wageMethod: WageMethod;
  wageRate: number; // percent or amount
  wageAmount: number; // Manufacturing fee
  profitBase: ProfitBase;
  profitPercent: number;
  profitAmount: number;
  vatBase: VatBase;
  vatPercent: number;
  vatAmount: number;
  stonePrice: number;
  otherCharges: number;
  discountAmount: number;
  totalPrice: number; // Final payable price in Tomans
  currency: 'TOMAN';
  calculatedAt: string;
  isReconciled: boolean;
  isEstimated?: boolean; // True when custom weight is entered before final hallmarking
}

export interface GoldPriceData {
  gold18PerGram: number;
  currency: string;
  source: string;
  updatedAt: string;
  change24hPercent?: number;
  high24h?: number;
  low24h?: number;
}

export type PriceStatus = 'live' | 'stale' | 'expired' | 'manual';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight?: number; // Custom chosen gram weight
  isCustomWeight?: boolean; // Flag indicating customer chose custom gram
  lockedPrice?: number;
  addedAt: number;
}

export interface OrderCustomerInfo {
  fullName: string;
  mobile: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  shippingMethod: 'express_post' | 'yazd_courier';
  notes?: string;
}

export interface FilterState {
  search: string;
  category: string;
  type: string;
  karat: string;
  minWeight: number;
  maxWeight: number;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  hasStone: 'all' | 'withStone' | 'noStone';
  sortBy: 'newest' | 'bestseller' | 'cheapest' | 'expensive' | 'lightest' | 'heaviest';
}

export interface InvoiceItem {
  id: string;
  sku: string;
  name: string;
  karat: number;
  weightGrams: number;
  quantity: number;
  goldPricePerGram: number;
  rawGoldPrice: number;
  wageAmount: number;
  profitAmount: number;
  vatAmount: number;
  stonePrice: number;
  unitTotalPrice: number;
  lineTotalPrice: number;
  isCustomWeight?: boolean;
  originalWeightGrams?: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  isDraft: boolean;
  issuedAt: string;
  issuedAtFa: string;
  goldReferencePrice: number;
  goldReferenceTimestamp: string;
  pricingRules: {
    profitRate: number;
    profitBase: string;
    vatRate: number;
    vatBase: string;
    legalNote: string;
  };
  seller: {
    name: string;
    brandTitle: string;
    brandSlogan: string;
    showroomAddress: string;
    telephone: string;
    registrationStatus: string;
  };
  customer: OrderCustomerInfo;
  items: InvoiceItem[];
  totals: {
    totalWeightGrams: number;
    totalRawGold: number;
    totalWage: number;
    totalProfit: number;
    totalVat: number;
    totalStone: number;
    totalPayable: number;
    currency: string;
  };
}

export interface EducationalGuide {
  id: string;
  slug: string;
  title: string;
  summary: string;
  readTimeMinutes: number;
  category: 'pricing' | 'karat' | 'buying' | 'care';
  categoryFa: string;
  sections: {
    heading: string;
    content: string;
    exampleBox?: string;
  }[];
  keyTakeaway: string;
  relatedCategory?: CategoryKey;
}
