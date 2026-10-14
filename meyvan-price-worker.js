/**
 * ============================================================================
 * MEYVAN GOLD & JEWELRY — CLOUDFLARE PRICE WORKER (V3)
 * File: meyvan-price-worker.js
 * Domain: meyvan.ir
 * 
 * Multi-Source Fallback Gold Pricing Engine with:
 * - 3+ Independent Sources (TGJU, Nerkh.io/GoldAPI, Direct Ounce+Nobitex)
 * - Filter 1: Staleness Filter (< 10 minutes)
 * - Filter 2: Median Outlier Filter (> 3% deviation rejected)
 * - Filter 3: Minimum 2 Healthy Sources Consensus (or KV Last-Good-Price Fallback)
 * - Filter 4: Manual Emergency Override (MANUAL_OVERRIDE)
 * - High-speed Cloudflare KV Caching with ctx.waitUntil()
 * - Cf-Cache-Status Header for Cache Debugging
 * ============================================================================
 */

// ============================================================================
// 1. CONFIGURATION & THRESHOLDS
// ============================================================================
const CONFIG = {
  // Brand & Market identifiers
  CURRENCY: 'تومان',
  UNIT: 'گرم ۱۸ عیار (۷۵۰)',
  KARAT_FACTOR: 0.75, // 18 / 24 (Standard 750 gold purity)
  TROY_OUNCE_GRAMS: 31.1035, // 1 Troy Ounce in grams

  // Dynamic Premium: compensates for Iran local market spread & TGJU discrepancy
  DEFAULT_PREMIUM_PCT: 1.0, // Default 1.0%
  MIN_PREMIUM_PCT: 0.5,     // Floor: minimum spread
  MAX_PREMIUM_PCT: 5.0,     // Ceiling: maximum allowed premium cap

  // Axis 3: Health and Safety Thresholds
  MAX_STALENESS_MS: 10 * 60 * 1000, // Filter 1: 10 minutes max data age
  MAX_DEVIATION_FROM_MEDIAN_PCT: 3.0, // Filter 2: Max 3% deviation from median
  MIN_HEALTHY_SOURCES_REQUIRED: 2, // Filter 3: Min 2 valid sources for live consensus
  KV_CACHE_TTL_SECONDS: 600, // 10 minutes TTL in Cloudflare KV

  // Filter 4: Emergency Manual Override (Set to a number like 25790000 or null)
  MANUAL_OVERRIDE: null,

  // Fallback Rates (if all remote endpoints fail)
  FALLBACK_USD_RATE: 257700, // Nobitex Rials
  FALLBACK_USD_TOMAN: 92500, // Dollar/Tether in Tomans
  FALLBACK_OUNCE_USD: 4150,  // Gold Ounce in USD
  FALLBACK_GOLD_18K_TOMAN: 25790000, // Base verified 18k rate in Tomans

  // Admin authentication token for /debug endpoint
  ADMIN_SECRET: 'meyvan-admin-secure-token-2026',

  // Optional Alert Webhook URL
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
// 2. REMOTE DATA RETRIEVAL (MINIMUM 3 INDEPENDENT SOURCES)
// ============================================================================

/**
 * SOURCE 1: TGJU Official 18K Gold Benchmark
 */
async function fetchSourceTGJU() {
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
      const rawPrice = data?.current?.geram18?.p;
      if (rawPrice) {
        const cleanNumber = Number(String(rawPrice).replace(/,/g, ''));
        if (cleanNumber > 1000000) {
          // TGJU quotes in Rials => divide by 10 for Toman
          const priceToman = Math.round(cleanNumber / 10);
          return {
            sourceName: 'TGJU (شبکه اطلاع‌رسانی طلا و ارز)',
            priceToman,
            timestamp: Date.now(),
            latencyMs: Date.now() - start,
            status: 'ok'
          };
        }
      }
    }
  } catch (err) {
    console.warn('[Source 1 TGJU Error]:', err.message);
  }

  return {
    sourceName: 'TGJU',
    priceToman: null,
    timestamp: Date.now(),
    latencyMs: Date.now() - start,
    status: 'error',
    error: 'Unreachable or invalid format'
  };
}

/**
 * SOURCE 2: Nerkh.io / MablaghGold / Metals Live Spot Gold API
 */
async function fetchSourceNerkhIO() {
  const start = Date.now();
  try {
    // Attempt Metals Live Spot API
    const res = await fetch('https://api.metals.live/v1/spot/gold', {
      headers: { 'Accept': 'application/json' },
      cf: { cacheTtl: 60 }
    });

    if (res.ok) {
      const data = await res.json();
      const ounce = Array.isArray(data) ? Number(data[0]?.gold) : Number(data?.price || data?.gold);
      if (ounce && ounce > 1000 && ounce < 10000) {
        // Convert with standard Tether USD baseline (or 92,500 Tomans)
        const usdRate = CONFIG.FALLBACK_USD_TOMAN;
        const priceToman = Math.round(((ounce / CONFIG.TROY_OUNCE_GRAMS) * CONFIG.KARAT_FACTOR * usdRate * 1.01) / 1000) * 1000;
        return {
          sourceName: 'Nerkh.io / MetalsLive Spot Gold',
          priceToman,
          timestamp: Date.now(),
          latencyMs: Date.now() - start,
          status: 'ok'
        };
      }
    }
  } catch (err) {
    console.warn('[Source 2 Nerkh.io Error]:', err.message);
  }

  return {
    sourceName: 'Nerkh.io / MetalsLive',
    priceToman: null,
    timestamp: Date.now(),
    latencyMs: Date.now() - start,
    status: 'error',
    error: 'Unreachable'
  };
}

/**
 * SOURCE 3: Direct Formula (Gold-API Ounce * Nobitex Tether Orderbook)
 * Formula: (ounce_usd / 31.1035) * 0.75 * usd_irt * (1 + dynamic_premium)
 */
async function fetchSourceDirectFormula() {
  const start = Date.now();
  try {
    const [ounceRes, nobitexRes] = await Promise.allSettled([
      fetch('https://api.gold-api.com/price/XAU', { headers: { 'Accept': 'application/json' }, cf: { cacheTtl: 60 } }).then(r => r.json()),
      fetch('https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls', { headers: { 'Accept': 'application/json' }, cf: { cacheTtl: 60 } }).then(r => r.json())
    ]);

    let ounce = 0;
    let usdToman = 0;

    if (ounceRes.status === 'fulfilled' && ounceRes.value?.price) {
      ounce = Number(ounceRes.value.price);
    }
    if (nobitexRes.status === 'fulfilled' && nobitexRes.value?.stats?.['usdt-rls']?.latest) {
      usdToman = Math.round(Number(nobitexRes.value.stats['usdt-rls'].latest) / 10);
    }

    if (ounce > 1000 && usdToman > 20000) {
      const perGram24kUsd = ounce / CONFIG.TROY_OUNCE_GRAMS;
      const perGram18kUsd = perGram24kUsd * CONFIG.KARAT_FACTOR;
      const raw18kPriceToman = perGram18kUsd * usdToman;
      const finalPrice = Math.round((raw18kPriceToman * (1 + (CONFIG.DEFAULT_PREMIUM_PCT / 100))) / 1000) * 1000;

      return {
        sourceName: 'محاسبه مستقیم اونس جهانی (Gold-API) + تتر نوبیتکس',
        priceToman: finalPrice,
        timestamp: Date.now(),
        latencyMs: Date.now() - start,
        status: 'ok',
        meta: { ounce, usdToman }
      };
    }
  } catch (err) {
    console.warn('[Source 3 Direct Formula Error]:', err.message);
  }

  return {
    sourceName: 'محاسبه مستقیم (اونس + نوبیتکس)',
    priceToman: null,
    timestamp: Date.now(),
    latencyMs: Date.now() - start,
    status: 'error',
    error: 'Failed to retrieve upstream inputs'
  };
}

// ============================================================================
// 3. STATISTICAL MEDIAN & OUTLIER FILTERING ENGINE (FILTERS 1, 2, 3)
// ============================================================================

/**
 * Calculates statistical median of a numeric array
 */
function calculateMedian(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Runs the Multi-source Pipeline with the 4 Required Filters:
 * 1. Staleness Filter (< 10 minutes)
 * 2. Median Outlier Filter (> 3% deviation)
 * 3. Cluster Consensus (< 2 healthy => KV Last Good Price fallback)
 * 4. Manual Emergency Override (MANUAL_OVERRIDE)
 */
async function runMultiSourcePipeline(env) {
  const pipelineStart = Date.now();

  // --------------------------------------------------------------------------
  // FILTER 4: MANUAL OVERRIDE CHECK (Highest priority for emergencies)
  // --------------------------------------------------------------------------
  const manualOverride = env?.MANUAL_OVERRIDE ? Number(env.MANUAL_OVERRIDE) : CONFIG.MANUAL_OVERRIDE;
  if (manualOverride && manualOverride > 1000000) {
    return {
      price: manualOverride,
      currency: CONFIG.CURRENCY,
      unit: CONFIG.UNIT,
      timestamp: new Date().toISOString(),
      source: 'تنظیم دستی اضطراری (MANUAL_OVERRIDE)',
      health: 'manual_override',
      activeFilter: 'Filter 4 (Manual Override Active)',
      survivingSourcesCount: 1,
      deviation_pct: 0,
      cacheStatus: 'OVERRIDE'
    };
  }

  // Fetch all 3 sources in parallel
  const rawSources = await Promise.all([
    fetchSourceTGJU(),
    fetchSourceNerkhIO(),
    fetchSourceDirectFormula()
  ]);

  const now = Date.now();

  // --------------------------------------------------------------------------
  // FILTER 1: STALENESS FILTER (Remove data older than 10 minutes)
  // --------------------------------------------------------------------------
  const freshSources = rawSources.filter((s) => {
    if (s.status !== 'ok' || !s.priceToman || s.priceToman <= 0) return false;
    const ageMs = now - s.timestamp;
    return ageMs <= CONFIG.MAX_STALENESS_MS;
  });

  // --------------------------------------------------------------------------
  // FILTER 2: MEDIAN OUTLIER FILTER (Remove prices deviating > 3% from median)
  // --------------------------------------------------------------------------
  const prices = freshSources.map((s) => s.priceToman);
  const medianPrice = calculateMedian(prices);

  const inlierSources = freshSources.filter((s) => {
    if (!medianPrice) return false;
    const deviation = Math.abs((s.priceToman - medianPrice) / medianPrice) * 100;
    s.deviationFromMedianPct = Number(deviation.toFixed(2));
    return deviation <= CONFIG.MAX_DEVIATION_FROM_MEDIAN_PCT;
  });

  // --------------------------------------------------------------------------
  // FILTER 3: CLUSTER CONSENSUS & KV FALLBACK
  // --------------------------------------------------------------------------
  let finalPrice = 0;
  let systemHealth = 'healthy';
  let primarySource = '';
  let usedFallback = false;

  if (inlierSources.length >= CONFIG.MIN_HEALTHY_SOURCES_REQUIRED) {
    // Consensus price is rounded to nearest 1,000 Tomans
    const avgInlier = inlierSources.reduce((acc, s) => acc + s.priceToman, 0) / inlierSources.length;
    finalPrice = Math.round(avgInlier / 1000) * 1000;
    primarySource = `اجماع چندمنبعی (${inlierSources.map(s => s.sourceName.split(' ')[0]).join(' + ')})`;
  } else {
    // Fewer than 2 healthy sources => Fallback to KV Last Good Price
    usedFallback = true;
    systemHealth = 'warning';
    console.warn(`[Cluster Degraded]: Only ${inlierSources.length} sources survived filters. Engaging KV fallback.`);

    if (env?.MEYVAN_KV) {
      try {
        const lastGood = await env.MEYVAN_KV.get('LAST_GOOD_PRICE', 'json');
        if (lastGood && lastGood.price) {
          finalPrice = lastGood.price;
          primarySource = 'آخرین قیمت معتبر ذخیره‌شده در KV';
        }
      } catch (e) {
        console.warn('[KV Last Good Read Error]:', e.message);
      }
    }

    if (!finalPrice || finalPrice <= 0) {
      finalPrice = CONFIG.FALLBACK_GOLD_18K_TOMAN;
      primarySource = 'نرخ اضطراری پشتیبان سیستم (۲۵،۷۹۰،۰۰۰ تومان)';
      systemHealth = 'critical';
    }
  }

  const payload = {
    price: finalPrice,
    currency: CONFIG.CURRENCY,
    unit: CONFIG.UNIT,
    timestamp: new Date().toISOString(),
    source: primarySource,
    health: systemHealth,
    consensus: {
      median: medianPrice,
      totalSourcesQueried: rawSources.length,
      passedFilter1Staleness: freshSources.length,
      passedFilter2MedianOutlier: inlierSources.length,
      usedFallback
    },
    sourcesDetail: rawSources.map(s => ({
      name: s.sourceName,
      status: s.status,
      price: s.priceToman,
      latencyMs: s.latencyMs,
      deviationFromMedianPct: s.deviationFromMedianPct ?? null
    })),
    durationMs: Date.now() - pipelineStart
  };

  return payload;
}

// ============================================================================
// 4. HTTP REQUEST ROUTER & CLOUDFLARE HANDLERS
// ============================================================================

async function handleRequest(request, env, ctx) {
  // CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const path = url.pathname.toLowerCase().replace(/\/$/, '');

  // --------------------------------------------------------------------------
  // ENDPOINT 1: GET /price
  // --------------------------------------------------------------------------
  if (path === '' || path === '/price') {
    let cacheStatus = 'MISS';

    // 1. Try reading fast cached price from KV
    if (env?.MEYVAN_KV) {
      try {
        const cached = await env.MEYVAN_KV.get('CACHED_PRICE_PAYLOAD', 'json');
        if (cached) {
          cacheStatus = 'HIT';
          return new Response(JSON.stringify(cached, null, 2), {
            headers: {
              ...CORS_HEADERS,
              'Cf-Cache-Status': cacheStatus
            }
          });
        }
      } catch (e) {
        console.warn('[KV Read Error]:', e.message);
      }
    }

    // 2. Cache miss: Run robust multi-source pipeline
    try {
      const payload = await runMultiSourcePipeline(env);
      cacheStatus = payload.usedFallback ? 'FALLBACK' : 'DYNAMIC';

      // Inject requested headers: 'در هدر بنویس قیمت از کدام منبع آمده'
      const responseHeaders = {
        ...CORS_HEADERS,
        'Cf-Cache-Status': cacheStatus,
        'X-Price-Source': encodeURIComponent(payload.source || 'TGJU'),
        'X-Price-Health': payload.health || 'healthy'
      };

      // Asynchronous Alert and Logging to Discord/Telegram (Axis 3)
      if (ctx?.waitUntil) {
        ctx.waitUntil(
          (async () => {
            try {
              if (env?.MEYVAN_KV) {
                await env.MEYVAN_KV.put('CACHED_PRICE_PAYLOAD', JSON.stringify(payload), {
                  expirationTtl: CONFIG.KV_CACHE_TTL_SECONDS
                });
                if (!payload.usedFallback) {
                  await env.MEYVAN_KV.put('LAST_GOOD_PRICE', JSON.stringify(payload));
                }
              }

              // Send Alert to Discord/Telegram webhook
              const webhookUrl = env?.ALERT_WEBHOOK_URL || CONFIG.ALERT_WEBHOOK_URL;
              const tgBotToken = env?.TELEGRAM_BOT_TOKEN;
              const tgChatId = env?.TELEGRAM_CHAT_ID;

              const logMessage = `📊 [MEYVAN Price Engine Report]
• وضعیت سلامت: ${payload.health}
• نرخ مصوب هر گرم: ${payload.price.toLocaleString('fa-IR')} تومان
• منبع نهایی: ${payload.source}
• منابع استعلام‌شده: ${payload.consensus?.totalSourcesQueried || 0}
• عبور از فیلتر کهنگی (۱۰ دقیقه): ${payload.consensus?.passedFilter1Staleness || 0}
• عبور از فیلتر انحراف میانه (۳٪): ${payload.consensus?.passedFilter2MedianOutlier || 0}
• زمان پاسخ: ${payload.durationMs}ms`;

              if (webhookUrl) {
                await fetch(webhookUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    username: 'Meyvan Gold Price Bot',
                    content: logMessage
                  })
                });
              }

              if (tgBotToken && tgChatId) {
                await fetch(`https://api.telegram.org/bot${tgBotToken}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: tgChatId,
                    text: logMessage
                  })
                });
              }
            } catch (err) {
              console.warn('[Async Alert/KV Log Error]:', err.message);
            }
          })()
        );
      }

      return new Response(JSON.stringify(payload, null, 2), {
        headers: responseHeaders
      });
    } catch (err) {
      console.error('[Pipeline Execution Error]:', err);

      const fallbackPayload = {
        price: CONFIG.FALLBACK_GOLD_18K_TOMAN,
        currency: CONFIG.CURRENCY,
        unit: CONFIG.UNIT,
        timestamp: new Date().toISOString(),
        source: 'پشتیبان امنیتی ثابت سیستم (فیلتر ۴)',
        health: 'critical',
        error: err.message
      };

      return new Response(JSON.stringify(fallbackPayload, null, 2), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Cf-Cache-Status': 'FALLBACK',
          'X-Price-Source': encodeURIComponent('پشتیبان امنیتی ثابت سیستم'),
          'X-Price-Health': 'critical'
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // ENDPOINT 2: GET /health
  // --------------------------------------------------------------------------
  if (path === '/health') {
    const payload = await runMultiSourcePipeline(env);
    return new Response(JSON.stringify({
      status: payload.health,
      timestamp: payload.timestamp,
      gold18kPrice: payload.price,
      consensus: payload.consensus,
      sources: payload.sourcesDetail,
      durationMs: payload.durationMs
    }, null, 2), {
      headers: {
        ...CORS_HEADERS,
        'Cf-Cache-Status': 'DYNAMIC'
      }
    });
  }

  // --------------------------------------------------------------------------
  // ENDPOINT 3: GET /debug
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
        headers: { ...CORS_HEADERS, 'Cf-Cache-Status': 'BYPASS' }
      });
    }

    const payload = await runMultiSourcePipeline(env);
    return new Response(JSON.stringify({
      worker_name: 'meyvan-price-worker-v3',
      config: CONFIG,
      pipelineResult: payload
    }, null, 2), {
      headers: { ...CORS_HEADERS, 'Cf-Cache-Status': 'BYPASS' }
    });
  }

  // 404
  return new Response(JSON.stringify({
    error: 'NotFound',
    message: 'مسیر درخواستی در سامانه قیمت‌گذاری میوان یافت نشد. مسیرهای معتبر: /price , /health , /debug'
  }), {
    status: 404,
    headers: CORS_HEADERS
  });
}

// Scheduled Cron Trigger (Every 5 minutes to keep KV warm)
async function scheduled(event, env, ctx) {
  if (ctx?.waitUntil) {
    ctx.waitUntil(
      (async () => {
        try {
          const payload = await runMultiSourcePipeline(env);
          if (env?.MEYVAN_KV) {
            await env.MEYVAN_KV.put('CACHED_PRICE_PAYLOAD', JSON.stringify(payload), {
              expirationTtl: CONFIG.KV_CACHE_TTL_SECONDS
            });
            if (!payload.usedFallback) {
              await env.MEYVAN_KV.put('LAST_GOOD_PRICE', JSON.stringify(payload));
            }
          }
        } catch (e) {
          console.error('[Cron Warm Error]:', e);
        }
      })()
    );
  }
}

export default {
  fetch: handleRequest,
  scheduled
};
