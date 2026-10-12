import React, { useState } from 'react';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { formatToman, toPersianDigits } from '../../utils/persian';
import { X, Settings, RotateCcw, ShieldCheck, Check, Info } from 'lucide-react';
import { DEFAULT_PRICING_CONFIG } from '../../utils/pricing';

interface PricingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingSettingsModal: React.FC<PricingSettingsModalProps> = ({ isOpen, onClose }) => {
  const { pricingConfig, updatePricingConfig, status } = useGoldPrice();

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
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E5DED2] text-[#0B0F14]">
        
        {/* Header */}
        <div className="bg-[#0B0F14] text-white p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-serif-luxury text-base font-semibold">پیکربندی و موازین محاسبه نرخ طلا</h3>
              <p className="text-[11px] text-[#A89B8A] mt-0.5">شفافیت مبنای محاسبه مالیات، سود و نرخ روز</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-[#F7F5EE] p-3.5 border-b border-[#E5DED2] text-xs text-[#202124] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            در میوان نرخ‌های طلا و ضرایب مالیاتی ثابت و غیرقابل تغییر نیستند، بلکه مطابق جدیدترین ابلاغیه‌های قانونی اتحادیه و قانون مالیات بر ارزش افزوده طلا تنظیم می‌گردند.
          </p>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs">
          
          {/* 1. Reference Gold Price */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-[#0B0F14]">نرخ مرجع هر گرم طلای ۱۸ عیار (تومان):</label>
              <span className="font-numeral text-[#D4AF37] font-bold">{formatToman(goldRate)}</span>
            </div>
            <input
              type="number"
              min="1000000"
              max="20000000"
              step="10000"
              value={goldRate}
              onChange={(e) => setGoldRate(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-[#E5DED2] focus:border-[#D4AF37] outline-none font-numeral text-left"
            />
            <p className="text-[10px] text-[#77716A] mt-1">
              * قابل تطبیق با آخرین نرخ رسمی تابلوی طلافروشان کشور
            </p>
          </div>

          {/* 2. Tax Settings (VAT) */}
          <div className="p-3.5 rounded-xl bg-[#F7F5EE] border border-[#E5DED2] space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-[#0B0F14]">درصد مالیات بر ارزش افزوده (VAT):</label>
              <span className="font-numeral font-bold text-[#202124]">٪{toPersianDigits(vatRate)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 9, label: '۹٪ (قانون فعلی طلا)' },
                { val: 10, label: '۱۰٪ (اختیاری سال نو)' },
                { val: 0, label: '۰٪ (معافیت کامل)' }
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
              <label className="block text-[11px] font-semibold text-[#0B0F14] mb-1">مبنای اعمال مالیات:</label>
              <select
                value={vatBase}
                onChange={(e) => setVatBase(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-[#E5DED2] bg-white text-xs outline-none"
              >
                <option value="wage_and_profit">مجموع اجرت و سود (مقررات مصوب اتحادیه و قانون طلا)</option>
                <option value="total">کل ارزش کالا (روش سنتی کالاهای عمومی)</option>
                <option value="none">بدون محاسبه مالیات</option>
              </select>
            </div>
          </div>

          {/* 3. Profit Settings */}
          <div className="p-3.5 rounded-xl bg-[#F7F5EE] border border-[#E5DED2] space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-[#0B0F14]">درصد سود مصوب فروشنده طلا:</label>
              <span className="font-numeral font-bold text-[#202124]">٪{toPersianDigits(profitRate)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 7, label: '۷٪ (سقف اتحادیه)' },
                { val: 5, label: '۵٪ (تخفیف ویژه)' },
                { val: 0, label: '۰٪ (قیمت درب کارگاه)' }
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
              <label className="block text-[11px] font-semibold text-[#0B0F14] mb-1">مبنای محاسبه سود:</label>
              <select
                value={profitBase}
                onChange={(e) => setProfitBase(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-[#E5DED2] bg-white text-xs outline-none"
              >
                <option value="gold_plus_wage">ارزش طلای خام + اجرت ساخت (فرمول استاندارد کشوری)</option>
                <option value="gold_only">فقط ارزش طلای خام</option>
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
              <span>بازنشانی به پیش‌فرض اتحادیه</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0B0F14] hover:bg-[#D4AF37] text-white hover:text-[#0B0F14] font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              {savedNotice ? <Check className="w-4 h-4 text-emerald-400" /> : null}
              <span>{savedNotice ? 'اعمال شد' : 'ذخیره و اعمال در سایت'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
