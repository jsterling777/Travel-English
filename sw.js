// ===== SERVICE WORKER =====
// Es un pequeño programa que el navegador ejecuta "por detrás".
// Aquí lo usamos para guardar una copia de los archivos de la app,
// así abre rápido y funciona aunque no tengas internet.

// IMPORTANTE: cada vez que cambies un archivo de la app, sube este número
// (v1 -> v2) para que el iPhone descargue la versión nueva.
const VERSION = "ingles-viaje-v11";

const ARCHIVOS = [
  "./",
  "index.html",
  "styles.css",
  "phrases.js",
  "app.js",
  "manifest.json",
  "audio/info.js",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// La lista de audios grabados está en audio/info.js (INFO_AUDIOS.archivos)
importScripts("audio/info.js");

// Al instalarse: guardamos todos los archivos.
// "cache: reload" obliga a descargarlos de nuevo (y no usar copias viejas).
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSION).then((cache) =>
      cache.addAll(ARCHIVOS.map((archivo) => new Request(archivo, { cache: "reload" }))).then(() =>
        // Los audios se guardan uno por uno: si falta alguno, la app igual se instala
        Promise.all(
          INFO_AUDIOS.archivos.map((audio) =>
            cache.add(new Request(audio, { cache: "reload" })).catch(() => {})
          )
        )
      )
    )
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

// Cada vez que la app pide un archivo: primero buscamos la copia guardada
// ("ignoreSearch" hace que "./?audio=2" use la misma copia que "./"),
// y si no existe, lo pedimos a internet.
self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    caches.match(evento.request, { ignoreSearch: true }).then((guardado) => guardado || fetch(evento.request))
  );
});
