import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatToman, formatWeight, toPersianDigits } from '../../utils/persian';
import { Heart, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { calculatePrice, isExpired } = useGoldPrice();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const breakdown = calculatePrice(product);
  const isWish = isInWishlist(product.id);

  return (
    <article
      className="group relative bg-white border border-[#0B080F]/5 rounded-xl overflow-hidden hover:border-[#D4AF37]/40 transition-all duration-300 flex flex-col hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-[#14101A] overflow-hidden flex items-center justify-center">
        {!imageError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            width={380}
            height={380}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          /* High-fidelity Brand Official Emblem Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#14101A] to-[#0B080F] text-center p-6 select-none">
            <img
              src="/logo.svg"
              alt="MEYVAN"
              className="w-24 h-24 object-contain mb-2 opacity-90 filter drop-shadow-lg"
            />
            <span className="text-[10px] text-white/40 font-numeral">{product.sku}</span>
          </div>
        )}

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
          {/* Metadata: Zero-Pill unboxed clean text with separators */}
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
          <div className="text-xs text-[#0B080F]/70 mb-3 flex items-center justify-between">
            <span>وزن تقریبی:</span>
            <span className="font-medium text-[#0B080F] font-numeral">
              {formatWeight(product.weightGrams)}
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#0B080F]/5">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[11px] text-[#A89B8A]">قیمت روز:</span>
            <span className="text-sm font-bold text-[#0B080F] font-numeral">
              {formatToman(breakdown.totalPrice)}
            </span>
          </div>

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
