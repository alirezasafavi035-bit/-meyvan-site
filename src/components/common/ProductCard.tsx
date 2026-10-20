import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { Heart, ShoppingBag, Eye, ChevronDown } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { calculatePrice, isExpired } = useGoldPrice();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, formatPrice, formatGrams, formatNum, getProductName, getCategoryTitle, getTypeTitle, language } = useLanguage();
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

  const wagePercentageText = formatNum(Math.round((product.wagePercent || breakdown.wageRate || 0.15) * 100));
  const productName = getProductName(product);

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
          alt={productName}
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
          className={`absolute top-3 ${language === 'fa' ? 'left-3' : 'right-3'} p-2 rounded-full backdrop-blur-md transition-all ${
            isWish
              ? 'bg-[#D4AF37] text-[#0B080F]'
              : 'bg-black/40 text-white hover:text-[#D4AF37] hover:bg-black/60'
          }`}
          aria-label={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className="w-4 h-4 fill-current" strokeWidth={isWish ? 0 : 2} />
        </button>

        {/* Quick View Link overlay on hover */}
        <Link
          to={`/product/${product.slug}`}
          className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label={`View details for ${productName}`}
        >
          <span className="bg-[#0B080F]/90 text-white text-xs px-3.5 py-1.5 rounded-full border border-[#D4AF37]/40 flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            {t('card.quick_view')}
          </span>
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white text-start">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-[#A89B8A] mb-1.5">
            <span>{getCategoryTitle(product.category)}</span>
            <span aria-hidden="true">·</span>
            <span>{getTypeTitle(product.type)}</span>
            <span aria-hidden="true">·</span>
            <span className="font-numeral">{formatNum(product.karat)} {t('karat_suffix')}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-[#0B080F] group-hover:text-[#997D24] transition-colors line-clamp-1 mb-2">
            <Link to={`/product/${product.slug}`}>
              {productName}
            </Link>
          </h3>

          {/* Weight */}
          <div className="text-xs text-[#0B080F]/70 mb-2 flex items-center justify-between">
            <span>{language === 'fa' ? 'وزن تقریبی:' : 'Approx. Weight:'}</span>
            <span className="font-medium text-[#0B080F] font-numeral">
              {formatGrams(product.weightGrams)}
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#0B080F]/5">
          {/* Price Header */}
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-[#A89B8A]">{language === 'fa' ? 'قیمت روز:' : 'Live Price:'}</span>
            <span className="text-sm font-bold text-[#0B080F] font-numeral">
              {formatPrice(breakdown.totalPrice)}
            </span>
          </div>

          {/* Wage percentage display */}
          <div className="flex items-center justify-between text-[11px] text-[#997D24] font-medium mt-1 mb-2">
            <span>{t('card.wage')}</span>
            <span className="font-numeral">
              {language === 'fa' ? `${wagePercentageText}٪` : `${wagePercentageText}%`}
            </span>
          </div>

          {/* Accordion Toggle Button */}
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
              <span>{isAccordionOpen ? t('card.close_breakdown') : t('card.view_breakdown')}</span>
              <span className="text-[9px] text-[#997D24] bg-[#D4AF37]/15 px-1.5 py-0.5 rounded">
                {language === 'fa' ? 'فرمول شفاف' : 'Union Formula'}
              </span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform duration-200 ${
                isAccordionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Collapsible Accordion Table */}
          {isAccordionOpen && (
            <div className="bg-[#FAF8F5] border border-[#D4AF37]/35 rounded-xl p-3 mb-3 text-[11px] space-y-1.5 animate-fadeIn shadow-sm">
              <div className="flex justify-between items-center text-neutral-600">
                <span>{language === 'fa' ? 'وزن طلا:' : 'Weight:'}</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatGrams(product.weightGrams)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>{language === 'fa' ? 'نرخ روز هر گرم:' : '18K Daily Rate:'}</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatPrice(breakdown.goldPricePerGram)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>{t('card.raw_gold')}</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatPrice(breakdown.rawGoldPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>{t('card.wage')} ({wagePercentageText}%)</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatPrice(breakdown.wageAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>{t('card.profit')}</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatPrice(breakdown.profitAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>{t('card.vat')}</span>
                <span className="font-numeral font-medium text-neutral-800">
                  {formatPrice(breakdown.vatAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#D4AF37]/30 font-bold text-[#0B080F]">
                <span>{t('card.total')}</span>
                <span className="font-numeral text-[#997D24] text-xs">
                  {formatPrice(breakdown.totalPrice)}
                </span>
              </div>
              <p className="text-[9px] text-[#A89B8A] leading-tight pt-1 border-t border-neutral-200/60 mt-1">
                {t('pdp.vat_exempt_note')}
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
                ? (language === 'fa' ? 'قیمت ناموجود' : 'Price Unavailable')
                : product.stock <= 0
                ? (language === 'fa' ? 'ناموجود' : 'Sold Out')
                : t('card.add_to_cart')}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
