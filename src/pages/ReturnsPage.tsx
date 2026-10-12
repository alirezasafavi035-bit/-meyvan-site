import React from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-right text-xs sm:text-sm text-[#0B080F]/80 leading-relaxed">
      <div className="border-b pb-6">
        <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-2">
          رویه ضمانت ۷ روزه بازگشت و تعویض طلا
        </h1>
        <p className="text-xs text-[#A89B8A]">
          آسودگی و اعتماد کامل شما در انتخاب آنلاین زیورآلات میوان
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#D4AF37]" />
            شرایط تعویض و بازگشت کالا
          </h2>
          <p>
            مشتریان گرامی می‌توانند تا ۷ روز پس از دریافت بسته، در صورت عدم تطابق با مشخصات، اندازه نبودن سایز یا عدم رضایت از ظاهر، نسبت به تعویض یا مرجوع نمودن کالا اقدام فرمایند.
          </p>
        </section>

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>پلمپ امنیتی و بارکد اختصاصی متصل به طلا نباید مخدوش یا جدا شده باشد.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>فاکتور رسمی، شناسنامه و بسته‌بندی اولیه محصول باید همراه آن عودت داده شود.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>محصول فاقد هرگونه خط و خش، ضربه‌دیدگی یا تغییر حالت فیزیکی باشد.</span>
          </div>
        </div>

        <section className="space-y-2 pt-4 border-t border-neutral-200 text-xs text-[#77716A]">
          <h3 className="font-bold text-[#0B080F]">نحوه محاسبه ارزش طلا در بازگشت:</h3>
          <p>
            در صورت وجود مغایرت کالا با مشخصات درج‌شده در سایت، تعویض یا عودت کالا بدون هیچ‌گونه کسر هزینه انجام می‌پذیرد. در موارد انصراف اختیاری خریدار، با توجه به ضوابط اتحادیه طلا و نوسانات نرخ روز بازار، محاسبه مبلغ استردادی با هماهنگی مستقیم پشتیبانی به شماره ۰۹۱۳۲۵۶۰۶۱۶ و بر اساس نرخ روز طلای خام صورت می‌گیرد.
          </p>
        </section>
      </div>
    </div>
  );
};
