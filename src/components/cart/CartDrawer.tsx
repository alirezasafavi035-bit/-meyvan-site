import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';
import { InvoiceModal } from './InvoiceModal';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalWeightGrams,
    totalPriceTomans
  } = useCart();
  const { calculatePrice, isExpired } = useGoldPrice();
  const { t, formatPrice, formatGrams, formatNum, getProductName, language, dir } = useLanguage();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  if (!isCartOpen) return null;

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />

        <div className={`fixed inset-y-0 ${dir === 'rtl' ? 'left-0 pl-0 sm:pl-10' : 'right-0 pr-0 sm:pr-10'} max-w-full flex`}>
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col text-start">
            {/* Header */}
            <div className="p-4 sm:p-6 bg-[#0B080F] text-white flex items-center justify-between border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="font-serif-luxury text-base font-semibold">{t('cart.title')}</h2>
                <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full font-numeral">
                  {t('cart.item_count', { count: formatNum(items.length) })}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close Shopping Bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice */}
            <div className="bg-[#FAF8F5] px-4 py-2 border-b border-[#0B080F]/5 text-[11px] text-[#A89B8A] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>{language === 'fa' ? 'قیمت لحظه‌ای طلا در مرحله پرداخت به‌مدت ۱۰ دقیقه قفل می‌شود.' : 'Live gold rate is locked for 10 minutes upon checkout.'}</span>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-[#0B080F]/5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#A89B8A]">
                  <ShoppingBag className="w-16 h-16 stroke-1 text-[#A89B8A]/40 mb-3" />
                  <p className="text-sm font-medium text-[#0B080F]">{t('cart.empty_title')}</p>
                  <p className="text-xs text-[#A89B8A] mt-1">{t('cart.empty_desc')}</p>
                  <button
                    onClick={closeCart}
                    className="mt-6 px-5 py-2.5 bg-[#0B080F] text-white text-xs font-semibold rounded-lg hover:bg-[#D4AF37] hover:text-[#0B080F] transition-colors"
                  >
                    {t('cart.go_catalog')}
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const itemWeight = item.selectedWeight || item.product.weightGrams;
                  const isCustom = !!item.isCustomWeight || (item.selectedWeight !== undefined && item.selectedWeight !== item.product.weightGrams);
                  const breakdown = calculatePrice(item.product, undefined, item.selectedWeight);
                  const itemTotal = breakdown.totalPrice * item.quantity;
                  const itemName = getProductName(item.product);

                  return (
                    <div key={`${item.product.id}-${itemWeight}`} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                      {/* Thumbnail */}
                      <div className="w-18 h-18 sm:w-20 sm:h-20 bg-[#14101A] rounded-lg overflow-hidden shrink-0 border border-[#0B080F]/10 flex items-center justify-center p-1">
                        <img
                          src={item.product.images[0]}
                          alt={itemName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/logo.svg';
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-semibold text-[#0B080F] line-clamp-1">
                              {itemName}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.selectedWeight)}
                              className="text-neutral-400 hover:text-rose-500 p-1"
                              aria-label={t('cart.remove')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#A89B8A] mt-1 flex-wrap">
                            <span>{language === 'fa' ? 'کد:' : 'SKU:'} <span className="font-numeral">{item.product.sku}</span></span>
                            <span>·</span>
                            <span>{language === 'fa' ? 'وزن:' : 'Weight:'} <span className="font-numeral">{formatGrams(itemWeight)}</span></span>
                            {isCustom && (
                              <span className="text-[9px] bg-[#D4AF37]/15 text-[#997D24] px-1.5 py-0.5 rounded font-medium">
                                {t('cart.custom_weight_badge')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls & Price */}
                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity stepper */}
                          <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedWeight)}
                              className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-semibold text-[#0B080F] font-numeral">
                              {formatNum(item.quantity)}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedWeight)}
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Item Price */}
                          <span className="text-xs sm:text-sm font-bold text-[#0B080F] font-numeral">
                            {formatPrice(itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-4 sm:p-6 bg-[#FAF8F5] border-t border-[#0B080F]/5 space-y-3.5">
                <div className="flex justify-between items-center text-xs text-[#A89B8A]">
                  <span>{t('cart.summary.weight')}</span>
                  <span className="font-semibold text-[#0B080F] font-numeral">
                    {formatGrams(totalWeightGrams)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-[#0B080F]">
                  <span>{t('cart.summary.total')}</span>
                  <span className="text-base text-[#997D24] font-numeral">
                    {formatPrice(totalPriceTomans)}
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => setShowCheckout(true)}
                    disabled={isExpired}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                      isExpired
                        ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                        : 'bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] active:scale-98 shadow-lg'
                    }`}
                  >
                    <span>{t('cart.checkout_btn')}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInvoice(true)}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all bg-white hover:bg-neutral-50 text-[#0B080F] border border-[#E5DED2]"
                  >
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t('cart.print_invoice_btn')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guest Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            closeCart();
          }}
        />
      )}

      {/* Pre-Invoice Modal for Cart Items */}
      {showInvoice && (
        <InvoiceModal
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
          items={items}
          customer={{ fullName: language === 'fa' ? 'خریدار گرامی (پیش‌فاکتور سبد)' : 'Valued Client (Cart Pre-Invoice)', province: 'یزد', city: 'یزد' }}
          isDraft={true}
        />
      )}
    </>
  );
};
