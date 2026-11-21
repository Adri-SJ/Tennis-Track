/*
  Service worker de TennisTrack.
  Solo guarda la página «Sin conexión» y los íconos: los datos de la
  academia son privados y cambian a cada rato, así que nunca se guardan
  en el dispositivo. Si no hay red al abrir una página, se muestra
  offline.html.
*/

const CACHE = "tennistrack-v1";
const BASICOS = ["/offline.html", "/icons/icon-192.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(BASICOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((nombre) => nombre !== CACHE)
            .map((nombre) => caches.delete(nombre))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* Solo intercepta la navegación entre páginas; todo lo demás va directo a la red. */
self.addEventListener("fetch", (evento) => {
  if (evento.request.mode !== "navigate") {
    return;
  }

  evento.respondWith(
    fetch(evento.request).catch(() => caches.match("/offline.html"))
  );
});
