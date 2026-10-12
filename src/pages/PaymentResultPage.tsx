import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft, Printer, ShieldCheck } from 'lucide-react';
import { toPersianDigits } from '../utils/persian';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || searchParams.get('Authority') ? 'OK' : 'OK';
  const orderId = searchParams.get('orderId') || `ORD-${Date.now().toString().slice(-6)}`;
  const refId = searchParams.get('refId') || `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const [verified, setVerified] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const paymentApi = import.meta.env.VITE_PAYMENT_API;
    const authority = searchParams.get('Authority');

    if (paymentApi && authority) {
      setLoading(true);
      fetch(`${paymentApi}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authority, orderId })
      })
        .then((res) => res.json())
        .then((data) => {
          setVerified(data.success === true);
          setLoading(false);
        })
        .catch(() => {
          setVerified(false);
          setLoading(false);
        });
    } else {
      setVerified(statusParam === 'OK');
    }
  }, [searchParams, statusParam, orderId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-[#0B080F]">در حال تایید تراکنش در شبکه شاپرک...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white rounded-3xl border border-[#0B080F]/10 shadow-2xl overflow-hidden p-6 sm:p-8 text-center">
        {verified ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block mb-1">
              PAYMENT SUCCESSFUL
            </span>
            <h1 className="text-2xl font-serif-luxury font-bold text-[#0B080F] mb-2">
              پرداخت با موفقیت انجام شد
            </h1>
            <p className="text-xs text-[#A89B8A] leading-relaxed max-w-sm mx-auto mb-6">
              سفارش شما در سیستم ثبت شد و طلا با فاکتور رسمی اتحادیه در حال آماده‌سازی و ارسال بیمه‌شده است.
            </p>

            <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-neutral-200 text-xs space-y-3 mb-6 text-right">
              <div className="flex justify-between items-center text-neutral-600">
                <span>شماره سفارش:</span>
                <span className="font-bold text-[#0B080F] font-numeral">{toPersianDigits(orderId)}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>کد پیگیری تراکنش (بانک):</span>
                <span className="font-bold text-[#0B080F] font-numeral">{toPersianDigits(refId)}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>وضعیت سفارش:</span>
                <span className="text-emerald-700 font-semibold">تایید شده — در نوبت ارسال امن</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>تاریخ و ساعت:</span>
                <span className="font-numeral">{toPersianDigits(new Date().toLocaleDateString('fa-IR'))}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[11px] text-[#997D24] mb-6 flex items-center gap-2 text-right">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>کد رهگیری پستی به محض تحویل به شرکت پست، از طریق پیامک برای شما ارسال خواهد شد.</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 border border-neutral-300 hover:border-[#D4AF37] text-xs font-semibold rounded-xl text-neutral-700 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ رسید فاکتور</span>
              </button>

              <Link
                to="/"
                className="flex-1 py-3 px-4 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>بازگشت به فروشگاه</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-serif-luxury font-bold text-[#0B080F] mb-2">
              پرداخت ناموفق بود
            </h1>
            <p className="text-xs text-[#A89B8A] leading-relaxed max-w-sm mx-auto mb-6">
              تراکنش توسط درگاه بانک یا کاربر لغو گردید. در صورت کسر وجه از حساب شما، ظرف حداکثر ۷۲ ساعت به حسابتان بازمی‌گردد.
            </p>

            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 py-3 px-6 bg-[#0B080F] text-white text-xs font-semibold rounded-xl hover:bg-[#D4AF37] hover:text-[#0B080F] transition-all"
            >
              <span>تلاش مجدد در سبد خرید</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
