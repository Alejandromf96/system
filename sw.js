/* ═══════════════════════════════════════════════════════════════
   SISTEMA // SW.JS — Service Worker v2
   Estrategia: Cache-first para assets locales
   Garantiza funcionamiento 100% offline tras primera carga
═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'sistema-v3';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/favicon.ico',
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/animations.css',
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
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) return cached;
          return fetch(event.request)
            .then((response) => {
              if (response && response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
              }
              return response;
            })
            .catch(() => caches.match('/index.html'));
        })
    );
    return;
  }

  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => cached || fetch(event.request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
          .catch(() => new Response('', { status: 408 }))
        )
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
