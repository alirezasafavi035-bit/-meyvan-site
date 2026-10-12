#!/usr/bin/env node
/**
 * MEYVAN Gold Price Updater
 * Fetches latest 18k gold price from PRICE_API_URL or environment
 * Updates public/data/prices.json gracefully without breaking workflow on errors.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const priceFilePath = path.join(ROOT_DIR, 'public', 'data', 'prices.json');

const apiUrl = process.env.PRICE_API_URL;
const apiKey = process.env.PRICE_API_KEY;

async function updatePrices() {
  if (!apiUrl) {
    console.log('No PRICE_API_URL provided in environment. Retaining existing prices.json.');
    return;
  }

  try {
    console.log(`Fetching latest gold price from: ${apiUrl}...`);
    const headers = {
      'User-Agent': 'MeyvanGoldBot/1.0',
      'Accept': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['x-api-key'] = apiKey;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(apiUrl, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }

    const data = await res.json();
    let gold18PerGram = null;

    if (typeof data.gold18PerGram === 'number') {
      gold18PerGram = data.gold18PerGram;
    } else if (typeof data.price === 'number') {
      gold18PerGram = data.price;
    } else if (data.data && typeof data.data.gold18PerGram === 'number') {
      gold18PerGram = data.data.gold18PerGram;
    }

    if (!gold18PerGram || gold18PerGram <= 0) {
      throw new Error(`Invalid price parsed from API: ${JSON.stringify(data)}`);
    }

    const payload = {
      gold18PerGram,
      currency: 'TOMAN',
      source: 'Meyvan Automated Price Feed',
      updatedAt: new Date().toISOString(),
      change24hPercent: typeof data.change24hPercent === 'number' ? data.change24hPercent : 0,
      high24h: data.high24h || gold18PerGram * 1.01,
      low24h: data.low24h || gold18PerGram * 0.99
    };

    fs.writeFileSync(priceFilePath, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`Successfully updated prices.json: 18K Gold = ${gold18PerGram.toLocaleString('fa-IR')} Toman`);
  } catch (err) {
    console.warn(`Warning: Could not fetch price from API (${err.message}). Retaining existing prices.json.`);
    // Exit with code 0 so CI/CD does not fail
    process.exit(0);
  }
}

updatePrices();
