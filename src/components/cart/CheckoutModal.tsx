import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { OrderCustomerInfo } from '../../types';
import { formatToman, formatWeight, toPersianDigits } from '../../utils/persian';
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
  const navigate = useNavigate();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [customer, setCustomer] = useState<OrderCustomerInfo>({
    fullName: '',
    mobile: '',
    province: 'یزد',
    city: 'یزد',
    address: '',
    postalCode: '',
    shippingMethod: 'express_post',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const paymentApi = import.meta.env.VITE_PAYMENT_API;

  const validateForm = () => {
    if (!customer.fullName.trim()) return 'لطفاً نام و نام خانوادگی خود را وارد کنید.';
    if (!customer.mobile.trim() || !/^09[0-9]{9}$/.test(customer.mobile.trim())) {
      return 'لطفاً شماره موبایل معتبر ۱۱ رقمی (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.';
    }
    if (!customer.address.trim() || customer.address.trim().length < 10) {
      return 'لطفاً نشانی کامل پستی دقیق خود را وارد نمایید.';
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

    // If Payment API endpoint is configured
    if (paymentApi) {
      try {
        const orderPayload = {
          items: items.map((i) => ({ sku: i.product.sku, quantity: i.quantity })),
          customer,
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
          throw new Error('خطا در برقراری ارتباط با درگاه پرداخت.');
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
        setErrorMsg('خطا در اتصال به درگاه. لطفاً از طریق واتساپ سفارش خود را نهایی کنید.');
        setLoading(false);
        return;
      }
    }

    // Fallback Mock Transaction for demonstration / sandbox preview
    setTimeout(() => {
      const mockOrderId = `ORD-${Date.now().toString().slice(-6)}`;
      const mockRefId = `MEYVAN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      clearCart();
      onSuccess();
      navigate(`/payment-result?status=OK&orderId=${mockOrderId}&refId=${mockRefId}`);
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
          `${idx + 1}. ${i.product.name} (کد: ${i.product.sku}) - تعداد: ${i.quantity} - وزن: ${i.product.weightGrams} گرم`
      )
      .join('\n');

    const message = `✨ سفارش جدید از وبسایت میوان (meyvan.ir) ✨\n\n` +
      `👤 نام مشتری: ${customer.fullName}\n` +
      `📱 شماره تماس: ${customer.mobile}\n` +
      `📍 مقصد: استان ${customer.province}، شهر ${customer.city}\n` +
      `🏠 آدرس: ${customer.address}\n` +
      `📮 کد پستی: ${customer.postalCode || 'ثبت نشده'}\n` +
      `🚚 روش ارسال: ${customer.shippingMethod === 'yazd_courier' ? 'پیک اختصاصی یزد' : 'پست پیشتاز بیمه‌شده'}\n\n` +
      `📋 اقلام سبد خرید:\n${itemsSummary}\n\n` +
      `⚖️ مجموع وزن طلا: ${totalWeightGrams.toFixed(2)} گرم\n` +
      `💰 مبلغ تقریبی کل: ${totalPriceTomans.toLocaleString('fa-IR')} تومان\n` +
      (customer.notes ? `📝 توضیحات: ${customer.notes}\n` : '') +
      `\nلطفاً برای قفل قیمت و صدور فاکتور رسمی راهنمایی بفرمایید.`;

    const whatsappUrl = `https://wa.me/+989132560616?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#D4AF37]/30 my-8">
        {/* Header */}
        <div className="bg-[#0B080F] text-white p-5 flex items-center justify-between border-b border-[#D4AF37]/20">
          <div>
            <h3 className="font-serif-luxury text-base font-semibold">تکمیل و نهایی‌سازی سفارش</h3>
            <p className="text-xs text-[#D4AF37]/80 mt-0.5">تسویه حساب مهمان — بدون نیاز به ثبت‌نام</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price Lock Notice */}
        <div className="bg-[#FAF8F5] p-3 border-b border-[#0B080F]/5 text-xs text-[#0B080F]/80 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>نرخ طلا برای شما به مدت ۱۰ دقیقه قفل شده است. فاکتور رسمی اتحادیه با بارکد همراه مرسوله ارسال می‌شود.</span>
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
                نام و نام خانوادگی <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customer.fullName}
                onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                placeholder="مثال: سارا محمدی"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">
                شماره موبایل (جهت هماهنگی و پیامک کد رهگیری) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={customer.mobile}
                onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none font-numeral text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">استان</label>
              <input
                type="text"
                value={customer.province}
                onChange={(e) => setCustomer({ ...customer, province: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">شهر</label>
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
              نشانی دقیق پستی <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="خیابان، کوچه، پلاک، واحد..."
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">کد پستی (۱۰ رقمی)</label>
              <input
                type="text"
                value={customer.postalCode}
                onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                placeholder="اختیاری جهت رهگیری سریع‌تر"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none font-numeral"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B080F] mb-1">روش ارسال</label>
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
                <option value="express_post">پست پیشتاز بیمه‌شده سراسری (رایگان)</option>
                <option value="yazd_courier">پیک اختصاصی و امن (ویژه شهر یزد)</option>
              </select>
            </div>
          </div>

          {/* Price Summary Breakdown Card */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-neutral-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>وزن کل طلای مرسوله:</span>
              <span className="font-semibold text-[#0B080F] font-numeral">{formatWeight(totalWeightGrams)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>هزینه بسته‌بندی فاخر و بیمه طلا:</span>
              <span className="text-emerald-700 font-semibold">رایگان (هدیه میوان)</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#0B080F] pt-2 border-t border-neutral-200">
              <span>مبلغ نهایی قابل پرداخت:</span>
              <span className="text-[#997D24] font-numeral">{formatToman(totalPriceTomans)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-white hover:bg-neutral-50 text-[#0B080F] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#E5DED2] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>مشاهده و چاپ پیش‌فاکتور تفکیک‌شده این سفارش</span>
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
                  ? 'در حال اتصال به درگاه امن...'
                  : paymentApi
                  ? 'انتقال به درگاه پرداخت شاپرک'
                  : 'تایید و پرداخت آنلاین (آزمایشی)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="w-full py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/40 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>ثبت سفارش و هماهنگی از طریق واتساپ رسمی میوان</span>
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
