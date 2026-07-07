const CACHE_NAME = "dailyjobs-v10";
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

// Fetch: network-first strategy (always try network, fallback to cache)
self.addEventListener("fetch", (e) => {
  // Skip non-GET, API and Supabase database requests
  if (e.request.method !== "GET" || e.request.url.includes("/api/") || e.request.url.includes("supabase.co")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful responses
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        if (e.request.mode === "navigate") {
          const rootCache = await caches.match("/");
          if (rootCache) return rootCache;
        }
        return new Response("Offline/Network Error", { status: 503, statusText: "Service Unavailable" });
      })
  );
});
