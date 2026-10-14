/**
 * ============================================================================
 * MEYVAN GOLD & JEWELRY — CLOUDFLARE PRICE WORKER
 * File: meyvan-price-worker.js
 * Domain: meyvan.ir
 * 
 * Direct Autonomous 18K Gold Pricing Engine with TGJU Dynamic Premium Tracker,
 * KV High-Performance Caching, Multi-source Fallback, Health Monitoring & Alerting.
 * ============================================================================
 */

// ============================================================================
// 1. CONFIGURATION & THRESHOLDS
// ============================================================================
const CONFIG = {
  // Brand & Market identifiers
  CURRENCY: 'تومان',
  UNIT: 'گرم ۱۸ عیار',
  KARAT_FACTOR: 0.75, // 18 / 24 (Standard 750 gold purity)
  TROY_OUNCE_GRAMS: 31.1035, // 1 Troy Ounce in grams

  // Dynamic Premium: compensates for Iran local market spread & TGJU discrepancy
  DEFAULT_PREMIUM_PCT: 1.0, // Default 1.0%
  MIN_PREMIUM_PCT: 0.5,     // Floor: minimum spread
  MAX_PREMIUM_PCT: 5.0,     // Ceiling: maximum allowed premium cap

  // Health and safety thresholds
  MAX_DEVIATION_FROM_TGJU_PCT: 3.0, // Alert triggered if deviation > 3%
  MAX_STALENESS_MS: 10 * 60 * 1000, // 10 minutes max cache freshness
  KV_CACHE_TTL_SECONDS: 900,        // 15 minutes TTL in Cloudflare KV

  // Resilient Fallback Rates (if all remote endpoints fail)
  FALLBACK_USD_RATE: 257700, // Nobitex Rials (equivalent to ~25,770 - updated via API)
  FALLBACK_USD_TOMAN: 92500, // Safety fallback for Dollar/Tether in Tomans
  FALLBACK_OUNCE_USD: 4150,  // Safety fallback for Gold Ounce in USD

  // Admin authentication token for /debug endpoint
  ADMIN_SECRET: 'meyvan-admin-secure-token-2026',

  // Optional Alert Webhook URL (Discord, Telegram bot, or Slack)
  ALERT_WEBHOOK_URL: ''
};

// Standard HTTP Headers for CORS and JSON response
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=60, s-maxage=300'
};

// ============================================================================
// 2. REMOTE DATA RETRIEVAL (WITH LATENCY TRACKING & FALLBACKS)
// ============================================================================

/**
 * Fetches Spot Gold Ounce (XAU) in USD with fallback sources
 */
async function fetchOuncePrice() {
  const start = Date.now();
  
  // Source 1: Gold-API.com (Free, Public, No Key)
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU', {
      headers: { 'Accept': 'application/json' },
      cf: { cacheTtl: 60 }
    });
    if (res.ok) {
      const data = await res.json();
      const ounce = Number(data.price);
      if (ounce && ounce > 500 && ounce < 10000) {
        return {
          price: ounce,
          source: 'gold-api.com',
          latency_ms: Date.now() - start,
          status: 'ok'
        };
      }
    }
  } catch (err) {
    console.warn('[Ounce Source 1 Failed]:', err.message);
  }

  // Source 2: Metals.live Fallback
  try {
    const res = await fetch('https://api.metals.live/v1/spot/gold', {
      headers: { 'Accept': 'application/json' },
      cf: { cacheTtl: 60 }
    });
    if (res.ok) {
      const data = await res.json();
      // metals.live returns [{ gold: 4150.2, timestamp: ... }]
      const ounce = Array.isArray(data) ? Number(data[0]?.gold) : Number(data?.price || data?.gold);
      if (ounce && ounce > 500 && ounce < 10000) {
        return {
          price: ounce,
          source: 'metals.live',
          latency_ms: Date.now() - start,
          status: 'ok'
        };
      }
    }
  } catch (err) {
    console.warn('[Ounce Source 2 Failed]:', err.message);
  }

  // Source 3: Static safe fallback
  return {
    price: CONFIG.FALLBACK_OUNCE_USD,
    source: 'fallback_static',
    latency_ms: Date.now() - start,
    status: 'fallback'
  };
}

/**
 * Fetches USDT/USD exchange rate from Nobitex public orderbook
 */
async function fetchUsdRate() {
  const start = Date.now();

  // Source 1: Nobitex USDT/IRT (Toman) Market Stats
  try {
    const res = await fetch('https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls', {
      headers: { 'Accept': 'application/json', 'User-Agent': 'MeyvanPriceWorker/1.0' },
      cf: { cacheTtl: 60 }
    });
    if (res.ok) {
      const data = await res.json();
      // data.stats['usdt-rls'].latest (Rials)
      const rlsPrice = Number(data?.stats?.['usdt-rls']?.latest);
      if (rlsPrice && rlsPrice > 100000) {
        // Convert Rials to Toman
        const tomanRate = Math.round(rlsPrice / 10);
        return {
          rateToman: tomanRate,
          source: 'nobitex_rls',
          latency_ms: Date.now() - start,
          status: 'ok'
        };
      }
    }
  } catch (err) {
    console.warn('[Nobitex Source 1 Failed]:', err.message);
  }

  // Source 2: Nobitex Orderbook USDT/IRT
  try {
    const res = await fetch('https://api.nobitex.ir/v2/orderbook/USDTIRT', {
      headers: { 'Accept': 'application/json' },
      cf: { cacheTtl: 60 }
    });
    if (res.ok) {
      const data = await res.json();
      const lastTrade = Number(data?.lastTradePrice);
      if (lastTrade && lastTrade > 10000) {
        return {
          rateToman: Math.round(lastTrade),
          source: 'nobitex_orderbook',
          latency_ms: Date.now() - start,
          status: 'ok'
        };
      }
    }
  } catch (err) {
    console.warn('[Nobitex Source 2 Failed]:', err.message);
  }

  // Source 3: Fallback calculation
  // CONFIG.FALLBACK_USD_RATE in Rials -> divide by 10 for Tomans
  const fallbackToman = Math.round(CONFIG.FALLBACK_USD_RATE / 10);
  return {
    rateToman: fallbackToman > 10000 ? fallbackToman : CONFIG.FALLBACK_USD_TOMAN,
    source: 'fallback_static',
    latency_ms: Date.now() - start,
    status: 'fallback'
  };
}

/**
 * Fetches TGJU 18k Gold Benchmark Price for verification & dynamic premium calibration
 */
async function fetchTGJUPrice() {
  const start = Date.now();

  try {
    const res = await fetch('https://call.tgju.org/ajax.json', {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.tgju.org/'
      },
      cf: { cacheTtl: 60 }
    });

    if (res.ok) {
      const data = await res.json();
      // TGJU geram18 price object: data.current.geram18.p (Rials or string with commas)
      const rawPrice = data?.current?.geram18?.p;
      if (rawPrice) {
        const cleanNumber = Number(String(rawPrice).replace(/,/g, ''));
        if (cleanNumber > 1000000) {
          // TGJU quotes in Rials => divide by 10 for Toman
          const priceToman = Math.round(cleanNumber / 10);
          return {
            price: priceToman,
            source: 'tgju_ajax',
            latency_ms: Date.now() - start,
            status: 'ok'
          };
        }
      }
    }
  } catch (err) {
    console.warn('[TGJU Fetch Failed]:', err.message);
  }

  return {
    price: null,
    source: 'unavailable',
    latency_ms: Date.now() - start,
    status: 'error'
  };
}

// ============================================================================
// 3. CORE FINANCIAL PRICING FORMULA
// ============================================================================

/**
 * Direct Formula:
 * gold_18k_base = (ounce_usd / 31.1035) * 0.75 * usd_irt
 * gold_18k_final = Math.round(gold_18k_base * (1 + (premium_pct / 100)))
 * Rounded to nearest 1,000 Tomans.
 */
function calculateGoldPrice(ounceUsd, usdIrt, premiumPct = CONFIG.DEFAULT_PREMIUM_PCT) {
  if (!ounceUsd || !usdIrt || ounceUsd <= 0 || usdIrt <= 0) {
    return 0;
  }
  const perGram24kUsd = ounceUsd / CONFIG.TROY_OUNCE_GRAMS;
  const perGram18kUsd = perGram24kUsd * CONFIG.KARAT_FACTOR;
  const raw18kPriceToman = perGram18kUsd * usdIrt;
  
  // Apply dynamic premium
  const withPremium = raw18kPriceToman * (1 + (premiumPct / 100));
  
  // Round to nearest 1,000 Tomans
  return Math.round(withPremium / 1000) * 1000;
}

// ============================================================================
// 4. DYNAMIC PREMIUM & DEVIATION CALIBRATION
// ============================================================================

/**
 * Calibrates PREMIUM_PCT based on empirical market deviation from TGJU:
 * deviation = (tgju - ours) / ours * 100
 * If deviation > 0: PREMIUM_PCT = Math.min(deviation, 5.0)
 * If deviation <= 0: PREMIUM_PCT = 0.5 (floor)
 */
async function updateDynamicPremium(basePrice, tgjuPrice, env) {
  if (!basePrice || !tgjuPrice || tgjuPrice <= 0 || basePrice <= 0) {
    return CONFIG.DEFAULT_PREMIUM_PCT;
  }

  const deviation = ((tgjuPrice - basePrice) / basePrice) * 100;
  let dynamicPremium = CONFIG.DEFAULT_PREMIUM_PCT;

  if (deviation > 0) {
    dynamicPremium = Math.min(Number(deviation.toFixed(2)), CONFIG.MAX_PREMIUM_PCT);
  } else {
    dynamicPremium = CONFIG.MIN_PREMIUM_PCT;
  }

  // Persist in Cloudflare KV if binding available
  if (env?.MEYVAN_KV) {
    try {
      await env.MEYVAN_KV.put('DYNAMIC_PREMIUM_PCT', dynamicPremium.toString(), {
        expirationTtl: CONFIG.KV_CACHE_TTL_SECONDS
      });
    } catch (e) {
      console.warn('[KV Put Dynamic Premium Failed]:', e.message);
    }
  }

  return dynamicPremium;
}

// ============================================================================
// 5. ALERTING & LOGGING ENGINES
// ============================================================================

/**
 * Evaluates system health, registers alerts with 24h TTL, and dispatches webhooks
 */
async function checkAndRecordAlerts(sources, deviationPct, env) {
  const alerts = [];
  const now = new Date().toISOString();

  // Condition 1: High Deviation from TGJU
  if (Math.abs(deviationPct) > CONFIG.MAX_DEVIATION_FROM_TGJU_PCT) {
    alerts.push({
      level: 'warning',
      type: 'high_deviation',
      message: `اختلاف نرخ محاسبه‌شده با تابلوی TGJU برابر ٪${deviationPct.toFixed(2)} است (بیش از سقف مجاز ٪${CONFIG.MAX_DEVIATION_FROM_TGJU_PCT}).`,
      timestamp: now
    });
  }

  // Condition 2: Endpoint Fallbacks
  if (sources.gold_api.status === 'fallback') {
    alerts.push({
      level: 'warning',
      type: 'gold_source_fallback',
      message: 'سرویس‌های اونس طلا پاسخ ندادند؛ نرخ اونس پشتیبان فعال است.',
      timestamp: now
    });
  }

  if (sources.nobitex.status === 'fallback') {
    alerts.push({
      level: 'warning',
      type: 'usd_source_fallback',
      message: 'سرویس نوبیتکس پاسخ نداد؛ نرخ دلار پشتیبان فعال است.',
      timestamp: now
    });
  }

  // Condition 3: Fewer than 2 healthy sources => Critical
  const healthyCount = [sources.gold_api, sources.nobitex, sources.tgju].filter(s => s.status === 'ok').length;
  if (healthyCount < 2) {
    alerts.push({
      level: 'critical',
      type: 'unhealthy_cluster',
      message: `تنها ${healthyCount} منبع از ۳ منبع داده سالم است. سیستم در وضعیت بحرانی قرار دارد.`,
      timestamp: now
    });
  }

  // Persist alerts in KV (24 hours TTL)
  if (env?.MEYVAN_KV && alerts.length > 0) {
    try {
      await env.MEYVAN_KV.put('MEYVAN_ALERTS', JSON.stringify(alerts), {
        expirationTtl: 24 * 60 * 60
      });
    } catch (e) {
      console.warn('[KV Put Alerts Failed]:', e.message);
    }
  }

  // Dispatch Webhook on Critical Alerts
  if (CONFIG.ALERT_WEBHOOK_URL && alerts.some(a => a.level === 'critical')) {
    try {
      await fetch(CONFIG.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 [MEYVAN ALARM]: وضعیت بحرانی در سیستم قیمت‌گذاری طلا: ${alerts.map(a => a.message).join(' | ')}`
        })
      });
    } catch (e) {
      console.warn('[Webhook Notification Failed]:', e.message);
    }
  }

  return alerts;
}

/**
 * Appends daily calibration samples in KV for 7-day statistical review
 */
async function appendDailyLog(sample, env) {
  if (!env?.MEYVAN_KV) return;

  const todayKey = `LOG_${new Date().toISOString().slice(0, 10)}`;
  try {
    const existing = await env.MEYVAN_KV.get(todayKey, 'json') || {
      date: todayKey.replace('LOG_', ''),
      samples: [],
      avg_deviation_pct: 0,
      max_deviation_pct: 0,
      recommended_premium_pct: CONFIG.DEFAULT_PREMIUM_PCT
    };

    existing.samples.push(sample);
    if (existing.samples.length > 288) { // Keep max 288 samples (5-min intervals over 24h)
      existing.samples.shift();
    }

    const deviations = existing.samples.map(s => Math.abs(s.deviation_pct));
    const sum = deviations.reduce((acc, curr) => acc + curr, 0);
    existing.avg_deviation_pct = Number((sum / deviations.length).toFixed(2));
    existing.max_deviation_pct = Number(Math.max(...deviations).toFixed(2));
    existing.recommended_premium_pct = Number((existing.avg_deviation_pct || CONFIG.DEFAULT_PREMIUM_PCT).toFixed(2));

    await env.MEYVAN_KV.put(todayKey, JSON.stringify(existing), {
      expirationTtl: 7 * 24 * 60 * 60 // Retain 7 days
    });
  } catch (e) {
    console.warn('[Daily Log Append Failed]:', e.message);
  }
}

// ============================================================================
// 6. MAIN PRICE RECOMPUTATION PIPELINE
// ============================================================================

async function computeCompletePriceState(env) {
  // 1. Concurrently fetch all three upstream sources
  const [ounceRes, usdRes, tgjuRes] = await Promise.all([
    fetchOuncePrice(),
    fetchUsdRate(),
    fetchTGJUPrice()
  ]);

  // 2. Compute raw un-premium base price
  const rawBasePrice = calculateGoldPrice(ounceRes.price, usdRes.rateToman, 0);

  // 3. Calibrate Dynamic Premium against TGJU
  let dynamicPremium = CONFIG.DEFAULT_PREMIUM_PCT;
  let deviationPct = 0;

  if (tgjuRes.price && rawBasePrice > 0) {
    deviationPct = Number((((tgjuRes.price - rawBasePrice) / rawBasePrice) * 100).toFixed(2));
    dynamicPremium = await updateDynamicPremium(rawBasePrice, tgjuRes.price, env);
  } else if (env?.MEYVAN_KV) {
    const cachedPremium = await env.MEYVAN_KV.get('DYNAMIC_PREMIUM_PCT');
    if (cachedPremium) dynamicPremium = Number(cachedPremium);
  }

  // 4. Calculate Final 18k Price
  const finalPrice = calculateGoldPrice(ounceRes.price, usdRes.rateToman, dynamicPremium);

  // 5. Evaluate Health & Alerts
  const sources = {
    gold_api: ounceRes,
    nobitex: usdRes,
    tgju: tgjuRes
  };

  const alerts = await checkAndRecordAlerts(sources, deviationPct, env);

  let systemHealth = 'healthy';
  if (alerts.some(a => a.level === 'critical')) {
    systemHealth = 'critical';
  } else if (alerts.length > 0) {
    systemHealth = 'warning';
  }

  const nowIso = new Date().toISOString();

  // 6. Assemble state objects
  const pricePayload = {
    price: finalPrice,
    currency: CONFIG.CURRENCY,
    unit: CONFIG.UNIT,
    timestamp: nowIso,
    source: {
      ounce: ounceRes.price,
      usd_rate: usdRes.rateToman,
      premium_pct: dynamicPremium
    },
    health: systemHealth
  };

  const healthPayload = {
    status: systemHealth,
    last_update: nowIso,
    sources: {
      gold_api: { status: ounceRes.status, latency_ms: ounceRes.latency_ms, source: ounceRes.source },
      nobitex: { status: usdRes.status, latency_ms: usdRes.latency_ms, source: usdRes.source },
      tgju: { status: tgjuRes.status, latency_ms: tgjuRes.latency_ms, price: tgjuRes.price }
    },
    deviation_from_tgju_pct: deviationPct,
    dynamic_premium_pct: dynamicPremium,
    alerts
  };

  // 7. Store in KV Cache
  if (env?.MEYVAN_KV) {
    try {
      await env.MEYVAN_KV.put('CACHED_PRICE_PAYLOAD', JSON.stringify(pricePayload), {
        expirationTtl: CONFIG.KV_CACHE_TTL_SECONDS
      });
      await env.MEYVAN_KV.put('CACHED_HEALTH_PAYLOAD', JSON.stringify(healthPayload), {
        expirationTtl: CONFIG.KV_CACHE_TTL_SECONDS
      });
      await env.MEYVAN_KV.put('LAST_GOOD_PRICE', JSON.stringify(pricePayload)); // Permanent backup
    } catch (e) {
      console.warn('[KV Cache Save Failed]:', e.message);
    }
  }

  // 8. Append to daily calibration log
  if (tgjuRes.price) {
    await appendDailyLog({
      time: nowIso,
      our_price: finalPrice,
      tgju_price: tgjuRes.price,
      deviation_pct: deviationPct
    }, env);
  }

  return { pricePayload, healthPayload };
}

// ============================================================================
// 7. HTTP REQUEST ROUTER
// ============================================================================

async function handleRequest(request, env) {
  // Handle CORS Pre-flight Options request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const path = url.pathname.toLowerCase().replace(/\/$/, '');

  // --------------------------------------------------------------------------
  // ENDPOINT 1: GET /price
  // --------------------------------------------------------------------------
  if (path === '' || path === '/price') {
    // 1. Try reading fast cached price from KV
    if (env?.MEYVAN_KV) {
      try {
        const cached = await env.MEYVAN_KV.get('CACHED_PRICE_PAYLOAD', 'json');
        if (cached) {
          return new Response(JSON.stringify(cached, null, 2), { headers: CORS_HEADERS });
        }
      } catch (e) {
        console.warn('[KV Read Error]:', e.message);
      }
    }

    // 2. Cache miss: Compute live price
    try {
      const { pricePayload } = await computeCompletePriceState(env);
      return new Response(JSON.stringify(pricePayload, null, 2), { headers: CORS_HEADERS });
    } catch (err) {
      console.error('[Live Computation Error]:', err);

      // 3. Last Known Good Price from KV
      if (env?.MEYVAN_KV) {
        const lastGood = await env.MEYVAN_KV.get('LAST_GOOD_PRICE', 'json');
        if (lastGood) {
          lastGood.health = 'warning';
          return new Response(JSON.stringify(lastGood, null, 2), { headers: CORS_HEADERS });
        }
      }

      // 4. Hardcoded ultimate fallback
      const ultimateFallbackPrice = calculateGoldPrice(CONFIG.FALLBACK_OUNCE_USD, CONFIG.FALLBACK_USD_TOMAN, CONFIG.DEFAULT_PREMIUM_PCT);
      return new Response(JSON.stringify({
        price: ultimateFallbackPrice,
        currency: CONFIG.CURRENCY,
        unit: CONFIG.UNIT,
        timestamp: new Date().toISOString(),
        source: {
          ounce: CONFIG.FALLBACK_OUNCE_USD,
          usd_rate: CONFIG.FALLBACK_USD_TOMAN,
          premium_pct: CONFIG.DEFAULT_PREMIUM_PCT
        },
        health: 'critical'
      }, null, 2), { headers: CORS_HEADERS });
    }
  }

  // --------------------------------------------------------------------------
  // ENDPOINT 2: GET /health
  // --------------------------------------------------------------------------
  if (path === '/health') {
    if (env?.MEYVAN_KV) {
      try {
        const cachedHealth = await env.MEYVAN_KV.get('CACHED_HEALTH_PAYLOAD', 'json');
        if (cachedHealth) {
          return new Response(JSON.stringify(cachedHealth, null, 2), { headers: CORS_HEADERS });
        }
      } catch (e) {
        console.warn('[Health KV Read Error]:', e.message);
      }
    }

    // Cache miss: Compute fresh health
    const { healthPayload } = await computeCompletePriceState(env);
    return new Response(JSON.stringify(healthPayload, null, 2), { headers: CORS_HEADERS });
  }

  // --------------------------------------------------------------------------
  // ENDPOINT 3: GET /debug (Requires Bearer Authorization)
  // --------------------------------------------------------------------------
  if (path === '/debug') {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (token !== CONFIG.ADMIN_SECRET && token !== (env?.ADMIN_SECRET || '')) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'برای دسترسی به این بخش، توکن احراز هویت ادمین الزامی است.'
      }), {
        status: 401,
        headers: CORS_HEADERS
      });
    }

    const todayKey = `LOG_${new Date().toISOString().slice(0, 10)}`;
    let dailyLog = null;
    let alerts = [];

    if (env?.MEYVAN_KV) {
      dailyLog = await env.MEYVAN_KV.get(todayKey, 'json');
      alerts = await env.MEYVAN_KV.get('MEYVAN_ALERTS', 'json') || [];
    }

    const debugDump = {
      worker_name: 'meyvan-price-worker',
      config: CONFIG,
      timestamp: new Date().toISOString(),
      active_alerts: alerts,
      today_samples: dailyLog
    };

    return new Response(JSON.stringify(debugDump, null, 2), { headers: CORS_HEADERS });
  }

  // 404 Not Found
  return new Response(JSON.stringify({
    error: 'NotFound',
    message: 'مسیر درخواستی در سامانه قیمت‌گذاری میوان یافت نشد. مسیرهای معتبر: /price , /health , /debug'
  }), {
    status: 404,
    headers: CORS_HEADERS
  });
}

// ============================================================================
// 8. SCHEDULED CRON TRIGGER HANDLER (Every 5 Minutes)
// ============================================================================

async function scheduled(event, env, ctx) {
  ctx.waitUntil(
    (async () => {
      console.log(`[Cron Trigger Started]: ${event.cron} at ${new Date().toISOString()}`);
      try {
        await computeCompletePriceState(env);
        console.log('[Cron Trigger Completed]: Fresh gold price cached successfully.');
      } catch (err) {
        console.error('[Cron Trigger Error]:', err);
      }
    })()
  );
}

export default {
  fetch: handleRequest,
  scheduled
};
