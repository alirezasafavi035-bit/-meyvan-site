import React, { Suspense, lazy, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GoldPriceProvider } from './context/GoldPriceContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { GoldPriceTicker } from './components/common/GoldPriceTicker';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchOverlay } from './components/common/SearchOverlay';
import { Product } from './types';

// Code-splitting with React.lazy
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const CatalogPage = lazy(() => import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const PaymentResultPage = lazy(() => import('./pages/PaymentResultPage').then((m) => ({ default: m.PaymentResultPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage').then((m) => ({ default: m.ReturnsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Scroll to top on navigation change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Page loading fallback skeleton
const PageLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    <span className="font-serif-luxury tracking-widest text-xs text-[#997D24]">MEYVAN JEWELRY</span>
  </div>
);

import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch('/data/products.json')
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products.json', err);
        setLoading(false);
      });
  }, []);

  return (
    <HashRouter>
      <LanguageProvider>
        <GoldPriceProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-[#0B080F]">
              {/* Header & Sticky Gold Price Bar */}
              <Header onOpenSearch={() => setIsSearchOpen(true)} />
              <GoldPriceTicker />

              {/* Main App Content Viewport */}
              <main className="flex-1">
                {loading ? (
                  <PageLoadingFallback />
                ) : (
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<HomePage products={products} />} />
                      <Route path="/catalog" element={<CatalogPage products={products} />} />
                      <Route path="/product/:slug" element={<ProductDetailPage products={products} />} />
                      <Route path="/payment-result" element={<PaymentResultPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/returns" element={<ReturnsPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                )}
              </main>

              {/* Footer */}
              <Footer />

              {/* Overlays & Floating elements */}
              <CartDrawer />
              <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                products={products}
              />
              <WhatsAppButton />
              <MobileBottomBar onOpenSearch={() => setIsSearchOpen(true)} />
            </div>
          </WishlistProvider>
        </CartProvider>
      </GoldPriceProvider>
      </LanguageProvider>
    </HashRouter>
  );
}
