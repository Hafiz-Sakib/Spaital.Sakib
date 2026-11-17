// Service worker: makes the site installable and fast on repeat visits / offline.
// Bump VERSION to force every visitor to drop the old caches.
const VERSION = "v4";
const SHELL = `shell-${VERSION}`;      // html, icons, manifest, hashed JS/CSS
const PHOTOS = `photos-${VERSION}`;    // /gallery/* pictures that were actually viewed
const MAX_PHOTOS = 1500;               // oldest cached pictures are dropped beyond this

const PRECACHE = ["/", "/favicon.ico", "/favicon-32.png", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/logo-128.png", "/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== PHOTOS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function cacheFirst(req, name, max) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) { cache.put(req, res.clone()); if (max) trim(cache, max); }
  return res;
}

async function networkFirstPage(req) {
  const cache = await caches.open(SHELL);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put("/", res.clone());
    return res;
  } catch {
    return (await cache.match("/")) || Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(req);
  const fresh = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || fresh;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === "navigate") return e.respondWith(networkFirstPage(req));
  if (url.pathname.startsWith("/gallery/")) return e.respondWith(cacheFirst(req, PHOTOS, MAX_PHOTOS)); // URL has ?v=hash, so a changed picture is a new entry
  if (url.pathname.startsWith("/assets/")) return e.respondWith(cacheFirst(req, SHELL));               // hashed file names never change
  e.respondWith(staleWhileRevalidate(req));
});
