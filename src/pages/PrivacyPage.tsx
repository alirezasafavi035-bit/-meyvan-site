import React from 'react';
import { Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-start text-xs sm:text-sm text-[#0B080F]/80 leading-relaxed">
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-2">
            {t('privacy.title')}
          </h1>
          <p className="text-xs text-[#A89B8A]">
            {t('privacy.subtitle')}
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

      <div className="bg-white p-6 sm:p-8 rounded-2xl border space-y-4">
        <p className="flex items-center gap-2 font-bold text-sm text-[#0B080F]">
          <Lock className="w-5 h-5 text-[#D4AF37]" />
          {t('privacy.card_title')}
        </p>
        <p>
          {t('privacy.card_desc')}
        </p>
      </div>
    </div>
  );
};
