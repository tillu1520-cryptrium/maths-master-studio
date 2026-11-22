const CACHE_NAME = 'maths-master-studio-v14';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/exam_questions_bank.json',
  'https://cdn.tailwindcss.com/3.4.17',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js',
  'https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  const isHtmlOrJson = event.request.mode === 'navigate' ||
                       url.endsWith('/') ||
                       url.includes('/index.html') ||
                       url.includes('/exam_questions_bank.json') ||
                       event.request.headers.get('accept')?.includes('text/html') ||
                       event.request.headers.get('accept')?.includes('application/json');

  if (isHtmlOrJson) {
    // NETWORK-FIRST STRATEGY for HTML and Question Bank
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first fallback for static external libraries (tailwindcss, katex, lucide)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      });
    })
  );
});
