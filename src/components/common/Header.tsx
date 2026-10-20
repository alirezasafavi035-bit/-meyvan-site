import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { t, formatNum, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Top Banner Motto */}
      <div className="bg-[#14101A] border-b border-[#D4AF37]/20 py-1.5 px-4 text-center text-[11px] text-[#D4AF37] font-medium tracking-wide">
        {t('top_motto')}
      </div>
      <header className="sticky top-0 z-40 bg-[#0B080F]/95 backdrop-blur-md border-b border-[#D4AF37]/20 text-white transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <Link to="/" className="flex items-center shrink-0 group focus-visible:outline-[#D4AF37]">
            <Logo variant="gold" size="md" />
          </Link>

          {/* Zone 2: Concise Single-line Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-white/80">
            <Link
              to="/"
              className="hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/catalog"
              className="hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              {t('nav.catalog')}
            </Link>
            <Link
              to="/about"
              className="hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/returns"
              className="hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              {t('nav.returns')}
            </Link>
            <Link
              to="/contact"
              className="hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Zone 3: Actions & Shopping Bag */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher Toggle */}
            <LanguageSwitcher variant="header" />

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch || (() => navigate('/catalog?focus=search'))}
              className="p-2 text-white/80 hover:text-[#D4AF37] hover:bg-white/5 rounded-full transition-colors"
              aria-label={t('nav.search')}
              title={t('nav.search')}
            >
              <Search className="w-5 h-5" strokeWidth={1.75} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/catalog?filter=wishlist"
              className="relative p-2 text-white/80 hover:text-[#D4AF37] hover:bg-white/5 rounded-full transition-colors hidden sm:inline-flex"
              aria-label={t('nav.wishlist')}
              title={t('nav.wishlist')}
            >
              <Heart className="w-5 h-5" strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 -right-0.5 min-w-[18px] h-[18px] bg-[#D4AF37] text-[#0B080F] text-[10px] font-bold rounded-full flex items-center justify-center px-1 font-numeral">
                  {formatNum(wishlistCount)}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg transition-all active:scale-95 focus-visible:outline-[#D4AF37]"
              aria-label={t('nav.cart')}
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
              <span className="hidden sm:inline text-xs font-medium tracking-wide">{t('nav.cart')}</span>
              {itemCount > 0 && (
                <span className="bg-[#D4AF37] text-[#0B080F] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center font-numeral">
                  {formatNum(itemCount)}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/80 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-colors"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#D4AF37]/20 bg-[#0B080F] px-4 pt-4 pb-6 space-y-3">
            {/* Mobile Language Switcher */}
            <LanguageSwitcher variant="mobile" />

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              {t('nav.catalog')}
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/returns"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              {t('nav.returns')}
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              {t('nav.contact')}
            </Link>
            <Link
              to="/catalog?filter=wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 text-base text-white/90 hover:text-[#D4AF37] hover:bg-white/5 rounded-md"
            >
              <span>{t('nav.wishlist')}</span>
              <span className="text-xs text-[#D4AF37] font-numeral">{formatNum(wishlistCount)}</span>
            </Link>

            <a
              href="tel:09132560616"
              className="flex items-center justify-between py-2.5 px-3 text-sm text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg bg-[#D4AF37]/5 font-numeral hover:bg-[#D4AF37]/10 transition-colors"
            >
              <span>{language === 'fa' ? 'تماس مستقیم با شوروم یزد:' : 'Direct Showroom Contact:'}</span>
              <span className="font-bold">{language === 'fa' ? '۰۹۱۳۲۵۶۰۶۱۶' : '+98 913 256 0616'}</span>
            </a>
          </div>
        )}
      </header>
    </>
  );
};
