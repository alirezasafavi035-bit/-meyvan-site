import React, { createContext, useContext, useState, useEffect } from 'react';
import { toPersianDigits, formatToman, formatWeight } from '../utils/persian';
import { Product } from '../types';

export type Language = 'fa' | 'en';

interface LanguageContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatPrice: (amountTomans: number) => string;
  formatGrams: (grams: number) => string;
  formatNum: (num: number | string) => string;
  getProductName: (product: Product) => string;
  getProductDesc: (product: Product) => string;
  getCategoryTitle: (catKey: string) => string;
  getTypeTitle: (typeKey: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fa: {
    // Nav & Brand
    'nav.home': 'صفحه اصلی',
    'nav.catalog': 'محصولات و کالکشن',
    'nav.about': 'اصالت و داستان میوان',
    'nav.returns': 'شرایط بازگشت وجه',
    'nav.contact': 'شعب و ارتباط',
    'nav.search': 'جستجو',
    'nav.wishlist': 'لیست علاقه‌مندی‌ها',
    'nav.cart': 'سبد خرید',
    'top_motto': 'بیش از ۵۰۰ قطعه جواهر دست‌ساز از یزد تا تمام ایران',

    // Gold Ticker
    'ticker.rate_label': 'نرخ مبنای هر گرم طلای ۱۸ عیار (۷۵۰):',
    'ticker.tgju_badge': 'نرخ معتبر از TGJU',
    'ticker.last_update': 'آخرین به‌روزرسانی:',
    'ticker.formula_settings': 'پیکربندی و شفافیت فرمول',
    'ticker.tax_note': 'مالیات ۱۰٪ فقط بر اجرت و سود',
    'ticker.refresh_title': 'بروزرسانی نرخ طلا',

    // Hero Section
    'hero.badge': 'بیش از ۵۰۰ قطعه جواهر دست‌ساز از یزد تا تمام ایران',
    'hero.kicker': 'اصالت، شفافیت و هنر ماندگار',
    'hero.title_pre': 'درخشش،',
    'hero.title_gold': 'حق انتخاب توست',
    'hero.subtitle': 'خرید آنلاین طلا و جواهر دست‌ساز ۱۸ عیار از مهد زرگری یزد با محاسبه لحظه‌ای فرمول مصوب اتحادیه، فاکتور معتبر و شناسنامه اختصاصی.',
    'hero.cta_catalog': 'مشاهده کاتالوگ و محصولات',
    'hero.cta_about': 'داستان زرگری یزد',
    'hero.stat_karat': '۱۸ عیار (۷۵۰)',
    'hero.stat_karat_desc': 'خلوص استاندارد طلای ایران',
    'hero.stat_transparency': '۱۰۰٪ شفافیت',
    'hero.stat_transparency_desc': 'تفکیک اجرت، سود و مالیات',
    'hero.stat_guarantee': '۷ روز تعویض',
    'hero.stat_guarantee_desc': 'با تضمین اصالت و سلامت',

    // Categories
    'categories.title': 'کالکشن‌های تخصصی طلا و جواهر',
    'categories.subtitle': '۱۰ دسته‌بندی متمایز با طراحی معاصر و دست‌سازهای اصیل استادکاران یزد',
    'categories.view_collection': 'مشاهده کالکشن',

    // Category names
    'cat.earrings': 'گوشواره',
    'cat.ring': 'انگشتر',
    'cat.necklace': 'گردنبند',
    'cat.bracelet': 'دستبند و النگو',
    'cat.set': 'نیم‌ست و سرویس',
    'cat.coin': 'سکه و شمش',
    'cat.pendant': 'آویز و پلاک',
    'cat.men': 'محصولات مردانه',
    'cat.kids': 'محصولات بچگانه',
    'cat.economic': 'محصولات کم‌اجرت',

    // Category descriptions
    'cat.desc.earrings': 'انواع گوشواره‌های میخی، آویز و مجلسی ۱۸ عیار با قفل استاندارد و مطمئن',
    'cat.desc.ring': 'انگشترهای فاخر، پورتوفینو، رینگ‌های مینیمال و تراش‌های اصیل سنتی',
    'cat.desc.necklace': 'گردنبندهای کارتیه، رولباسی، زنجیرهای ونزی و مدال‌های اسلیمی یزد',
    'cat.desc.bracelet': 'النگو، تک‌پوش، بنگل و دستبندهای تراش‌خورده با بالاترین دوام فیزیکی',
    'cat.desc.set': 'مجموعه‌های هماهنگ گردنبند، گوشواره و دستبند برای مجالس و هدایا',
    'cat.desc.coin': 'شمش‌های سرمایه‌گذاری استاندارد و سکه‌های بانکی با فاکتور و شناسه یکتا',
    'cat.desc.pendant': 'پلاک‌های اسمی، حروف، طرح قلب و آویزهای مینیاتوری ظریف با طناب ابریشمی یا طلا',
    'cat.desc.men': 'دستبندهای چرم و طلا، انگشترهای عقیق و رینگ‌های مردانه سنگین با عیار ۷۵۰ استاندارد',
    'cat.desc.kids': 'گوشواره‌های میخی ایمن، دستبند زنجیری نوزادی و پلاک‌های کارتونی ضدحساسیت',
    'cat.desc.economic': 'طلاهای مینیمال با کمترین درصد اجرت کارگاهی، مناسب سرمایه‌گذاری و پس‌انداز هوشمندانه',

    // Bestsellers
    'bestsellers.tag': 'منتخب مشتریان',
    'bestsellers.title': 'پرفروش‌ترین‌های منتخب',
    'bestsellers.view_all': 'مشاهده همه پرفروش‌ها',

    // Philosophy
    'philosophy.tag': 'فلسفه و اصالت',
    'philosophy.title': 'فلسفه میوان: بیشتر از یک جواهر',
    'philosophy.subtitle': 'طلا تنها یک فلز گرانبها نیست؛ پیوندی میان هنر، احساس و سرمایه‌گذاری هوشمندانه است. ما در میوان بر ۵ اصل تزلزل‌ناپذیر پایبندیم:',
    'philosophy.badge': '«یزد؛ پایتخت اصالت زرگری ایران»',
    'philosophy.p1.title': 'انتخاب آگاهانه',
    'philosophy.p1.desc': 'دسترسی به مشخصات کامل، وزن میلی‌گرمی و تفکیک اجرت برای خریدی با چشمان باز.',
    'philosophy.p2.title': 'اصالت و زرگری یزد',
    'philosophy.p2.desc': 'هنر دست استادکاران نام‌آور یزد با خلوص دقیق عیار ۷۵۰ (۱۸ عیار) و استانداردهای ملی.',
    'philosophy.p3.title': 'شفافیت کامل مالیاتی و قانونی (۱۰٪)',
    'philosophy.p3.desc': 'رعایت دقیق اصلاحیه قانون مالیات طلا؛ اصل ارزش طلا ۱۰۰٪ معاف از مالیات بوده و نرخ قانونی مالیات ۱۰٪ منحصراً بر مجموع اجرت ساخت و سود متعلقه محاسبه می‌شود.',
    'philosophy.p4.title': 'زیبایی ماندگار و جاودان',
    'philosophy.p4.desc': 'طرح‌هایی که فراتر از مدهای گذرا، سال‌ها همراه لحظات درخشان شما باقی می‌مانند.',

    // Packaging
    'packaging.tag': 'اصالت و بسته‌بندی',
    'packaging.title': 'بسته‌بندی فاخر، شناسنامه هولوگرام‌دار و فاکتور رسمی',
    'packaging.desc': 'هر خرید از میوان در جعبه اختصاصی لوکس مشکی-طلایی همراه با شناسنامه معتبر حاوی شماره سریال یکتا، بارکد اصالت، فاکتور مهرشده رسمی اتحادیه و کارت ضمانت عیار تقدیم شما می‌شود تا در هر کجای ایران قابل بازفروش یا تعویض باشد.',
    'packaging.card1.title': 'شناسنامه محصول',
    'packaging.card1.desc': 'شامل وزن دقیق، عیار، ابعاد و مشخصات نگین',
    'packaging.card2.title': 'بسته‌بندی هدیه',
    'packaging.card2.desc': 'جعبه مخمل لوکس با روبان و بگ اختصاصی میوان',

    // FAQ
    'faq.tag': 'پرسش‌های متداول',
    'faq.title': 'پرسش‌های متداول شما درباره خرید طلا',
    'faq.returns_box.title': 'نیاز به راهنمایی بیشتر درباره قوانین و رویه مرجوعی دارید؟',
    'faq.returns_box.desc': 'مشاهده جزئیات کامل ضمانت ۷ روزه، الزامات سلامت پلمپ سربی، مراحل هماهنگی و شیوه بازپرداخت وجه.',
    'faq.returns_box.btn': 'مطالعه شرایط بازگشت وجه',

    // Catalog Page
    'catalog.title': 'کاتالوگ طلا و جواهر میوان',
    'catalog.count_summary': 'نمایش {count} قطعه طلا از مجموع {total} محصول دست‌ساز',
    'catalog.filter.category': 'کالکشن تخصصی',
    'catalog.filter.type': 'نوع زیورآلات',
    'catalog.filter.karat': 'عیار طلا',
    'catalog.filter.max_weight': 'حداکثر گرماژ (وزن):',
    'catalog.filter.in_stock': 'فقط کالاهای موجود در انبار',
    'catalog.filter.stone_all': 'همه محصولات (نگین‌دار و بی نگین)',
    'catalog.filter.with_stone': 'دارای نگین یا گوهرسنگ',
    'catalog.filter.no_stone': 'طلای خالص بدون نگین',
    'catalog.filter.reset': 'پاکسازی فیلترها',
    'catalog.filter.open_btn': 'فیلترهای پیشرفته',
    'catalog.search_placeholder': 'جستجوی نام طلا، کد کالا (SKU) یا ویژگی...',
    'catalog.load_more': 'نمایش محصولات بیشتر',
    'catalog.all_loaded': 'تمام محصولات با موفقیت نمایش داده شدند',

    // Sorting
    'sort.label': 'مرتب‌سازی بر اساس:',
    'sort.newest': 'جدیدترین‌ها',
    'sort.bestseller': 'پرفروش‌ترین و محبوب‌ترین',
    'sort.cheapest': 'ارزان‌ترین قیمت',
    'sort.expensive': 'گران‌ترین قیمت',
    'sort.lightest': 'سبک‌ترین گرماژ',
    'sort.heaviest': 'سنگین‌ترین گرماژ',

    // Product Card
    'card.quick_view': 'مشاهده جزئیات',
    'card.view_breakdown': 'مشاهده تفکیک قیمت اتحادیه',
    'card.close_breakdown': 'بستن تفکیک قیمت',
    'card.raw_gold': 'ارزش طلای خام:',
    'card.wage': 'اجرت ساخت:',
    'card.profit': 'سود قانونی (۷٪):',
    'card.vat': 'مالیات ارزش افزوده (۱۰٪ بر سود و اجرت):',
    'card.stone': 'بهای سنگ و نگین:',
    'card.total': 'قیمت نهایی مصوب:',
    'card.add_to_cart': 'افزودن به سبد',
    'card.in_stock': 'موجود در کارگاه',
    'card.sold_out': 'ناموجود / سفارش ساخت',

    // Product Detail Page
    'pdp.breadcrumb.home': 'خانه',
    'pdp.breadcrumb.catalog': 'کاتالوگ',
    'pdp.sku_label': 'کد شناسه انحصاری:',
    'pdp.karat_label': 'عیار استاندارد:',
    'pdp.weight_label': 'وزن طلای خام:',
    'pdp.wage_label': 'اجرت ساخت:',
    'pdp.gem_label': 'نگین و جواهر:',
    'pdp.gem_with': 'شناسنامه‌دار و اصیل',
    'pdp.gem_none': 'بدون نگین (طلای خالص)',
    'pdp.weight_module.title': 'انتخاب گرماژ موردنظر (سفارش در وزن دلخواه)',
    'pdp.weight_module.desc': 'این مدل قابلیت ساخت در گرماژهای مختلف را دارد. با تغییر اسلایدر یا وارد کردن عدد، ارزش طلای خام، اجرت، سود و مالیات ۱۰٪ فوراً تجدید محاسبه می‌شوند.',
    'pdp.weight_module.custom_badge': 'گرماژ سفارشی (قیمت تخمینی)',
    'pdp.weight_module.standard_badge': 'وزن استاندارد کاتالوگ (قطعی)',
    'pdp.weight_module.min': 'حداقل:',
    'pdp.weight_module.max': 'حداکثر:',
    'pdp.breakdown_title': 'تفکیک دقیق ریالی فرمول اتحادیه طلا',
    'pdp.breakdown_desc': 'محاسبه شفاف و برخط بدون هیچ‌گونه حباب واسطه‌ای',
    'pdp.raw_gold_formula': 'ارزش طلای خام ({weight} گرم × نرخ روز {rate}):',
    'pdp.wage_calc': 'اجرت ساخت کارگاهی (٪{wage}):',
    'pdp.profit_calc': 'سود فروشنده (۷٪ مصوب اتحادیه):',
    'pdp.vat_calc': 'مالیات بر ارزش افزوده (٪۱۰ منحصراً روی اجرت و سود):',
    'pdp.vat_exempt_note': '✓ اصل طلا معاف از مالیات است؛ مالیات ۱۰٪ فقط روی (اجرت ساخت + سود فروشنده) اعمال می‌شود.',
    'pdp.stone_calc': 'بهای سنگ و نگین‌های مخراجی‌شده:',
    'pdp.final_payable_label': 'قیمت نهایی قابل پرداخت:',
    'pdp.invoice_cta': 'مشاهده و چاپ پیش‌فاکتور رسمی این قطعه طلا',
    'pdp.add_btn': 'افزودن به سبد خرید',
    'pdp.add_btn_custom': 'افزودن با وزن {weight}',
    'pdp.whatsapp_btn': 'مشاوره و استعلام در واتساپ',
    'pdp.share_btn': 'اشتراک‌گذاری',
    'pdp.similar_title': 'محصولات مشابه در این کالکشن',

    // Cart & Checkout
    'cart.title': 'سبد خرید شما',
    'cart.item_count': '{count} قلم',
    'cart.timer_prefix': 'قفل قیمت معتبر تا:',
    'cart.timer_expired': 'زمان قفل قیمت به پایان رسید. نرخ طلا مجدداً محاسبه شد.',
    'cart.empty_title': 'سبد خرید شما خالی است',
    'cart.empty_desc': 'می‌توانید از بین بیش از ۵۰۰ قطعه طلای دست‌ساز، زیورآلات موردعلاقه خود را انتخاب کنید.',
    'cart.go_catalog': 'مشاهده و انتخاب طلا',
    'cart.remove': 'حذف',
    'cart.custom_weight_badge': 'وزن سفارشی',
    'cart.summary.weight': 'مجموع وزن خالص طلا:',
    'cart.summary.shipping': 'هزینه ارسال بیمه‌شده:',
    'cart.summary.shipping_free': 'رایگان (هدیه میوان)',
    'cart.summary.total': 'مبلغ نهایی قابل پرداخت:',
    'cart.checkout_btn': 'تکمیل خرید و پرداخت امن',
    'cart.print_invoice_btn': 'مشاهده و چاپ پیش‌فاکتور رسمی سبد',
    'cart.whatsapp_order': 'ثبت سفارش از طریق واتساپ',

    // Checkout Modal
    'checkout.title': 'مشخصات گیرنده و نهایی‌سازی سفارش',
    'checkout.subtitle': 'سفارش بدون نیاز به ثبت‌نام؛ مستقیماً به درگاه امن بانکی هدایت می‌شوید.',
    'checkout.field.name': 'نام و نام خانوادگی خریدار',
    'checkout.field.mobile': 'شماره موبایل (جهت پیامک رهگیری پستی)',
    'checkout.field.province': 'استان',
    'checkout.field.city': 'شهر',
    'checkout.field.postal': 'کد پستی ۱۰ رقمی',
    'checkout.field.address': 'آدرس کامل پستی تحویل مرسوله',
    'checkout.field.notes': 'توضیحات و درخواست‌های خاص (اختیاری)',
    'checkout.submit_btn': 'انتقال به درگاه پرداخت شاپرک',
    'checkout.cancel': 'انصراف و بازگشت',

    // Search Overlay
    'search.placeholder': 'جستجوی نام جواهر، مدل (کارتیه، ونکلیف)، کد محصول یا دسته‌بندی...',
    'search.cancel': 'انصراف',
    'search.popular_label': 'جستجوهای پرطرفدار طلا و جواهر:',
    'search.no_results': 'موردی مطابق با «{query}» یافت نشد.',
    'search.view_all': 'مشاهده همه نتایج برای «{query}» در فروشگاه',

    // About Page
    'about.badge': 'ABOUT MEYVAN · SINCE YAZD',
    'about.title': 'داستان میوان: از کهن‌دیار یزد، تا تمام ایران',
    'about.subtitle': '«ارزش، به انتخاب تو...» روایتی از پیوند سنت هزارساله زرگری یزد با نگاهی نو و مینیمال به دنیای طلا و جواهر.',
    'about.narrative.title': 'یزد؛ مهد عیارسنجی و زرگری اصیل ایران',
    'about.narrative.p1': 'شهر جهانی یزد در درازنای تاریخ همواره به عنوان پایتخت معتمدترین زرگران ایران شناخته شده است؛ جایی که عیار طلا با وسواسی اخلاقی و استانداردی بی‌نظیر سنجیده می‌شد. برند «میوان» زاده‌ی همین خاک و همین فرهنگ امانت‌داری است.',
    'about.narrative.p2': 'ما بر این باوریم که خرید طلا نباید همراه با سردرگمی، ابهام در فرمول‌های پیچیده یا عدم شفافیت باشد. به همین دلیل، در میوان هر تکه طلا با شناسنامه معتبر، محاسبه لحظه‌ای و تفکیک مو‌به‌موی اجرت و سود اتحادیه عرضه می‌شود.',
    'about.pillar1.title': 'طراحی معاصر و ارگونومیک',
    'about.pillar1.desc': 'محصولاتی سبک، ظریف و هماهنگ با سبک زندگی امروز برای استفاده آسوده روزمره.',
    'about.pillar2.title': 'شفافیت کامل در قیمت',
    'about.pillar2.desc': 'قیمت آنلاین با فرمول رسمی اتحادیه، وزن دقیق با دقت صدم گرم و بدون حباب.',
    'about.pillar3.title': 'فاکتور معتبر هولوگرام‌دار',
    'about.pillar3.desc': 'همراه با فاکتور رسمی اتحادیه طلا و امکان معامله و فروش در سراسر کشور.',
    'about.pillar4.title': 'ارسال بیمه‌شده سراسری',
    'about.pillar4.desc': 'پست پیشتاز با پوشش کامل بیمه ارزش طلا تا درب منزل شما در تمامی شهرهای ایران.',

    // Contact Page
    'contact.badge': 'CONTACT & SHOWROOM',
    'contact.title': 'ارتباط با شوروم و پشتیبانی میوان',
    'contact.subtitle': 'مشاوران تخصصی طلا و جواهر میوان در تمامی روزهای هفته آماده پاسخگویی به پرسش‌ها و راهنمایی شما هستند.',
    'contact.info.title': 'اطلاعات شوروم مرکزی',
    'contact.address.label': 'نشانی حضوری شوروم:',
    'contact.address.val': 'یزد، خیابان قیام، بازار خان، راسته زرگران و طلافروشان، پلاک ۱۰۴، گالری طلا و جواهر میوان',
    'contact.phone.label': 'تلفن‌های تماس:',
    'contact.hours.label': 'ساعات کاری:',
    'contact.hours.val': 'شنبه تا پنج‌شنبه: ۹:۰۰ الی ۱۳:۳۰ و ۱۷:۰۰ الی ۲۱:۳۰',
    'contact.whatsapp.label': 'واتساپ رسمی:',
    'contact.whatsapp.val': '۰۹۱۳۲۵۶۰۶۱۶ (پاسخگویی سریع)',
    'contact.form.title': 'ارسال پیام یا درخواست ساخت سفارشی',
    'contact.form.name': 'نام و نام خانوادگی',
    'contact.form.phone': 'شماره تماس',
    'contact.form.message': 'متن پیام یا توضیحات سفارش ساخت سفارشی',
    'contact.form.submit': 'ارسال پیام به مشاوران میوان',
    'contact.form.success_title': 'پیام شما با موفقیت ثبت شد',
    'contact.form.success_desc': 'کارشناسان میوان در کوتاه‌ترین زمان ممکن از طریق تماس یا پیامک با شما هماهنگ خواهند شد.',

    // Returns Page
    'returns.title': 'شرایط، قوانین و رویه کامل بازگشت وجه و تعویض طلا',
    'returns.subtitle': 'به‌روزرسانی: مهرماه ۱۴۰۵ — منطبق با ماده ۳۷ قانون تجارت الکترونیک و ضوابط رسمی اتحادیه طلا و جواهر',
    'returns.btn_catalog': 'مشاهده محصولات',
    'returns.p1.title': '۱. مهلت مجاز بازگشت',
    'returns.p1.desc': '۷ روز تقویمی از لحظه تحویل مرسوله پستی',
    'returns.p2.title': '۲. شرایط فیزیکی کالا',
    'returns.p2.desc': 'پلمپ سربی دست‌نخورده، فاکتور و جعبه سالم',
    'returns.p3.title': '۳. مراحل درخواست',
    'returns.p3.desc': 'تماس تلفنی، ارسال بیمه‌شده و بررسی عیار',
    'returns.p4.title': '۴. زمان بازپرداخت',
    'returns.p4.desc': 'حداکثر ۲۴ ساعت پس از وصول و تایید کارشناسی',

    // Terms Page
    'terms.title': 'قوانین، مقررات و صدور فاکتور رسمی',
    'terms.subtitle': 'به‌روزرسانی: مهرماه ۱۴۰۵ — مطابق قوانین رسمی اتحادیه طلا و جواهر جمهوری اسلامی ایران',
    'terms.sec1.title': '۱. اصالت عیار طلا و فاکتور رسمی',
    'terms.sec1.desc': 'کلیه محصولات میوان از طلای ۱۸ عیار استاندارد (۷۵۰) ساخته شده و فاکتور رسمی و معتبر همراه با قید وزن، عیار، شماره سریال و مهر اتحادیه صادر می‌شود. این فاکتور سند قانونی مالکیت شماست.',
    'terms.sec2.title': '۲. نوسان نرخ طلا و قفل قیمت',
    'terms.sec2.desc': 'با توجه به نوسانات لحظه‌ای بازار طلا، به محض ورود به صفحه تسویه حساب و ایجاد پیش‌فاکتور، قیمت به مدت ۱۰ دقیقه برای خریدار قفل می‌گردد. در صورت عدم تکمیل فرآیند ظرف این مدت، سفارش با نرخ جدید مجدداً محاسبه خواهد شد.',
    'terms.sec3.title': '۳. ارسال و بیمه مرسولات',
    'terms.sec3.desc': 'تمام سفارش‌های ارسالی با پست پیشتاز یا شرکت‌های پستی معتبر دارای بیمه کامل ارزش طلا می‌باشند. در صورت هرگونه مفقودی یا آسیب احتمالی در مسیر حمل، مسئولیت کامل بر عهده گالری میوان است.',
    'terms.sec4.title': '۴. شفافیت هویت، مجوزها و پیش‌فاکتور واقعی',
    'terms.sec4.desc': 'اعتماد مشتریان بزرگ‌ترین سرمایه میوان است. تا زمان تکمیل فرآیندهای اداری و سامانه‌های اتصال خودکار، وضعیت مجوزها و احراز هویت‌ها به شکل شفاف و واقعی اعلام می‌شود و هیچ ادعای غیرواقعی مطرح نمی‌گردد.',

    // Privacy Page
    'privacy.title': 'سیاست حفظ حریم خصوصی',
    'privacy.subtitle': 'تعهد میوان به حفظ امنیت داده‌ها و اطلاعات کاربران',
    'privacy.card_title': 'امنیت اطلاعات هویتی و آدرس‌ها',
    'privacy.card_desc': 'فروشگاه آنلاین طلا و جواهر میوان اطلاعات شخصی کاربران شامل شماره تلفن، آدرس پستی و نام را صرفاً به منظور پردازش، بیمه و ارسال فیزیکی مرسولات پستی استفاده کرده و تحت هیچ شرایطی در اختیار اشخاص یا سازمان‌های ثالث قرار نمی‌دهد.',

    // Payment Result Page
    'payment.verified_badge': 'تراکنش موفق شاپرک',
    'payment.success_title': 'پرداخت شما با موفقیت تایید شد',
    'payment.success_desc': 'سفارش شما در سامانه ثبت گردید و بسته طلا در مرحله بسته‌بندی امنیتی و صدور فاکتور رسمی قرار گرفت.',
    'payment.failed_title': 'تراکنش ناموفق یا لغو شده',
    'payment.failed_desc': 'عملیات پرداخت بانکی با موفقیت نهایی نشد. در صورت کسر وجه از حساب، حداکثر ظرف ۷۲ ساعت توسط شبکه شاپرک بازگردانده می‌شود.',
    'payment.order_id': 'شماره سفارش:',
    'payment.ref_id': 'کد رهگیری بانکی:',
    'payment.view_invoice': 'مشاهده و چاپ فاکتور قطعی',
    'payment.back_home': 'بازگشت به فروشگاه',
    'payment.contact_support': 'تماس با پشتیبانی میوان',

    // 404 Page
    'notfound.badge': '۴۰۴ · صفحه ناموجود',
    'notfound.title': 'صفحه مورد نظر پیدا نشد',
    'notfound.desc': 'صفحه‌ای که به دنبال آن بودید یافت نشد یا به نشانی دیگری منتقل شده است.',
    'notfound.back_home': 'بازگشت به صفحه اصلی',

    // Pricing Settings Modal
    'settings.title': 'پیکربندی و موازین محاسبه نرخ طلا',
    'settings.subtitle': 'شفافیت مبنای محاسبه مالیات، سود و نرخ روز',
    'settings.union_disclaimer': 'در میوان نرخ‌های طلا و ضرایب مالیاتی ثابت و غیرقابل تغییر نیستند، بلکه مطابق جدیدترین ابلاغیه‌های قانونی اتحادیه و قانون مالیات بر ارزش افزوده طلا تنظیم می‌گردند.',
    'settings.ref_rate_label': 'نرخ مرجع هر گرم طلای ۱۸ عیار (تومان):',
    'settings.vat_label': 'درصد مالیات بر ارزش افزوده قانونی:',
    'settings.profit_label': 'درصد سود مصوب فروشنده:',
    'settings.reset_btn': 'بازنشانی به استاندارد اتحادیه',
    'settings.save_btn': 'ذخیره تنظیمات محاسباتی',

    // Invoice Modal
    'invoice.pre_title': 'پیش‌فاکتور رسمی و شفاف میوان',
    'invoice.final_title': 'فاکتور قطعی فروش طلا و جواهر',
    'invoice.print_btn': 'چاپ / دانلود PDF',
    'invoice.whatsapp_btn': 'ارسال به واتساپ',
    'invoice.number_label': 'شماره فاکتور:',
    'invoice.date_label': 'تاریخ صدور:',
    'invoice.col_desc': 'شرح قطعه طلا / جواهر',
    'invoice.col_weight': 'وزن (گرم)',
    'invoice.col_karat': 'عیار',
    'invoice.col_raw_gold': 'ارزش طلای خام',
    'invoice.col_wage': 'اجرت ساخت',
    'invoice.col_profit': 'سود قانونی (۷٪)',
    'invoice.col_vat': 'مالیات ۱۰٪',
    'invoice.col_stone': 'بهای سنگ',
    'invoice.col_subtotal': 'مبلغ نهایی',
    'invoice.totals.weight': 'مجموع وزن خالص طلا:',
    'invoice.totals.shipping': 'هزینه ارسال پستی بیمه‌شده:',
    'invoice.totals.total': 'مبلغ کل فاکتور:',
    'invoice.union_seal': 'ممهور به مهر رسمی صنف طلا و جواهر یزد',

    // Footer
    'footer.motto': 'میوان · بیشتر از یک جواهر · یزد · ایران · جهان',
    'footer.description': '«درخشش، حق انتخاب توست...» از کهن‌دیار یزد، مهد زرگری اصیل ایران تا درخشش ماندگار بر دستان شما.',
    'footer.pillar1.title': 'ضمانت اصالت و عیار',
    'footer.pillar1.desc': 'شناسنامه رسمی و فاکتور اتحادیه طلا',
    'footer.pillar2.title': 'ارسال بیمه‌شده سراسری',
    'footer.pillar2.desc': 'تحویل امن و رایگان با بیمه کامل ارزش طلا',
    'footer.pillar3.title': '۷ روز ضمانت تعویض',
    'footer.pillar3.desc': 'آسودگی خاطر کامل در انتخاب و خرید',
    'footer.pillar4.title': 'هنر دست استادکاران یزد',
    'footer.pillar4.desc': 'ظرافت منحصربه‌فرد با برترین پرداخت طلا',
    'footer.col.about': 'میوان (MEYVAN)',
    'footer.col.categories': 'دسته‌بندی‌های تخصصی',
    'footer.col.service': 'خدمات مشتریان',
    'footer.col.showroom': 'شوروم مرکزی',
    'footer.showroom_address': 'یزد، خیابان قیام، بازار خان، راسته زرگران، پلاک ۱۰۴',
    'footer.working_hours': 'شنبه تا پنج‌شنبه: ۹:۰۰ الی ۱۳:۳۰ و ۱۷:۰۰ الی ۲۱:۳۰',
    'footer.phone_label': 'تماس مستقیم:',
    'footer.enamad_status': 'در حال احراز و تکمیل پرونده',
    'footer.copyright': 'کلیه حقوق برای برند میوان (meyvan.ir) محفوظ است.',

    // Floating WhatsApp Concierge
    'whatsapp.badge': 'مشاوره آنلاین طلا',
    'whatsapp.aria_label': 'مشاوره مستقیم در واتساپ گالری میوان',
    'whatsapp.default_msg': 'درود، مایل به مشاوره و استعلام در خصوص محصولات طلا و جواهر میوان هستم.',

    // Common
    'currency': 'تومان',
    'grams': 'گرم',
    'karat_suffix': 'عیار'
  },
  en: {
    // Nav & Brand
    'nav.home': 'Home',
    'nav.catalog': 'Collections & Catalog',
    'nav.about': 'Heritage & Story',
    'nav.returns': 'Returns & Exchange',
    'nav.contact': 'Showrooms & Contact',
    'nav.search': 'Search',
    'nav.wishlist': 'Wishlist',
    'nav.cart': 'Shopping Bag',
    'top_motto': 'Over 500 handcrafted 18K fine jewelry pieces from historic Yazd to all of Iran',

    // Gold Ticker
    'ticker.rate_label': '18K Gold Benchmark Rate (750 Purity):',
    'ticker.tgju_badge': 'Verified TGJU Rate',
    'ticker.last_update': 'Last Updated:',
    'ticker.formula_settings': 'Formula & Transparency Settings',
    'ticker.tax_note': '10% VAT strictly on wage & profit',
    'ticker.refresh_title': 'Refresh live gold price',

    // Hero Section
    'hero.badge': 'Over 500 handcrafted pieces from Yazd to the world',
    'hero.kicker': 'Heritage, Transparency & Timeless Artistry',
    'hero.title_pre': 'Radiance is',
    'hero.title_gold': 'Your Choice',
    'hero.subtitle': 'Online luxury 18K handcrafted gold and fine jewelry from the historic goldsmith capital of Yazd. Live official Union price calculations, certified authenticity cards, and fully insured delivery.',
    'hero.cta_catalog': 'Explore All Collections',
    'hero.cta_about': 'The Yazd Heritage',
    'hero.stat_karat': '18K (750)',
    'hero.stat_karat_desc': 'Official Iranian Gold Standard',
    'hero.stat_transparency': '100% Transparency',
    'hero.stat_transparency_desc': 'Itemized wage, profit & tax',
    'hero.stat_guarantee': '7-Day Return',
    'hero.stat_guarantee_desc': 'Guaranteed purity & authenticity',

    // Categories
    'categories.title': 'Specialized Fine Jewelry Collections',
    'categories.subtitle': '10 curated collections combining contemporary elegance with master Iranian goldsmithing',
    'categories.view_collection': 'View Collection',

    // Category names
    'cat.earrings': 'Earrings',
    'cat.ring': 'Rings',
    'cat.necklace': 'Necklaces',
    'cat.bracelet': 'Bracelets & Bangles',
    'cat.set': 'Sets & Suites',
    'cat.coin': 'Coins & Bullion',
    'cat.pendant': 'Pendants & Medallions',
    'cat.men': "Men's Collection",
    'cat.kids': 'Kids & Baby',
    'cat.economic': 'Investment / Low-Wage Gold',

    // Category descriptions
    'cat.desc.earrings': 'Stud, drop, and chandelier earrings in 18K gold with secure, hypoallergenic clasps.',
    'cat.desc.ring': 'Statement rings, minimal bands, and intricate filigree solitaires in 18K gold.',
    'cat.desc.necklace': 'Cartier chains, Venetian links, chokers, and historic Yazdi medallions.',
    'cat.desc.bracelet': 'Bangles, cuffs, Italian mesh, and faceted bracelets built for enduring luxury.',
    'cat.desc.set': 'Harmonious suites of matching necklaces, earrings, and bracelets for special celebrations.',
    'cat.desc.coin': 'Certified investment gold bullion bars and authentic mint coins with serial codes.',
    'cat.desc.pendant': 'Name medallions, celestial pendants, and dainty gold charms with silk cords or chains.',
    'cat.desc.men': "Heavy 18K signet rings, braided Italian leather bracelets, and classic gold accents.",
    'cat.desc.kids': 'Hypoallergenic stud earrings, baby link bracelets, and adorable safety gold charms.',
    'cat.desc.economic': 'Minimalist gold pieces with the lowest workshop labor fee, ideal for smart savings.',

    // Bestsellers
    'bestsellers.tag': 'CLIENT FAVORITES',
    'bestsellers.title': 'Featured Bestsellers',
    'bestsellers.view_all': 'View All Bestsellers',

    // Philosophy
    'philosophy.tag': 'HERITAGE & VALUES',
    'philosophy.title': 'The Meyvan Philosophy: More Than Just Jewelry',
    'philosophy.subtitle': 'Gold is more than a precious metal; it is a bond between art, emotion, and intelligent investment. At Meyvan, we uphold four unwavering pillars:',
    'philosophy.badge': '«Yazd: The Historic Goldsmithing Capital of Iran»',
    'philosophy.p1.title': 'Informed Decision-Making',
    'philosophy.p1.desc': 'Transparent specifications, milligram precision, and itemized labor charges for a confident purchase.',
    'philosophy.p2.title': 'Yazdi Goldsmith Authenticity',
    'philosophy.p2.desc': 'Master craftsmanship from renowned Yazd workshops with strict 750 (18 Karat) purity standards.',
    'philosophy.p3.title': '100% Legal & Tax Transparency (10%)',
    'philosophy.p3.desc': 'Strict adherence to Iranian gold tax laws: raw gold is 100% tax-free; 10% VAT applies strictly to making wage and seller profit.',
    'philosophy.p4.title': 'Timeless Enduring Beauty',
    'philosophy.p4.desc': 'Designs transcending temporary trends, staying with your most luminous moments for a lifetime.',

    // Packaging
    'packaging.tag': 'AUTHENTICITY & PACKAGING',
    'packaging.title': 'Luxury Packaging, Holographic Certificate & Official Union Invoice',
    'packaging.desc': 'Every order arrives in our signature matte black-and-gold presentation box with a verified certificate of authenticity, unique serial number, barcode, and stamped official Union invoice accepted nationwide.',
    'packaging.card1.title': 'Product Certificate',
    'packaging.card1.desc': 'Details exact calibrated weight, karat, dimensions, and gemstone specifications.',
    'packaging.card2.title': 'Luxury Gift Box',
    'packaging.card2.desc': 'Velvet-lined signature box with silk ribbon and custom Meyvan tote.',

    // FAQ
    'faq.tag': 'FAQ',
    'faq.title': 'Frequently Asked Questions',
    'faq.returns_box.title': 'Need further assistance regarding returns or exchanges?',
    'faq.returns_box.desc': 'Review our full 7-day guarantee terms, intact security seal requirements, and fast refund timeline.',
    'faq.returns_box.btn': 'Read Return Policy',

    // Catalog Page
    'catalog.title': 'MEYVAN Gold & Fine Jewelry Catalog',
    'catalog.count_summary': 'Displaying {count} gold pieces of {total} handcrafted creations',
    'catalog.filter.category': 'Specialized Collection',
    'catalog.filter.type': 'Jewelry Type',
    'catalog.filter.karat': 'Gold Purity',
    'catalog.filter.max_weight': 'Max Weight (Grams):',
    'catalog.filter.in_stock': 'In-Stock Items Only',
    'catalog.filter.stone_all': 'All Items (Plain & Gemstone)',
    'catalog.filter.with_stone': 'With Certified Gemstones',
    'catalog.filter.no_stone': 'Pure Gold (No Gemstones)',
    'catalog.filter.reset': 'Reset All Filters',
    'catalog.filter.open_btn': 'Advanced Filters',
    'catalog.search_placeholder': 'Search by design name, SKU code, or style...',
    'catalog.load_more': 'Load More Products',
    'catalog.all_loaded': 'All products in this category have been loaded',

    // Sorting
    'sort.label': 'Sort by:',
    'sort.newest': 'Newest First',
    'sort.bestseller': 'Most Popular & Bestselling',
    'sort.cheapest': 'Price: Low to High',
    'sort.expensive': 'Price: High to Low',
    'sort.lightest': 'Weight: Lightest First',
    'sort.heaviest': 'Weight: Heaviest First',

    // Product Card
    'card.quick_view': 'View Details',
    'card.view_breakdown': 'View Union Price Breakdown',
    'card.close_breakdown': 'Close Breakdown',
    'card.raw_gold': 'Raw Gold Value:',
    'card.wage': 'Making Wage:',
    'card.profit': 'Legal Profit (7%):',
    'card.vat': 'VAT Tax (10% on profit+wage):',
    'card.stone': 'Gemstone Value:',
    'card.total': 'Total Official Price:',
    'card.add_to_cart': 'Add to Bag',
    'card.in_stock': 'In Stock',
    'card.sold_out': 'Made to Order',

    // Product Detail Page
    'pdp.breadcrumb.home': 'Home',
    'pdp.breadcrumb.catalog': 'Catalog',
    'pdp.sku_label': 'Exclusive SKU:',
    'pdp.karat_label': 'Gold Purity:',
    'pdp.weight_label': 'Raw Gold Weight:',
    'pdp.wage_label': 'Crafting Wage:',
    'pdp.gem_label': 'Gemstones:',
    'pdp.gem_with': 'Certified Gemstones',
    'pdp.gem_none': 'Pure 18K Gold (No Stone)',
    'pdp.weight_module.title': 'Choose Desired Gold Weight (Custom Grams)',
    'pdp.weight_module.desc': 'This design can be custom crafted in various weights. Moving the slider automatically recalculates raw gold, making charge, profit, and 10% VAT in real-time.',
    'pdp.weight_module.custom_badge': 'Custom Weight (Estimated Price)',
    'pdp.weight_module.standard_badge': 'Standard Weight (Fixed)',
    'pdp.weight_module.min': 'Min:',
    'pdp.weight_module.max': 'Max:',
    'pdp.breakdown_title': 'Official Iranian Union Pricing Breakdown',
    'pdp.breakdown_desc': 'Transparent live calculation with zero hidden fees',
    'pdp.raw_gold_formula': 'Raw Gold ({weight}g × live rate {rate}):',
    'pdp.wage_calc': 'Workshop Labor Wage ({wage}%):',
    'pdp.profit_calc': 'Seller Legal Profit (7% Union):',
    'pdp.vat_calc': 'VAT Tax (10% exclusively on wage + profit):',
    'pdp.vat_exempt_note': '✓ Raw gold is 100% tax-exempt. 10% VAT applies only to workshop wage + seller profit.',
    'pdp.stone_calc': 'Hand-Set Gemstones & Pearls Value:',
    'pdp.final_payable_label': 'Final Payable Amount:',
    'pdp.invoice_cta': 'View & Print Official Pre-Invoice for This Item',
    'pdp.add_btn': 'Add to Shopping Bag',
    'pdp.add_btn_custom': 'Add with {weight} Weight',
    'pdp.whatsapp_btn': 'Inquire on WhatsApp',
    'pdp.share_btn': 'Share Piece',
    'pdp.similar_title': 'More Pieces in This Collection',

    // Cart & Checkout
    'cart.title': 'Your Shopping Bag',
    'cart.item_count': '{count} items',
    'cart.timer_prefix': 'Price lock guaranteed for:',
    'cart.timer_expired': 'Price guarantee window expired. Rates have been refreshed to current live price.',
    'cart.empty_title': 'Your Shopping Bag is Empty',
    'cart.empty_desc': 'Discover our collection of over 500 handcrafted 18K gold jewels and find your signature piece.',
    'cart.go_catalog': 'Discover Fine Jewelry',
    'cart.remove': 'Remove',
    'cart.custom_weight_badge': 'Custom Weight',
    'cart.summary.weight': 'Total Gold Weight:',
    'cart.summary.shipping': 'Insured Delivery:',
    'cart.summary.shipping_free': 'Complimentary (Meyvan Gift)',
    'cart.summary.total': 'Total Payable Amount:',
    'cart.checkout_btn': 'Proceed to Secure Checkout',
    'cart.print_invoice_btn': 'View & Print Official Pre-Invoice',
    'cart.whatsapp_order': 'Complete Order via WhatsApp',

    // Checkout Modal
    'checkout.title': 'Delivery Address & Order Confirmation',
    'checkout.subtitle': 'Guest checkout available. You will be redirected to the secure Iranian banking gateway (Shatarak / ZarinPal).',
    'checkout.field.name': 'Recipient Full Name',
    'checkout.field.mobile': 'Mobile Number (for SMS Tracking)',
    'checkout.field.province': 'Province',
    'checkout.field.city': 'City',
    'checkout.field.postal': '10-Digit Postal Code',
    'checkout.field.address': 'Full Postal Address for Insured Delivery',
    'checkout.field.notes': 'Special instructions or notes (Optional)',
    'checkout.submit_btn': 'Proceed to Secure Bank Gateway',
    'checkout.cancel': 'Cancel & Return to Bag',

    // Search Overlay
    'search.placeholder': 'Search fine jewelry, style (Cartier, Van Cleef), SKU, or collection...',
    'search.cancel': 'Cancel',
    'search.popular_label': 'Popular Fine Jewelry Searches:',
    'search.no_results': 'No jewelry found matching "{query}".',
    'search.view_all': 'View all results for "{query}" in catalog',

    // About Page
    'about.badge': 'ABOUT MEYVAN · SINCE YAZD',
    'about.title': 'The Story of Meyvan: From Ancient Yazd to the World',
    'about.subtitle': '"Radiance is your choice..." A narrative uniting thousand-year-old Yazdi goldsmithing heritage with contemporary luxury aesthetics.',
    'about.narrative.title': 'Yazd: The Historical Capital of Goldsmithing & Purity',
    'about.narrative.p1': 'Throughout history, the UNESCO World Heritage city of Yazd has stood as the venerable capital of master Iranian goldsmiths, where gold purity was tested with ethical devotion and uncompromising standards. Meyvan is born from this storied soil and culture of integrity.',
    'about.narrative.p2': 'We believe acquiring fine jewelry should never come with ambiguity, complex hidden formulas, or obscurity. Therefore, at Meyvan, every creation is offered with a verified certificate, live transparent calculations, and itemized official Union breakdown.',
    'about.pillar1.title': 'Contemporary & Ergonomic Design',
    'about.pillar1.desc': 'Lightweight, graceful pieces tailored for modern lifestyles and daily effortless wear.',
    'about.pillar2.title': 'Complete Pricing Transparency',
    'about.pillar2.desc': 'Live rates based on official Union regulations, 0.01g weight accuracy, and zero artificial markups.',
    'about.pillar3.title': 'Certified Holographic Invoice',
    'about.pillar3.desc': 'Accompanied by stamped official Union invoices accepted for trade or resale nationwide.',
    'about.pillar4.title': 'Insured Nationwide Delivery',
    'about.pillar4.desc': 'Priority secure express mail with 100% full-value insurance straight to your door across Iran.',

    // Contact Page
    'contact.badge': 'CONTACT & SHOWROOM',
    'contact.title': 'Connect with Meyvan Showroom & Concierge',
    'contact.subtitle': 'Our master jewelry consultants are available six days a week to assist your custom inquiries and sizing.',
    'contact.info.title': 'Central Showroom Information',
    'contact.address.label': 'Boutique Address:',
    'contact.address.val': 'Khan Bazaar, Goldsmiths Row, No. 104, Ghiam St., Yazd, Iran',
    'contact.phone.label': 'Phone Contact:',
    'contact.hours.label': 'Visiting Hours:',
    'contact.hours.val': 'Saturday to Thursday: 09:00 - 13:30 & 17:00 - 21:30',
    'contact.whatsapp.label': 'Official WhatsApp:',
    'contact.whatsapp.val': '+98 913 256 0616 (Fast Concierge Response)',
    'contact.form.title': 'Send an Inquiry or Custom Bespoke Request',
    'contact.form.name': 'Full Name',
    'contact.form.phone': 'Phone / Mobile',
    'contact.form.message': 'Your Message or Bespoke Custom Request',
    'contact.form.submit': 'Submit Message to Concierge',
    'contact.form.success_title': 'Your message has been received successfully',
    'contact.form.success_desc': 'A Meyvan jewelry advisor will reach out to you shortly via phone or message.',

    // Returns Page
    'returns.title': 'Returns, Exchange & Purity Guarantee Policy',
    'returns.subtitle': 'Updated: 2026 — Fully compliant with Article 37 of E-Commerce Law & Official Gold Union Directives',
    'returns.btn_catalog': 'Explore Jewelry',
    'returns.p1.title': '1. Return Window',
    'returns.p1.desc': '7 calendar days from confirmed postal delivery',
    'returns.p2.title': '2. Physical Condition',
    'returns.p2.desc': 'Intact security seal, undamaged original box and invoice',
    'returns.p3.title': '3. Simple Request Steps',
    'returns.p3.desc': 'Phone contact, insured shipping, laboratory purity verification',
    'returns.p4.title': '4. Fast Reimbursement',
    'returns.p4.desc': 'Within 24 business hours of verification',

    // Terms Page
    'terms.title': 'Terms of Service & Official Union Invoicing',
    'terms.subtitle': 'Updated: 2026 — Formulated under Iranian Official Gold Union Regulations',
    'terms.sec1.title': '1. Gold Purity & Stamped Legal Invoice',
    'terms.sec1.desc': 'All Meyvan creations are crafted from authentic 18 Karat gold (750 purity standard) and accompanied by an official stamped invoice detailing exact calibrated weight, purity, serial code, and Union registration.',
    'terms.sec2.title': '2. Live Gold Price Fluctuations & 10-Min Price Lock',
    'terms.sec2.desc': 'Due to real-time market gold fluctuations, once you proceed to checkout and a pre-invoice is generated, your price is locked for 10 minutes. If checkout is not completed within this window, current live rates apply.',
    'terms.sec3.title': '3. Insured Nationwide Delivery',
    'terms.sec3.desc': 'All parcels sent via priority express or armored courier carry 100% full-value insurance coverage. Meyvan holds full liability until confirmed delivery to your hands.',
    'terms.sec4.title': '4. Transparency & Verified Craftsmanship',
    'terms.sec4.desc': 'Client trust is our highest honor. Boutique address, registration codes, direct hotline (+98 913 256 0616), and pre-invoices are fully accessible for verification before completing any transaction.',

    // Privacy Page
    'privacy.title': 'Privacy & Data Protection Policy',
    'privacy.subtitle': 'Meyvan’s Commitment to Customer Privacy & Security',
    'privacy.card_title': 'Identity & Address Data Protection',
    'privacy.card_desc': 'Meyvan Fine Jewelry uses client names, phone numbers, and delivery addresses exclusively for logistics, insurance, and physical delivery. Your confidential information is never shared with third parties.',

    // Payment Result Page
    'payment.verified_badge': 'TRANSACTION VERIFIED',
    'payment.success_title': 'Your Payment Was Successfully Confirmed',
    'payment.success_desc': 'Your order has been registered in the system and your gold piece has entered secure boutique packaging and official Union invoice issuance.',
    'payment.failed_title': 'Payment Failed or Cancelled',
    'payment.failed_desc': 'The online banking transaction was not completed. If funds were deducted from your account, they will be automatically reimbursed by the banking network within 72 hours.',
    'payment.order_id': 'Order Number:',
    'payment.ref_id': 'Bank Tracking Ref:',
    'payment.view_invoice': 'View & Print Official Stamped Invoice',
    'payment.back_home': 'Return to Catalog',
    'payment.contact_support': 'Contact Customer Concierge',

    // 404 Page
    'notfound.badge': '404 · PAGE NOT FOUND',
    'notfound.title': 'Page Not Found',
    'notfound.desc': 'The piece or page you are looking for does not exist or has been relocated.',
    'notfound.back_home': 'Return to Homepage',

    // Pricing Settings Modal
    'settings.title': 'Gold Pricing Engine & Transparency Formula',
    'settings.subtitle': 'Transparent breakdown of raw gold, VAT, workshop wage & profit',
    'settings.union_disclaimer': 'At Meyvan, gold rates and statutory tax coefficients strictly follow current Union directives and Iranian VAT statutes.',
    'settings.ref_rate_label': '18K Gold Benchmark Rate per Gram (Tomans):',
    'settings.vat_label': 'Statutory VAT Rate (%):',
    'settings.profit_label': 'Seller Statutory Profit (%):',
    'settings.reset_btn': 'Reset to Union Standard',
    'settings.save_btn': 'Save Calculation Settings',

    // Invoice Modal
    'invoice.pre_title': 'MEYVAN Official Pre-Invoice',
    'invoice.final_title': 'MEYVAN Stamped Gold Sales Invoice',
    'invoice.print_btn': 'Print / Download PDF',
    'invoice.whatsapp_btn': 'Send to WhatsApp',
    'invoice.number_label': 'Invoice Number:',
    'invoice.date_label': 'Issued Date:',
    'invoice.col_desc': 'Jewelry Description',
    'invoice.col_weight': 'Weight (g)',
    'invoice.col_karat': 'Purity',
    'invoice.col_raw_gold': 'Raw Gold Value',
    'invoice.col_wage': 'Making Wage',
    'invoice.col_profit': 'Profit (7%)',
    'invoice.col_vat': 'VAT (10%)',
    'invoice.col_stone': 'Stone Value',
    'invoice.col_subtotal': 'Subtotal',
    'invoice.totals.weight': 'Total Net Gold Weight:',
    'invoice.totals.shipping': 'Insured Shipping Cost:',
    'invoice.totals.total': 'Total Invoice Amount:',
    'invoice.union_seal': 'Stamped with Official Yazd Gold & Jewelry Union Seal',

    // Footer
    'footer.motto': 'MEYVAN · MORE THAN JUST JEWELRY · YAZD · IRAN · WORLD',
    'footer.description': '«Radiance is your choice...» From the historic city of Yazd, the cradle of Iranian goldsmithing, to timeless brilliance on your hands.',
    'footer.pillar1.title': 'Authenticity & Purity Guarantee',
    'footer.pillar1.desc': 'Official certificate and stamped Union invoice',
    'footer.pillar2.title': 'Insured Nationwide Delivery',
    'footer.pillar2.desc': 'Complimentary delivery fully insured to full value',
    'footer.pillar3.title': '7-Day Return Guarantee',
    'footer.pillar3.desc': 'Complete peace of mind with every order',
    'footer.pillar4.title': 'Yazd Goldsmith Craftsmanship',
    'footer.pillar4.desc': 'Unsurpassed polish and meticulous finishing',
    'footer.col.about': 'MEYVAN Fine Jewelry',
    'footer.col.categories': 'Collections',
    'footer.col.service': 'Customer Care',
    'footer.col.showroom': 'Central Showroom',
    'footer.showroom_address': 'Khan Bazaar, Goldsmiths Row, No. 104, Yazd, Iran',
    'footer.working_hours': 'Saturday to Thursday: 09:00 - 13:30 & 17:00 - 21:30',
    'footer.phone_label': 'Direct Phone:',
    'footer.enamad_status': 'Under official verification process',
    'footer.copyright': '© All rights reserved for MEYVAN Fine Jewelry (meyvan.ir).',

    // Floating WhatsApp Concierge
    'whatsapp.badge': 'Online Gold Concierge',
    'whatsapp.aria_label': 'Direct WhatsApp Jewelry Consultation',
    'whatsapp.default_msg': 'Hello, I would like jewelry consultation and product inquiries regarding Meyvan 18K fine jewelry collection.',

    // Common
    'currency': 'Tomans',
    'grams': 'g',
    'karat_suffix': 'Karat'
  }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('meyvan_lang');
      if (saved === 'en' || saved === 'fa') return saved;
    } catch {
      // Fallback
    }
    return 'fa';
  });

  const dir: 'rtl' | 'ltr' = language === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;
    if (dir === 'ltr') {
      document.body.classList.add('ltr-mode');
    } else {
      document.body.classList.remove('ltr-mode');
    }

    try {
      localStorage.setItem('meyvan_lang', language);
    } catch {
      // ignore
    }

    // Dynamic Title
    if (language === 'en') {
      document.title = 'MEYVAN | Handcrafted 18K Gold & Fine Jewelry from Yazd';
    } else {
      document.title = 'MEYVAN | میوان - طلا و جواهر دست‌ساز و فاخر ۱۸ عیار یزد';
    }
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'fa' ? 'en' : 'fa'));
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let str = translations[language][key] || translations['fa'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  };

  const formatPrice = (amountTomans: number): string => {
    if (language === 'fa') {
      return formatToman(amountTomans);
    }
    return `${Math.round(amountTomans).toLocaleString('en-US')} Tomans`;
  };

  const formatGrams = (grams: number): string => {
    if (language === 'fa') {
      return formatWeight(grams);
    }
    return `${grams.toFixed(2)} g`;
  };

  const formatNum = (num: number | string): string => {
    if (language === 'fa') {
      return toPersianDigits(num);
    }
    return String(num);
  };

  const getProductName = (product: Product): string => {
    if (language === 'en') {
      if (product.nameEn) return product.nameEn;
      // Elegant luxury English translation mapping
      const enNames: Record<string, string> = {
        'MY-0501': '18K Yellow Gold Ball Stud Earrings',
        'MY-0502': '18K Gold Dome Screw-Back Earrings',
        'MY-0503': '18K Gold Oval Bead Drop Earrings',
        'MY-0504': '18K White Gold Van Cleef Guilloche Ring',
        'MY-0505': '18K Yellow Gold Ribbon Bow Ring',
        'MY-0506': '18K Minimal Gold "Love" Band Ring',
        'MY-0507': '18K Gold Faceted Bead Chain Necklace',
        'MY-0508': '18K Tri-Color Gold Albernado Bead Bracelet',
        'MY-0509': '18K Gold Cartier Link Chain Bracelet',
        'MY-0510': '18K Gold Cartier Screw Accent Bangle',
        'MY-0511': '18K Gold Crescent Moon Pendant Charm',
        'MY-0512': '18K Gold Guardian Angel Silhouette Pendant',
        'MY-0513': '18K Gold Openwork Heart Medallion',
        'MY-0514': '18K Two-Tone Van Cleef Micro-Cut Suite',
        'MY-0515': '18K Yellow Gold Golden Circle Bridal Set',
        'MY-0516': '18K Celestial Star Choker Necklace'
      };
      if (enNames[product.sku]) return enNames[product.sku];

      // Systematic transliterated luxury English fallback
      const typeLabel = {
        ring: 'Ring',
        earrings: 'Earrings',
        necklace: 'Necklace',
        bracelet: 'Bracelet',
        bangle: 'Bangle',
        anklet: 'Anklet',
        set: 'Bridal Suite',
        half_set: 'Demi-Parure Set',
        coin: 'Gold Coin & Bullion',
        pendant: 'Pendant Charm',
        bullion: 'Investment Bar'
      }[product.type] || 'Jewelry Piece';

      return `MEYVAN 18K Gold ${typeLabel} (${product.sku})`;
    }
    return product.name;
  };

  const getProductDesc = (product: Product): string => {
    if (language === 'en') {
      if (product.descriptionEn) return product.descriptionEn;
      return `Master-crafted in historic Yazd from authentic 18 Karat gold (750 purity). Calibrated weight: ${product.weightGrams.toFixed(2)}g. Includes official Union invoice, holographic authenticity certificate, and complimentary insured delivery across Iran.`;
    }
    return product.description;
  };

  const getCategoryTitle = (catKey: string): string => {
    if (language === 'en') {
      const map: Record<string, string> = {
        all: 'All Collections',
        earrings: 'Earrings',
        ring: 'Rings',
        necklace: 'Necklaces',
        bracelet: 'Bracelets & Bangles',
        set: 'Sets & Suites',
        coin: 'Coins & Bullion',
        pendant: 'Pendants & Medallions',
        men: "Men's Collection",
        kids: 'Kids & Baby',
        economic: 'Investment Gold',
        minimal: 'Minimalist Gold',
        everyday: 'Daily Wear',
        heavy: 'Yazdi Heavy Gold',
        jewelry: 'Fine Jewelry'
      };
      return map[catKey] || catKey;
    }
    const mapFa: Record<string, string> = {
      all: 'همه کالکشن‌ها',
      earrings: 'گوشواره',
      ring: 'انگشتر',
      necklace: 'گردنبند',
      bracelet: 'دستبند و النگو',
      set: 'نیم‌ست و سرویس',
      coin: 'سکه و شمش',
      pendant: 'آویز و پلاک',
      men: 'محصولات مردانه',
      kids: 'محصولات بچگانه',
      economic: 'محصولات کم‌اجرت',
      minimal: 'مینیمال',
      everyday: 'روزمره',
      heavy: 'سنگین و یزدی',
      jewelry: 'جواهرات نگین‌دار'
    };
    return mapFa[catKey] || catKey;
  };

  const getTypeTitle = (typeKey: string): string => {
    if (language === 'en') {
      const map: Record<string, string> = {
        all: 'All Types',
        ring: 'Rings',
        necklace: 'Necklaces',
        pendant: 'Pendants',
        earrings: 'Earrings',
        bracelet: 'Bracelets',
        bangle: 'Bangles',
        anklet: 'Anklets',
        set: 'Full Suites',
        half_set: 'Demi-Parures',
        coin: 'Coins',
        bullion: 'Bullion'
      };
      return map[typeKey] || typeKey;
    }
    const mapFa: Record<string, string> = {
      all: 'همه انواع',
      ring: 'انگشتر',
      necklace: 'گردنبند',
      pendant: 'آویز',
      earrings: 'گوشواره',
      bracelet: 'دستبند',
      bangle: 'النگو',
      anklet: 'پابند',
      set: 'سرویس کامل',
      half_set: 'نیم‌ست',
      coin: 'سکه',
      bullion: 'شمش'
    };
    return mapFa[typeKey] || typeKey;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        dir,
        setLanguage,
        toggleLanguage,
        t,
        formatPrice,
        formatGrams,
        formatNum,
        getProductName,
        getProductDesc,
        getCategoryTitle,
        getTypeTitle
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
