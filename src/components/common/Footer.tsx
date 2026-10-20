import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ShieldCheck, Truck, RefreshCw, Award, Instagram, Send, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#0B080F] text-white border-t border-[#D4AF37]/20 pt-16 pb-24 md:pb-12 text-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Kicker Motto */}
        <div className="text-center pb-12 border-b border-white/10">
          <div className="flex justify-center mb-4">
            <Logo variant="gold" size="lg" />
          </div>
          <p className="font-serif-luxury tracking-[0.25em] text-xs text-[#D4AF37] uppercase">
            {t('footer.motto')}
          </p>
          <p className="text-white/60 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            {t('footer.description')}
          </p>
        </div>

        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">{t('footer.pillar1.title')}</h4>
              <p className="text-xs text-white/50 leading-relaxed">{t('footer.pillar1.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
              <Truck className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">{t('footer.pillar2.title')}</h4>
              <p className="text-xs text-white/50 leading-relaxed">{t('footer.pillar2.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
              <RefreshCw className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">{t('footer.pillar3.title')}</h4>
              <p className="text-xs text-white/50 leading-relaxed">{t('footer.pillar3.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
              <Award className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">{t('footer.pillar4.title')}</h4>
              <p className="text-xs text-white/50 leading-relaxed">{t('footer.pillar4.desc')}</p>
            </div>
          </div>
        </div>

        {/* Links & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 text-sm">
          {/* Col 1: About & Info */}
          <div>
            <h5 className="font-serif-luxury text-sm font-semibold text-[#D4AF37] mb-4">
              {t('footer.col.about')}
            </h5>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              {language === 'fa'
                ? 'برند تخصصی طلا و جواهر معاصر با ریشه در هنر تاریخی زرگری یزد. ارزش، به انتخاب تو.'
                : 'Contemporary fine 18K jewelry boutique rooted in the historic goldsmithing heritage of Yazd.'}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/meyvan.gold"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/meyvan_gold"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h5 className="font-serif-luxury text-sm font-semibold text-[#D4AF37] mb-4">
              {t('footer.col.categories')}
            </h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link to="/catalog?category=earrings&type=earrings" className="hover:text-[#D4AF37] transition-colors">{t('cat.earrings')}</Link></li>
              <li><Link to="/catalog?category=ring&type=ring" className="hover:text-[#D4AF37] transition-colors">{t('cat.ring')}</Link></li>
              <li><Link to="/catalog?category=necklace&type=necklace" className="hover:text-[#D4AF37] transition-colors">{t('cat.necklace')}</Link></li>
              <li><Link to="/catalog?category=bracelet&type=bracelet" className="hover:text-[#D4AF37] transition-colors">{t('cat.bracelet')}</Link></li>
              <li><Link to="/catalog?category=set&type=set" className="hover:text-[#D4AF37] transition-colors">{t('cat.set')}</Link></li>
              <li><Link to="/catalog?category=coin&type=coin" className="hover:text-[#D4AF37] transition-colors">{t('cat.coin')}</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Legal */}
          <div>
            <h5 className="font-serif-luxury text-sm font-semibold text-[#D4AF37] mb-4">
              {t('footer.col.service')}
            </h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link to="/about" className="hover:text-[#D4AF37] transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-[#D4AF37] transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/terms" className="hover:text-[#D4AF37] transition-colors">{t('terms.title')}</Link></li>
              <li><Link to="/returns" className="hover:text-[#D4AF37] transition-colors">{t('nav.returns')}</Link></li>
              <li><Link to="/privacy" className="hover:text-[#D4AF37] transition-colors">{t('privacy.title')}</Link></li>
            </ul>
          </div>

          {/* Col 4: Showroom info */}
          <div>
            <h5 className="font-serif-luxury text-sm font-semibold text-[#D4AF37] mb-4">
              {t('footer.col.showroom')}
            </h5>
            <div className="space-y-2.5 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{t('footer.showroom_address')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href="tel:09132560616" className="font-numeral hover:text-[#D4AF37] transition-colors">
                  {language === 'fa' ? '۰۹۱۳۲۵۶۰۶۱۶' : '+98 913 256 0616'}
                </a>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <div className="p-2 border border-white/10 rounded-lg bg-white/5 text-[10px] text-white/60">
                  <span className="text-[#D4AF37] block font-semibold mb-0.5">
                    {language === 'fa' ? 'احراز هویت و کارگاه حضوری:' : 'Authenticity & Atelier:'}
                  </span>
                  {language === 'fa'
                    ? 'گالری و کارگاه طلاسازی یزد · تماس مستقیم ۰۹۱۳۲۵۶۰۶۱۶'
                    : 'Yazd Goldsmith Workshop & Showroom · Hotline: +98 913 256 0616'}
                </div>
                <div className="p-2 border border-white/10 rounded-lg bg-white/5 text-[10px] text-white/60 flex items-center justify-between">
                  <span>{language === 'fa' ? 'نماد تجارت الکترونیکی:' : 'E-Commerce Seal:'}</span>
                  <span className="text-amber-400/80">{t('footer.enamad_status')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Language Switcher */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <p className="font-serif-luxury tracking-widest text-[#D4AF37]/60 text-[11px]">
              MORE THAN JUST JEWELRY
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
