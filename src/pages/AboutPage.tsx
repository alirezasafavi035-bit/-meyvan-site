import React from 'react';
import { Award, Compass, Sparkles, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <Logo variant="emblem" size="lg" />
        </div>
        <span className="text-xs font-serif-luxury tracking-[0.25em] text-[#997D24] uppercase block">
          {t('about.badge')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-[#0B080F]">
          {t('about.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#A89B8A] leading-relaxed">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Narrative Section with Image */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-[#0B080F]/5 shadow-sm text-start">
        <div className="md:col-span-6 space-y-4 text-xs sm:text-sm text-[#0B080F]/80 leading-relaxed">
          <h2 className="text-xl font-serif-luxury font-bold text-[#0B080F]">
            {t('about.narrative.title')}
          </h2>
          <p>
            {t('about.narrative.p1')}
          </p>
          <p>
            {t('about.narrative.p2')}
          </p>
        </div>

        <div className="md:col-span-6 rounded-2xl overflow-hidden border border-[#D4AF37]/30">
          <img
            src="/images/craft.jpg"
            alt="MEYVAN Atelier in Yazd"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-start">
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-2">
          <Sparkles className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          <h3 className="font-bold text-sm text-[#0B080F]">{t('about.pillar1.title')}</h3>
          <p className="text-xs text-[#A89B8A] leading-relaxed">
            {t('about.pillar1.desc')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-2">
          <ShieldCheck className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          <h3 className="font-bold text-sm text-[#0B080F]">{t('about.pillar2.title')}</h3>
          <p className="text-xs text-[#A89B8A] leading-relaxed">
            {t('about.pillar2.desc')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-2">
          <Award className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          <h3 className="font-bold text-sm text-[#0B080F]">{t('about.pillar3.title')}</h3>
          <p className="text-xs text-[#A89B8A] leading-relaxed">
            {t('about.pillar3.desc')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-2">
          <Compass className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          <h3 className="font-bold text-sm text-[#0B080F]">{t('about.pillar4.title')}</h3>
          <p className="text-xs text-[#A89B8A] leading-relaxed">
            {t('about.pillar4.desc')}
          </p>
        </div>
      </div>
    </div>
  );
};

