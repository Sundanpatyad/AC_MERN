/* Existing PWA installs may still have this worker. Replace it with a
   one-shot cleanup: take control, drop old caches, unregister, reload. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      await Promise.all(
        windows.map((client) => {
          if ("navigate" in client) return client.navigate(client.url);
          return client.postMessage({ type: "AC_PWA_RELOAD" });
        })
      );
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
