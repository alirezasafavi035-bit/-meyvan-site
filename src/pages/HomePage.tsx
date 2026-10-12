import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Compass,
  ArrowLeft,
  ChevronDown,
  Gift,
  Layers,
  Crown,
  Heart,
  Gem,
  CheckCircle2
} from 'lucide-react';

interface HomePageProps {
  products: Product[];
}

export const HomePage: React.FC<HomePageProps> = ({ products }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  const categories = [
    {
      key: 'minimal',
      name: 'طلای مینیمال',
      desc: 'ظرافت مدرن برای استایل روزمره و معاصر',
      weight: '۱ تا ۳ گرم',
      icon: Sparkles
    },
    {
      key: 'economic',
      name: 'کالکشن اقتصادی',
      desc: 'انتخابی هوشمندانه و ارزشمند برای هدیه',
      weight: '۱ تا ۴ گرم',
      icon: Gift
    },
    {
      key: 'everyday',
      name: 'طلای روزمره',
      desc: 'استحکام بالا و زیبایی چشم‌نواز در هر لحظه',
      weight: '۲ تا ۸ گرم',
      icon: Layers
    },
    {
      key: 'heavy',
      name: 'کارهای سنگین یزد',
      desc: 'النگو و تراش‌های اصیل سنتی یزد',
      weight: '۱۰ تا ۶۰ گرم',
      icon: Crown
    },
    {
      key: 'set',
      name: 'سرویس و نیم‌ست',
      desc: 'مجموعه‌های فاخر برای مراسم و عروس',
      weight: '۱۵ تا ۸۰ گرم',
      icon: Heart
    },
    {
      key: 'jewelry',
      name: 'جواهرات نگین‌دار',
      desc: 'ترکیب برلیان، سنگ‌های قیمتی و طلای ۱۸ عیار',
      weight: '۲ تا ۱۵ گرم',
      icon: Gem
    }
  ];

  const faqs = [
    {
      q: 'آیا همراه با خرید، فاکتور رسمی اتحادیه طلا ارائه می‌شود؟',
      a: 'بله، تمامی سفارش‌های میوان به همراه فاکتور رسمی و هولوگرام‌دار اتحادیه طلا و جواهر ارسال می‌شوند که شامل وزن دقیق با ترازوی سه صفر، کد کارگاهی رسمی یزد، درصد اجرت و مهر رسمی است.'
    },
    {
      q: 'فرمول محاسبه آنلاین قیمت طلا در میوان چگونه است؟',
      a: 'قیمت هر قطعه طلا از فرمول مصوب اتحادیه محاسبه می‌شود: قیمت پایه (وزن × نرخ روز طلا) + اجرت ساخت کارگاه + ۷٪ سود قانونی + ۹٪ مالیات بر ارزش افزوده (فقط بر سود و اجرت). قیمت به صورت زنده هر ۶۰ ثانیه به‌روزرسانی می‌شود.'
    },
    {
      q: 'ارسال طلا به سایر شهرهای ایران چگونه و با چه تضمینی انجام می‌گیرد؟',
      a: 'کلیه مرسولات پستی میوان از طریق پست پیشتاز ویژه یا تیپاکس به صورت ۱۰۰٪ بیمه‌شده با سقف کامل ارزش طلا ارسال می‌شوند و در بسته‌بندی پلمپ امنیتی تحویل داده می‌شوند.'
    },
    {
      q: 'آیا امکان تعویض یا بازگشت طلا وجود دارد؟',
      a: 'بله، میوان تا ۷ روز پس از دریافت کالا امکان تعویض و بازگشت وجه را مطابق با قوانین و شرایط ضمانت بازگشت طلا تضمین می‌کند.'
    },
    {
      q: 'چرا طلا و زرگری شهر یزد دارای شهرت و کیفیت ویژه است؟',
      a: 'یزد از دیرباز قطب عیارسنجی دقیق و ساخت دست‌سازه‌های طلای باکیفیت و بدون ناخالصی در ایران بوده است. میوان با حفظ این میراث تاریخی، طلایی با خلوص دقیق و بالاترین سطح پرداخت را به شما تقدیم می‌کند.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Hero Section */}
      <section className="relative bg-[#0B080F] text-white overflow-hidden border-b border-[#D4AF37]/20">
        {/* Subtle Ambient Radial Gold Glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left/Main Col: Headline & Brand Taglines */}
            <div className="lg:col-span-7 space-y-6 text-right">
              {/* Subtle Kicker with Brand Emblem */}
              <div className="flex items-center gap-3">
                <img
                  src="/logo.svg"
                  alt="Meyvan Gold & Jewelry Emblem"
                  className="w-10 h-10 object-contain filter drop-shadow-md"
                />
                <div className="inline-flex items-center gap-2 text-xs font-serif-luxury tracking-[0.25em] text-[#D4AF37] uppercase">
                  <span className="w-6 h-px bg-[#D4AF37]" />
                  <span>از یزد، تا تمام ایران · بیش از یک جواهر</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury font-bold leading-tight sm:leading-tight text-white">
                درخشش، <br className="hidden sm:inline" />
                <span className="gold-gradient-text">حق انتخاب توست...</span>
              </h1>

              {/* Body Prose */}
              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xl">
                میوان پیوند هنر کهن زرگری یزد با زبان طراحی مدرن است. هر قطعه طلا در میوان، تجلیلی از اصالت، شفافیت کامل قیمت و ارزش ماندگار برای سلیقه شماست.
              </p>

              {/* CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/catalog"
                  className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#E5C358] text-[#0B080F] font-bold text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/20 flex items-center gap-2 group active:scale-95"
                >
                  <span>مشاهده محصولات</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/about"
                  className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/90 border border-white/20 hover:border-[#D4AF37]/60 font-medium text-sm rounded-xl transition-all"
                >
                  داستان و اصالت میوان
                </Link>
              </div>

              {/* Tagline footer note */}
              <div className="pt-6 border-t border-white/10 flex items-center gap-4 text-xs text-white/50">
                <span>ارزش، به انتخاب تو</span>
                <span>·</span>
                <span>طلای ۱۸ عیار استاندارد</span>
                <span>·</span>
                <span>فاکتور رسمی اتحادیه</span>
              </div>
            </div>

            {/* Right Col: High-Res Hero Jewelry Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl bg-[#14101A]">
                <img
                  src="/src/assets/images/hero_jewelry_luxury_1791741170455.jpg"
                  alt="مجموعه طلای ۱۸ عیار فاخر میوان"
                  width={640}
                  height={360}
                  fetchPriority="high"
                  className="w-full h-auto object-cover aspect-[16/9] lg:aspect-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B080F]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 right-4 left-4 p-3 bg-[#0B080F]/90 backdrop-blur-md rounded-xl border border-[#D4AF37]/20 flex items-center justify-between">
                  <div className="text-right">
                    <span className="text-[10px] text-[#D4AF37] block font-serif-luxury tracking-wider">MEYVAN SIGNATURE</span>
                    <span className="text-xs text-white font-medium">گردنبند و گوشواره طلای ۱۸ عیار پرنیان</span>
                  </div>
                  <Link
                    to="/catalog?category=jewelry"
                    className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1"
                  >
                    <span>مشاهده</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand 4 Core Personality Pillars (Thin Golden Line Icons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#0B080F]/5 text-center flex flex-col items-center hover:border-[#D4AF37]/40 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-3 border border-[#D4AF37]/20">
              <Sparkles className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif-luxury text-base font-bold text-[#0B080F] mb-1">لوکس (Luxury)</h3>
            <p className="text-xs text-[#A89B8A] leading-relaxed">
              طراحی منحصر‌به‌فرد و درخشش چشم‌نواز طلا با استانداردهای بین‌المللی
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#0B080F]/5 text-center flex flex-col items-center hover:border-[#D4AF37]/40 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-3 border border-[#D4AF37]/20">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif-luxury text-base font-bold text-[#0B080F] mb-1">اعتماد (Trust)</h3>
            <p className="text-xs text-[#A89B8A] leading-relaxed">
              شفافیت دقیق فرمول قیمت، فاکتور اتحادیه و بازگشت تضمین‌شده وجه
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#0B080F]/5 text-center flex flex-col items-center hover:border-[#D4AF37]/40 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-3 border border-[#D4AF37]/20">
              <Award className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif-luxury text-base font-bold text-[#0B080F] mb-1">اصالت (Heritage)</h3>
            <p className="text-xs text-[#A89B8A] leading-relaxed">
              ریشه‌دار در تاریخ زرگری کهن یزد با عیارسنجی معتبر و دقیق
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#0B080F]/5 text-center flex flex-col items-center hover:border-[#D4AF37]/40 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-3 border border-[#D4AF37]/20">
              <Compass className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif-luxury text-base font-bold text-[#0B080F] mb-1">مدرن (Modern)</h3>
            <p className="text-xs text-[#A89B8A] leading-relaxed">
              فرم‌های ارگونومیک، خطوط مینیمال و هماهنگ با استایل نسل نو
            </p>
          </div>
        </div>
      </section>

      {/* 3. Main Categories (6 Large Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block mb-1">
              COLLECTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F]">
              دسته‌بندی‌های تخصصی میوان
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-semibold text-[#0B080F] hover:text-[#D4AF37] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>مشاهده همه محصولات (۵۰۰ قطعه)</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                to={`/catalog?category=${cat.key}`}
                className="group relative bg-white p-6 rounded-2xl border border-[#0B080F]/5 hover:border-[#D4AF37]/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0B080F] transition-colors border border-[#0B080F]/5">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <span className="text-[11px] text-[#A89B8A] font-numeral">
                      {cat.weight}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0B080F] group-hover:text-[#997D24] transition-colors mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#A89B8A] leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#0B080F]/5 flex items-center justify-between text-xs font-medium text-[#0B080F]">
                  <span className="group-hover:text-[#D4AF37] transition-colors">ورود به مجموعه</span>
                  <ArrowLeft className="w-4 h-4 text-[#A89B8A] group-hover:text-[#D4AF37] group-hover:-translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Best Sellers / Featured Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block mb-1">
              BESTSELLERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F]">
              پرفروش‌ترین‌های منتخب
            </h2>
          </div>
          <Link
            to="/catalog?sortBy=bestseller"
            className="text-xs font-semibold text-[#0B080F] hover:text-[#D4AF37] flex items-center gap-1"
          >
            <span>مشاهده همه پرفروش‌ها</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Brand Philosophy & Yazd Goldsmithing Heritage */}
      <section className="bg-[#0B080F] text-white py-16 sm:py-24 border-y border-[#D4AF37]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual: Yazd Goldsmith Workshop */}
            <div className="lg:col-span-5 relative order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl bg-[#14101A]">
                <img
                  src="/src/assets/images/craft_goldsmith_yazd_1791741185534.jpg"
                  alt="استادکار زرگر در کارگاه سنتی یزد"
                  width={600}
                  height={450}
                  loading="lazy"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 p-4 bg-[#14101A] border border-[#D4AF37]/40 rounded-xl text-xs text-[#D4AF37] shadow-xl hidden sm:block">
                «یزد؛ پایتخت اصالت زرگری ایران»
              </div>
            </div>

            {/* Content: 5 Pillars of Philosophy */}
            <div className="lg:col-span-7 space-y-6 text-right order-1 lg:order-2">
              <span className="text-xs font-serif-luxury tracking-[0.25em] text-[#D4AF37] uppercase block">
                PHILOSOPHY & HERITAGE
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white">
                فلسفه میوان: <span className="gold-gradient-text">بیشتر از یک جواهر</span>
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                طلا تنها یک فلز گرانبها نیست؛ پیوندی میان هنر، احساس و سرمایه‌گذاری هوشمندانه است. ما در میوان بر ۵ اصل تزلزل‌ناپذیر پایبندیم:
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">انتخاب آگاهانه</h4>
                    <p className="text-xs text-white/50 leading-relaxed">دسترسی به مشخصات کامل، وزن میلی‌گرمی و تفکیک اجرت برای خریدی با چشمان باز.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">اصالت و زرگری یزد</h4>
                    <p className="text-xs text-white/50 leading-relaxed">هنر دست استادکاران نام‌آور یزد با خلوص دقیق عیار ۷۵۰ (۱۸ عیار) و استانداردهای ملی.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">شفافیت کامل مالیاتی و قانونی</h4>
                    <p className="text-xs text-white/50 leading-relaxed">رعایت دقیق قانون جدید مالیات طلا بدون دریافت هیچ‌گونه هزینه پنهان یا حباب ساختگی.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">زیبایی ماندگار و جاودان</h4>
                    <p className="text-xs text-white/50 leading-relaxed">طرح‌هایی که فراتر از مدهای گذرا، سال‌ها همراه لحظات درخشان شما باقی می‌مانند.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Packaging & Certificate of Authenticity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#0B080F]/5 overflow-hidden shadow-xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5 text-right">
              <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block">
                AUTHENTICITY & PACKAGING
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F]">
                بسته‌بندی فاخر، شناسنامه هولوگرام‌دار و فاکتور رسمی
              </h2>
              <p className="text-xs sm:text-sm text-[#A89B8A] leading-relaxed">
                هر خرید از میوان در جعبه اختصاصی لوکس مشکی-طلایی همراه با شناسنامه معتبر حاوی شماره سریال یکتا، بارکد اصالت، فاکتور مهرشده رسمی اتحادیه و کارت ضمانت عیار تقدیم شما می‌شود تا در هر کجای ایران قابل بازفروش یا تعویض باشد.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-neutral-200/60">
                  <span className="font-semibold text-[#0B080F] block mb-1">شناسنامه محصول</span>
                  <span className="text-[#A89B8A]">شامل وزن دقیق، عیار، ابعاد و مشخصات نگین</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-neutral-200/60">
                  <span className="font-semibold text-[#0B080F] block mb-1">بسته‌بندی هدیه</span>
                  <span className="text-[#A89B8A]">جعبه مخمل لوکس با روبان و بگ اختصاصی میوان</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md">
                <img
                  src="/src/assets/images/luxury_packaging_cert_1791741197853.jpg"
                  alt="جعبه لوکس بسته‌بندی میوان و شناسنامه رسمی طلا"
                  width={500}
                  height={375}
                  loading="lazy"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center mb-10">
          <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block mb-1">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F]">
            پرسش‌های متداول شما درباره خرید طلا
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#0B080F]/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-4 font-semibold text-sm text-[#0B080F] hover:text-[#997D24] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#A89B8A] transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#D4AF37]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#A89B8A] leading-relaxed border-t border-[#0B080F]/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
