import React, { useState } from 'react';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { formatToman, toPersianDigits, formatPersianDateTime } from '../../utils/persian';
import { RefreshCw, SlidersHorizontal, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PricingSettingsModal } from './PricingSettingsModal';

export const GoldPriceTicker: React.FC = () => {
  const { gold18PerGram, status, isLoading, lastUpdated, priceData, refreshPrice, pricingConfig } = useGoldPrice();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshPrice();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formattedTimestamp = formatPersianDateTime(priceData?.updatedAt || lastUpdated);

  return (
    <>
      <div className="bg-[#0B0F14] border-b border-[#E5DED2]/20 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Right side: Gold reference rate, TGJU verified badge & timestamp */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <span className="text-white/60">نرخ مبنای هر گرم طلای ۱۸ عیار (۷۵۰):</span>
            <span className="font-semibold text-[#D4AF37] font-numeral text-sm">
              {formatToman(gold18PerGram)}
            </span>

            {/* TGJU Verified Badge */}
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>نرخ معتبر از TGJU</span>
            </span>

            {/* Timestamp from Worker */}
            <span className="text-white/70 font-numeral text-[11px]">
              آخرین به‌روزرسانی: {formattedTimestamp}
            </span>

            {pricingConfig.defaultVatPercent > 0 && (
              <span className="text-[10px] text-white/50 hidden lg:inline">
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
