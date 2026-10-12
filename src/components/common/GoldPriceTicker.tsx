import React, { useState } from 'react';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { formatToman, toPersianDigits } from '../../utils/persian';
import { RefreshCw, SlidersHorizontal, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PricingSettingsModal } from './PricingSettingsModal';

export const GoldPriceTicker: React.FC = () => {
  const { gold18PerGram, status, isLoading, lastUpdated, refreshPrice, pricingConfig } = useGoldPrice();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshPrice();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getStatusBadge = () => {
    if (status === 'live') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          نرخ برخط (مبنای ۱۸ عیار)
        </span>
      );
    }
    if (status === 'manual') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-sky-400">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          تنظیم دستی کاربر
        </span>
      );
    }
    if (status === 'stale') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          در حال به‌روزرسانی استعلام
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-rose-400">
        <AlertTriangle className="w-3.5 h-3.5" />
        نرخ نیازمند تایید
      </span>
    );
  };

  return (
    <>
      <div className="bg-[#0B0F14] border-b border-[#E5DED2]/20 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Right side: Gold reference rate & status */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-white/60">نرخ مبنای هر گرم طلای ۱۸ عیار (۷۵۰):</span>
            <span className="font-semibold text-[#D4AF37] font-numeral text-sm">
              {formatToman(gold18PerGram)}
            </span>
            <span className="text-white/30 hidden sm:inline">|</span>
            <div className="hidden sm:inline-flex items-center gap-2">
              {getStatusBadge()}
            </div>
            {pricingConfig.defaultVatPercent > 0 && (
              <span className="text-[10px] text-white/50 hidden md:inline">
                (مالیات ٪{toPersianDigits(Math.round(pricingConfig.defaultVatPercent * 100))} {pricingConfig.vatBase === 'total' ? 'بر کل کالا' : 'فقط بر اجرت و سود'})
              </span>
            )}
          </div>

          {/* Left side: Formula Settings and refresh */}
          <div className="flex items-center gap-3 text-white/70">
            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-1 text-[#D4AF37] hover:underline focus-visible:outline-none text-[11px]"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>پیکربندی و شفافیت فرمول</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              className="p-1 hover:text-[#D4AF37] transition-colors rounded disabled:opacity-50"
              aria-label="به‌روزرسانی استعلام قیمت"
              title="بروزرسانی نرخ طلا"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Settings and Transparency Modal */}
      <PricingSettingsModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </>
  );
};
