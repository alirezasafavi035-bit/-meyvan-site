import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const phoneNumber = '+989132560616'; // Official Meyvan WhatsApp number
  const defaultMessage = encodeURIComponent('درود، مایل به مشاوره و استعلام در خصوص محصولات طلا و جواهر میوان هستم.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="مشاوره مستقیم در واتساپ"
      className="fixed bottom-20 md:bottom-8 left-5 z-40 group flex items-center gap-2.5 bg-[#0B080F] border border-[#D4AF37]/50 text-[#D4AF37] px-3.5 py-2.5 rounded-full shadow-2xl hover:bg-[#D4AF37] hover:text-[#0B080F] transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:text-[#0B080F] transition-colors" />
      <span className="text-xs font-semibold tracking-wide hidden sm:inline">
        مشاوره آنلاین طلا
      </span>
    </a>
  );
};
