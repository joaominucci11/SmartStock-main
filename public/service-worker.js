const CACHE_NAME = "smartstock-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/login.html",
  "/dashboard.html",
  "/itens.html",

  // CSS
  "/style/style.css",
  "/style/styleDashboard.css",
  "/style/styleItens.css",

  // JS
  "/scripts/loginScript.js",
  "/scripts/dashboardScript.js",
  "/scripts/itensScript.js",

  // Imagens
  "/icon/logo-small.ico",
  "/icon/senai.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
