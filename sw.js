// The version of the cache.
const VERSION = 'v1';

// The name of the cache
const CACHE_NAME = `period-tracker-${VERSION}`;

// The static resources that the app needs to function.
const APP_STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/icons/wheel.svg',
];

// On install, cache the static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(APP_STATIC_RESOURCES);
    })()
  );
});

// delete old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
      await clients.claim();
    })()
  );
});

// On fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.match('/'));
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);

      if (cachedResponse) {
        return cachedResponse; // Return cached response if found
      }

      try {
        // If not in cache, try to fetch from the network
        const networkResponse = await fetch(event.request);

        // Cache the network response for future use
        cache.put(event.request, networkResponse.clone());

        return networkResponse; // Return the network response
      } catch (error) {
        // Network fetch failed
        return new Response('<h1>Network Error</h1>', {
          status: 503,
          headers: { 'Content-Type': 'text/html' },
        });
      }
    })()
  );
});
