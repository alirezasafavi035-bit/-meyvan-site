import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { useGoldPrice } from '../context/GoldPriceContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from '../components/common/ProductCard';
import { InvoiceModal } from '../components/cart/InvoiceModal';
import { PricingSettingsModal } from '../components/common/PricingSettingsModal';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  Heart,
  MessageCircle,
  Share2,
  Check,
  ChevronDown,
  Sparkles,
  FileText,
  Scale
} from 'lucide-react';

interface ProductDetailPageProps {
  products: Product[];
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ products }) => {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  const { calculatePrice, isExpired } = useGoldPrice();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const {
    t,
    formatPrice,
    formatGrams,
    formatNum,
    getProductName,
    getProductDesc,
    getCategoryTitle,
    getTypeTitle,
    language
  } = useLanguage();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isPriceAccordionOpen, setIsPriceAccordionOpen] = useState(true);

  // Dynamic weight selection state
  const [selectedWeight, setSelectedWeight] = useState<number>(() => (product ? product.weightGrams : 2.5));

  React.useEffect(() => {
    if (product) {
      setSelectedWeight(product.weightGrams);
    }
  }, [product?.id]);

  const minWeight = product ? product.minCustomWeight || 1.0 : 1.0;
  const maxWeight = product
    ? product.maxCustomWeight || Math.max(10.0, Math.round(product.weightGrams * 2.5 * 10) / 10)
    : 10.0;
  const weightStep = product ? product.weightStep || 0.1 : 0.1;
  const isCustomWeight = product ? selectedWeight !== product.weightGrams : false;

  const breakdown = product ? calculatePrice(product, undefined, selectedWeight) : null;
  const isWish = product ? isInWishlist(product.id) : false;

  // Similar products from same category
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  if (!product || !breakdown) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-[#0B080F] mb-3">
          {language === 'fa' ? 'محصول مورد نظر یافت نشد' : 'Product Not Found'}
        </h2>
        <p className="text-xs text-[#A89B8A] mb-6">
          {language === 'fa' ? 'احتمالاً این محصول حذف شده یا آدرس اشتباه است.' : 'This piece may have been relocated or the link is incorrect.'}
        </p>
        <Link
          to="/catalog"
          className="px-6 py-2.5 bg-[#0B080F] text-white text-xs font-semibold rounded-lg hover:bg-[#D4AF37] hover:text-[#0B080F]"
        >
          {t('cart.go_catalog')}
        </Link>
      </div>
    );
  }

  const productName = getProductName(product);
  const productDesc = getProductDesc(product);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: productName,
        text: `MEYVAN: ${productName}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getProductImage = (idx = 0) => {
    if (product.images && product.images[idx]) {
      return product.images[idx];
    }
    if (product.category === 'coin' || product.type === 'coin') {
      return '/images/products/coin_bullion.jpg';
    }
    if (product.category === 'men' || product.tags?.includes('مردانه')) {
      return '/images/products/men_jewelry.jpg';
    }
    if (product.category === 'kids' || product.tags?.includes('کودک')) {
      return '/images/products/kids_jewelry.jpg';
    }
    if (product.category === 'pendant' || product.type === 'pendant') {
      return '/images/products/pendant_medallion.jpg';
    }
    if (product.category === 'economic' || product.wagePercent <= 0.12) {
      return '/images/products/low_wage_economic.jpg';
    }
    const nameLower = product.name.toLowerCase();
    if (nameLower.includes('انار') || nameLower.includes('فیروزه')) {
      return '/images/products/pomegranate_turquoise.jpg';
    }
    if (product.type === 'earrings') {
      return product.weightGrams <= 3.2 ? '/images/products/earrings_stud.jpg' : '/images/products/earrings_chandelier.jpg';
    }
    if (product.type === 'ring') {
      return '/images/products/gold_ring_luxury_1791946268061.jpg';
    }
    if (product.type === 'necklace') {
      return '/images/products/gold_necklace_pendant_1791946268677.jpg';
    }
    if (product.type === 'bracelet' || product.type === 'bangle' || product.type === 'anklet') {
      return '/images/products/gold_bracelet_bangle_1791946279045.jpg';
    }
    if (product.type === 'set' || product.type === 'half_set') {
      return '/images/products/gold_bridal_set_suite_1791946299635.jpg';
    }
    return '/images/products/ring.jpg';
  };

  const whatsappMessage = encodeURIComponent(
    language === 'fa'
      ? `درود، مایل به استعلام و هماهنگی خرید این محصول در میوان هستم:\n` +
        `نام: ${productName}\n` +
        `کد کالا: ${product.sku}\n` +
        `وزن: ${formatGrams(selectedWeight)} (${product.karat} عیار)${isCustomWeight ? ' [گرماژ سفارشی]' : ''}\n` +
        `مبلغ روز: ${formatPrice(breakdown.totalPrice)}\n` +
        `لینک: https://meyvan.ir/#/product/${product.slug}`
      : `Hello, I would like to inquire about purchasing this jewelry piece from MEYVAN:\n` +
        `Item: ${productName}\n` +
        `SKU: ${product.sku}\n` +
        `Weight: ${selectedWeight}g (18K 750)${isCustomWeight ? ' [Custom Weight]' : ''}\n` +
        `Price: ${formatPrice(breakdown.totalPrice)}\n` +
        `Link: https://meyvan.ir/#/product/${product.slug}`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-start">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#A89B8A] mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-[#0B080F]">{t('pdp.breadcrumb.home')}</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-[#0B080F]">{t('pdp.breadcrumb.catalog')}</Link>
        <span>/</span>
        <Link to={`/catalog?category=${product.category}`} className="hover:text-[#0B080F]">
          {getCategoryTitle(product.category)}
        </Link>
        <span>/</span>
        <span className="text-[#0B080F] font-medium">{productName}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Gallery Section */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onClick={() => setImageZoomed(!imageZoomed)}
            className="relative aspect-square w-full bg-[#14101A] rounded-2xl overflow-hidden border border-[#0B080F]/10 cursor-zoom-in group shadow-md"
          >
            <img
              src={getProductImage(selectedImageIdx)}
              alt={productName}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                imageZoomed ? 'scale-150' : 'group-hover:scale-105'
              }`}
            />

            {/* Fallback container */}
            <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#14101A] to-[#0B080F] text-[#D4AF37]">
              <Sparkles className="w-12 h-12 mb-2 opacity-60" />
              <span className="font-serif-luxury tracking-widest text-xs">MEYVAN JEWELRY</span>
              <span className="text-[10px] text-white/40 mt-1 font-numeral">{product.sku}</span>
            </div>

            {/* Badges / Zoom indicator */}
            <span className="absolute bottom-3 left-3 ltr:left-auto ltr:right-3 bg-black/60 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full">
              {imageZoomed
                ? (language === 'fa' ? 'کلیک جهت خروج از بزرگنمایی' : 'Click to exit zoom')
                : (language === 'fa' ? 'کلیک جهت بزرگنمایی عکس' : 'Click to zoom in')}
            </span>
          </div>

          {/* Thumbnails Row */}
          <div className="flex items-center gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedImageIdx(idx);
                  setImageZoomed(false);
                }}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-[#14101A] ${
                  selectedImageIdx === idx ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Angle ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Purchase & Details Module */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            {/* Meta Row */}
            <div className="flex items-center gap-2 text-xs text-[#A89B8A] mb-2">
              <span>{t('pdp.sku_label')} <strong className="font-numeral text-[#0B080F]">{product.sku}</strong></span>
              <span aria-hidden="true">·</span>
              <span>{getCategoryTitle(product.category)}</span>
              <span aria-hidden="true">·</span>
              <span>{getTypeTitle(product.type)}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">{t('card.in_stock')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-3">
              {productName}
            </h1>

            <p className="text-xs sm:text-sm text-[#A89B8A] leading-relaxed">
              {productDesc}
            </p>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-neutral-200 text-xs">
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100">
              <span className="text-[#A89B8A] block mb-1">{t('pdp.karat_label')}</span>
              <span className="font-bold text-[#0B080F] font-numeral">
                {formatNum(product.karat)} {t('karat_suffix')} (750)
              </span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100">
              <span className="text-[#A89B8A] block mb-1">{t('pdp.weight_label')}</span>
              <span className="font-bold text-[#0B080F] font-numeral">{formatGrams(product.weightGrams)}</span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100">
              <span className="text-[#A89B8A] block mb-1">{t('pdp.wage_label')}</span>
              <span className="font-bold text-[#0B080F] font-numeral">
                {language === 'fa' ? `٪${formatNum(Math.round(product.wagePercent * 100))}` : `${formatNum(Math.round(product.wagePercent * 100))}%`}
              </span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100">
              <span className="text-[#A89B8A] block mb-1">{t('pdp.gem_label')}</span>
              <span className="font-bold text-[#0B080F]">
                {product.hasStone ? t('pdp.gem_with') : t('pdp.gem_none')}
              </span>
            </div>
          </div>

          {/* Dynamic Weight Selection Slider */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#D4AF37]/35 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#997D24]" />
                <h3 className="font-bold text-xs sm:text-sm text-[#0B080F]">
                  {t('pdp.weight_module.title')}
                </h3>
              </div>
              {isCustomWeight ? (
                <span className="text-[10px] bg-amber-500/15 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-medium">
                  {t('pdp.weight_module.custom_badge')}
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full font-medium">
                  {t('pdp.weight_module.standard_badge')}
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#A89B8A] leading-relaxed">
              {t('pdp.weight_module.desc')}
            </p>

            {/* Slider & Number Input Row */}
            <div className="space-y-3 pt-1">
              <div>
                <input
                  type="range"
                  min={minWeight}
                  max={maxWeight}
                  step={weightStep}
                  value={selectedWeight}
                  onChange={(e) => setSelectedWeight(Number(parseFloat(e.target.value).toFixed(2)))}
                  className="w-full accent-[#D4AF37] cursor-pointer h-2 bg-neutral-200 rounded-lg"
                  aria-label="Gold weight slider"
                />
              </div>

              {/* Range Bounds & Numeric Stepper Input */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-neutral-500 font-numeral">
                  {t('pdp.weight_module.min')} {formatGrams(minWeight)}
                </span>

                {/* Stepper with number input */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-neutral-300 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setSelectedWeight((prev) => Math.max(minWeight, Number((prev - 0.1).toFixed(2))))}
                    disabled={selectedWeight <= minWeight}
                    className="w-6 h-6 rounded flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 disabled:opacity-30 text-xs font-bold transition-colors"
                  >
                    -
                  </button>
                  <div className="flex items-center gap-1 font-numeral font-bold text-sm text-[#0B080F]">
                    <input
                      type="number"
                      step="0.1"
                      min={minWeight}
                      max={maxWeight}
                      value={selectedWeight}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setSelectedWeight(Number(val.toFixed(2)));
                        }
                      }}
                      className="w-16 text-center font-bold text-sm bg-transparent focus:outline-none"
                    />
                    <span className="text-xs text-neutral-500 font-normal">{t('grams')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedWeight((prev) => Math.min(maxWeight, Number((prev + 0.1).toFixed(2))))}
                    disabled={selectedWeight >= maxWeight}
                    className="w-6 h-6 rounded flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 disabled:opacity-30 text-xs font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                <span className="text-[11px] text-neutral-500 font-numeral">
                  {t('pdp.weight_module.max')} {formatGrams(maxWeight)}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Module */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0B080F]">
                  {t('pdp.breakdown_title')}
                </h3>
                <p className="text-[11px] text-[#A89B8A]">
                  {t('pdp.breakdown_desc')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPriceAccordionOpen(!isPriceAccordionOpen)}
                className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <span>{isPriceAccordionOpen ? t('card.close_breakdown') : t('card.view_breakdown')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPriceAccordionOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isPriceAccordionOpen && (
              <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs">
                {/* 1. Raw Gold Value */}
                <div className="flex justify-between items-center text-neutral-600">
                  <span>
                    {t('pdp.raw_gold_formula', {
                      weight: formatNum(selectedWeight),
                      rate: formatPrice(breakdown.goldPricePerGram)
                    })}
                  </span>
                  <span className="font-semibold text-[#0B080F] font-numeral">{formatPrice(breakdown.rawGoldPrice)}</span>
                </div>

                {/* 2. Making Charge */}
                <div className="flex justify-between items-center text-neutral-600">
                  <span>
                    {t('pdp.wage_calc', {
                      wage: formatNum(Math.round(breakdown.wageRate * 100))
                    })}
                  </span>
                  <span className="font-semibold text-[#0B080F] font-numeral">
                    {formatPrice(breakdown.wageAmount)}
                  </span>
                </div>

                {/* 3. Seller Profit */}
                <div className="flex justify-between items-center text-neutral-600">
                  <span>{t('pdp.profit_calc')}</span>
                  <span className="font-semibold text-[#0B080F] font-numeral">{formatPrice(breakdown.profitAmount)}</span>
                </div>

                {/* 4. VAT Tax */}
                <div className="flex justify-between items-center text-neutral-600">
                  <span>{t('pdp.vat_calc')}</span>
                  <span className="font-semibold text-[#0B080F] font-numeral">{formatPrice(breakdown.vatAmount)}</span>
                </div>
                <div className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200/60 leading-relaxed">
                  {t('pdp.vat_exempt_note')}
                </div>

                {breakdown.stonePrice > 0 && (
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>{t('pdp.stone_calc')}</span>
                    <span className="font-semibold text-[#0B080F] font-numeral">{formatPrice(breakdown.stonePrice)}</span>
                  </div>
                )}

                {/* 5. Final Payable */}
                <div className="pt-3 border-t border-neutral-200 flex items-baseline justify-between bg-[#FAF8F5] -mx-5 -mb-5 p-4 rounded-b-2xl">
                  <div>
                    <span className="text-sm font-bold text-[#0B080F] block">{t('pdp.final_payable_label')}</span>
                    <span className="text-[10px] text-[#A89B8A]">{language === 'fa' ? 'مطابق دقیق با پیش‌فاکتور رسمی و ارسال رایگان' : 'Guaranteed price matching official stamped invoice'}</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-[#997D24] font-numeral">
                    {formatPrice(breakdown.totalPrice)}
                  </span>
                </div>

                {/* View Pre-Invoice CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="w-full py-2 px-3 rounded-lg bg-white hover:bg-neutral-50 text-[#0B080F] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#E5DED2] transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{t('pdp.invoice_cta')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                onClick={() => addToCart(product, 1, selectedWeight)}
                disabled={isExpired || product.stock <= 0}
                className="flex-1 py-3.5 px-6 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isExpired
                    ? (language === 'fa' ? 'قیمت در دسترس نیست' : 'Price Unavailable')
                    : isCustomWeight
                    ? t('pdp.add_btn_custom', { weight: formatGrams(selectedWeight) })
                    : t('pdp.add_btn')}
                </span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWish
                    ? 'bg-[#D4AF37] text-[#0B080F] border-[#D4AF37]'
                    : 'border-neutral-300 hover:border-[#D4AF37] text-neutral-700'
                }`}
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 fill-current" strokeWidth={isWish ? 0 : 2} />
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 rounded-xl border border-neutral-300 hover:border-[#D4AF37] text-neutral-700 transition-all"
                aria-label="Share"
                title={t('pdp.share_btn')}
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
              </button>
            </div>

            {/* WhatsApp Direct Inquiry */}
            <a
              href={`https://wa.me/+989132560616?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/40 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>{t('pdp.whatsapp_btn')}</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200 text-center text-xs text-neutral-600">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'fa' ? 'شناسنامه و فاکتور اتحادیه' : 'Official Certificate'}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'fa' ? 'پست پیشتاز بیمه‌شده رایگان' : 'Insured Free Delivery'}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'fa' ? '۷ روز ضمانت تعویض' : '7-Day Return Guarantee'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-neutral-200">
          <h2 className="text-xl font-serif-luxury font-bold text-[#0B080F] mb-6">
            {t('pdp.similar_title')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        items={[
          {
            product,
            quantity: 1,
            selectedWeight,
            isCustomWeight,
            breakdown,
            addedAt: Date.now()
          }
        ]}
      />

      {/* Pricing Settings Modal */}
      <PricingSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};
