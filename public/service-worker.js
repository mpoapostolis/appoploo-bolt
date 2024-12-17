const CACHE_VERSION = new Date().getTime(); // Force update on each load
const CACHE_NAME = `appoploo-bolt-v2-${CACHE_VERSION}`;
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/android/android-launchericon-48-48.png',
  '/android/android-launchericon-72-72.png',
  '/android/android-launchericon-96-96.png',
  '/android/android-launchericon-144-144.png',
  '/android/android-launchericon-192-192.png',
  '/android/android-launchericon-512-512.png',
  '/ios/128.png',
  '/ios/152.png',
  '/ios/167.png',
  '/ios/180.png',
  '/ios/256.png',
  '/ios/1024.png'
];

const DYNAMIC_CACHE = `dynamic-v2-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';
const UPDATE_INTERVAL = 1000 * 60 * 5; // Check for updates every 5 minutes

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // Force activation
  );
});

// Activate service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Take control immediately
      // Clear all old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE)
            .map(cacheName => caches.delete(cacheName))
        );
      })
    ])
  );
});

// Force periodic updates
setInterval(() => {
  self.registration.update();
}, UPDATE_INTERVAL);

// Fetch resources with network-first strategy
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache the fresh response
        const freshResponse = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then(cache => cache.put(event.request, freshResponse));
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_PAGE);
            }
            return Response.error();
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-vessels') {
    event.waitUntil(
      // Implement vessel data sync logic here
      Promise.resolve()
    );
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/android/android-launchericon-192-192.png',
    badge: '/android/android-launchericon-96-96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Appoploo Bolt', options)
  );
});
