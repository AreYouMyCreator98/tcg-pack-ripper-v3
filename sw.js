const VERSION = 'tcg-pack-ripper-0.252.0-1';
const STATIC = `${VERSION}-static`;
const MEDIA = `${VERSION}-media`;
const CORE = [
  './','./index.html','./src/main.js','./src/ui.js','./src/app/runtime-loader.js','./src/app/diagnostics.js',
  './src/config/app-config.js','./src/config/runtime-manifest.js','./src/utils/async.js','./src/app/navigation-preload.js','./src/systems/binder.js','./src/systems/rank-frame-renderer.js','./src/screens/binder/index.js','./src/screens/binder/binder-bridge.js','./src/screens/binder/binder-model.js','./src/screens/binder/binder-renderer.js','./src/screens/binder/binder-inspector.js','./src/screens/binder/binder-status.js','./src/artwork/index.js','./src/artwork/card-identity.js','./src/artwork/artwork-db.js','./src/artwork/artwork-queue.js','./src/artwork/artwork-resolver.js','./src/artwork/artwork-cache.js',
  './styles/core.css','./styles/collection.css','./styles/packs.css','./styles/multiplayer.css','./styles/binder.css','./styles/mobile-performance.css',
  './runtime/core.js','./runtime/progression.js','./runtime/special-collection.js','./runtime/packs.js','./runtime/binder-bridge.js',
  './ui/chrome.html','./ui/screens/rip.html','./ui/screens/binder.html','./ui/screens/bulk.html','./ui/screens/trade.html','./ui/screens/profile.html','./ui/overlays.html'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC)
    .then(cache => Promise.allSettled(CORE.map(async url => {
      try { const r = await fetch(url, { cache: 'reload' }); if (r.ok) await cache.put(url, r); } catch (_) {}
    })))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => ![STATIC, MEDIA].includes(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // never cache Supabase/API traffic

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  if (url.pathname.includes('/assets/')) {
    event.respondWith(caches.open(MEDIA).then(async cache => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    }));
    return;
  }

  event.respondWith(caches.open(STATIC).then(async cache => {
    const hit = await cache.match(req);
    const network = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    return hit || await network || Response.error();
  }));
});
