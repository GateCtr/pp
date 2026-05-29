const CACHE_NAME = "lopango-v2";
const STATIC_CACHE = "lopango-static-v2";

// Pages à cacher pour l'accès hors-ligne
const OFFLINE_PAGES = [
  "/collecteur",
  "/collecteur/login",
  "/collecteur/nouvelle",
];

// Assets statiques à pré-cacher
const STATIC_ASSETS = [
  "/favicon.svg",
  "/favicon-96x96.png",
  "/favicon.ico",
  "/site.webmanifest",
];

// ===== INSTALL =====
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_PAGES)),
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
    ])
  );
  self.skipWaiting();
});

// ===== ACTIVATE =====
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ===== FETCH =====
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes API POST (collecte offline gérée côté client)
  if (request.method !== "GET") {
    // Pour les POST vers /api/parcelles, on laisse passer normalement
    // Si offline, le client gère la queue dans IndexedDB
    return;
  }

  // Stratégie pour les pages Next.js (HTML) : Network first, fallback cache
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Fallback vers la page collecteur (app shell)
            return caches.match("/collecteur");
          });
        })
    );
    return;
  }

  // Stratégie pour les assets statiques : Cache first, fallback network
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|webp)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Stratégie pour les API GET : Network first, fallback cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response(
              JSON.stringify({ error: "Hors ligne", offline: true }),
              { headers: { "Content-Type": "application/json" }, status: 503 }
            );
          });
        })
    );
    return;
  }

  // Défaut : Network first, fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ===== BACKGROUND SYNC =====
// Quand la connexion revient, on synchronise les données offline
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-parcelles") {
    event.respondWith(syncOfflineParcelles());
  }
});

async function syncOfflineParcelles() {
  // La synchronisation réelle est gérée côté client via IndexedDB
  // Le service worker notifie juste les clients qu'une sync est possible
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: "SYNC_AVAILABLE" });
  });
}
