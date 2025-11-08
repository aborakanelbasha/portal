const CACHE = "ptw-shell-v1";
const ASSETS = [ "/index.html", "/favicon.png", "/manifest.webmanifest" ];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS).catch(()=>{}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || /script.google.com\/macros/.test(url.href)) return;
  if (e.request.method === "GET") {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
  }
});
