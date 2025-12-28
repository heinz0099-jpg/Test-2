const CACHE_NAME = "strahlenschutz-cache-v4";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./ADR_Info.pdf"
];

// 1. Installation: Dateien in den Cache laden
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// 2. Aktivierung: Alten Cache löschen (wichtig für den Schutzwert-Rechner)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      // Übernimmt sofort die Kontrolle über alle geöffneten Fenster
      return self.clients.claim();
    })
  );
});

// 3. Update-Logik: Auf Befehl vom Update-Banner warten
self.addEventListener("message", event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 4. Fetch-Strategie: Cache-First, dann Netzwerk
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
