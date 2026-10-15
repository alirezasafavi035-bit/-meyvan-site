import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { toPersianDigits } from '../utils/persian';
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

  // Helper to dynamically calculate real statistics from products array
  const getCatData = (filterFn: (p: Product) => boolean) => {
    const matching = products.filter(filterFn);
    const count = matching.length;
    if (count === 0) return { count: 0, weight: '—' };
    const weights = matching.map(p => p.weightGrams);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const weight = minW === maxW
      ? `${toPersianDigits(minW.toFixed(1))} گرم`
      : `${toPersianDigits(minW.toFixed(1))} تا ${toPersianDigits(maxW.toFixed(1))} گرم`;
    return { count, weight };
  };

  const earringsData = getCatData(p => p.category === 'earrings' || p.type === 'earrings');
  const ringData = getCatData(p => p.category === 'ring' || p.type === 'ring');
  const necklaceData = getCatData(p => p.category === 'necklace' || p.type === 'necklace');
  const braceletData = getCatData(p => p.category === 'bracelet' || p.type === 'bracelet' || p.type === 'bangle' || p.type === 'anklet');
  const setData = getCatData(p => p.category === 'set' || p.type === 'set' || p.type === 'half_set');
  const coinData = getCatData(p => p.category === 'coin' || p.type === 'coin' || p.type === 'bullion');
  const pendantData = getCatData(p => p.category === 'pendant' || p.type === 'pendant');
  const menData = getCatData(p => p.category === 'men' || p.tags.includes('مردانه') || p.name.includes('مردانه'));
  const kidsData = getCatData(p => p.category === 'kids' || p.tags.includes('کودک') || p.name.includes('کودک'));
  const economicData = getCatData(p => p.category === 'economic' || p.wagePercent <= 0.12 || p.tags.includes('کم‌اجرت'));

  // Axis 1: ۱۰ دسته‌بندی تخصصی میوان همراه با تصویر دقیق، عنوان، تعداد محاسبه‌شده و لینک مستقیم
  const categories = [
    {
      key: 'earrings',
      type: 'earrings',
      name: 'گوشواره',
      count: earringsData.count,
      desc: 'انواع گوشواره‌های میخی، آویز و مجلسی ۱۸ عیار با قفل استاندارد و مطمئن',
      weight: earringsData.weight,
      image: '/images/products/earrings_stud.jpg'
    },
    {
      key: 'ring',
      type: 'ring',
      name: 'انگشتر',
      count: ringData.count,
      desc: 'انگشترهای فاخر، پورتوفینو، رینگ‌های مینیمال و تراش‌های اصیل سنتی',
      weight: ringData.weight,
      image: '/images/products/gold_ring_luxury_1791946268061.jpg'
    },
    {
      key: 'necklace',
      type: 'necklace',
      name: 'گردنبند',
      count: necklaceData.count,
      desc: 'گردنبندهای کارتیه، رولباسی، زنجیرهای ونزی و مدال‌های اسلیمی یزد',
      weight: necklaceData.weight,
      image: '/images/products/gold_necklace_pendant_1791946268677.jpg'
    },
    {
      key: 'bracelet',
      type: 'bracelet',
      name: 'دستبند',
      count: braceletData.count,
      desc: 'النگو، تک‌پوش، بنگل و دستبندهای تراش‌خورده با بالاترین دوام فیزیکی',
      weight: braceletData.weight,
      image: '/images/products/gold_bracelet_bangle_1791946279045.jpg'
    },
    {
      key: 'set',
      type: 'set',
      name: 'نیم‌ست',
      count: setData.count,
      desc: 'مجموعه‌های هماهنگ گردنبند، گوشواره و دستبند برای مجالس و هدایا',
      weight: setData.weight,
      image: '/images/products/gold_bridal_set_suite_1791946299635.jpg'
    },
    {
      key: 'coin',
      type: 'coin',
      name: 'سکه و شمش',
      count: coinData.count,
      desc: 'شمش‌های سرمایه‌گذاری استاندارد و سکه‌های بانکی با فاکتور و شناسه یکتا',
      weight: coinData.weight,
      image: '/images/products/coin_bullion.jpg'
    },
    {
      key: 'pendant',
      type: 'pendant',
      name: 'آویز و پلاک',
      count: pendantData.count,
      desc: 'پلاک‌های اسمی، حروف، طرح قلب و آویزهای مینیاتوری ظریف با طناب ابریشمی یا طلا',
      weight: pendantData.weight,
      image: '/images/products/pendant_medallion.jpg'
    },
    {
      key: 'men',
      type: 'all',
      name: 'محصولات مردانه',
      count: menData.count,
      desc: 'دستبندهای چرم و طلا، انگشترهای عقیق و رینگ‌های مردانه سنگین با عیار ۷۵۰ استاندارد',
      weight: menData.weight,
      image: '/images/products/men_jewelry.jpg'
    },
    {
      key: 'kids',
      type: 'all',
      name: 'محصولات بچگانه',
      count: kidsData.count,
      desc: 'گوشواره‌های میخی ایمن، دستبند زنجیری نوزادی و پلاک‌های کارتونی ضدحساسیت',
      weight: kidsData.weight,
      image: '/images/products/kids_jewelry.jpg'
    },
    {
      key: 'economic',
      type: 'all',
      name: 'محصولات کم‌اجرت',
      count: economicData.count,
      desc: 'طلاهای مینیمال با کمترین درصد اجرت کارگاهی، مناسب سرمایه‌گذاری و پس‌انداز هوشمندانه',
      weight: economicData.weight,
      image: '/images/products/low_wage_economic.jpg'
    }
  ];

  // Requirement: 6 Comprehensive FAQs with factual transparency
  const faqs = [
    {
      q: 'چگونه قیمت طلا محاسبه می‌شود؟',
      a: 'فرمول قیمت‌گذاری در میوان کاملاً مستقیم، شفاف و بدون هیچ‌گونه حباب واسطه‌ای محاسبه می‌شود:\nقیمت نهایی = ارزش طلای خام (وزن × نرخ روز گرم طلای ۱۸ عیار) + اجرت ساخت کارگاه + سود مصوب قانونی فروشنده (۷٪) + مالیات بر ارزش افزوده (۱۰٪ منحصراً بر مجموع اجرت و سود).\nتمام این مقادیر در کادر بازشوی «مشاهده جزئیات قیمت» در هر محصول و در پیش‌فاکتور رسمی به‌صورت ریالی و تفکیک‌شده نمایش داده می‌شوند.'
    },
    {
      q: 'آیا مالیات پرداخت می‌کنم؟',
      a: 'طبق اصلاحیه رسمی قانون مالیات بر ارزش افزوده، اصل ارزش طلا (طلای خام) ۱۰۰٪ معاف از هرگونه مالیات است. مالیات بر ارزش افزوده قانونی (۱۰٪) منحصراً بر روی «مجموع اجرت ساخت کارگاه و سود مصوب فروشنده» محاسبه می‌گردد؛ بنابراین شما بابت وزن خالص طلای خود حتی یک ریال مالیات پرداخت نمی‌کنید.'
    },
    {
      q: 'شرایط بازگشت وجه چیست؟',
      a: 'میوان ضمانت تعویض و بازگشت ۷ روزه را ارائه می‌دهد. در صورت وجود هرگونه مغایرت وزن یا مشخصات با فاکتور، ۱۰۰٪ وجه بدون کسر هیچ هزینه‌ای عودت می‌گردد. در صورت انصراف سلیقه‌ای، طلای استفاده‌نشده با پلمپ امنیتی سالم ظرف ۷ روز تقویمی پذیرش شده و اصل ارزش طلای خام به نرخ روز تسویه مسترد می‌گردد. برای آگاهی از ضوابط کامل و مراحل عودت، صفحه «شرایط بازگشت وجه» را مطالعه فرمایید.'
    },
    {
      q: 'ارسال به شهرستان چقدر طول می‌کشد؟',
      a: 'تمامی مرسولات پستی میوان از طریق پست پیشتاز ویژه امنیتی یا تیپاکس هوایی با پوشش کامل بیمه ۱۰۰٪ سقف ارزش طلا ارسال می‌شوند و بین ۲۴ تا ۷۲ ساعت کاری در سراسر کشور تحویل خریدار می‌گردند. در شهر یزد نیز امکان تحویل حضوری در شوروم بازار خان یا ارسال با پیک اختصاصی در همان روز سفارش وجود دارد.'
    },
    {
      q: 'آیا فاکتور رسمی اتحادیه داده می‌شود؟',
      a: 'بله، تمامی سفارش‌های میوان همراه با فاکتور چاپی رسمی، دارای هولوگرام امنیتی و مهر صنف طلا و جواهر صادر می‌شوند. این فاکتور شامل وزن دقیق با ترازوی سه صفر کالیبره‌شده، عیار استاندارد ۷۵۰ (۱۸ عیار)، کد کارگاه زرگری یزد، تفکیک ریالی اجرت و سود و بارکد اختصاصی سامانه تجارت است که سند رسمی و قانونی مالکیت شما در سراسر کشور محسوب می‌شود.'
    },
    {
      q: 'چرا قیمت دو محصول با وزن یکسان متفاوت است؟',
      a: 'تفاوت قیمت در دو محصول هم‌وزن، دقیقاً ناشی از «درصد اجرت ساخت» و «حضور سنگ یا نگین» است. قطعاتی که حاصل دست‌ورزی استادکاران زرگر یزد، تراش‌های اسلیمی، یا تکنیک‌های پیچیده فیوژن هستند، اجرت ساخت متفاوتی نسبت به کارهای تراش ماشینی ساده دارند. همچنین ارزش سنگ‌های قیمتی به‌صورت جداگانه در شناسنامه درج شده و به قیمت پایه طلا افزوده می‌شود. اجرت ساخت هر محصول به‌صورت جداگانه روی کارت آن درج شده است.'
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
                  <span>بیش از ۵۰۰ قطعه جواهر دست‌ساز از یزد تا تمام ایران</span>
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

            {/* Right Col: Macro Gold Jewelry Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 shadow-2xl bg-[#14101A] group">
                <picture>
                  <source srcSet="/images/hero_macro_gold.webp" type="image/webp" />
                  <source srcSet="/images/hero.webp" type="image/webp" />
                  <img
                    src="/images/hero_macro_gold.webp"
                    alt="مجموعه شاهکار طلای ۱۸ عیار دست‌ساز میوان بر بستر سنگ تیره"
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('hero.jpg')) {
                        target.src = '/images/hero.jpg';
                      } else {
                        target.onerror = null;
                        target.src = '/images/products/signature_gold_set_1791741211906.jpg';
                      }
                    }}
                    className="w-full h-auto object-cover aspect-[16/9] lg:aspect-auto transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B080F]/85 via-[#0B080F]/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 right-4 left-4 p-3.5 bg-[#0B080F]/90 backdrop-blur-md rounded-xl border border-[#D4AF37]/25 flex items-center justify-between">
                  <div className="text-right">
                    <span className="text-[10px] text-[#D4AF37] block font-serif-luxury tracking-wider">MEYVAN SIGNATURE</span>
                    <span className="text-xs text-white font-medium">دستبند شاهکار طلای ۱۸ عیار با مروارید باروک</span>
                  </div>
                  <Link
                    to="/catalog"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to={`/catalog?category=${cat.key}&type=${cat.type}`}
              className="group relative bg-white rounded-2xl border border-[#0B080F]/5 hover:border-[#D4AF37]/60 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Category Image with dark subtle gradient overlay */}
              <div className="relative aspect-[16/11] w-full bg-[#14101A] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  width={400}
                  height={275}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                {/* Weight badge (top left) */}
                <span className="absolute top-2.5 left-2.5 bg-[#0B080F]/80 backdrop-blur-md text-[#D4AF37] text-[10px] font-numeral px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                  {cat.weight}
                </span>

                {/* Product Count badge (top right) */}
                <span className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white/90 text-[10px] font-numeral px-2 py-0.5 rounded-full border border-white/20">
                  {toPersianDigits(cat.count)} محصول
                </span>

                <div className="absolute bottom-2.5 right-3 text-right">
                  <h3 className="text-lg font-bold text-white drop-shadow-md">
                    {cat.name}
                  </h3>
                </div>
              </div>

              {/* Description & Action */}
              <div className="p-4 flex flex-col flex-1 justify-between bg-white text-right">
                <p className="text-[11px] text-[#A89B8A] leading-relaxed mb-3 line-clamp-2">
                  {cat.desc}
                </p>

                <div className="pt-2.5 border-t border-[#0B080F]/5 flex items-center justify-between text-xs font-semibold text-[#0B080F]">
                  <span className="group-hover:text-[#D4AF37] transition-colors text-[11px]">
                    مشاهده کالکشن ({toPersianDigits(cat.count)})
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-[#A89B8A] group-hover:text-[#D4AF37] group-hover:-translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
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
                  src="/images/craft.jpg"
                  alt="استادکار زرگر در کارگاه سنتی یزد"
                  width={600}
                  height={450}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = '/images/products/craft_goldsmith.jpg';
                  }}
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
                    <h4 className="text-sm font-semibold text-white">شفافیت کامل مالیاتی و قانونی (۱۰٪)</h4>
                    <p className="text-xs text-white/50 leading-relaxed">رعایت دقیق اصلاحیه قانون مالیات طلا؛ اصل ارزش طلا ۱۰۰٪ معاف از مالیات بوده و نرخ قانونی مالیات ۱۰٪ منحصراً بر مجموع اجرت ساخت و سود متعلقه محاسبه می‌شود.</p>
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
                  src="/images/packaging.jpg"
                  alt="جعبه لوکس بسته‌بندی میوان و شناسنامه رسمی طلا"
                  width={500}
                  height={375}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = '/images/products/luxury_packaging.jpg';
                  }}
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

        {/* Requirement 4: Direct Link to Returns Policy Page */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-[#D4AF37]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#0B080F]">
              نیاز به راهنمایی بیشتر درباره قوانین و رویه مرجوعی دارید؟
            </h3>
            <p className="text-xs text-[#A89B8A] leading-relaxed">
              مشاهده جزئیات کامل ضمانت ۷ روزه، الزامات سلامت پلمپ سربی، مراحل هماهنگی و شیوه بازپرداخت وجه.
            </p>
          </div>
          <Link
            to="/returns"
            className="shrink-0 px-5 py-2.5 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 group"
          >
            <span>مطالعه شرایط بازگشت وجه</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};
