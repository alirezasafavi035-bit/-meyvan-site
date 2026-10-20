import React from 'react';
import { ShieldCheck, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const TermsPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-start text-xs sm:text-sm text-[#0B080F]/80 leading-relaxed">
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-2">
            {t('terms.title')}
          </h1>
          <p className="text-xs text-[#A89B8A]">
            {t('terms.subtitle')}
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

      <div className="bg-white p-6 sm:p-8 rounded-2xl border space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            {t('terms.sec1.title')}
          </h2>
          <p>
            {t('terms.sec1.desc')}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
            {t('terms.sec2.title')}
          </h2>
          <p>
            {t('terms.sec2.desc')}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B080F]">
            {t('terms.sec3.title')}
          </h2>
          <p>
            {t('terms.sec3.desc')}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B080F]">
            {t('terms.sec4.title')}
          </h2>
          <p>
            {t('terms.sec4.desc')}
          </p>
        </section>
      </div>
    </div>
  );
};
