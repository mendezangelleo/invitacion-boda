/* CONTENIDO PARA sw.js */

const CACHE = 'invitacion-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/rsvp.html',
  '/offline.html',
  '/manifest.webmanifest',

  // Imágenes usadas
  'img/IMG-20210924-WA0148.jpg',
  'img/20250810_150700.jpg',
  'img/20251015_210918.jpg',
  'img/IMG_1939.JPG',
  'img/Logo definitivo.png',

  '/assets/Invitacion.ics'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      console.log('SW: Cacheando assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE)
          .map((k) => {
            console.log('SW: Borrando cache antiguo:', k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Solo manejamos GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Ignorar esquemas raros (extensiones, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // ✅ BYPASS: nunca cachear ni interceptar llamadas a Google (Apps Script / Forms)
  // (evita respuestas viejas y problemas de CORS/no-cors)
  const isGoogle =
    url.hostname.includes('google.com') ||
    url.hostname.includes('googleusercontent.com') ||
    url.hostname.includes('gstatic.com');

  if (isGoogle) {
    e.respondWith(fetch(req));
    return;
  }

  // Estrategia: Cache-First para assets propios
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((resp) => {
          const copy = resp.clone();

          // Guardar solo respuestas OK
          if (resp.ok) {
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          }

          return resp;
        })
        .catch(() => {
          // Si la red falla y es navegación, devolvemos offline.html
          if (req.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('', { status: 504, statusText: 'Offline' });
        });
    })
  );
});
