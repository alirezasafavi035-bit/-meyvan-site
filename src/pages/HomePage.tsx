import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

interface HomePageProps {
  products: Product[];
}

export const HomePage: React.FC<HomePageProps> = ({ products }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t, formatNum, formatGrams, language, dir } = useLanguage();

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  // Helper to dynamically calculate real statistics from products array
  const getCatData = (filterFn: (p: Product) => boolean) => {
    const matching = products.filter(filterFn);
    const count = matching.length;
    if (count === 0) return { count: 0, weight: '—' };
    const weights = matching.map((p) => p.weightGrams);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const weight =
      minW === maxW
        ? formatGrams(minW)
        : language === 'fa'
        ? `${formatGrams(minW)} تا ${formatGrams(maxW)}`
        : `${minW.toFixed(1)} to ${maxW.toFixed(1)} g`;
    return { count, weight };
  };

  const earringsData = getCatData((p) => p.category === 'earrings' || p.type === 'earrings');
  const ringData = getCatData((p) => p.category === 'ring' || p.type === 'ring');
  const necklaceData = getCatData((p) => p.category === 'necklace' || p.type === 'necklace');
  const braceletData = getCatData(
    (p) => p.category === 'bracelet' || p.type === 'bracelet' || p.type === 'bangle' || p.type === 'anklet'
  );
  const setData = getCatData((p) => p.category === 'set' || p.type === 'set' || p.type === 'half_set');
  const coinData = getCatData((p) => p.category === 'coin' || p.type === 'coin' || p.type === 'bullion');
  const pendantData = getCatData((p) => p.category === 'pendant' || p.type === 'pendant');
  const womenData = getCatData(
    (p) =>
      p.category === 'women' ||
      (!['men', 'kids', 'coin'].includes(p.category) &&
        !p.tags.includes('مردانه') &&
        !p.tags.includes('کودک') &&
        !p.tags.includes('بچگانه') &&
        !p.tags.includes('نوزادی') &&
        !p.name.includes('مردانه') &&
        !p.name.includes('کودک') &&
        !p.name.includes('نوزاد'))
  );
  const menData = getCatData((p) => p.category === 'men' || p.tags.includes('مردانه') || p.name.includes('مردانه'));
  const kidsData = getCatData((p) => p.category === 'kids' || p.tags.includes('کودک') || p.tags.includes('بچگانه') || p.tags.includes('نوزادی') || p.name.includes('کودک') || p.name.includes('نوزاد'));
  const economicData = getCatData((p) => p.category === 'economic' || p.wagePercent <= 0.12 || p.tags.includes('کم‌اجرت'));

  // Specialized categories with verified distinct images
  const categories = [
    {
      key: 'women',
      type: 'all',
      name: t('cat.women'),
      count: womenData.count,
      desc: t('cat.desc.women'),
      weight: womenData.weight,
      image: '/images/products/women_solitaire_diamond_ring.jpg'
    },
    {
      key: 'earrings',
      type: 'earrings',
      name: t('cat.earrings'),
      count: earringsData.count,
      desc: t('cat.desc.earrings'),
      weight: earringsData.weight,
      image: '/images/products/earrings_stud.jpg'
    },
    {
      key: 'ring',
      type: 'ring',
      name: t('cat.ring'),
      count: ringData.count,
      desc: t('cat.desc.ring'),
      weight: ringData.weight,
      image: '/images/products/gold_ring_luxury_1791946268061.jpg'
    },
    {
      key: 'necklace',
      type: 'necklace',
      name: t('cat.necklace'),
      count: necklaceData.count,
      desc: t('cat.desc.necklace'),
      weight: necklaceData.weight,
      image: '/images/products/gold_necklace_pendant_1791946268677.jpg'
    },
    {
      key: 'bracelet',
      type: 'bracelet',
      name: t('cat.bracelet'),
      count: braceletData.count,
      desc: t('cat.desc.bracelet'),
      weight: braceletData.weight,
      image: '/images/products/gold_bracelet_bangle_1791946279045.jpg'
    },
    {
      key: 'set',
      type: 'set',
      name: t('cat.set'),
      count: setData.count,
      desc: t('cat.desc.set'),
      weight: setData.weight,
      image: '/images/products/gold_bridal_set_suite_1791946299635.jpg'
    },
    {
      key: 'coin',
      type: 'coin',
      name: t('cat.coin'),
      count: coinData.count,
      desc: t('cat.desc.coin'),
      weight: coinData.weight,
      image: '/images/products/coin_bullion.jpg'
    },
    {
      key: 'pendant',
      type: 'pendant',
      name: t('cat.pendant'),
      count: pendantData.count,
      desc: t('cat.desc.pendant'),
      weight: pendantData.weight,
      image: '/images/products/pendant_medallion.jpg'
    },
    {
      key: 'men',
      type: 'all',
      name: t('cat.men'),
      count: menData.count,
      desc: t('cat.desc.men'),
      weight: menData.weight,
      image: '/images/products/men_gold_signet_onyx.jpg'
    },
    {
      key: 'kids',
      type: 'all',
      name: t('cat.kids'),
      count: kidsData.count,
      desc: t('cat.desc.kids'),
      weight: kidsData.weight,
      image: '/images/products/kids_baby_pin_gold.jpg'
    },
    {
      key: 'economic',
      type: 'all',
      name: t('cat.economic'),
      count: economicData.count,
      desc: t('cat.desc.economic'),
      weight: economicData.weight,
      image: '/images/products/low_wage_economic.jpg'
    }
  ];

  // Bilingual FAQs
  const faqs = language === 'fa' ? [
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
      a: 'میوان ضمانت تعویض و بازگشت ۷ روزه را ارائه می‌دهد. در صورت وجود هرگونه مغایرت وزن یا مشخصات با فاکتور، ۱۰۰٪ وجه بدون کسر هیچ هزینه‌ای عودت می‌گردد. در صورت انصراف سلیقه‌ای، طلای استفاده‌نشده با پلمپ امنیتی سالم ظرف ۷ روز تقویمی پذیرش شده و اصل ارزش طلای خام به نرخ روز تسویه مسترد می‌گردد.'
    },
    {
      q: 'ارسال به شهرستان چقدر طول می‌کشد؟',
      a: 'تمامی مرسولات پستی میوان از طریق پست پیشتاز ویژه امنیتی یا تیپاکس هوایی با پوشش کامل بیمه ۱۰۰٪ سقف ارزش طلا ارسال می‌شوند و بین ۲۴ تا ۷۲ ساعت کاری در سراسر کشور تحویل خریدار می‌گردند. در شهر یزد نیز امکان تحویل حضوری در شوروم بازار خان یا ارسال با پیک اختصاصی وجود دارد.'
    },
    {
      q: 'آیا فاکتور رسمی اتحادیه داده می‌شود؟',
      a: 'بله، تمامی سفارش‌های میوان همراه با فاکتور چاپی رسمی، دارای هولوگرام امنیتی و مهر صنف طلا و جواهر صادر می‌شوند. این فاکتور شامل وزن دقیق با ترازوی سه صفر کالیبره‌شده، عیار استاندارد ۷۵۰ (۱۸ عیار)، کد کارگاه زرگری یزد، تفکیک ریالی اجرت و سود و بارکد اختصاصی است.'
    },
    {
      q: 'چرا قیمت دو محصول با وزن یکسان متفاوت است؟',
      a: 'تفاوت قیمت در دو محصول هم‌وزن، دقیقاً ناشی از «درصد اجرت ساخت» و «حضور سنگ یا نگین» است. قطعاتی که حاصل دست‌ورزی استادکاران زرگر یزد، تراش‌های اسلیمی، یا تکنیک‌های پیچیده فیوژن هستند، اجرت ساخت متفاوتی نسبت به کارهای تراش ماشینی ساده دارند.'
    }
  ] : [
    {
      q: 'How is the final gold price calculated?',
      a: 'At Meyvan, our pricing formula is 100% direct, transparent, and strictly compliant with official Iranian Gold Union regulations:\nFinal Price = Raw Gold Value (calibrated weight × 18K daily rate) + Workshop Making Wage + Legal Retail Profit (7%) + Value Added Tax (10% strictly on wage + profit).\nAll components are itemized on every product card and on the official stamped pre-invoice.'
    },
    {
      q: 'Do I pay taxes on the raw gold?',
      a: 'No. Under the official Iranian Value Added Tax reform, raw gold bullion and precious metals are 100% tax-exempt. The statutory 10% VAT applies strictly to the sum of the workshop making charge and seller profit. You never pay a single cent of tax on the raw gold weight itself.'
    },
    {
      q: 'What are the return and exchange conditions?',
      a: 'Meyvan offers a verified 7-day exchange and return policy. In case of any specification discrepancy with your official invoice, 100% of your payment is refunded immediately without deduction. For change of mind, undamaged jewelry with an intact tamper-evident security seal is accepted within 7 calendar days.'
    },
    {
      q: 'How long does nationwide shipping take?',
      a: 'All orders are dispatched via secure express mail or armored courier with full 100% insurance coverage. Deliveries typically arrive within 24 to 72 business hours anywhere across Iran. Same-day courier delivery or boutique pickup is also available at our Central Showroom in Khan Bazaar, Yazd.'
    },
    {
      q: 'Do you provide an official stamped Union invoice?',
      a: 'Yes. Every order is delivered with a stamped official invoice featuring a holographic security seal, verified 3-decimal calibrated weight, 750 (18 Karat) purity standard stamp, workshop registration code, and itemized financial breakdown.'
    },
    {
      q: 'Why do two items of identical weight have different prices?',
      a: 'Price variations between items of identical weight stem solely from workshop labor intricacy (making wage percentage) and whether certified gemstones are incorporated. Hand-carved Yazdi filigree pieces involve higher artisanal mastery than simple machine-cut bands.'
    }
  ];

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Hero Section */}
      <section className="relative bg-[#0B080F] text-white overflow-hidden border-b border-[#D4AF37]/20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Main Col: Headline & Brand Taglines */}
            <div className="lg:col-span-7 space-y-6 text-start">
              {/* Subtle Kicker with Brand Emblem */}
              <div className="flex items-center gap-3">
                <img
                  src="/logo.svg"
                  alt="Meyvan Gold & Jewelry Emblem"
                  className="w-10 h-10 object-contain filter drop-shadow-md"
                />
                <div className="inline-flex items-center gap-2 text-xs font-serif-luxury tracking-[0.25em] text-[#D4AF37] uppercase">
                  <span className="w-6 h-px bg-[#D4AF37]" />
                  <span>{t('hero.kicker')}</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury font-bold leading-tight sm:leading-tight text-white">
                {t('hero.title_pre')} <br className="hidden sm:inline" />
                <span className="gold-gradient-text">{t('hero.title_gold')}...</span>
              </h1>

              {/* Body Prose */}
              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xl">
                {t('hero.subtitle')}
              </p>

              {/* CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/catalog"
                  className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#E5C358] text-[#0B080F] font-bold text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/20 flex items-center gap-2 group active:scale-95"
                >
                  <span>{t('hero.cta_catalog')}</span>
                  <ArrowIcon className="w-4 h-4 group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/about"
                  className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/90 border border-white/20 hover:border-[#D4AF37]/60 font-medium text-sm rounded-xl transition-all"
                >
                  {t('hero.cta_about')}
                </Link>
              </div>

              {/* Stat badges */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="block font-bold text-[#D4AF37] text-sm sm:text-base font-numeral">
                    {t('hero.stat_karat')}
                  </span>
                  <span className="text-white/50 text-[11px]">{t('hero.stat_karat_desc')}</span>
                </div>
                <div>
                  <span className="block font-bold text-[#D4AF37] text-sm sm:text-base font-numeral">
                    {t('hero.stat_transparency')}
                  </span>
                  <span className="text-white/50 text-[11px]">{t('hero.stat_transparency_desc')}</span>
                </div>
                <div>
                  <span className="block font-bold text-[#D4AF37] text-sm sm:text-base font-numeral">
                    {t('hero.stat_guarantee')}
                  </span>
                  <span className="text-white/50 text-[11px]">{t('hero.stat_guarantee_desc')}</span>
                </div>
              </div>
            </div>

            {/* Visual Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 shadow-2xl bg-[#14101A] group">
                <picture>
                  <source srcSet="/images/hero_macro_gold.webp" type="image/webp" />
                  <source srcSet="/images/hero.webp" type="image/webp" />
                  <img
                    src="/images/hero_macro_gold.webp"
                    alt="Meyvan Fine 18K Gold Masterpieces"
                    width={640}
                    height={360}
                    fetchPriority="high"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = '/images/hero.webp';
                    }}
                    className="w-full h-auto object-cover aspect-[16/9] transition-transform duration-700 group-hover:scale-105"
                  />
                </picture>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B080F]/90 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#0B080F]/80 backdrop-blur-md border border-[#D4AF37]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-semibold text-white tracking-wide">
                      {language === 'fa' ? 'دست‌ساز زرگران سنتی یزد' : 'Handcrafted by Yazdi Goldsmith Masters'}
                    </span>
                  </div>
                  <span className="text-[#D4AF37] font-numeral font-bold">
                    {language === 'fa' ? 'عیار ۷۵۰ استاندارد' : '750 Standard Purity'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Specialized Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block">
            COLLECTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F]">
            {t('categories.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#A89B8A] leading-relaxed">
            {t('categories.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to={`/catalog?category=${cat.key}&type=${cat.type}`}
              className="group relative bg-white border border-[#0B080F]/5 rounded-2xl overflow-hidden hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-[#14101A] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  width={300}
                  height={300}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2.5 right-2.5 ltr:right-auto ltr:left-2.5 bg-black/60 backdrop-blur-md text-[#D4AF37] text-[10px] font-semibold px-2 py-0.5 rounded-full font-numeral">
                  {formatNum(cat.count)} {language === 'fa' ? 'طرح' : 'items'}
                </span>
              </div>

              <div className="p-3.5 space-y-1.5 text-start flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0B080F] group-hover:text-[#997D24] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#A89B8A] line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 font-numeral">
                  <span>{language === 'fa' ? 'بازه وزنی:' : 'Weight:'}</span>
                  <span className="font-semibold text-[#0B080F]">{cat.weight}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Best Sellers / Featured Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block mb-1">
              {t('bestsellers.tag')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F]">
              {t('bestsellers.title')}
            </h2>
          </div>
          <Link
            to="/catalog?sortBy=bestseller"
            className="text-xs font-semibold text-[#0B080F] hover:text-[#D4AF37] flex items-center gap-1"
          >
            <span>{t('bestsellers.view_all')}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Brand Philosophy & Yazd Goldsmithing Heritage */}
      <section className="bg-[#0B080F] text-white py-16 sm:py-24 border-y border-[#D4AF37]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual: Yazd Goldsmith Workshop */}
            <div className="lg:col-span-5 relative order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl bg-[#14101A]">
                <img
                  src="/images/craft.jpg"
                  alt="Yazd Goldsmith Workshop"
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
              <div className="absolute -bottom-4 -right-4 ltr:-right-auto ltr:-left-4 p-4 bg-[#14101A] border border-[#D4AF37]/40 rounded-xl text-xs text-[#D4AF37] shadow-xl hidden sm:block">
                {t('philosophy.badge')}
              </div>
            </div>

            {/* Content: Pillars */}
            <div className="lg:col-span-7 space-y-6 text-start order-1 lg:order-2">
              <span className="text-xs font-serif-luxury tracking-[0.25em] text-[#D4AF37] uppercase block">
                {t('philosophy.tag')}
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white">
                {t('philosophy.title')}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                {t('philosophy.subtitle')}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{t('philosophy.p1.title')}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">{t('philosophy.p1.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{t('philosophy.p2.title')}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">{t('philosophy.p2.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{t('philosophy.p3.title')}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">{t('philosophy.p3.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{t('philosophy.p4.title')}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">{t('philosophy.p4.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Packaging & Certificate of Authenticity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#0B080F]/5 overflow-hidden shadow-xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5 text-start">
              <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block">
                {t('packaging.tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F]">
                {t('packaging.title')}
              </h2>
              <p className="text-xs sm:text-sm text-[#A89B8A] leading-relaxed">
                {t('packaging.desc')}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-neutral-200/60">
                  <span className="font-semibold text-[#0B080F] block mb-1">{t('packaging.card1.title')}</span>
                  <span className="text-[#A89B8A]">{t('packaging.card1.desc')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-neutral-200/60">
                  <span className="font-semibold text-[#0B080F] block mb-1">{t('packaging.card2.title')}</span>
                  <span className="text-[#A89B8A]">{t('packaging.card2.desc')}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md">
                <img
                  src="/images/packaging.jpg"
                  alt="Meyvan Luxury Packaging and Authenticity Certificate"
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

      {/* 6. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center mb-10">
          <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block mb-1">
            {t('faq.tag')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F]">
            {t('faq.title')}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#0B080F]/5 overflow-hidden transition-all text-start"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-start flex items-center justify-between gap-4 font-semibold text-sm text-[#0B080F] hover:text-[#997D24] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#A89B8A] transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#D4AF37]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#A89B8A] leading-relaxed border-t border-[#0B080F]/5 whitespace-pre-line">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Direct Link to Returns Policy Page */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-[#D4AF37]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-start">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#0B080F]">
              {t('faq.returns_box.title')}
            </h3>
            <p className="text-xs text-[#A89B8A] leading-relaxed">
              {t('faq.returns_box.desc')}
            </p>
          </div>
          <Link
            to="/returns"
            className="shrink-0 px-5 py-2.5 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 group"
          >
            <span>{t('faq.returns_box.btn')}</span>
            <ArrowIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};
