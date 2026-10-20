import React, { useState } from 'react';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Settings, RotateCcw, ShieldCheck, Check } from 'lucide-react';
import { DEFAULT_PRICING_CONFIG } from '../../utils/pricing';

interface PricingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingSettingsModal: React.FC<PricingSettingsModalProps> = ({ isOpen, onClose }) => {
  const { pricingConfig, updatePricingConfig } = useGoldPrice();
  const { t, formatPrice, formatNum, language, dir } = useLanguage();

  const [goldRate, setGoldRate] = useState<number>(pricingConfig.gold18PerGram);
  const [vatRate, setVatRate] = useState<number>(Math.round(pricingConfig.defaultVatPercent * 100));
  const [vatBase, setVatBase] = useState(pricingConfig.vatBase);
  const [profitRate, setProfitRate] = useState<number>(Math.round(pricingConfig.defaultProfitPercent * 100));
  const [profitBase, setProfitBase] = useState(pricingConfig.profitBase);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingConfig({
      gold18PerGram: Number(goldRate),
      defaultVatPercent: vatRate / 100,
      vatBase,
      defaultProfitPercent: profitRate / 100,
      profitBase,
      pricingStatus: 'manual'
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  const handleResetToUnionDefault = () => {
    setGoldRate(DEFAULT_PRICING_CONFIG.gold18PerGram);
    setVatRate(Math.round(DEFAULT_PRICING_CONFIG.defaultVatPercent * 100));
    setVatBase(DEFAULT_PRICING_CONFIG.vatBase);
    setProfitRate(Math.round(DEFAULT_PRICING_CONFIG.defaultProfitPercent * 100));
    setProfitBase(DEFAULT_PRICING_CONFIG.profitBase);
    updatePricingConfig(DEFAULT_PRICING_CONFIG);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E5DED2] text-[#0B0F14] text-start">
        
        {/* Header */}
        <div className="bg-[#0B0F14] text-white p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-serif-luxury text-base font-semibold">{t('settings.title')}</h3>
              <p className="text-[11px] text-[#A89B8A] mt-0.5">{t('settings.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-[#F7F5EE] p-3.5 border-b border-[#E5DED2] text-xs text-[#202124] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t('settings.union_disclaimer')}
          </p>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs">
          
          {/* 1. Reference Gold Price */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-[#0B0F14]">{t('settings.ref_rate_label')}</label>
              <span className="font-numeral text-[#D4AF37] font-bold">{formatPrice(goldRate)}</span>
            </div>
            <input
              type="number"
              min="1000000"
              max="20000000"
              step="10000"
              value={goldRate}
              onChange={(e) => setGoldRate(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-[#E5DED2] focus:border-[#D4AF37] outline-none font-numeral text-start"
            />
            <p className="text-[10px] text-[#77716A] mt-1">
              {language === 'fa' ? '* قابل تطبیق با آخرین نرخ رسمی تابلوی طلافروشان کشور' : '* Aligned with official live benchmark board rates across Iran'}
            </p>
          </div>

          {/* 2. Tax Settings (VAT) */}
          <div className="p-3.5 rounded-xl bg-[#F7F5EE] border border-[#E5DED2] space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-[#0B0F14]">{t('settings.vat_label')}</label>
              <span className="font-numeral font-bold text-[#202124]">
                {language === 'fa' ? `٪${formatNum(vatRate)}` : `${vatRate}%`}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 10, label: language === 'fa' ? '۱۰٪ (قانون رسمی طلا)' : '10% (Official VAT)' },
                { val: 9, label: language === 'fa' ? '۹٪ (نرخ پیشین)' : '9% (Previous)' },
                { val: 0, label: language === 'fa' ? '۰٪ (معافیت کامل)' : '0% (Exempt)' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setVatRate(opt.val)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] border transition-colors ${
                    vatRate === opt.val
                      ? 'bg-[#0B0F14] text-[#D4AF37] border-[#0B0F14] font-bold'
                      : 'border-[#E5DED2] text-[#77716A] hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#0B0F14] mb-1">{language === 'fa' ? 'مبنای اعمال مالیات:' : 'VAT Calculation Base:'}</label>
              <select
                value={vatBase}
                onChange={(e) => setVatBase(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-[#E5DED2] bg-white text-xs outline-none"
              >
                <option value="wage_and_profit">{language === 'fa' ? 'مجموع اجرت و سود (مقررات مصوب اتحادیه و قانون طلا)' : 'Wage & Profit Sum (Official Union Directive)'}</option>
                <option value="total">{language === 'fa' ? 'کل ارزش کالا (روش سنتی کالاهای عمومی)' : 'Full Item Value (General Commodities)'}</option>
                <option value="none">{language === 'fa' ? 'بدون محاسبه مالیات' : 'No Tax Assessment'}</option>
              </select>
            </div>
          </div>

          {/* 3. Profit Settings */}
          <div className="p-3.5 rounded-xl bg-[#F7F5EE] border border-[#E5DED2] space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-[#0B0F14]">{t('settings.profit_label')}</label>
              <span className="font-numeral font-bold text-[#202124]">
                {language === 'fa' ? `٪${formatNum(profitRate)}` : `${profitRate}%`}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 7, label: language === 'fa' ? '۷٪ (سقف اتحادیه)' : '7% (Union Cap)' },
                { val: 5, label: language === 'fa' ? '۵٪ (تخفیف ویژه)' : '5% (Promotional)' },
                { val: 0, label: language === 'fa' ? '۰٪ (قیمت درب کارگاه)' : '0% (Workshop Direct)' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setProfitRate(opt.val)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] border transition-colors ${
                    profitRate === opt.val
                      ? 'bg-[#0B0F14] text-[#D4AF37] border-[#0B0F14] font-bold'
                      : 'border-[#E5DED2] text-[#77716A] hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#0B0F14] mb-1">{language === 'fa' ? 'مبنای محاسبه سود:' : 'Profit Base:'}</label>
              <select
                value={profitBase}
                onChange={(e) => setProfitBase(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-[#E5DED2] bg-white text-xs outline-none"
              >
                <option value="gold_plus_wage">{language === 'fa' ? 'ارزش طلای خام + اجرت ساخت (فرمول استاندارد کشوری)' : 'Raw Gold Value + Labor Wage (Union Standard)'}</option>
                <option value="gold_only">{language === 'fa' ? 'فقط ارزش طلای خام' : 'Raw Gold Value Only'}</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToUnionDefault}
              className="text-[#77716A] hover:text-[#0B0F14] text-xs flex items-center gap-1 p-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('settings.reset_btn')}</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0B0F14] hover:bg-[#D4AF37] text-white hover:text-[#0B0F14] font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              {savedNotice ? <Check className="w-4 h-4 text-emerald-400" /> : null}
              <span>{savedNotice ? (language === 'fa' ? 'اعمال شد' : 'Applied') : t('settings.save_btn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
