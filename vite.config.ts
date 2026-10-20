import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // Endpoint: /api/price
        if (url === '/api/price' && req.method === 'GET') {
          try {
            const raw = fs.readFileSync(path.resolve(__dirname, 'public/data/prices.json'), 'utf-8');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(raw);
            return;
          } catch (e) {
            console.error('Error serving /api/price:', e);
          }
        }

        // Endpoint: /api/create-order
        if (url === '/api/create-order' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const { items, customer } = data;

              if (!customer?.fullName || !customer?.mobile || !items || !Array.isArray(items)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ success: false, message: 'اطلاعات مشتری یا اقلام سفارش ناقص است.' }));
                return;
              }

              const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'public/data/products.json'), 'utf-8'));
              const priceData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'public/data/prices.json'), 'utf-8'));
              const gold18Rate = priceData.gold18PerGram || 25790000;

              let serverTotal = 0;
              let totalWeight = 0;

              for (const it of items) {
                const prod = products.find((p: { sku: string }) => p.sku === it.sku);
                if (!prod) continue;
                const qty = Math.max(1, Number(it.quantity) || 1);
                const weight = Number(it.selectedWeight) > 0 ? Number(it.selectedWeight) : Number(prod.weightGrams);
                totalWeight += weight * qty;

                const karatFactor = (prod.karat || 18) / 18;
                const rawGold = Math.round(weight * gold18Rate * karatFactor);
                const wage = Math.round(rawGold * (prod.wagePercent || 0.15));
                const profit = Math.round((rawGold + wage) * 0.07);
                const vat = Math.round((wage + profit) * 0.10);
                const unitTotal = rawGold + wage + profit + vat + (prod.stonePrice || 0);

                serverTotal += unitTotal * qty;
              }

              const orderId = `ORD-MYV-${Date.now().toString().slice(-6)}`;
              const authority = `A0000${Math.floor(1000000000 + Math.random() * 9000000000)}`;

              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({
                success: true,
                orderId,
                authority,
                serverCalculatedTotal: serverTotal,
                totalWeightGrams: Number(totalWeight.toFixed(2)),
                goldReferenceRate: gold18Rate,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
                paymentUrl: null // Local sandbox mode: directly ready for verify
              }));
              return;
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ success: false, message: (err as Error)?.message || 'Server error' }));
              return;
            }
          });
          return;
        }

        // Endpoint: /api/verify
        if (url === '/api/verify' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const refId = `SHAPARAK-${Math.floor(10000000 + Math.random() * 90000000)}`;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({
                success: true,
                orderId: data.orderId || `ORD-MYV-${Date.now().toString().slice(-6)}`,
                refId,
                message: 'پرداخت با موفقیت توسط شبکه شتاب و شاپرک تایید شد.'
              }));
              return;
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ success: false, message: (err as Error)?.message }));
              return;
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
