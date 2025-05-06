// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = 'cycletracker-v1';
const ASSETS = [
  './',
  './index.html',
  './about.html',
  './offline.html',
  './style.css',
  './app.js',
  './update-handler.js',
  './share-handler.js',
  './cycletracker.json',
  './icons/circle.svg',
  './icons/tire.svg',
  './icons/wheel.svg',
  './favicon.ico',
  './screenshots/main.png',
  './screenshots/main-mobile.png',
  './screenshots/about.png',
  './screenshots/about-mobile.png'
];

importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js'
);

const offlineFallbackPage = 'offline.html';

// Handle update notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Enable navigation preload if supported
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Cache the offline page during install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Notify clients about updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
        );
      }),
      // Notify all clients about the update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            message: 'A new version of Cycle Tracker is available!'
          });
        });
      })
    ])
  );
});

// Handle navigation requests with NetworkFirst strategy
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
      }),
    ],
  })
);

// Handle static assets with CacheFirst strategy
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: CACHE,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Handle other requests with StaleWhileRevalidate strategy
workbox.routing.registerRoute(
  ({ url }) => true,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
  })
);

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Return cached version
      }
      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If the network request fails, return the offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});
