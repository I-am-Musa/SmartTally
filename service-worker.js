// LazyMan's Tallysheet — service worker
// Strategy: cache-first for app shell + XLSX CDN, network fallback,
// stale-while-revalidate for HTML so updates roll out.

const VERSION = 'wetally-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      // Use addAll but allow individual failures (CDN may be blocked first time)
      Promise.allSettled(APP_SHELL.map(url => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Stale-while-revalidate for the app shell
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkResp => {
          if (networkResp && networkResp.ok) {
            caches.open(VERSION).then(cache => cache.put(req, networkResp.clone()));
          }
          return networkResp;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (resp && resp.ok && (url.protocol === 'https:' || url.protocol === 'http:')) {
          const respClone = resp.clone();
          caches.open(VERSION).then(cache => cache.put(req, respClone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
