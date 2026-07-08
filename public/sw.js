const CACHE_NAME = "dailyjobs-v20";
const STATIC_ASSETS = ["/", "/favicon.svg"];

// Install: cache essential assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for static assets only
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Only handle same-origin GET requests
  if (e.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Skip API routes and Supabase calls entirely
  if (url.pathname.startsWith("/api/") || e.request.url.includes("supabase.co")) return;

  // For navigation requests (HTML pages), always go to network and fall back to cached root (SPA)
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match("/").then((root) => root || fetch(e.request))
      )
    );
    return;
  }

  // For static assets (JS, CSS, images), use network-first with cache fallback
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) => cached || new Response("", { status: 408 }))
      )
  );
});
