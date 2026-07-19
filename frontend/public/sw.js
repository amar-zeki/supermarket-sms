const CACHE_NAME = 'nexamart-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/css/main.css',
  '/src/css/components/sidebar.css',
  '/src/css/pages/auth.css',
  '/src/css/pages/dashboard.css',
  '/src/css/pages/pos.css',
  '/src/js/app.js',
  '/src/js/router.js',
  '/src/js/store.js',
  '/src/js/utils/i18n.js',
  '/src/js/utils/auth.js',
  '/src/js/utils/format.js',
  '/src/js/utils/offline.js',
  '/src/js/api/client.js',
  '/locales/en.json',
  '/locales/ar.json',
  '/locales/am.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // If request targets API endpoints, fetch from network first, bypass cache
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback for API offline health checks
        if (requestUrl.pathname === '/api/health') {
          return new Response(JSON.stringify({
            success: true,
            data: { status: 'offline', database: 'cached' },
            message: 'Running in offline mode'
          }), { headers: { 'Content-Type': 'application/json' } });
        }
        
        // Return standard failure envelope for POST requests
        return new Response(JSON.stringify({
          success: false,
          message: 'You are currently offline. This transaction has been queued locally.',
          errors: { code: 'OFFLINE' }
        }), { status: 503, headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }

  // Otherwise, use Cache-First strategy for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Return if not a valid resource
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Clone response to cache it
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      });
    })
  );
});
