import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const WhatsAppButton: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const phoneNumber = '+989132560616'; // Official Meyvan WhatsApp concierge number
  const defaultMessage = encodeURIComponent(t('whatsapp.default_msg'));
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsapp.aria_label')}
      title={t('whatsapp.aria_label')}
      className={`fixed bottom-20 md:bottom-8 ${
        dir === 'rtl' ? 'left-5' : 'right-5'
      } z-40 group flex items-center gap-2.5 bg-[#0B080F] border border-[#D4AF37]/50 text-[#D4AF37] px-3.5 py-2.5 rounded-full shadow-2xl hover:bg-[#D4AF37] hover:text-[#0B080F] transition-all duration-300 hover:scale-105 active:scale-95`}
    >
      <div className="relative flex items-center justify-center">
        <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:text-[#0B080F] transition-colors" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
      </div>
      <span className="text-xs font-semibold tracking-wide hidden sm:inline">
        {t('whatsapp.badge')}
      </span>
    </a>
  );
};
