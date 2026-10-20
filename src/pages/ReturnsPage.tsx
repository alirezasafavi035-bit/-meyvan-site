import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle2, AlertCircle, ShieldCheck, PhoneCall, Clock, ArrowLeft, ArrowRight, PackageCheck, Banknote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ReturnsPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-start text-xs sm:text-sm text-[#0B080F]/80 leading-relaxed">
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-2">
            {t('returns.title')}
          </h1>
          <p className="text-xs text-[#A89B8A]">
            {t('returns.subtitle')}
          </p>
        </div>
        <Link
          to="/catalog"
          className="self-start sm:self-auto px-4 py-2 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <span>{t('returns.btn_catalog')}</span>
          <ArrowIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 Core Pillars Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/30 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#997D24] flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-[#0B080F] mb-1">{t('returns.p1.title')}</h3>
          <p className="text-[11px] text-[#A89B8A]">{t('returns.p1.desc')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/30 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#997D24] flex items-center justify-center mb-2">
            <PackageCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-[#0B080F] mb-1">{t('returns.p2.title')}</h3>
          <p className="text-[11px] text-[#A89B8A]">{t('returns.p2.desc')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/30 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#997D24] flex items-center justify-center mb-2">
            <RotateCcw className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-[#0B080F] mb-1">{t('returns.p3.title')}</h3>
          <p className="text-[11px] text-[#A89B8A]">{t('returns.p3.desc')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/30 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#997D24] flex items-center justify-center mb-2">
            <Banknote className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs text-[#0B080F] mb-1">{t('returns.p4.title')}</h3>
          <p className="text-[11px] text-[#A89B8A]">{t('returns.p4.desc')}</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border space-y-6">
        {/* Section 1: Allowed duration */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            {language === 'fa' ? '۱. مدت زمان مجاز برای بازگشت (۷ روز تقویمی)' : '1. Permissible Return Window (7 Calendar Days)'}
          </h2>
          <p>
            {language === 'fa'
              ? 'خریداران محترم گالری میوان می‌توانند تا حداکثر ۷ روز پس از دریافت مرسوله توسط شرکت پست یا پیک اختصاصی، در صورت تمایل به تعویض یا استرداد کالا، موضوع را به واحد پشتیبانی شوروم اطلاع دهند. کلیه هماهنگی‌ها ظرف ۲۴ ساعت کاری ثبت و راهنمایی لازم جهت ارسال بسته ارائه می‌گردد.'
              : 'Valued Meyvan clients may initiate an exchange or return within up to 7 calendar days from confirmed delivery by express mail or courier. Our boutique concierge registers your request within 24 business hours with full insured shipping instructions.'}
          </p>
        </section>

        {/* Section 2: Product condition requirements */}
        <section className="space-y-3 pt-2 bg-[#FAF8F5] p-5 rounded-xl border border-neutral-200">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#D4AF37]" />
            {language === 'fa' ? '۲. شرایط فیزیکی کالا و الزامات سلامت پلمپ' : '2. Physical Condition & Tamper-Evident Security Seal'}
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'fa' ? 'پلمپ امنیتی و تگ بارکد: ' : 'Security Seal & Barcode Tag: '}</strong>
                {language === 'fa'
                  ? 'پلمپ سربی امنیتی و نخ هولوگرام‌دار متصل به قطعه طلا نباید به هیچ عنوان قیچی، باز یا مخدوش شده باشد. باز شدن پلمپ به معنای استفاده از طلا تلقی می‌گردد.'
                  : 'The lead security seal and holographic string attached to the gold piece must remain completely intact. Any cutting or tampering indicates wear and voids the return guarantee.'}
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'fa' ? 'عدم استفاده و سلامت ظاهری: ' : 'Pristine Unworn Condition: '}</strong>
                {language === 'fa'
                  ? 'محصول باید کاملاً نو و فاقد هرگونه خط و خش، لکه، دفرمگی ناشی از فشار، تغییر اندازه دستبند/انگشتر یا پولیش غیراستاندارد باشد.'
                  : 'The item must be completely unworn, free from abrasions, scratches, resizing, or unauthorized polishing.'}
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'fa' ? 'اسناد همراه: ' : 'Accompanying Documents: '}</strong>
                {language === 'fa'
                  ? 'فاکتور رسمی هولوگرام‌دار، شناسنامه مشخصات، کارت گارانتی و جعبه مخمل اختصاصی اولیه باید همراه بسته مرجوع شوند.'
                  : 'Original stamped holographic invoice, certificate of authenticity, warranty card, and velvet presentation box must be returned.'}
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Return Steps */}
        <section className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#D4AF37]" />
            {language === 'fa' ? '۳. مراحل گام‌به‌گام درخواست بازگشت' : '3. Step-by-Step Return Procedure'}
          </h2>
          <ol className="list-decimal list-inside space-y-2 pr-2 text-neutral-700 leading-relaxed text-xs">
            <li>
              <strong>{language === 'fa' ? 'اعلام درخواست به پشتیبانی: ' : 'Contact Concierge: '}</strong>
              {language === 'fa'
                ? 'ظرف مهلت ۷ روزه، با تلفن شوروم ۰۹۱۳۲۵۶۰۶۱۶ تماس گرفته یا در واتساپ پیام بگذارید و عکس پلمپ سالم را ارسال نمایید.'
                : 'Within 7 calendar days, reach out to our concierge hotline (+98 913 256 0616) or WhatsApp and provide a photo of the intact seal.'}
            </li>
            <li>
              <strong>{language === 'fa' ? 'بسته‌بندی ایمن: ' : 'Secure Packaging: '}</strong>
              {language === 'fa'
                ? 'طلای پلمپ‌شده را داخل جعبه اصلی و لفاف حباب‌دار قرار داده و فاکتور خرید را همراه آن بگذارید.'
                : 'Place the sealed jewel in its original velvet box and bubble wrap, along with the official invoice.'}
            </li>
            <li>
              <strong>{language === 'fa' ? 'ارسال با پست پیشتاز بیمه‌شده: ' : 'Insured Shipping: '}</strong>
              {language === 'fa'
                ? 'بسته را به نشانی «یزد، خیابان قیام، بازار خان، شوروم میوان» ارسال کرده و حتماً گزینه پوشش کامل بیمه طلا را در دفتر پست فعال کنید.'
                : 'Dispatch the parcel to our Yazd central showroom via priority mail with mandatory 100% full-value gold insurance.'}
            </li>
            <li>
              <strong>{language === 'fa' ? 'کارشناسی آزمایشگاهی: ' : 'Assay Verification: '}</strong>
              {language === 'fa'
                ? 'بلافاصله پس از تحویل بسته در شوروم، کارشناس عیارسنج وزن و خلوص ۱۸ عیار طلا را بررسی و تاییدیه رسمی صادر می‌کند.'
                : 'Upon arrival, our master assayers examine calibrated weight and 750 purity before issuing the official refund approval.'}
            </li>
          </ol>
        </section>

        {/* Section 4: Refund Timing */}
        <section className="space-y-3 pt-4 border-t border-neutral-200">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#D4AF37]" />
            {language === 'fa' ? '۴. زمان و شیوه بازپرداخت وجه' : '4. Reimbursement Method & Timeline'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <h3 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {language === 'fa' ? 'در صورت مغایرت یا نقص فنی' : 'In Case of Discrepancy or Defect'}
              </h3>
              <p className="text-emerald-800 leading-relaxed">
                {language === 'fa'
                  ? '۱۰۰٪ وجه پرداختی به انضمام کلیه هزینه‌های پست مرجوعی، ظرف حداکثر ۲۴ ساعت پس از وصول کالا به شماره شبای ثبت‌شده خریدار واریز می‌گردد.'
                  : '100% of the purchase amount including all return express postage is reimbursed within 24 hours to your bank IBAN.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <h3 className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                {language === 'fa' ? 'در صورت انصراف سلیقه‌ای' : 'Change of Mind / Voluntary Return'}
              </h3>
              <p className="text-amber-800 leading-relaxed">
                {language === 'fa'
                  ? 'با توجه به ماهیت نوسانی بازار طلا، اصل ارزش طلای خام به نرخ روز تسویه محاسبه شده و کسورات اجرت ساخت کارگاه طبق مقررات صنف طلا کسر و مانده ظرف ۲۴ ساعت عودت می‌گردد.'
                  : 'Due to precious metal market volatility, raw gold value is settled at current live market rate, workshop labor fee is adjusted per Union regulations, and remainder is returned within 24 hours.'}
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
              <span className="text-white/60 block text-[11px]">
                {language === 'fa' ? 'تماس مستقیم با واحد بازگشت و ضمانت میوان:' : 'Direct Contact with Meyvan Guarantee & Returns:'}
              </span>
              <span className="font-semibold text-white">
                {language === 'fa' ? 'پاسخگویی سریع از ۹ صبح تا ۹ شب' : 'Responsive Concierge: 09:00 - 21:00'}
              </span>
            </div>
          </div>
          <a
            href="tel:09132560616"
            className="font-numeral text-[#D4AF37] font-bold text-base hover:underline px-4 py-2 bg-white/5 rounded-xl border border-white/10"
          >
            {language === 'fa' ? '۰۹۱۳۲۵۶۰۶۱۶' : '+98 913 256 0616'}
          </a>
        </div>
      </div>
    </div>
  );
};

