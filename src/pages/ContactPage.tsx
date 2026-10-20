import React, { useState } from 'react';
import { MapPin, Phone, MessageCircle, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const { t, language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-serif-luxury tracking-widest text-[#997D24] uppercase block">
          {t('contact.badge')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-[#0B080F]">
          {t('contact.title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A89B8A] max-w-lg mx-auto leading-relaxed">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-start">
        {/* Info Col */}
        <div className="md:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#0B080F]/5 space-y-6">
          <h2 className="text-lg font-serif-luxury font-bold text-[#0B080F]">{t('contact.info.title')}</h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-[#D4AF37] shrink-0 border">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-[#0B080F] block mb-0.5">{t('contact.address.label')}</span>
                <span className="text-neutral-600 leading-relaxed">
                  {t('contact.address.val')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-[#D4AF37] shrink-0 border">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-[#0B080F] block mb-0.5">{t('contact.phone.label')}</span>
                <a href="tel:09132560616" className="text-neutral-600 hover:text-[#997D24] font-numeral block">
                  {language === 'fa' ? '۰۹۱۳۲۵۶۰۶۱۶' : '+98 913 256 0616'}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-[#D4AF37] shrink-0 border">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-[#0B080F] block mb-0.5">{t('contact.hours.label')}</span>
                <span className="text-neutral-600">{t('contact.hours.val')}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-emerald-600 shrink-0 border">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-[#0B080F] block mb-0.5">{t('contact.whatsapp.label')}</span>
                <a
                  href="https://wa.me/+989132560616"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline font-numeral"
                >
                  {t('contact.whatsapp.val')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#0B080F]/5">
          <h2 className="text-lg font-serif-luxury font-bold text-[#0B080F] mb-4">{t('contact.form.title')}</h2>

          {submitted ? (
            <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-[#0B080F] mb-1">{t('contact.form.success_title')}</h3>
              <p className="text-xs text-[#A89B8A]">
                {t('contact.form.success_desc')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#0B080F] mb-1">{t('contact.form.name')}</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={language === 'fa' ? 'مثال: علیرضا صفوی' : 'e.g. Alireza Safavi'}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0B080F] mb-1">{t('contact.form.phone')}</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={language === 'fa' ? '۰۹۱۲۳۴۵۶۷۸۹' : '+98 912 345 6789'}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none font-numeral"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0B080F] mb-1">{t('contact.form.message')}</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={language === 'fa' ? 'مدل مورد نظر، وزن تقریبی، طرح دلخواه و...' : 'Desired jewelry piece, approximate grams, custom modifications...'}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-[#D4AF37] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>{t('contact.form.submit')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

