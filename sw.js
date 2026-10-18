/* Rythmique Star – service worker
   - la page du jeu : réseau d'abord (toujours la dernière version), copie de secours si pas de réseau
   - bibliothèques (three.js, PeerJS, polices), modèles 3D et musiques : copie gardée sur le téléphone */
const CACHE = 'rythmique-star-v2';
const PAGE = 'gr.html';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([PAGE, 'manifest.webmanifest', 'icon-192.png', 'icon-512.png']).catch(() => {})));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  // Firebase, PeerJS (serveur de connexion), API GitHub : toujours en direct
  if (/firebasedatabase|firebaseio|peerjs\.com|api\.github\.com|ko-fi/.test(url.hostname)) return;
  const estPage = req.mode === 'navigate' || url.pathname.endsWith('.html');
  if (estPage) {
    e.respondWith((async () => {
      try {
        const r = await fetch(req, { cache: 'no-store' });
        if (r.ok) (await caches.open(CACHE)).put(PAGE, r.clone());
        return r;
      } catch (err) {
        return (await caches.match(PAGE)) || (await caches.match(req)) || Response.error();
      }
    })());
    return;
  }
  const garder = /unpkg\.com|jsdelivr|fonts\.(googleapis|gstatic)\.com/.test(url.hostname) ||
    (url.origin === location.origin && /\/(modeles|musiques|sons)\/|\.(png|webmanifest)$/.test(url.pathname));
  if (!garder) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE), hit = await c.match(req);
    if (hit) return hit;
    const r = await fetch(req);
    if (r.ok || r.type === 'opaque') c.put(req, r.clone());
    return r;
  })());
});
