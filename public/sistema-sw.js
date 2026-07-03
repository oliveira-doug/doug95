// Service worker da PWA "O Sistema" (escopo /sistema).
// Estratégia: network-first para navegações com fallback ao shell em cache
// (offline mínimo); cache-first para os ícones. Push já suportado (v1.5).

const CACHE = 'sistema-v1' // troque a versão para invalidar o cache

const PRECACHE = [
  '/sistema',
  '/sistema/manifest.webmanifest',
  '/sistema/icons/icon-192.png',
  '/sistema/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('sistema-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (!url.pathname.startsWith('/sistema')) return

  // Navegações: rede primeiro; sem rede, shell do cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copia = res.clone()
          caches.open(CACHE).then((cache) => cache.put('/sistema', copia))
          return res
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((hit) => hit ?? caches.match('/sistema'))
            .then((hit) => hit ?? Response.error()),
        ),
    )
    return
  }

  // Estáticos do sistema (ícones/manifest): cache primeiro.
  event.respondWith(
    caches.match(event.request).then(
      (hit) =>
        hit ??
        fetch(event.request).then((res) => {
          const copia = res.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copia))
          return res
        }),
    ),
  )
})

// ── Web Push (v1.5 — backend opcional; handlers já prontos) ─────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title ?? '⚠ O Sistema', {
      body: data.body ?? 'Suas quests diárias estão disponíveis.',
      icon: data.icon ?? '/sistema/icons/icon-192.png',
      badge: '/sistema/icons/icon-192.png',
      vibrate: [100, 50, 100],
      tag: data.tag ?? 'sistema-push',
      data: { url: data.url ?? '/sistema/quests' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/sistema/quests'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if (win.url.includes('/sistema') && 'focus' in win) {
          win.navigate(url)
          return win.focus()
        }
      }
      return clients.openWindow(url)
    }),
  )
})
