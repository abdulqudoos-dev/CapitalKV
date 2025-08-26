const CACHE = "pwabuilder-offline-page";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// TODO: replace the following with the correct offline fallback page
const offlineFallbackPage = "ToDo-replace-this-name.html";

// Skip waiting when a new service worker is available
self.addEventListener("message", (event: MessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Install event: cache the offline fallback page
self.addEventListener('install', async (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache: Cache) => cache.add(offlineFallbackPage))
  );
});

// Enable navigation preload for faster load
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Register routing for the application with stale-while-revalidate strategy
workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
  })
);

// Fetch event: handle network requests and provide offline fallback page if necessary
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Try to get the preload response if available
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        // Otherwise, try to fetch from the network
        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        // If network request fails, return cached fallback page
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp || new Response("Offline page not found.", { status: 404 });
      }
    })());
  }
});