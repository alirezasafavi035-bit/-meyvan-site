import {
  Product,
  PriceBreakdown,
  GoldPriceData,
  PricingConfig,
  InvoiceData,
  InvoiceItem,
  OrderCustomerInfo,
  CartItem
} from '../types';

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  gold18PerGram: 25790000,
  referenceKarat: 18,
  defaultProfitPercent: 0.07, // 7% standard legal profit
  profitBase: 'gold_plus_wage',
  defaultVatPercent: 0.10, // 10% Iranian gold VAT law
  vatBase: 'wage_and_profit',
  currency: 'TOMAN',
  roundingUnit: 1, // Exact Tomans (e.g. 59,162,170)
  priceSource: 'استعلام سیستمی نرخ بازار طلا (TGJU)',
  updatedAt: new Date().toISOString(),
  pricingStatus: 'live',
  legalBasisNote:
    'طبق اصلاحیه قانون مالیات بر ارزش افزوده طلا، اصل ارزش طلا معاف از مالیات بوده و مالیات (۱۰٪) منحصراً بر مجموع اجرت ساخت و سود متعلقه محاسبه می‌شود.'
};

/**
 * Calculates gold price per gram based on karat conversion.
 * 18k = 750 / 1000
 * 21k = 875 / 1000 => (21 / 18) * 18k price
 * 24k = 999.9 / 1000 => (24 / 18) * 18k price
 */
export function getGoldPriceForKarat(
  referencePrice: number,
  targetKarat: number,
  referenceKarat: 18 | 24 = 18
): number {
  if (targetKarat <= 0 || referencePrice <= 0) return 0;
  if (targetKarat === referenceKarat) return referencePrice;

  // Convert to 24k pure base first, then to target karat
  const price24k = (referencePrice * 24) / referenceKarat;
  return Math.round((targetKarat / 24) * price24k);
}

/**
 * Main Centralized Calculation Engine for MEYVAN:
 * Computes transparent, itemized price breakdown for any product using configurable rules.
 */
export function calculateProductPrice(
  product: Product,
  customConfig?: Partial<PricingConfig>
): PriceBreakdown {
  const config: PricingConfig = {
    ...DEFAULT_PRICING_CONFIG,
    ...(customConfig || {})
  };

  const karatPricePerGram = getGoldPriceForKarat(
    config.gold18PerGram,
    product.karat || 18,
    config.referenceKarat
  );

  // 1. Raw Gold Value (وزن طلا × نرخ روز هر گرم)
  const weight = Math.max(0, product.weightGrams || 0);
  const rawGoldPrice = Math.round(weight * karatPricePerGram);

  // 2. Making Charge / Wage (اجرت ساخت)
  const wageMethod = product.wageMethod || 'percentage';
  let wageAmount = 0;
  let wageRate = 0;

  if (wageMethod === 'fixed_per_gram') {
    wageRate = product.wagePerGram || 0;
    wageAmount = Math.round(weight * wageRate);
  } else if (wageMethod === 'fixed_per_item') {
    wageRate = product.wagePerGram || 0;
    wageAmount = Math.round(wageRate);
  } else {
    // Default percentage of raw gold value
    wageRate = product.wagePercent || 0;
    wageAmount = Math.round(rawGoldPrice * wageRate);
  }

  // 3. Seller Profit (سود فروشنده)
  const profitPercent =
    product.profitPercent !== undefined
      ? product.profitPercent
      : config.defaultProfitPercent;
  const profitBase = config.profitBase;

  let profitAmount = 0;
  if (profitBase === 'gold_only') {
    profitAmount = Math.round(rawGoldPrice * profitPercent);
  } else {
    // Standard: (Gold Value + Wage) * Profit%
    profitAmount = Math.round((rawGoldPrice + wageAmount) * profitPercent);
  }

  // 4. VAT Tax (مالیات بر ارزش افزوده)
  const vatPercent =
    product.vatPercent !== undefined
      ? product.vatPercent
      : config.defaultVatPercent;
  const vatBase = config.vatBase;

  let vatAmount = 0;
  if (vatBase === 'total') {
    vatAmount = Math.round((rawGoldPrice + wageAmount + profitAmount) * vatPercent);
  } else if (vatBase === 'none') {
    vatAmount = 0;
  } else {
    // Iranian Law: Only on Wage + Profit
    vatAmount = Math.round((wageAmount + profitAmount) * vatPercent);
  }

  // 5. Gemstones, Other charges, Discounts
  const stonePrice = Math.max(0, product.stonePrice || 0);
  const otherCharges = 0;
  const discountAmount = 0;

  // 6. Final Total
  const subtotalSum =
    rawGoldPrice +
    wageAmount +
    profitAmount +
    vatAmount +
    stonePrice +
    otherCharges -
    discountAmount;

  // Rounding policy: round to configured rounding unit (e.g. nearest 1000 Tomans)
  let totalPrice = subtotalSum;
  if (config.roundingUnit > 1) {
    totalPrice = Math.round(subtotalSum / config.roundingUnit) * config.roundingUnit;
  }

  // Check reconciliation: breakdown must exactly equal total (adjusting VAT or rounding slightly if rounded)
  const reconciliationDiff = totalPrice - subtotalSum;
  const reconciledVat = vatAmount + reconciliationDiff;

  return {
    goldPricePerGram: karatPricePerGram,
    karat: product.karat || 18,
    weightGrams: weight,
    rawGoldPrice,
    wageMethod,
    wageRate,
    wageAmount,
    profitBase,
    profitPercent,
    profitAmount,
    vatBase,
    vatPercent,
    vatAmount: reconciledVat >= 0 ? reconciledVat : vatAmount,
    stonePrice,
    otherCharges,
    discountAmount,
    totalPrice,
    currency: 'TOMAN',
    calculatedAt: new Date().toISOString(),
    isReconciled: true
  };
}

/**
 * Parses raw API response into standardized GoldPriceData.
 */
export function parsePriceResponse(data: unknown): GoldPriceData | null {
  if (!data || typeof data !== 'object') return null;

  const obj = data as Record<string, unknown>;
  let price18: number | null = null;
  let updatedAt = new Date().toISOString();

  if (typeof obj.gold18PerGram === 'number') {
    price18 = obj.gold18PerGram;
  } else if (typeof obj.price === 'number') {
    price18 = obj.price;
  } else if (typeof obj.gold_18k === 'number') {
    price18 = obj.gold_18k;
  } else if (obj.data && typeof (obj.data as Record<string, unknown>).gold18PerGram === 'number') {
    price18 = (obj.data as Record<string, unknown>).gold18PerGram as number;
  }

  if (typeof obj.timestamp === 'string') {
    updatedAt = obj.timestamp;
  } else if (typeof obj.updatedAt === 'string') {
    updatedAt = obj.updatedAt;
  }

  if (!price18 || price18 <= 0) {
    return null;
  }

  let sourceStr = 'استعلام برخط بازار طلا';
  if (typeof obj.source === 'string') {
    sourceStr = obj.source;
  } else if (obj.source && typeof obj.source === 'object') {
    const s = obj.source as Record<string, unknown>;
    sourceStr = `محاسبه مستقیم اونس (${s.ounce || '—'}$)+نوبیتکس (حباب ٪${s.premium_pct || '۱'})`;
  }

  return {
    gold18PerGram: price18,
    currency: (obj.currency as string) || 'تومان',
    source: sourceStr,
    updatedAt,
    change24hPercent: typeof obj.change24hPercent === 'number' ? obj.change24hPercent : 0,
    high24h: typeof obj.high24h === 'number' ? obj.high24h : price18 * 1.01,
    low24h: typeof obj.low24h === 'number' ? obj.low24h : price18 * 0.99
  };
}

/**
 * Creates a formal, verifiable Invoice Record using the exact pricing engine output.
 * Ensures zero drift between product page, checkout, and printable document.
 */
export function createInvoiceRecord(params: {
  invoiceId?: string;
  isDraft?: boolean;
  customer?: Partial<OrderCustomerInfo>;
  items: CartItem[];
  pricingConfig?: PricingConfig;
}): InvoiceData {
  const config = params.pricingConfig || DEFAULT_PRICING_CONFIG;
  const isDraft = params.isDraft ?? false;

  const invoiceNumber =
    params.invoiceId ||
    `MYV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  let totalWeightGrams = 0;
  let totalRawGold = 0;
  let totalWage = 0;
  let totalProfit = 0;
  let totalVat = 0;
  let totalStone = 0;
  let totalPayable = 0;

  const invoiceItems: InvoiceItem[] = params.items.map((cartItem) => {
    const breakdown = calculateProductPrice(cartItem.product, config);
    const qty = Math.max(1, cartItem.quantity || 1);

    const lineRawGold = breakdown.rawGoldPrice * qty;
    const lineWage = breakdown.wageAmount * qty;
    const lineProfit = breakdown.profitAmount * qty;
    const lineVat = breakdown.vatAmount * qty;
    const lineStone = breakdown.stonePrice * qty;
    const lineTotal = breakdown.totalPrice * qty;

    totalWeightGrams += breakdown.weightGrams * qty;
    totalRawGold += lineRawGold;
    totalWage += lineWage;
    totalProfit += lineProfit;
    totalVat += lineVat;
    totalStone += lineStone;
    totalPayable += lineTotal;

    return {
      id: cartItem.product.id,
      sku: cartItem.product.sku,
      name: cartItem.product.name,
      karat: breakdown.karat,
      weightGrams: breakdown.weightGrams,
      quantity: qty,
      goldPricePerGram: breakdown.goldPricePerGram,
      rawGoldPrice: lineRawGold,
      wageAmount: lineWage,
      profitAmount: lineProfit,
      vatAmount: lineVat,
      stonePrice: lineStone,
      unitTotalPrice: breakdown.totalPrice,
      lineTotalPrice: lineTotal
    };
  });

  const now = new Date();
  const issuedAtFa = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now);

  const customer: OrderCustomerInfo = {
    fullName: params.customer?.fullName || 'خریدار گرامی (مهمان)',
    mobile: params.customer?.mobile || 'ثبت نشده',
    province: params.customer?.province || 'یزد',
    city: params.customer?.city || 'یزد',
    address: params.customer?.address || 'تحویل حضوری یا ثبت نشده',
    postalCode: params.customer?.postalCode || '—',
    shippingMethod: params.customer?.shippingMethod || 'express_post',
    notes: params.customer?.notes || ''
  };

  return {
    invoiceNumber,
    isDraft,
    issuedAt: now.toISOString(),
    issuedAtFa,
    goldReferencePrice: config.gold18PerGram,
    goldReferenceTimestamp: config.updatedAt,
    pricingRules: {
      profitRate: config.defaultProfitPercent,
      profitBase: config.profitBase === 'gold_only' ? 'ارزش طلای خام' : 'طلای خام + اجرت',
      vatRate: config.defaultVatPercent,
      vatBase:
        config.vatBase === 'wage_and_profit'
          ? 'مجموع اجرت ساخت و سود (طبق موازین قانون طلا)'
          : 'کل ارزش فاکتور',
      legalNote: config.legalBasisNote
    },
    seller: {
      name: 'گالری طلا و جواهر میوان (MEYVAN)',
      brandTitle: 'MEYVAN GOLD & JEWELRY',
      brandSlogan: 'MORE THAN JUST JEWELRY · فراتر از یک جواهر',
      showroomAddress: 'یزد، خیابان قیام، بازار خان، راسته زرگران (هماهنگی بازدید حضوری)',
      telephone: '۰۹۱۳۲۵۶۰۶۱۶',
      registrationStatus: 'شناسه فروشگاهی برخط — فاکتور مقدماتی شفاف'
    },
    customer,
    items: invoiceItems,
    totals: {
      totalWeightGrams: Number(totalWeightGrams.toFixed(2)),
      totalRawGold,
      totalWage,
      totalProfit,
      totalVat,
      totalStone,
      totalPayable,
      currency: 'تومان'
    }
  };
}
