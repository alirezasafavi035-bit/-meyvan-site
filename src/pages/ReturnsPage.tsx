import React from 'react';
import { RotateCcw, CheckCircle2, AlertCircle, ShieldCheck, PhoneCall, Clock } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-right text-xs sm:text-sm text-[#0B080F]/80 leading-relaxed">
      <div className="border-b pb-6">
        <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-2">
          شرایط، قوانین و رویه کامل بازگشت وجه و تعویض طلا
        </h1>
        <p className="text-xs text-[#A89B8A]">
          به‌روزرسانی: مهرماه ۱۴۰۵ — منطبق با قوانین تجارت الکترونیک و ضوابط رسمی اتحادیه طلا و جواهر
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border space-y-6">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#D4AF37]" />
            ۱. مهلت و شرایط عمومی تعویض یا بازگشت (۷ روز تقویمی)
          </h2>
          <p>
            خریداران محترم گالری میوان می‌توانند تا ۷ روز پس از تحویل مرسوله توسط شرکت پست یا پیک، در صورت تمایل به تعویض یا استرداد کالا، با پشتیبانی شوروم هماهنگ نمایند. کلیه درخواست‌ها ظرف ۲۴ ساعت کاری بررسی و تعیین تکلیف می‌شوند.
          </p>
        </section>

        {/* Essential Conditions */}
        <div className="space-y-3 pt-2 bg-[#FAF8F5] p-4 rounded-xl border border-neutral-200">
          <h3 className="font-semibold text-xs text-[#0B080F] mb-1">الزامات پذیرش مرجوعی:</h3>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>پلمپ سربی امنیتی، تگ بارکد و لیبل اصالت متصل به قطعه طلا نباید به هیچ عنوان باز، قیچی یا مخدوش شده باشد.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>فاکتور رسمی هولوگرام‌دار، شناسنامه مشخصات، کارت گارانتی و جعبه فاخر اولیه باید سالم همراه بسته برگشت داده شوند.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>محصول فاقد هرگونه خط و خش، دفرمگی، تغییر اندازه فیزیکی، ضربه‌دیدگی یا پولیش غیراستاندارد باشد.</span>
          </div>
        </div>

        {/* Section 2: Defect vs Mind Change */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <h3 className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              حالت اول: مغایرت مشخصات یا نقص فنی
            </h3>
            <p className="text-emerald-800 leading-relaxed">
              در صورت وجود هرگونه مغایرت در وزن، عیار، ابعاد یا آسیب فیزیکی هنگام تحویل، کالا بدون هیچ‌گونه قید و شرط تعویض یا ۱۰۰٪ وجه پرداختی به علاوه کلیه هزینه‌های پستی عودت داده می‌شود.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <h3 className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              حالت دوم: انصراف سلیقه‌ای خریدار
            </h3>
            <p className="text-amber-800 leading-relaxed">
              با توجه به نوسانات لحظه‌ای و رسمی بازار جهانی و داخلی طلا، در صورت انصراف سلیقه‌ای، ارزش اصل طلای خام به نرخ روز تسویه محاسبه شده و کسورات مربوط به اجرت ساخت طبق عرف مصوب صنف طلافروشان کسر می‌گردد.
            </p>
          </div>
        </div>

        {/* Step-by-step return process */}
        <section className="space-y-3 pt-4 border-t border-neutral-200 text-xs">
          <h3 className="font-bold text-[#0B080F] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            مراحل ۴ گانه ثبت و عودت کالا:
          </h3>
          <ol className="list-decimal list-inside space-y-2 pr-2 text-neutral-700 leading-relaxed">
            <li>
              <strong>تماس و اعلام اولیه:</strong> حداکثر تا ۷ روز پس از دریافت، با شماره مستقیم <strong>۰۹۱۳۲۵۶۰۶۱۶</strong> تماس گرفته یا در واتساپ پیام بگذارید.
            </li>
            <li>
              <strong>بسته‌بندی ایمن:</strong> قرار دادن طلا در جعبه اصلی به همراه فاکتور و لفاف حباب‌دار ایمن.
            </li>
            <li>
              <strong>ارسال با پست پیشتاز بیمه‌شده:</strong> ارسال بسته به نشانی شوروم مرکزی یزد (خیابان قیام، بازار خان) با درج ارزش کامل بیمه طلا.
            </li>
            <li>
              <strong>کارشناسی و واریز وجه:</strong> بررسی سلامت طلا توسط کارشناس عیارسنج ظرف ۲۴ ساعت از رسیدن بسته و واریز وجه از طریق پایا/ساتنا به شبای خریدار.
            </li>
          </ol>
        </section>

        {/* Direct coordination contact box */}
        <div className="p-4 rounded-xl bg-[#0B080F] text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#D4AF37]" />
            <span>واحد پشتیبانی و هماهنگی مرجوعی میوان:</span>
          </div>
          <a href="tel:09132560616" className="font-numeral text-[#D4AF37] font-bold text-sm hover:underline">
            ۰۹۱۳۲۵۶۰۶۱۶
          </a>
        </div>
      </div>
    </div>
  );
};
