// Basic service worker

const CACHE_NAME = 'skypecker-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  // Add paths to your main JS/CSS bundles if they have static names
  // '/index.tsx' (or the compiled output like /assets/index-XXXX.js)
  // '/App.tsx'
  // Add paths to critical assets like fonts or base images
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  // Icons and manifest (ensure these paths are correct)
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(URLS_TO_CACHE).catch(err => {
          console.error('Service Worker: Failed to cache some resources during install.', err);
          // It's important to decide if a failed cache means the SW install should fail or not.
          // For some non-critical resources, you might want to ignore the error.
        });
      })
      .then(() => {
        console.log('Service Worker: Install completed');
        return self.skipWaiting(); // Force the waiting service worker to become the active service worker.
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Remove old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation completed');
      return self.clients.claim(); // Become the controller for all clients within its scope.
    })
  );
});

self.addEventListener('fetch', (event) => {
  // console.log('Service Worker: Fetching', event.request.url);
  if (event.request.mode === 'navigate') {
    // For navigation requests, try network first, then cache, then offline page (if any)
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
        .then(response => response || caches.match('/index.html')) // Fallback to index.html
    );
  } else {
    // For other requests (assets), use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request).then((fetchResponse) => {
            // Optionally, cache new assets dynamically
            // return caches.open(CACHE_NAME).then((cache) => {
            //   cache.put(event.request, fetchResponse.clone());
            //   return fetchResponse;
            // });
            return fetchResponse;
          });
        })
        .catch(() => {
          // If fetch fails (e.g., offline) and not in cache,
          // you could return a fallback image/data here if appropriate.
          // For example, for an image: return caches.match('/offline-placeholder.png');
          console.warn('Service Worker: Fetch failed for', event.request.url);
        })
    );
  }
});
