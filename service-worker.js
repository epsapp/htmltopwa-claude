// ═══════════════════════════════════════════════════════════
//  VMA Tracker — Service Worker
//  Stratégie : Cache-First pour les assets statiques
//              Network-First pour index.html (mises à jour)
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'vma-tracker-v1';
const CACHE_CDN  = 'vma-tracker-cdn-v1';

// Fichiers locaux — mis en cache immédiatement à l'installation
const STATIC_ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// CDN externes — mis en cache à la première utilisation
const CDN_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;700&display=swap'
];

// ── Installation : précache des assets locaux ──
self.addEventListener('install', event => {
  console.log('[SW] Installation — cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Précache partiel:', err))
  );
});

// ── Activation : suppression des anciens caches ──
self.addEventListener('activate', event => {
  console.log('[SW] Activation');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CACHE_CDN)
          .map(k => { console.log('[SW] Suppression ancien cache:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch : stratégie hybride ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorer les requêtes non-GET
  if(event.request.method !== 'GET') return;

  // ── Google Fonts : Cache-First (changent rarement) ──
  if(url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    event.respondWith(cacheFirst(event.request, CACHE_CDN));
    return;
  }

  // ── CDN JS/CSS : Cache-First avec fallback réseau ──
  if(CDN_URLS.some(u => event.request.url.startsWith(u.split('?')[0]))){
    event.respondWith(cacheFirst(event.request, CACHE_CDN));
    return;
  }

  // ── index.html : Network-First (reçoit les mises à jour) ──
  if(url.pathname.endsWith('index.html') || url.pathname.endsWith('/')){
    event.respondWith(networkFirstWithFallback(event.request));
    return;
  }

  // ── Autres assets locaux (manifest, icônes…) : Cache-First ──
  if(url.origin === self.location.origin){
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
    return;
  }

  // ── Tout le reste : Network avec mise en cache opportuniste ──
  event.respondWith(networkWithCache(event.request));
});

// ─────────────────────────────────────────
//  Stratégies de fetch
// ─────────────────────────────────────────

// Cache-First : sert depuis le cache, sinon réseau puis mise en cache
async function cacheFirst(request, cacheName){
  const cached = await caches.match(request);
  if(cached) return cached;
  try {
    const response = await fetch(request);
    if(response.ok){
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch(err){
    console.warn('[SW] cacheFirst — réseau indisponible:', request.url);
    return new Response('Ressource non disponible hors ligne', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// Network-First : essaie le réseau, repli sur le cache
async function networkFirstWithFallback(request){
  try {
    const response = await fetch(request);
    if(response.ok){
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch(err){
    const cached = await caches.match(request);
    if(cached){
      console.log('[SW] Mode hors ligne — service depuis le cache:', request.url);
      return cached;
    }
    // Page offline de secours
    return new Response(offlineFallbackHTML(), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

// Network avec mise en cache opportuniste
async function networkWithCache(request){
  try {
    const response = await fetch(request);
    return response;
  } catch(err){
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}

// ─────────────────────────────────────────
//  Page de secours hors ligne
// ─────────────────────────────────────────
function offlineFallbackHTML(){
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VMA Tracker — Hors ligne</title>
<style>
  body{background:#0a0c10;color:#e8eaf0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:20px;text-align:center;padding:20px;}
  h1{font-size:2rem;color:#00e5ff;letter-spacing:3px;}
  p{color:#5a6070;max-width:320px;}
  button{background:#00e5ff;color:#0a0c10;border:none;padding:14px 28px;border-radius:8px;font-size:1rem;cursor:pointer;font-weight:700;}
</style>
</head>
<body>
  <div style="font-size:3rem">📡</div>
  <h1>HORS LIGNE</h1>
  <p>L'application n'est pas encore en cache. Connectez-vous une première fois pour activer le mode hors ligne.</p>
  <button onclick="location.reload()">↺ Réessayer</button>
</body>
</html>`;
}

// ─────────────────────────────────────────
//  Message de mise à jour
// ─────────────────────────────────────────
self.addEventListener('message', event => {
  if(event.data === 'SKIP_WAITING') self.skipWaiting();
});
