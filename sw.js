/* ═══════════════════════════════════════════════════════════════
   SISTEMA // SW.JS — Service Worker (PWA Offline + Background)
═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'sistema-v2';

// Archivos a cachear para uso offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/animation.css',
  '/css/screens.css',
  '/js/modules/state.js',
  '/js/modules/storage.js',
  '/js/modules/notifications.js',
  '/js/modules/titles.js',
  '/js/modules/player.js',
  '/js/modules/quests.js',
  '/js/modules/dungeon.js',
  '/js/modules/shop.js',
  '/js/modules/shadows.js',
  '/js/components/dashboard.js',
  '/js/components/questscreen.js',
  '/js/components/dungeonscreen.js',
  '/js/components/shopscreen.js',
  '/js/components/shadowscreen.js',
  '/js/app.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap',
];

// ── Install: precachear todos los assets ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cachear assets locales (críticos), ignorar errores en externos
      return cache.addAll(ASSETS_TO_CACHE.filter(url => !url.startsWith('http')))
        .then(() => {
          // Intentar cachear fuentes (no crítico)
          const fontUrls = ASSETS_TO_CACHE.filter(url => url.startsWith('http'));
          return Promise.allSettled(fontUrls.map(url => cache.add(url)));
        });
    })
  );
  self.skipWaiting();
});

// ── Activate: limpiar cachés viejos ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Cache-first para assets locales, Network-first para resto ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Sólo manejar GET
  if (event.request.method !== 'GET') return;

  // Assets locales: Cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          // Fallback a index.html para SPA
          return caches.match('/index.html');
        });
      })
    );
    return;
  }

  // Fuentes de Google: Cache-first
  if (url.hostname.includes('fonts.')) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});

// ── Background Sync: verificar resets a las 00:00 ──
// (Nota: el reset también se maneja en app.js con setInterval como respaldo)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reset') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'DAILY_RESET_CHECK' });
        });
      })
    );
  }
});