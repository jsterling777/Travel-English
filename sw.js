// ===== SERVICE WORKER =====
// Es un pequeño programa que el navegador ejecuta "por detrás".
// Aquí lo usamos para guardar una copia de los archivos de la app,
// así abre rápido y funciona aunque no tengas internet.

// IMPORTANTE: cada vez que cambies un archivo de la app, sube este número
// (v1 -> v2) para que el iPhone descargue la versión nueva.
const VERSION = "ingles-viaje-v2";

const ARCHIVOS = [
  "./",
  "index.html",
  "styles.css",
  "phrases.js",
  "app.js",
  "manifest.json",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// Al instalarse: guardamos todos los archivos
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

// Al activarse: borramos las copias de versiones viejas
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres.filter((nombre) => nombre !== VERSION).map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

// Cada vez que la app pide un archivo: primero buscamos la copia guardada,
// y si no existe, lo pedimos a internet.
self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((guardado) => guardado || fetch(evento.request))
  );
});
