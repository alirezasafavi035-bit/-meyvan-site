import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle2, AlertCircle, ShieldCheck, PhoneCall, Clock, ArrowLeft, PackageCheck, Banknote } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-right text-xs sm:text-sm text-[#0B080F]/80 leading-relaxed">
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-2">
            شرایط، قوانین و رویه کامل بازگشت وجه و تعویض طلا
          </h1>
          <p className="text-xs text-[#A89B8A]">
            به‌روزرسانی: مهرماه ۱۴۰۵ — منطبق با ماده ۳۷ قانون تجارت الکترونیک و ضوابط رسمی اتحادیه طلا و جواهر
          </p>
        </div>
        <Link
          to="/catalog"
          className="self-start sm:self-auto px-4 py-2 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <span>مشاهده محصولات</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 Core Pillars Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/30 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#997D24] flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-[#0B080F] mb-1">۱. مهلت مجاز بازگشت</h3>
          <p className="text-[11px] text-[#A89B8A]">۷ روز تقویمی از لحظه تحویل مرسوله پستی</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/30 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#997D24] flex items-center justify-center mb-2">
            <PackageCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-[#0B080F] mb-1">۲. شرایط فیزیکی کالا</h3>
          <p className="text-[11px] text-[#A89B8A]">پلمپ سربی دست‌نخورده، فاکتور و جعبه سالم</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/30 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#997D24] flex items-center justify-center mb-2">
            <RotateCcw className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-[#0B080F] mb-1">۳. مراحل درخواست</h3>
          <p className="text-[11px] text-[#A89B8A]">تماس تلفنی، ارسال بیمه‌شده و بررسی عیار</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/30 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#997D24] flex items-center justify-center mb-2">
            <Banknote className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-[#0B080F] mb-1">۴. زمان بازپرداخت</h3>
          <p className="text-[11px] text-[#A89B8A]">حداکثر ۲۴ ساعت پس از وصول و تایید کارشناسی</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border space-y-6">
        {/* Section 1: Allowed duration */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            ۱. مدت زمان مجاز برای بازگشت (۷ روز کاری)
          </h2>
          <p>
            خریداران محترم گالری میوان می‌توانند تا حداکثر ۷ روز پس از دریافت مرسوله توسط شرکت پست یا پیک اختصاصی، در صورت تمایل به تعویض یا استرداد کالا، موضوع را به واحد پشتیبانی شوروم اطلاع دهند. کلیه هماهنگی‌ها ظرف ۲۴ ساعت کاری ثبت و راهنمایی لازم جهت ارسال بسته ارائه می‌گردد.
          </p>
        </section>

        {/* Section 2: Product condition requirements */}
        <section className="space-y-3 pt-2 bg-[#FAF8F5] p-5 rounded-xl border border-neutral-200">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#D4AF37]" />
            ۲. شرایط کالا (الزامات سلامت فیزیکی و اصالت)
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>پلمپ امنیتی و تگ بارکد:</strong> پلمپ سربی امنیتی و نخ هولوگرام‌دار متصل به قطعه طلا نباید به هیچ عنوان قیچی، باز یا مخدوش شده باشد. باز شدن پلمپ به معنای استفاده از طلا تلقی می‌گردد.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>عدم استفاده و سلامت ظاهری:</strong> محصول باید کاملاً نو و فاقد هرگونه خط و خش، لکه، دفرمگی ناشی از فشار، تغییر اندازه دستبند/انگشتر یا پولیش غیراستاندارد باشد.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>اسناد همراه:</strong> فاکتور رسمی هولوگرام‌دار، شناسنامه مشخصات، کارت گارانتی و جعبه مخمل اختصاصی اولیه باید همراه بسته مرجوع شوند.</span>
            </div>
          </div>
        </section>

        {/* Section 3: Return Steps */}
        <section className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#D4AF37]" />
            ۳. مراحل گام‌به‌گام درخواست بازگشت
          </h2>
          <ol className="list-decimal list-inside space-y-2 pr-2 text-neutral-700 leading-relaxed text-xs">
            <li>
              <strong>اعلام درخواست به پشتیبانی:</strong> ظرف مهلت ۷ روزه، با تلفن شوروم <strong>۰۹۱۳۲۵۶۰۶۱۶</strong> تماس گرفته یا در واتساپ پیام بگذارید و عکس پلمپ سالم را ارسال نمایید.
            </li>
            <li>
              <strong>بسته‌بندی ایمن:</strong> طلای پلمپ‌شده را داخل جعبه اصلی و لفاف حباب‌دار قرار داده و فاکتور خرید را همراه آن بگذارید.
            </li>
            <li>
              <strong>ارسال با پست پیشتاز بیمه‌شده:</strong> بسته را به نشانی «یزد، خیابان قیام، بازار خان، شوروم میوان» ارسال کرده و حتماً گزینه «پوشش کامل بیمه طلا» را در دفتر پست فعال کنید.
            </li>
            <li>
              <strong>کارشناسی آزمایشگاهی:</strong> بلافاصله پس از تحویل بسته در شوروم، کارشناس عیارسنج وزن و خلوص ۱۸ عیار طلا را بررسی و تاییدیه رسمی صادر می‌کند.
            </li>
          </ol>
        </section>

        {/* Section 4: Refund Timing */}
        <section className="space-y-3 pt-4 border-t border-neutral-200">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#D4AF37]" />
            ۴. زمان و شیوه بازپرداخت وجه
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <h3 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                در صورت مغایرت یا نقص فنی
              </h3>
              <p className="text-emerald-800 leading-relaxed">
                ۱۰۰٪ وجه پرداختی به انضمام کلیه هزینه‌های پست مرجوعی، ظرف حداکثر ۲۴ ساعت پس از وصول کالا به شماره شبای ثبت‌شده خریدار واریز می‌گردد.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <h3 className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                در صورت انصراف سلیقه‌ای
              </h3>
              <p className="text-amber-800 leading-relaxed">
                با توجه به ماهیت نوسانی بازار طلا، اصل ارزش طلای خام به نرخ روز تسویه محاسبه شده و کسورات اجرت ساخت کارگاه طبق مقررات صنف طلا کسر و مانده ظرف ۲۴ ساعت عودت می‌گردد.
              </p>
            </div>
          </div>
        </section>

        {/* Direct coordination contact box */}
        <div className="p-5 rounded-2xl bg-[#0B080F] text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#D4AF37]">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-white/60 block text-[11px]">تماس مستقیم با واحد بازگشت و ضمانت میوان:</span>
              <span className="font-semibold text-white">پاسخگویی سریع از ۹ صبح تا ۹ شب</span>
            </div>
          </div>
          <a
            href="tel:09132560616"
            className="font-numeral text-[#D4AF37] font-bold text-base hover:underline px-4 py-2 bg-white/5 rounded-xl border border-white/10"
          >
            ۰۹۱۳۲۵۶۰۶۱۶
          </a>
        </div>
      </div>
    </div>
  );
};
