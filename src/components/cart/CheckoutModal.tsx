import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { useLanguage } from '../../context/LanguageContext';
import { OrderCustomerInfo } from '../../types';
import { X, ShieldCheck, Truck, MessageCircle, CreditCard, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InvoiceModal } from './InvoiceModal';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const { items, totalWeightGrams, totalPriceTomans, clearCart } = useCart();
  const { isExpired } = useGoldPrice();
  const { t, formatPrice, formatGrams, formatNum, getProductName, language, dir } = useLanguage();
  const navigate = useNavigate();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [customer, setCustomer] = useState<OrderCustomerInfo>({
    fullName: '',
    mobile: '',
    province: language === 'fa' ? 'یزد' : 'Yazd',
    city: language === 'fa' ? 'یزد' : 'Yazd',
    address: '',
    postalCode: '',
    shippingMethod: 'express_post',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const paymentApi = import.meta.env.VITE_PAYMENT_API || '/api';

  const validateForm = () => {
    if (!customer.fullName.trim() || customer.fullName.trim().length < 3) {
      return language === 'fa'
        ? 'لطفاً نام و نام خانوادگی کامل خود (حداقل ۳ حرف) را وارد کنید.'
        : 'Please enter your full name (at least 3 characters).';
    }
    const cleanMobile = customer.mobile.trim().replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728));
    if (!cleanMobile || !/^09[0-9]{9}$/.test(cleanMobile)) {
      return language === 'fa'
        ? 'لطفاً شماره موبایل معتبر ۱۱ رقمی (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.'
        : 'Please enter a valid 11-digit mobile number (e.g. 09123456789).';
    }
    if (customer.postalCode.trim()) {
      const cleanPostal = customer.postalCode.trim().replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728));
      if (!/^[0-9]{10}$/.test(cleanPostal)) {
        return language === 'fa'
          ? 'کد پستی ۱۰ رقمی باید صرفاً شامل ۱۰ رقم عددی بدون خط فاصله باشد.'
          : 'Postal code must contain exactly 10 digits without hyphens.';
      }
    }
    if (!customer.address.trim() || customer.address.trim().length < 10) {
      return language === 'fa'
        ? 'لطفاً نشانی کامل پستی دقیق خود (شامل خیابان، کوچه و پلاک) را وارد نمایید.'
        : 'Please enter your complete physical delivery address (street, building, unit).';
    }
    return '';
  };

  const handleOnlinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const generatedOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const snapshot = {
      orderId: generatedOrderId,
      items: items.map(i => ({
        product: {
          id: i.product.id,
          sku: i.product.sku,
          name: i.product.name,
          categoryFa: i.product.categoryFa,
          typeFa: i.product.typeFa,
          karat: i.product.karat,
          weightGrams: i.selectedWeight || i.product.weightGrams,
          wagePercent: i.product.wagePercent,
          stonePrice: i.product.stonePrice,
          images: i.product.images
        },
        quantity: i.quantity,
        selectedWeight: i.selectedWeight,
        isCustomWeight: i.isCustomWeight
      })),
      customer,
      totalWeightGrams,
      totalPriceTomans,
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('meyvan_last_order', JSON.stringify(snapshot));
    } catch {
      // Storage quota or private mode fallback
    }

    // If Payment API endpoint is configured (or proxy endpoint)
    if (paymentApi) {
      try {
        const orderPayload = {
          items: items.map((i) => ({
            sku: i.product.sku,
            quantity: i.quantity,
            selectedWeight: i.selectedWeight,
            isCustomWeight: i.isCustomWeight
          })),
          customer,
          clientCalculatedTotal: totalPriceTomans,
          createdAt: new Date().toISOString()
        };

        const res = await fetch(`${paymentApi}/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderPayload)
        });

        if (!res.ok) {
          throw new Error('Payment gateway connection error.');
        }

        const data = await res.json();
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
          return;
        } else if (data.orderId) {
          clearCart();
          onSuccess();
          navigate(`/payment-result?status=OK&orderId=${data.orderId}&refId=SIM-${Date.now()}`);
          return;
        }
      } catch (err: unknown) {
        console.error('Payment error', err);
        setErrorMsg(language === 'fa' ? 'خطا در اتصال به درگاه پرداخت آنلاین. می‌توانید از گزینه سفارش واتساپ استفاده فرمایید.' : 'Gateway connection error. You can also place your order via WhatsApp concierge.');
        setLoading(false);
        return;
      }
    }

    // Fallback Mock Transaction for demonstration / sandbox preview
    setTimeout(() => {
      const mockRefId = `MEYVAN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      clearCart();
      onSuccess();
      navigate(`/payment-result?status=OK&orderId=${generatedOrderId}&refId=${mockRefId}`);
    }, 1200);
  };

  const handleWhatsAppOrder = () => {
    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      return;
    }

    const itemsSummary = items
      .map(
        (i, idx) =>
          `${idx + 1}. ${getProductName(i.product)} (SKU: ${i.product.sku}) - Qty: ${i.quantity} - Weight: ${i.product.weightGrams}g`
      )
      .join('\n');

    const message = `✨ New Fine Jewelry Order from MEYVAN (meyvan.ir) ✨\n\n` +
      `👤 Client Name: ${customer.fullName}\n` +
      `📱 Phone: ${customer.mobile}\n` +
      `📍 Destination: ${customer.province}, ${customer.city}\n` +
      `🏠 Address: ${customer.address}\n` +
      `📮 Postal Code: ${customer.postalCode || 'Not provided'}\n` +
      `🚚 Shipping: ${customer.shippingMethod === 'yazd_courier' ? 'Local Yazd Courier' : 'Insured Priority Express'}\n\n` +
      `📋 Items Ordered:\n${itemsSummary}\n\n` +
      `⚖️ Total Gold Weight: ${totalWeightGrams.toFixed(2)} g\n` +
      `💰 Total Amount: ${formatPrice(totalPriceTomans)}\n` +
      (customer.notes ? `📝 Notes: ${customer.notes}\n` : '');

    const whatsappUrl = `https://wa.me/+989132560616?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#D4AF37]/30 my-8 text-start">
        {/* Header */}
        <div className="bg-[#0B080F] text-white p-5 flex items-center justify-between border-b border-[#D4AF37]/20">
          <div>
            <h3 className="font-serif-luxury text-base font-semibold">{t('checkout.title')}</h3>
            <p className="text-xs text-[#D4AF37]/80 mt-0.5">{t('checkout.subtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price Lock Notice */}
        <div className="bg-[#FAF8F5] p-3 border-b border-[#0B080F]/5 text-xs text-[#0B080F]/80 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>{language === 'fa' ? 'نرخ طلا برای شما به مدت ۱۰ دقیقه قفل شده است. فاکتور رسمی اتحادیه با بارکد همراه مرسوله ارسال می‌شود.' : 'Gold price is locked for 10 minutes. Official stamped Union invoice is included with your delivery.'}</span>
        </div>

        {errorMsg && (
          <div className="m-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleOnlinePayment} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">
                {t('checkout.field.name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customer.fullName}
                onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                placeholder={language === 'fa' ? 'مثال: سارا محمدی' : 'e.g. Sara Mohammadi'}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">
                {t('checkout.field.mobile')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={customer.mobile}
                onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                placeholder="09123456789"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none font-numeral"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">{t('checkout.field.province')}</label>
              <input
                type="text"
                value={customer.province}
                onChange={(e) => setCustomer({ ...customer, province: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">{t('checkout.field.city')}</label>
              <input
                type="text"
                value={customer.city}
                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0B080F] mb-1">
              {t('checkout.field.address')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder={language === 'fa' ? 'خیابان، کوچه، پلاک، واحد...' : 'Street, building, entrance, floor, unit...'}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">{t('checkout.field.postal')}</label>
              <input
                type="text"
                value={customer.postalCode}
                onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                placeholder={language === 'fa' ? 'اختیاری جهت رهگیری سریع‌تر' : 'Optional for faster dispatch'}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none font-numeral"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">{language === 'fa' ? 'روش ارسال' : 'Shipping Method'}</label>
              <select
                value={customer.shippingMethod}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    shippingMethod: e.target.value as 'express_post' | 'yazd_courier'
                  })
                }
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none bg-white"
              >
                <option value="express_post">{language === 'fa' ? 'پست پیشتاز بیمه‌شده سراسری (رایگان)' : 'Insured Priority Express Mail (Complimentary)'}</option>
                <option value="yazd_courier">{language === 'fa' ? 'پیک اختصاصی و امن (ویژه شهر یزد)' : 'Dedicated Secure Courier (Yazd City Only)'}</option>
              </select>
            </div>
          </div>

          {/* Price Summary Breakdown Card */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-neutral-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>{t('cart.summary.weight')}</span>
              <span className="font-semibold text-[#0B080F] font-numeral">{formatGrams(totalWeightGrams)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>{t('cart.summary.shipping')}</span>
              <span className="text-emerald-700 font-semibold">{t('cart.summary.shipping_free')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#0B080F] pt-2 border-t border-neutral-200">
              <span>{t('cart.summary.total')}</span>
              <span className="text-[#997D24] font-numeral">{formatPrice(totalPriceTomans)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-white hover:bg-neutral-50 text-[#0B080F] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#E5DED2] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t('pdp.invoice_cta')}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={loading || isExpired}
              className="w-full py-3 px-4 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {loading
                  ? (language === 'fa' ? 'در حال اتصال به درگاه امن...' : 'Connecting to secure gateway...')
                  : (language === 'fa' ? 'انتقال به درگاه پرداخت شاپرک' : 'Proceed to Secure Banking Gateway')}
              </span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="w-full py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/40 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>{t('cart.whatsapp_order')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Itemized Invoice Preview Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          items={items}
          customer={customer}
          isDraft={true}
        />
      )}
    </div>
  );
};
