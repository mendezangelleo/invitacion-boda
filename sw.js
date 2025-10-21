/* CONTENIDO PARA sw.js */

const CACHE = 'invitacion-v2'; // Incrementamos la versión
const ASSETS = [
  '/', 
  '/index.html',
  '/rsvp.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/guests.json',
  
  /* --- RUTAS DE IMÁGENES CORREGIDAS --- */
  'img/logo-aa.jpg', // Esta faltaba
  'img/IMG-20210924-WA0148.jpg',
  'img/20250810_150700.jpg',
  'img/20251015_210918.jpg',
  'img/IMG_1939.JPG',
  'img/capilla.jpg',
  'img/salon.jpg',
  'img/Logo definitivo.png',
  
  /* --- RUTAS DE ICONOS CORREGIDAS (asumiendo que están en /img) --- */
  'img/logo-aa-192.png', 
  'img/logo-aa-512.png', // Asumiendo que tienes esta
  
  '/assets/Invitacion.ics'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => {
    console.log('SW: Cacheando assets...');
    return cache.addAll(ASSETS);
  }));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => {
      console.log('SW: Borrando cache antiguo:', k);
      return caches.delete(k);
    })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  
  // Estrategia: Cache-First
  e.respondWith(
    caches.match(req).then(cached => {
      // 1. Devolver desde el cache si existe
      if (cached) {
        return cached;
      }
      // 2. Si no, ir a la red
      return fetch(req).then(resp => {
        const copy = resp.clone();
        // 3. Guardar en cache la respuesta de red (solo peticiones GET exitosas)
        if (req.method === 'GET' && copy.ok && (copy.type === 'basic' || copy.type === 'opaque')) {
          caches.open(CACHE).then(cache => cache.put(req, copy)).catch(()=>{});
        }
        return resp;
      }).catch(() => {
        // 4. Si la red falla (offline), mostrar página offline
        if (req.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});