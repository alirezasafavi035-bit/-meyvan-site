import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { toPersianDigits } from '../../utils/persian';

interface MobileBottomBarProps {
  onOpenSearch?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenSearch }) => {
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B080F]/95 backdrop-blur-lg border-t border-[#D4AF37]/20 px-2 py-1.5 flex items-center justify-around text-[10px] text-white/70"
      style={{ maxHeight: '60px' }}
      aria-label="ناوبری اصلی موبایل"
    >
      {/* Home */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
            isActive ? 'text-[#D4AF37] font-medium' : 'hover:text-white'
          }`
        }
      >
        <Home className="w-5 h-5" strokeWidth={1.75} />
        <span>خانه</span>
      </NavLink>

      {/* Products */}
      <NavLink
        to="/catalog"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
            isActive ? 'text-[#D4AF37] font-medium' : 'hover:text-white'
          }`
        }
      >
        <Grid className="w-5 h-5" strokeWidth={1.75} />
        <span>محصولات</span>
      </NavLink>

      {/* Search */}
      <button
        onClick={onOpenSearch}
        className="flex flex-col items-center gap-0.5 py-1 px-2 hover:text-white transition-colors"
      >
        <Search className="w-5 h-5" strokeWidth={1.75} />
        <span>جستجو</span>
      </button>

      {/* Wishlist */}
      <NavLink
        to="/catalog?filter=wishlist"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
            isActive ? 'text-[#D4AF37] font-medium' : 'hover:text-white'
          }`
        }
      >
        <Heart className="w-5 h-5" strokeWidth={1.75} />
        <span>علاقه‌مندی</span>
        {wishlistCount > 0 && (
          <span className="absolute top-0.5 right-1 min-w-[14px] h-[14px] bg-[#D4AF37] text-[#0B080F] text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 font-numeral">
            {toPersianDigits(wishlistCount)}
          </span>
        )}
      </NavLink>

      {/* Cart */}
      <button
        onClick={openCart}
        className="relative flex flex-col items-center gap-0.5 py-1 px-2 text-[#D4AF37] font-medium"
      >
        <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
        <span>سبد خرید</span>
        {itemCount > 0 && (
          <span className="absolute top-0.5 right-1 min-w-[15px] h-[15px] bg-[#D4AF37] text-[#0B080F] text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 font-numeral">
            {toPersianDigits(itemCount)}
          </span>
        )}
      </button>
    </nav>
  );
};
