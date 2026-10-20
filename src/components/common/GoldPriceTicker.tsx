import React, { useState } from 'react';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatPersianDateTime } from '../../utils/persian';
import { RefreshCw, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { PricingSettingsModal } from './PricingSettingsModal';

export const GoldPriceTicker: React.FC = () => {
  const { gold18PerGram, isLoading, lastUpdated, priceData, refreshPrice, pricingConfig } = useGoldPrice();
  const { t, formatPrice, formatNum, language } = useLanguage();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshPrice();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formattedTimestamp = React.useMemo(() => {
    const rawDate = priceData?.updatedAt ? new Date(priceData.updatedAt) : (lastUpdated || new Date());
    if (language === 'fa') {
      return formatPersianDateTime(rawDate);
    }
    return rawDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' GMT+3:30';
  }, [priceData?.updatedAt, lastUpdated, language]);

  return (
    <>
      <div className="bg-[#0B0F14] border-b border-[#E5DED2]/20 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Main info: Gold reference rate, TGJU verified badge & timestamp */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <span className="text-white/60">{t('ticker.rate_label')}</span>
            <span className="font-semibold text-[#D4AF37] font-numeral text-sm">
              {formatPrice(gold18PerGram)}
            </span>

            {/* TGJU Verified Link Badge */}
            <a
              href="https://www.tgju.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-0.5 rounded-md border border-emerald-500/30 transition-colors"
              title="Verified via Tehran Gold & Jewelry Union Data Feed (TGJU)"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('ticker.tgju_badge')}</span>
              <span className="text-[10px] opacity-75">↗</span>
            </a>

            {/* Timestamp from Worker */}
            <span className="text-white/70 font-numeral text-[11px]">
              {t('ticker.last_update')} {formattedTimestamp}
            </span>

            {pricingConfig.defaultVatPercent > 0 && (
              <span className="text-[10px] text-white/50 hidden lg:inline">
                ({t('ticker.tax_note')})
              </span>
            )}
          </div>

          {/* Left/Right controls: Formula Settings and refresh */}
          <div className="flex items-center gap-3 text-white/70">
            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-1 text-[#D4AF37] hover:underline focus-visible:outline-none text-[11px]"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{t('ticker.formula_settings')}</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              className="p-1 hover:text-[#D4AF37] transition-colors rounded disabled:opacity-50"
              aria-label={t('ticker.refresh_title')}
              title={t('ticker.refresh_title')}
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
