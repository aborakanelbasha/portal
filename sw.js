const CACHE = "ptw-shell-v1";
const ASSETS = [
  "./index.html",
  "./favicon.png",
  "./manifest.webmanifest",
  "./offline.html"
];

// تثبيت الكاش
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS).catch(()=>{}))
      .then(() => self.skipWaiting())
  );
});

// تفعيل وإزالة الكاشات القديمة
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first بسيط للملفات المحلية + بديل أوفلاين لصفحات HTML
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // تجاهل الروابط الخارجية وطلبات Apps Script
  if (url.origin !== location.origin || /script\.google\.com\/macros/.test(url.href)) return;

  if (e.request.method === "GET") {
    e.respondWith(
      caches.match(e.request).then(async (cached) => {
        try {
          return cached || await fetch(e.request);
        } catch (err) {
          // لو طلب HTML رجّع صفحة الأوفلاين
          const accept = e.request.headers.get('accept') || '';
          if (accept.includes('text/html')) {
            return caches.match('./offline.html');
          }
          throw err;
        }
      })
    );
  }
});
