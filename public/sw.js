/* Network-first, installable. Do not stale-lock theme art. */
const CACHE = 'math-quest-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isArt = url.pathname.includes('/themes/') || url.pathname.includes('/badges/');
  const isNavigate = event.request.mode === 'navigate';

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (isArt) return res;
        const copy = res.clone();
        if (res.ok) {
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() => {
        return caches.match(event.request).then((hit) => {
          if (hit) return hit;
          if (isNavigate) return caches.match('./index.html');
          return Response.error();
        });
      }),
  );
});
