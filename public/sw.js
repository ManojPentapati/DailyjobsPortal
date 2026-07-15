const CACHE_NAME = "dailyjobs-v23";
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

// Fetch: only cache static assets (JS, CSS, fonts, images)
// Do NOT intercept navigation, API, or unknown requests.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Never intercept navigation requests — let Vercel handle SPA routing natively
  if (e.request.mode === "navigate") return;

  // Never intercept API or supabase calls
  if (url.pathname.startsWith("/api/") || e.request.url.includes("supabase.co")) return;

  // Only cache actual static assets (hashed filenames from Vite, or known static files)
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/favicon.svg" ||
    url.pathname === "/sw.js" ||
    url.pathname === "/manifest.json";

  if (!isStaticAsset) return;

  // Network-first with cache fallback for static assets
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
