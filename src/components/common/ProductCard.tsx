import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatToman, formatWeight, toPersianDigits } from '../../utils/persian';
import { Heart, ShoppingBag, Eye, ChevronDown } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { calculatePrice, isExpired } = useGoldPrice();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const breakdown = calculatePrice(product);
  const isWish = isInWishlist(product.id);

  // High-Res Image selection with fallbacks
  const getProductImage = () => {
    if (!imageError && product.images && product.images[0]) {
      return product.images[0];
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

  const wagePercentageText = toPersianDigits(Math.round((product.wagePercent || breakdown.wageRate || 0.15) * 100));
  const profitPercentageText = toPersianDigits(Math.round((breakdown.profitPercent || 0.07) * 100));
  const vatPercentageText = toPersianDigits(Math.round((breakdown.vatPercent || 0.09) * 100));

  return (
    <article
      className="group relative bg-white border border-[#0B080F]/5 rounded-xl overflow-hidden hover:border-[#D4AF37]/40 transition-all duration-300 flex flex-col hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-[#14101A] overflow-hidden flex items-center justify-center">
        <img
          src={getProductImage()}
          alt={product.name}
          loading="lazy"
          width={400}
          height={400}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isWish
              ? 'bg-[#D4AF37] text-[#0B080F]'
              : 'bg-black/40 text-white hover:text-[#D4AF37] hover:bg-black/60'
          }`}
          aria-label={isWish ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
        >
          <Heart className="w-4 h-4 fill-current" strokeWidth={isWish ? 0 : 2} />
        </button>

        {/* Quick View Link overlay on hover */}
        <Link
          to={`/product/${product.slug}`}
          className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label={`مشاهده جزئیات ${product.name}`}
        >
          <span className="bg-[#0B080F]/90 text-white text-xs px-3.5 py-1.5 rounded-full border border-[#D4AF37]/40 flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            مشاهده جزئیات
          </span>
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-[#A89B8A] mb-1.5">
            <span>{product.categoryFa}</span>
            <span aria-hidden="true">·</span>
            <span>{product.typeFa}</span>
            <span aria-hidden="true">·</span>
            <span className="font-numeral">{toPersianDigits(product.karat)} عیار</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-[#0B080F] group-hover:text-[#997D24] transition-colors line-clamp-1 mb-2">
            <Link to={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {/* Weight */}
          <div className="text-xs text-[#0B080F]/70 mb-2 flex items-center justify-between">
            <span>وزن تقریبی:</span>
            <span className="font-medium text-[#0B080F] font-numeral">
              {formatWeight(product.weightGrams)}
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#0B080F]/5">
          {/* Price Header */}
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-[#A89B8A]">قیمت روز:</span>
            <span className="text-sm font-bold text-[#0B080F] font-numeral">
              {formatToman(breakdown.totalPrice)}
            </span>
          </div>

          {/* Requirement 6: Display wage directly on card without opening accordion */}
          <div className="flex items-center justify-between text-[11px] text-[#997D24] font-medium mt-1 mb-2">
            <span>اجرت ساخت:</span>
            <span className="font-numeral">اجرت: {wagePercentageText}٪</span>
          </div>

          {/* Requirement: Accordion Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAccordionOpen(!isAccordionOpen);
            }}
            className="w-full flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#0B080F] transition-colors border border-[#D4AF37]/20 mb-2.5 font-medium"
            aria-expanded={isAccordionOpen}
          >
            <span className="flex items-center gap-1.5 font-semibold text-[#0B080F]">
              <span>مشاهده جزئیات قیمت</span>
              <span className="text-[9px] text-[#997D24] bg-[#D4AF37]/15 px-1.5 py-0.5 rounded">فرمول شفاف</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform duration-200 ${
                isAccordionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Requirement: Collapsible Accordion Table */}
          {isAccordionOpen && (
            <div className="bg-[#FAF8F5] border border-[#D4AF37]/35 rounded-xl p-3 mb-3 text-[11px] space-y-1.5 animate-fadeIn shadow-sm">
              <div className="flex justify-between items-center text-neutral-600">
                <span>وزن:</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatWeight(product.weightGrams)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>نرخ روز گرم طلا:</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatToman(breakdown.goldPricePerGram)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>ارزش طلای خام:</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatToman(breakdown.rawGoldPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>اجرت ساخت ({wagePercentageText}٪):</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatToman(breakdown.wageAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>سود فروشنده (۷٪):</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatToman(breakdown.profitAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>مالیات (۱۰٪):</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatToman(breakdown.vatAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#D4AF37]/30 font-bold text-[#0B080F]">
                <span>قیمت نهایی:</span>
                <span className="font-numeral text-[#997D24] text-xs">
                  {formatToman(breakdown.totalPrice)}
                </span>
              </div>
              <p className="text-[9px] text-[#A89B8A] leading-tight pt-1 border-t border-neutral-200/60 mt-1">
                اصل طلا معاف از مالیات است؛ مالیات (۱۰٪) فقط روی اجرت و سود محاسبه می‌شود.
              </p>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0 || isExpired}
            className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              product.stock <= 0 || isExpired
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] active:scale-98'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {isExpired
                ? 'قیمت ناموجود'
                : product.stock <= 0
                ? 'ناموجود'
                : 'افزودن به سبد خرید'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};

