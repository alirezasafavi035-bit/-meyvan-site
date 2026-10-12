import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ShieldCheck, Truck, RefreshCw, Award, Instagram, Send, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B080F] text-white border-t border-[#D4AF37]/20 pt-16 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Kicker Motto */}
        <div className="text-center pb-12 border-b border-white/10">
          <div className="flex justify-center mb-4">
            <Logo variant="gold" size="lg" />
          </div>
          <p className="font-serif-luxury tracking-[0.25em] text-xs text-[#D4AF37] uppercase">
            MEYVAN · MORE THAN JUST JEWELRY · YAZD · IRAN · WORLD
          </p>
          <p className="text-white/60 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            «درخشش، حق انتخاب توست...» از کهن‌دیار یزد، مهد زرگری اصیل ایران تا درخشش ماندگار بر دستان شما.
          </p>
        </div>

        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-12 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">ضمانت اصالت و عیار</h4>
              <p className="text-xs text-white/50 leading-relaxed">شناسنامه رسمی و فاکتور اتحادیه طلا</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
              <Truck className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">ارسال بیمه‌شده سراسری</h4>
              <p className="text-xs text-white/50 leading-relaxed">تحویل امن و رایگان با بیمه کامل ارزش طلا</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
              <RefreshCw className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">۷ روز ضمانت تعویض</h4>
              <p className="text-xs text-white/50 leading-relaxed">آسودگی خاطر کامل در انتخاب و خرید</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
              <Award className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">هنر دست استادکاران یزد</h4>
              <p className="text-xs text-white/50 leading-relaxed">ظرافت منحصربه‌فرد با برترین پرداخت طلا</p>
            </div>
          </div>
        </div>

        {/* Links & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 text-sm">
          {/* Col 1: About & Info */}
          <div>
            <h5 className="font-serif-luxury text-sm font-semibold text-[#D4AF37] mb-4">میوان (MEYVAN)</h5>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              برند تخصصی طلا و جواهر معاصر با ریشه در هنر تاریخی زرگری یزد. ارزش، به انتخاب تو.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/meyvan.gold"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                aria-label="اینستاگرام میوان"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/meyvan_gold"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                aria-label="کانال تلگرام میوان"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h5 className="font-serif-luxury text-sm font-semibold text-[#D4AF37] mb-4">دسته‌بندی‌های طلا</h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link to="/catalog?category=minimal" className="hover:text-[#D4AF37] transition-colors">طلای مینیمال</Link></li>
              <li><Link to="/catalog?category=economic" className="hover:text-[#D4AF37] transition-colors">کالکشن اقتصادی و هدیه</Link></li>
              <li><Link to="/catalog?category=everyday" className="hover:text-[#D4AF37] transition-colors">طلای روزمره و استایل</Link></li>
              <li><Link to="/catalog?category=heavy" className="hover:text-[#D4AF37] transition-colors">النگو و کارهای سنگین یزدی</Link></li>
              <li><Link to="/catalog?category=set" className="hover:text-[#D4AF37] transition-colors">سرویس کامل و نیم‌ست عروس</Link></li>
              <li><Link to="/catalog?category=jewelry" className="hover:text-[#D4AF37] transition-colors">جواهرات نگین‌دار و برلیان</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Legal */}
          <div>
            <h5 className="font-serif-luxury text-sm font-semibold text-[#D4AF37] mb-4">خدمات مشتریان</h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link to="/about" className="hover:text-[#D4AF37] transition-colors">داستان برند میوان</Link></li>
              <li><Link to="/contact" className="hover:text-[#D4AF37] transition-colors">تماس با شوروم و پشتیبانی</Link></li>
              <li><Link to="/terms" className="hover:text-[#D4AF37] transition-colors">قوانین خرید و صدور فاکتور</Link></li>
              <li><Link to="/returns" className="hover:text-[#D4AF37] transition-colors">رویه بازگشت و تعویض کالا</Link></li>
              <li><Link to="/privacy" className="hover:text-[#D4AF37] transition-colors">حفظ حریم خصوصی</Link></li>
            </ul>
          </div>

          {/* Col 4: Showroom info & E-Namad */}
          <div>
            <h5 className="font-serif-luxury text-sm font-semibold text-[#D4AF37] mb-4">شوروم مرکزی</h5>
            <div className="space-y-2.5 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>یزد، خیابان قیام، بازار خان، راسته زرگران، پلاک ۱۰۴</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href="tel:09132560616" className="font-numeral hover:text-[#D4AF37] transition-colors">۰۹۱۳۲۵۶۰۶۱۶</a>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <div className="p-2 border border-white/10 rounded-lg bg-white/5 text-[10px] text-white/60">
                  <span className="text-[#D4AF37] block font-semibold mb-0.5">احراز هویت و شفافیت:</span>
                  گالری و کارگاه طلاسازی یزد · تماس مستقیم ۰۹۱۳۲۵۶۰۶۱۶
                </div>
                <div className="p-2 border border-white/10 rounded-lg bg-white/5 text-[10px] text-white/60 flex items-center justify-between">
                  <span>نماد اعتماد الکترونیکی (اینماد):</span>
                  <span className="text-amber-400/80">در حال احراز و تکمیل پرونده</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} کلیه حقوق برای برند میوان (meyvan.ir) محفوظ است.</p>
          <p className="font-serif-luxury tracking-widest text-[#D4AF37]/60 text-[11px]">
            MORE THAN JUST JEWELRY
          </p>
        </div>
      </div>
    </footer>
  );
};
