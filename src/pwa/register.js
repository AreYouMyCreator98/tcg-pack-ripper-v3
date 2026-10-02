import { APP_CONFIG } from '../config/app-config.js';

export function registerPWA() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(APP_CONFIG.buildId)}`, { scope: './' });
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            window.dispatchEvent(new CustomEvent('tcg:update-ready', { detail: { version: APP_CONFIG.version } }));
          }
        });
      });
    } catch (err) {
      console.warn('[TCG] Service worker registration failed', err);
    }
  }, { once: true });
}
