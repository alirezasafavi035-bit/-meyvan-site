import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Printer, ShieldCheck, ShoppingBag, FileText, PhoneCall } from 'lucide-react';
import { toPersianDigits, formatToman, formatWeight } from '../utils/persian';
import { CartItem, OrderCustomerInfo } from '../types';
import { InvoiceModal } from '../components/cart/InvoiceModal';
import { useLanguage } from '../context/LanguageContext';

interface SavedOrderSnapshot {
  orderId: string;
  items: CartItem[];
  customer: OrderCustomerInfo;
  totalWeightGrams: number;
  totalPriceTomans: number;
  createdAt: string;
}

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t, language, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  
  // Real Zarinpal query params: Status=OK or Status=NOK, Authority=A000...
  const rawStatus = searchParams.get('status') || searchParams.get('Status');
  const authority = searchParams.get('Authority') || searchParams.get('authority');
  const orderId = searchParams.get('orderId') || `ORD-${Date.now().toString().slice(-6)}`;
  const refId = searchParams.get('refId') || searchParams.get('RefId') || `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const isExplicitFailure = rawStatus ? rawStatus.toUpperCase() === 'NOK' || rawStatus.toUpperCase() === 'FAILED' : false;

  const [verified, setVerified] = useState<boolean>(!isExplicitFailure);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [savedOrder, setSavedOrder] = useState<SavedOrderSnapshot | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('meyvan_last_order');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedOrder(parsed);
      }
    } catch {
      // Storage unavailable
    }

    if (isExplicitFailure) {
      setVerified(false);
      setErrorMessage(
        language === 'fa'
          ? 'تراکنش توسط کاربر لغو شد یا درگاه پرداخت بانکی تایید ننمود.'
          : 'Transaction was cancelled by user or declined by the payment gateway.'
      );
      return;
    }

    const paymentApi = import.meta.env.VITE_PAYMENT_API || '/api';

    if (paymentApi && authority) {
      setLoading(true);
      fetch(`${paymentApi}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authority, orderId })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success === true) {
            setVerified(true);
          } else {
            setVerified(false);
            setErrorMessage(
              data.message || (language === 'fa' ? 'اعتبارسنجی تراکنش در شبکه شاپرک با خطا مواجه شد.' : 'Payment verification failed.')
            );
          }
          setLoading(false);
        })
        .catch(() => {
          setVerified(false);
          setErrorMessage(
            language === 'fa'
              ? 'خطای ارتباط با سرور تایید پرداخت. لطفاً با پشتیبانی میوان تماس حاصل فرمایید.'
              : 'Error connecting to payment verification server. Please contact Meyvan concierge.'
          );
          setLoading(false);
        });
    } else {
      setVerified(true);
    }
  }, [searchParams, isExplicitFailure, authority, orderId, language]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-base font-bold text-[#0B080F] mb-1">
          {language === 'fa' ? 'در حال استعلام و اعتبارسنجی تراکنش' : 'Verifying Transaction with Banking Network'}
        </h2>
        <p className="text-xs text-[#A89B8A]">
          {language === 'fa' ? 'ارتباط با سامانه پرداخت اینترنتی شاپرک و ثبت در فاکتور رسمی...' : 'Connecting to gateway and generating official invoice...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white rounded-3xl border border-[#0B080F]/10 shadow-2xl overflow-hidden p-6 sm:p-10 text-center">
        {verified ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block mb-1">
              {t('payment.verified_badge')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-2">
              {t('payment.success_title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#A89B8A] leading-relaxed max-w-md mx-auto mb-6">
              {t('payment.success_desc')}
            </p>

            <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-neutral-200 text-xs space-y-3 mb-6 text-start">
              <div className="flex justify-between items-center text-neutral-600">
                <span>{t('payment.order_id')}</span>
                <span className="font-bold text-[#0B080F] font-numeral">
                  {language === 'fa' ? toPersianDigits(orderId) : orderId}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>{t('payment.ref_id')}</span>
                <span className="font-bold text-[#0B080F] font-numeral">
                  {language === 'fa' ? toPersianDigits(refId) : refId}
                </span>
              </div>
              {savedOrder && (
                <>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>{language === 'fa' ? 'تحویل‌گیرنده:' : 'Recipient:'}</span>
                    <span className="font-semibold text-[#0B080F]">{savedOrder.customer.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>{language === 'fa' ? 'مجموع وزن طلا:' : 'Total Gold Weight:'}</span>
                    <span className="font-bold text-[#0B080F] font-numeral">
                      {language === 'fa' ? formatWeight(savedOrder.totalWeightGrams) : `${savedOrder.totalWeightGrams.toFixed(2)} g`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>{language === 'fa' ? 'مبلغ پرداخت‌شده:' : 'Paid Amount:'}</span>
                    <span className="font-bold text-[#997D24] font-numeral">
                      {language === 'fa' ? formatToman(savedOrder.totalPriceTomans) : `${savedOrder.totalPriceTomans.toLocaleString('en-US')} Tomans`}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center text-neutral-600">
                <span>{language === 'fa' ? 'وضعیت فرآیند:' : 'Status:'}</span>
                <span className="text-emerald-700 font-semibold">
                  {language === 'fa' ? 'تایید قطعی — آماده‌سازی در کارگاه یزد' : 'Confirmed — Preparing at Yazd Atelier'}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>{language === 'fa' ? 'تاریخ و ساعت ثبت:' : 'Recorded Date:'}</span>
                <span className="font-numeral">
                  {language === 'fa'
                    ? toPersianDigits(new Date().toLocaleDateString('fa-IR'))
                    : new Date().toLocaleDateString('en-US')}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[11px] text-[#997D24] mb-6 flex items-start gap-2.5 text-start">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {language === 'fa'
                  ? 'کد رهگیری پستی و بیمه‌نامه به محض تحویل محموله به پست پیشتاز یا پیک ویژه، از طریق پیامک به شماره همراه ثبت‌شده ارسال می‌گردد.'
                  : 'Postal tracking code and insurance certificate will be sent via SMS once dispatched with insured express courier.'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {savedOrder ? (
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex-1 py-3 px-4 bg-[#D4AF37] hover:bg-[#E5C358] text-[#0B080F] text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('payment.view_invoice')}</span>
                </button>
              ) : (
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 px-4 border border-neutral-300 hover:border-[#D4AF37] text-xs font-semibold rounded-xl text-neutral-700 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'fa' ? 'چاپ رسید پرداخت' : 'Print Receipt'}</span>
                </button>
              )}

              <Link
                to="/"
                className="flex-1 py-3 px-4 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>{t('payment.back_home')}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50">
              <XCircle className="w-8 h-8" />
            </div>
            <span className="text-xs font-serif-luxury tracking-widest text-rose-700 uppercase block mb-1">
              PAYMENT CANCELLED OR FAILED
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-2">
              {t('payment.failed_title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#A89B8A] leading-relaxed max-w-md mx-auto mb-6">
              {errorMessage || t('payment.failed_desc')}
            </p>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-xs space-y-2 mb-6 text-start">
              <div className="flex justify-between items-center text-neutral-600">
                <span>{language === 'fa' ? 'شناسه تلاش تراکنش:' : 'Attempt ID:'}</span>
                <span className="font-bold text-[#0B080F] font-numeral">
                  {language === 'fa' ? toPersianDigits(orderId) : orderId}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>{language === 'fa' ? 'علت عدم تکمیل:' : 'Reason:'}</span>
                <span className="text-rose-700 font-medium">
                  {language === 'fa' ? 'انصراف از پرداخت یا خطای تایید شاپرک' : 'User cancellation or gateway timeout'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/catalog"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#0B080F] text-white text-xs font-semibold rounded-xl hover:bg-[#D4AF37] hover:text-[#0B080F] transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'fa' ? 'بازگشت به سبد خرید و تلاش مجدد' : 'Return to Catalog & Retry'}</span>
              </Link>

              <a
                href="https://wa.me/+989132560616"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>{t('payment.contact_support')}</span>
              </a>
            </div>
          </>
        )}
      </div>

      {/* Official Invoice Modal if requested */}
      {showInvoiceModal && savedOrder && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          items={savedOrder.items}
          customer={savedOrder.customer}
          isDraft={false}
        />
      )}
    </div>
  );
};
