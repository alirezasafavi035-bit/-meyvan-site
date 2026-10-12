import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  GoldPriceData,
  PriceBreakdown,
  PriceStatus,
  Product,
  PricingConfig,
  InvoiceData,
  CartItem,
  OrderCustomerInfo
} from '../types';
import {
  calculateProductPrice,
  parsePriceResponse,
  DEFAULT_PRICING_CONFIG,
  createInvoiceRecord
} from '../utils/pricing';

interface GoldPriceContextValue {
  gold18PerGram: number;
  priceData: GoldPriceData | null;
  pricingConfig: PricingConfig;
  updatePricingConfig: (updates: Partial<PricingConfig>) => void;
  status: PriceStatus;
  isExpired: boolean;
  isLoading: boolean;
  lastUpdated: Date | null;
  calculatePrice: (product: Product, overrides?: Partial<PricingConfig>) => PriceBreakdown;
  generateInvoice: (
    items: CartItem[],
    customer?: Partial<OrderCustomerInfo>,
    isDraft?: boolean
  ) => InvoiceData;
  refreshPrice: () => Promise<void>;
}

const GoldPriceContext = createContext<GoldPriceContextValue | null>(null);

const POLLING_INTERVAL_MS = 60 * 1000; // 60 seconds

export const GoldPriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [priceData, setPriceData] = useState<GoldPriceData | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => {
    try {
      const saved = localStorage.getItem('meyvan_pricing_config_v2');
      if (saved) {
        return { ...DEFAULT_PRICING_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback to defaults
    }
    return DEFAULT_PRICING_CONFIG;
  });

  const [status, setStatus] = useState<PriceStatus>('live');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updatePricingConfig = (updates: Partial<PricingConfig>) => {
    setPricingConfig((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('meyvan_pricing_config_v2', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save pricing config to localStorage', e);
      }
      return next;
    });
  };

  const determineStatus = (updatedAtStr?: string): PriceStatus => {
    if (!updatedAtStr) return 'stale';
    const updatedTime = new Date(updatedAtStr).getTime();
    if (isNaN(updatedTime)) return 'stale';

    const diffMinutes = (Date.now() - updatedTime) / (1000 * 60);
    if (diffMinutes > 120) {
      return 'expired'; // > 2 hours without confirmation
    }
    if (diffMinutes > 10) {
      return 'stale'; // > 10 mins
    }
    return 'live';
  };

  const fetchPrice = useCallback(async () => {
    const apiEndpoint = import.meta.env.VITE_PRICE_API;
    let dataLoaded = false;

    // 1. Try VITE_PRICE_API if specified
    if (apiEndpoint) {
      try {
        const response = await fetch(apiEndpoint, {
          headers: { Accept: 'application/json' },
          cache: 'no-cache'
        });
        if (response.ok) {
          const json = await response.json();
          const parsed = parsePriceResponse(json);
          if (parsed) {
            setPriceData(parsed);
            updatePricingConfig({
              gold18PerGram: parsed.gold18PerGram,
              updatedAt: parsed.updatedAt,
              priceSource: parsed.source,
              pricingStatus: determineStatus(parsed.updatedAt)
            });
            const date = new Date(parsed.updatedAt);
            setLastUpdated(date);
            setStatus(determineStatus(parsed.updatedAt));
            dataLoaded = true;
          }
        }
      } catch (e) {
        console.warn('Could not fetch from VITE_PRICE_API, falling back to /data/prices.json', e);
      }
    }

    // 2. Try static backup /data/prices.json
    if (!dataLoaded) {
      try {
        const response = await fetch('/data/prices.json?t=' + Date.now(), {
          headers: { Accept: 'application/json' },
          cache: 'no-cache'
        });
        if (response.ok) {
          const json = await response.json();
          const parsed = parsePriceResponse(json);
          if (parsed) {
            setPriceData(parsed);
            updatePricingConfig({
              gold18PerGram: parsed.gold18PerGram,
              updatedAt: parsed.updatedAt,
              priceSource: parsed.source,
              pricingStatus: determineStatus(parsed.updatedAt)
            });
            const date = new Date(parsed.updatedAt);
            setLastUpdated(date);
            setStatus(determineStatus(parsed.updatedAt));
            dataLoaded = true;
          }
        }
      } catch (e) {
        console.warn('Could not fetch /data/prices.json', e);
      }
    }

    if (!dataLoaded && !priceData) {
      setStatus('stale');
    }
    setIsLoading(false);
  }, [priceData]);

  useEffect(() => {
    fetchPrice();

    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (document.visibilityState === 'visible') {
            fetchPrice();
          }
        }, POLLING_INTERVAL_MS);
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPrice();
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchPrice]);

  const calculatePrice = useCallback(
    (product: Product, overrides?: Partial<PricingConfig>): PriceBreakdown => {
      return calculateProductPrice(product, {
        ...pricingConfig,
        ...(overrides || {})
      });
    },
    [pricingConfig]
  );

  const generateInvoice = useCallback(
    (
      items: CartItem[],
      customer?: Partial<OrderCustomerInfo>,
      isDraft: boolean = false
    ): InvoiceData => {
      return createInvoiceRecord({
        items,
        customer,
        isDraft,
        pricingConfig
      });
    },
    [pricingConfig]
  );

  return (
    <GoldPriceContext.Provider
      value={{
        gold18PerGram: pricingConfig.gold18PerGram,
        priceData,
        pricingConfig,
        updatePricingConfig,
        status,
        isExpired: status === 'expired',
        isLoading,
        lastUpdated,
        calculatePrice,
        generateInvoice,
        refreshPrice: fetchPrice
      }}
    >
      {children}
    </GoldPriceContext.Provider>
  );
};

export const useGoldPrice = () => {
  const ctx = useContext(GoldPriceContext);
  if (!ctx) {
    throw new Error('useGoldPrice must be used within GoldPriceProvider');
  }
  return ctx;
};
