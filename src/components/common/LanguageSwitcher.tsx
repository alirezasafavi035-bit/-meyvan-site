import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'header' | 'footer' | 'mobile';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '', variant = 'header' }) => {
  const { language, setLanguage, dir } = useLanguage();

  if (variant === 'mobile') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 ${className}`}>
        <div className="flex items-center gap-2 text-xs text-white/80">
          <Globe className="w-4 h-4 text-[#D4AF37]" />
          <span>{language === 'fa' ? 'زبان سایت (Language)' : 'Site Language (زبان)'}</span>
        </div>
        <div className="flex items-center gap-1 bg-[#14101A] p-1 rounded-lg border border-[#D4AF37]/30">
          <button
            type="button"
            onClick={() => setLanguage('fa')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
              language === 'fa'
                ? 'bg-[#D4AF37] text-[#0B080F] shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            فارسی
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all font-sans ${
              language === 'en'
                ? 'bg-[#D4AF37] text-[#0B080F] shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            English
          </button>
        </div>
      </div>
    );
  }

  // Header Luxury Minimal Toggle
  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 rounded-full bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 backdrop-blur-sm transition-all ${className}`}
      title={language === 'fa' ? 'تغییر زبان به انگلیسی / Switch to English' : 'تغییر زبان به فارسی / Switch to Persian'}
    >
      <Globe className="w-3.5 h-3.5 text-[#D4AF37] ml-1 mr-0.5 shrink-0 opacity-80" />
      <div className="flex items-center text-[11px] font-medium">
        <button
          type="button"
          onClick={() => setLanguage('fa')}
          aria-label="Persian Language"
          className={`px-2 py-0.5 rounded-full transition-all duration-200 ${
            language === 'fa'
              ? 'bg-[#D4AF37] text-[#0B080F] font-bold shadow-xs'
              : 'text-white/60 hover:text-white'
          }`}
        >
          فا
        </button>
        <span className="text-white/20 text-[10px] select-none">|</span>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          aria-label="English Language"
          className={`px-2 py-0.5 rounded-full transition-all duration-200 font-sans tracking-wider ${
            language === 'en'
              ? 'bg-[#D4AF37] text-[#0B080F] font-bold shadow-xs'
              : 'text-white/60 hover:text-white'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
};
