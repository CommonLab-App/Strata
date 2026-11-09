/* global self, caches, fetch, Response, URL */
/* StrataLab service worker. Built by the serviceWorker plugin in vite.config.ts, which fills in the two constants. */
const VERSION = '__VERSION__'
// eslint-disable-next-line no-undef -- filled in by the build
const PRECACHE = __PRECACHE__
const MEDIA = 'media'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION && key !== MEDIA).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName)
  const hit = await cache.match(request)
  if (hit) return hit
  const response = await fetch(request)
  // ponytail: full responses only; a ranged video response (206) is not cacheable here, so seeks on a cold cache stream.
  if (response.ok && response.status === 200) cache.put(request, response.clone())
  return response
}

const networkFirst = async (request) => {
  try {
    return await fetch(request)
  } catch {
    return (await caches.match('./')) ?? Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  // Data APIs, basemap and planet tiles are left alone: the app's localStorage snapshots are the offline copy of data.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (request.mode === 'navigate') return event.respondWith(networkFirst(request))
  event.respondWith(cacheFirst(request, url.pathname.includes('/media/') ? MEDIA : VERSION))
})
