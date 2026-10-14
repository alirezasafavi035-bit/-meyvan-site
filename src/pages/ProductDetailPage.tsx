import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { useGoldPrice } from '../context/GoldPriceContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatToman, formatWeight, toPersianDigits } from '../utils/persian';
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
  ChevronLeft,
  ChevronDown,
  Award,
  Sparkles,
  SlidersHorizontal,
  FileText
} from 'lucide-react';

interface ProductDetailPageProps {
  products: Product[];
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ products }) => {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  const { calculatePrice, isExpired, gold18PerGram, pricingConfig } = useGoldPrice();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isPriceAccordionOpen, setIsPriceAccordionOpen] = useState(true);

  const breakdown = product ? calculatePrice(product) : null;
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
        <h2 className="text-xl font-bold text-[#0B080F] mb-3">محصول مورد نظر یافت نشد</h2>
        <p className="text-xs text-[#A89B8A] mb-6">احتمالاً این محصول حذف شده یا آدرس اشتباه است.</p>
        <Link
          to="/catalog"
          className="px-6 py-2.5 bg-[#0B080F] text-white text-xs font-semibold rounded-lg hover:bg-[#D4AF37] hover:text-[#0B080F]"
        >
          بازگشت به کاتالوگ محصولات
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `مشاهده طلا و جواهر فاخر ${product.name} در میوان`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getProductImage = (idx = 0) => {
    if (product.images && product.images[idx] && !product.images[idx].endsWith('.webp')) {
      return product.images[idx];
    }
    const nameLower = product.name.toLowerCase();
    const slugLower = product.slug.toLowerCase();
    if (nameLower.includes('انار') || slugLower.includes('pomegranate') || slugLower.includes('فیروزه')) {
      return '/images/products/gold_pomegranate_turquoise_1791946300076.jpg';
    }
    if (product.type === 'earrings') {
      return '/images/products/gold_earrings_drop_1791946270534.jpg';
    }
    if (product.type === 'ring') {
      return '/images/products/gold_ring_luxury_1791946268061.jpg';
    }
    if (product.type === 'necklace' || product.type === 'pendant') {
      return '/images/products/gold_necklace_pendant_1791946268677.jpg';
    }
    if (product.type === 'bracelet' || product.type === 'bangle' || product.type === 'anklet') {
      return '/images/products/gold_bracelet_bangle_1791946279045.jpg';
    }
    if (product.type === 'set' || product.type === 'half_set') {
      return '/images/products/gold_bridal_set_suite_1791946299635.jpg';
    }
    return '/images/products/gold_earrings_drop_1791946270534.jpg';
  };

  const whatsappMessage = encodeURIComponent(
    `درود، مایل به استعلام و هماهنگی خرید این محصول در میوان هستم:\n` +
    `نام: ${product.name}\n` +
    `کد کالا: ${product.sku}\n` +
    `وزن: ${product.weightGrams} گرم (${product.karat} عیار)\n` +
    `مبلغ روز: ${breakdown.totalPrice.toLocaleString('fa-IR')} تومان\n` +
    `لینک: https://meyvan.ir/#/product/${product.slug}`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#A89B8A] mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-[#0B080F]">خانه</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-[#0B080F]">کاتالوگ</Link>
        <span>/</span>
        <Link to={`/catalog?category=${product.category}`} className="hover:text-[#0B080F]">{product.categoryFa}</Link>
        <span>/</span>
        <span className="text-[#0B080F] font-medium">{product.name}</span>
      </nav>

      {/* Main PDP Grid: Gallery Left, Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Gallery Section (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onClick={() => setImageZoomed(!imageZoomed)}
            className="relative aspect-square w-full bg-[#14101A] rounded-2xl overflow-hidden border border-[#0B080F]/10 cursor-zoom-in group shadow-md"
          >
            <img
              src={getProductImage(selectedImageIdx)}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                imageZoomed ? 'scale-150' : 'group-hover:scale-105'
              }`}
            />

            {/* Fallback container if broken */}
            <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#14101A] to-[#0B080F] text-[#D4AF37]">
              <Sparkles className="w-12 h-12 mb-2 opacity-60" />
              <span className="font-serif-luxury tracking-widest text-xs">MEYVAN JEWELRY</span>
              <span className="text-[10px] text-white/40 mt-1 font-numeral">{product.sku}</span>
            </div>

            {/* Badges / Zoom indicator */}
            <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full">
              {imageZoomed ? 'کلیک جهت خروج از بزرگنمایی' : 'کلیک جهت بزرگنمایی عکس'}
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
                  alt={`نمای ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Purchase & Details Module (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            {/* Meta Row: Zero-Pill Unboxed */}
            <div className="flex items-center gap-2 text-xs text-[#A89B8A] mb-2">
              <span>کد رسمی: <strong className="font-numeral text-[#0B080F]">{product.sku}</strong></span>
              <span aria-hidden="true">·</span>
              <span>{product.categoryFa}</span>
              <span aria-hidden="true">·</span>
              <span>{product.typeFa}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">موجود در انبار یزد</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-3">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#A89B8A] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-neutral-200 text-xs">
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100">
              <span className="text-[#A89B8A] block mb-1">عیار طلا</span>
              <span className="font-bold text-[#0B080F] font-numeral">{toPersianDigits(product.karat)} عیار (۷۵۰)</span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100">
              <span className="text-[#A89B8A] block mb-1">وزن کل</span>
              <span className="font-bold text-[#0B080F] font-numeral">{formatWeight(product.weightGrams)}</span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100">
              <span className="text-[#A89B8A] block mb-1">اجرت ساخت</span>
              <span className="font-bold text-[#0B080F] font-numeral">٪{toPersianDigits(Math.round(product.wagePercent * 100))}</span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100">
              <span className="text-[#A89B8A] block mb-1">نگین و جواهر</span>
              <span className="font-bold text-[#0B080F]">
                {product.hasStone ? 'شناسنامه‌دار' : 'بدون نگین (طلای خالص)'}
              </span>
            </div>
          </div>

          {/* Accordion: جزئیات قیمت */}
          <div className="bg-white rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setIsPriceAccordionOpen(!isPriceAccordionOpen)}
              className="w-full bg-[#0B080F] text-white p-3.5 flex items-center justify-between hover:bg-[#14101A] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold">جزئیات و شفافیت فرمول قیمت</span>
                <span className="text-[10px] text-[#D4AF37]/80 bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                  (محاسبه مستقیم)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettingsModal(true);
                  }}
                  className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 focus-visible:outline-none"
                  title="تغییر یا بررسی نرخ روز و موازین مالیات"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span className="hidden sm:inline">تنظیم موازین</span>
                </button>
                <ChevronDown className={`w-4 h-4 text-[#D4AF37] transition-transform duration-300 ${isPriceAccordionOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Accordion Body */}
            {isPriceAccordionOpen && (
              <div className="p-4 space-y-2.5 text-xs animate-in fade-in duration-200">
                {/* 1. Gold Weight */}
                <div className="flex justify-between items-center text-neutral-600">
                  <span>وزن طلا:</span>
                  <span className="font-semibold text-[#0B080F] font-numeral">{formatWeight(product.weightGrams)}</span>
                </div>

                {/* 2. Gold Reference Rate from /price */}
                <div className="flex justify-between items-center text-neutral-600">
                  <span>نرخ روز هر گرم طلا ۱۸ عیار (از /price):</span>
                  <span className="font-semibold text-[#997D24] font-numeral">{formatToman(breakdown.goldPricePerGram)}</span>
                </div>

                {/* Raw Gold Value */}
                <div className="flex justify-between items-center text-neutral-600">
                  <span>ارزش طلای خام (وزن × نرخ روز):</span>
                  <span className="font-semibold text-[#0B080F] font-numeral">{formatToman(breakdown.rawGoldPrice)}</span>
                </div>

                {/* 3. Making Charge / Wage (Percentage + Amount) */}
                <div className="flex justify-between items-center text-neutral-600">
                  <span>اجرت ساخت کارگاهی (درصد + مبلغ):</span>
                  <span className="font-semibold text-[#0B080F] font-numeral">
                    ٪{toPersianDigits(Math.round(breakdown.wageRate * 100))} ({formatToman(breakdown.wageAmount)})
                  </span>
                </div>

                {/* 4. Seller Profit (7%) */}
                <div className="flex justify-between items-center text-neutral-600">
                  <span>سود فروشنده (۷٪ مصوب اتحادیه):</span>
                  <span className="font-semibold text-[#0B080F] font-numeral">{formatToman(breakdown.profitAmount)}</span>
                </div>

                {/* 5. VAT Tax (10% on Wage and Profit) */}
                <div className="flex justify-between items-center text-neutral-600">
                  <span>مالیات بر ارزش افزوده (٪{toPersianDigits(Math.round(breakdown.vatPercent * 100))} منحصراً روی اجرت و سود):</span>
                  <span className="font-semibold text-[#0B080F] font-numeral">{formatToman(breakdown.vatAmount)}</span>
                </div>
                <div className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200/60 leading-relaxed">
                  ✓ اصل طلا معاف از مالیات است؛ مالیات ۱۰٪ فقط روی (اجرت ساخت + سود فروشنده) اعمال می‌شود.
                </div>

                {breakdown.stonePrice > 0 && (
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>بهای سنگ و نگین‌های مخراجی‌شده:</span>
                    <span className="font-semibold text-[#0B080F] font-numeral">{formatToman(breakdown.stonePrice)}</span>
                  </div>
                )}

                {/* 6. Final Payable Price */}
                <div className="pt-3 border-t border-neutral-200 flex items-baseline justify-between bg-[#FAF8F5] -mx-4 -mb-4 p-4 rounded-b-2xl">
                  <div>
                    <span className="text-sm font-bold text-[#0B080F] block">قیمت نهایی قابل پرداخت:</span>
                    <span className="text-[10px] text-[#A89B8A]">مطابق دقیق با پیش‌فاکتور رسمی و ارسال رایگان</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-[#997D24] font-numeral">
                    {formatToman(breakdown.totalPrice)}
                  </span>
                </div>

                {/* View Item Pre-Invoice CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="w-full py-2 px-3 rounded-lg bg-white hover:bg-neutral-50 text-[#0B080F] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#E5DED2] transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>مشاهده و چاپ پیش‌فاکتور رسمی این قطعه طلا</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                onClick={() => addToCart(product, 1)}
                disabled={isExpired || product.stock <= 0}
                className="flex-1 py-3.5 px-6 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isExpired ? 'قیمت در دسترس نیست' : 'افزودن به سبد خرید'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWish
                    ? 'bg-[#D4AF37] text-[#0B080F] border-[#D4AF37]'
                    : 'border-neutral-300 hover:border-[#D4AF37] text-neutral-700'
                }`}
                aria-label="افزودن به علاقه‌مندی‌ها"
              >
                <Heart className="w-5 h-5 fill-current" strokeWidth={isWish ? 0 : 2} />
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 rounded-xl border border-neutral-300 hover:border-[#D4AF37] text-neutral-700 transition-all"
                aria-label="اشتراک‌گذاری"
                title="اشتراک‌گذاری"
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
              <span>استعلام و مشاوره اختصاصی از طریق واتساپ میوان</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200 text-center text-xs text-neutral-600">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>شناسنامه و فاکتور اتحادیه</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              <span>پست پیشتاز بیمه‌شده رایگان</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
              <span>۷ روز ضمانت تعویض</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif-luxury font-bold text-[#0B080F]">
              محصولات مشابه در این کالکشن
            </h3>
            <Link
              to={`/catalog?category=${product.category}`}
              className="text-xs text-[#997D24] hover:underline flex items-center gap-1"
            >
              <span>مشاهده بیشتر</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Invoice Modal for Single Product Item */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        items={[{ product, quantity: 1, addedAt: Date.now() }]}
        customer={{ fullName: 'مشتری گرامی (استعلام طلا)', province: 'یزد', city: 'یزد' }}
        isDraft={true}
      />

      {/* Pricing Settings and Transparency Modal */}
      <PricingSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};
