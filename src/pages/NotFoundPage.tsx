import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const NotFoundPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-md mx-auto px-4 py-28 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/30">
        <Compass className="w-8 h-8" />
      </div>
      <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block">
        {t('notfound.badge')}
      </span>
      <h1 className="text-2xl font-serif-luxury font-bold text-[#0B080F]">
        {t('notfound.title')}
      </h1>
      <p className="text-xs text-[#A89B8A] leading-relaxed">
        {t('notfound.desc')}
      </p>
      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] text-xs font-semibold rounded-xl transition-all shadow-md"
        >
          <span>{t('notfound.back_home')}</span>
          <ArrowIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
