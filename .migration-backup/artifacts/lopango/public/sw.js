const CACHE_NAME = "lopango-v3";
const STATIC_CACHE = "lopango-static-v3";

// Pages à cacher pour l'accès hors-ligne
const OFFLINE_PAGES = [
  "/collecteur",
  "/collecteur/login",
  "/collecteur/nouvelle",
  "/offline",
];

// Assets statiques à pré-cacher
const STATIC_ASSETS = [
  "/favicon.svg",
  "/favicon-96x96.png",
  "/favicon.ico",
  "/site.webmanifest",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
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
    return;
  }

  // Stratégie pour les pages Next.js (HTML) : Network first, fallback cache, then offline page
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
            return caches.match("/collecteur").then((collecteurPage) => {
              if (collecteurPage) return collecteurPage;
              return caches.match("/offline");
            });
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
        }).catch(() => {
          return new Response("", { status: 408, statusText: "Offline" });
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
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-parcelles") {
    event.waitUntil(syncOfflineParcelles());
  }
});

async function syncOfflineParcelles() {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: "SYNC_AVAILABLE" });
  });
}

// ===== PUSH NOTIFICATIONS (future) =====
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "Nouvelle notification Lopango",
    icon: "/web-app-manifest-192x192.png",
    badge: "/favicon-96x96.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/collecteur",
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Lopango", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/collecteur";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
