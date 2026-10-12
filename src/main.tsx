import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Register lightweight cache-first service worker in production/supporting browsers
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service Worker registration skipped:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
