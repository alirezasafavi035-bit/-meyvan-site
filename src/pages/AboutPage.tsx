import React from 'react';
import { Award, Compass, Sparkles, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <Logo variant="emblem" size="lg" />
        </div>
        <span className="text-xs font-serif-luxury tracking-[0.25em] text-[#997D24] uppercase block">
          ABOUT MEYVAN · SINCE YAZD
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-[#0B080F]">
          داستان میوان: از کهن‌دیار یزد، تا تمام ایران
        </h1>
        <p className="text-sm sm:text-base text-[#A89B8A] leading-relaxed">
          «ارزش، به انتخاب تو...» روایتی از پیوند سنت هزارساله زرگری یزد با نگاهی نو و مینیمال به دنیای طلا و جواهر.
        </p>
      </div>

      {/* Narrative Section with Image */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-[#0B080F]/5 shadow-sm">
        <div className="md:col-span-6 space-y-4 text-xs sm:text-sm text-[#0B080F]/80 leading-relaxed text-right">
          <h2 className="text-xl font-serif-luxury font-bold text-[#0B080F]">
            یزد؛ مهد عیارسنجی و زرگری اصیل ایران
          </h2>
          <p>
            شهر جهانی یزد در درازنای تاریخ همواره به عنوان پایتخت معتمدترین زرگران ایران شناخته شده است؛ جایی که عیار طلا با وسواسی اخلاقی و استانداردی بی‌نظیر سنجیده می‌شد. برند «میوان» زاده‌ی همین خاک و همین فرهنگ امانت‌داری است.
          </p>
          <p>
            ما بر این باوریم که خرید طلا نباید همراه با سردرگمی، ابهام در فرمول‌های پیچیده یا عدم شفافیت باشد. به همین دلیل، در میوان هر تکه طلا با شناسنامه معتبر، محاسبه لحظه‌ای و تفکیک مو‌به‌موی اجرت و سود اتحادیه عرضه می‌شود.
          </p>
        </div>

        <div className="md:col-span-6 rounded-2xl overflow-hidden border border-[#D4AF37]/30">
          <img
            src="/images/craft.jpg"
            alt="کارگاه تاریخی زرگری میوان در یزد"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = '/images/products/craft_goldsmith.jpg';
            }}
            className="w-full h-auto object-cover aspect-[4/3]"
          />
        </div>
      </div>

      {/* 4 Pillars of Meyvan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-2">
          <Sparkles className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          <h3 className="font-bold text-sm text-[#0B080F]">طراحی معاصر و ارگونومیک</h3>
          <p className="text-xs text-[#A89B8A] leading-relaxed">
            محصولاتی سبک، ظریف و هماهنگ با سبک زندگی امروز برای استفاده آسوده روزمره.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-2">
          <ShieldCheck className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          <h3 className="font-bold text-sm text-[#0B080F]">شفافیت کامل در قیمت</h3>
          <p className="text-xs text-[#A89B8A] leading-relaxed">
            قیمت آنلاین با فرمول رسمی اتحادیه، وزن دقیق با دقت صدم گرم و بدون حباب.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-2">
          <Award className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          <h3 className="font-bold text-sm text-[#0B080F]">فاکتور معتبر هولوگرام‌دار</h3>
          <p className="text-xs text-[#A89B8A] leading-relaxed">
            همراه با فاکتور رسمی اتحادیه طلا و امکان معامله و فروش در سراسر کشور.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-2">
          <Compass className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          <h3 className="font-bold text-sm text-[#0B080F]">ارسال بیمه‌شده سراسری</h3>
          <p className="text-xs text-[#A89B8A] leading-relaxed">
            پست پیشتاز با پوشش کامل بیمه ارزش طلا تا درب منزل شما در تمامی شهرهای ایران.
          </p>
        </div>
      </div>
    </div>
  );
};
