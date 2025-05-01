// The version of the cache.
const VERSION = 'v3'; // Increment version for this significant change

// The name of the cache
const CACHE_NAME = `period-tracker-${VERSION}`;

// The static resources that the app needs to function offline.
const APP_STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/icons/wheel.svg',
  // Potentially any other static assets crucial for the UI and basic logic
];

// On install, cache the static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_STATIC_RESOURCES);
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
self.addEventListener('fetch', (event) => {
  // For navigation requests, always try the cache first. If not found, fall back to network.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).catch(() => {
            // If network fails for navigation, serve the homepage from cache as a fallback
            return caches.match('/');
          })
        );
      })
    );
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

        // For successful network responses of critical assets, you might want to cache them dynamically
        // if they weren't part of the initial APP_STATIC_RESOURCES.
        // However, be mindful of storage limits.
        // cache.put(event.request, networkResponse.clone());

        return networkResponse; // Return the network response
      } catch (error) {
        // Network request failed (likely offline)

        // For specific types of requests, provide tailored offline responses
        if (event.request.destination === 'image') {
          return new Response(
            '<svg role="img" aria-labelledby="offline-title" viewBox="0 0 24 24" fill="currentColor"><title id="offline-title">Offline</title><path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 14l-4-4V8h4V6H6v2l4 4V16H6v2h12v-2z"/></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' }, status: 503 }
          );
        }

        // For other requests (like data fetching), you'll need a different strategy.
        // Since the app is a period tracker, it likely involves storing and retrieving data.
        // This service worker alone cannot handle that. You'll need to:
        // 1. Use a client-side storage mechanism (like IndexedDB) in your app.js.
        // 2. Modify your app.js to save and retrieve period data from this local storage.
        // 3. The service worker's role here is primarily to ensure the UI and core logic (app.js) are available offline.

        // For API requests that fail offline, you might return a generic error or a cached default if applicable.
        if (event.request.url.includes('/api/')) {
          // Example: Handle API requests
          return new Response(
            JSON.stringify({ error: 'Offline mode: Cannot fetch data.' }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
            }
          );
        }

        // If no specific offline response is available, you might return a generic offline page or error.
        return (
          caches.match('/offline.html') ||
          new Response(
            '<h1>Offline - App might not be fully functional.</h1>',
            {
              headers: { 'Content-Type': 'text/html' },
              status: 503,
            }
          )
        );
      }
    })()
  );
});
