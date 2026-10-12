import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { toPersianDigits } from '../../utils/persian';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B080F]/95 backdrop-blur-md border-b border-[#D4AF37]/20 text-white transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <Link to="/" className="flex items-center shrink-0 group focus-visible:outline-[#D4AF37]">
            <Logo variant="gold" size="md" />
          </Link>

          {/* Zone 2: 4-5 Concise Single-line Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <Link
              to="/"
              className="hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              صفحه اصلی
            </Link>
            <Link
              to="/catalog"
              className="hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              محصولات و کالکشن
            </Link>
            <Link
              to="/about"
              className="hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              اصالت و داستان میوان
            </Link>
            <Link
              to="/contact"
              className="hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              شعب و ارتباط
            </Link>
          </nav>

          {/* Zone 3: Actions & Shopping Bag */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch || (() => navigate('/catalog?focus=search'))}
              className="p-2 text-white/80 hover:text-[#D4AF37] hover:bg-white/5 rounded-full transition-colors"
              aria-label="جستجوی طلا و جواهر"
              title="جستجو"
            >
              <Search className="w-5 h-5" strokeWidth={1.75} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/catalog?filter=wishlist"
              className="relative p-2 text-white/80 hover:text-[#D4AF37] hover:bg-white/5 rounded-full transition-colors hidden sm:inline-flex"
              aria-label="علاقه‌مندی‌ها"
              title="لیست علاقه‌مندی‌ها"
            >
              <Heart className="w-5 h-5" strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span className="absolute 1 top-1 -right-0.5 min-w-[18px] h-[18px] bg-[#D4AF37] text-[#0B080F] text-[10px] font-bold rounded-full flex items-center justify-center px-1 font-numeral">
                  {toPersianDigits(wishlistCount)}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg transition-all active:scale-95 focus-visible:outline-[#D4AF37]"
              aria-label="سبد خرید"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
              <span className="hidden sm:inline text-xs font-medium tracking-wide">سبد خرید</span>
              {itemCount > 0 && (
                <span className="bg-[#D4AF37] text-[#0B080F] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center font-numeral">
                  {toPersianDigits(itemCount)}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/80 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-colors"
              aria-label={mobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#D4AF37]/20 bg-[#0B080F] px-4 pt-4 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              صفحه اصلی
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              محصولات و کالکشن
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              اصالت و داستان میوان
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              شعب و ارتباط با ما
            </Link>
            <Link
              to="/catalog?filter=wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              <span>علاقه‌مندی‌های من</span>
              <span className="text-xs text-[#D4AF37] font-numeral">{toPersianDigits(wishlistCount)} مورد</span>
            </Link>

            <a
              href="tel:09132560616"
              className="flex items-center justify-between py-2.5 px-3 text-sm text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg bg-[#D4AF37]/5 font-numeral hover:bg-[#D4AF37]/10 transition-colors"
            >
              <span>تماس مستقیم با شوروم یزد:</span>
              <span className="font-bold">۰۹۱۳۲۵۶۰۶۱۶</span>
            </a>
          </div>
        )}
      </header>
    </>
  );
};
