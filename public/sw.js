const CACHE_NAME = 'sophis-v2';

// Install: skip waiting immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate: clear old caches and claim all clients
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => clients.claim())
  );
});

// Fetch: always network-first, never serve stale HTML/JS
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Never cache API calls or auth
  if (url.pathname.includes('/auth/') || url.hostname.includes('supabase')) {
    return;
  }

  // For navigation requests (HTML), always go to network
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For assets: network first, cache as fallback
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Only cache successful responses for static assets
        if (response.ok && (url.pathname.match(/\.(js|css|png|svg|woff2?)$/))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

// Listen for skip waiting signal from app
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
