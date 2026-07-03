'use client'

// Registra o service worker da PWA do Sistema (escopo /sistema).
// O arquivo vive em public/sistema-sw.js — raiz de public/ pode reivindicar
// o escopo /sistema sem header Service-Worker-Allowed.

import { useEffect } from 'react'

export function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sistema-sw.js', { scope: '/sistema', updateViaCache: 'none' })
      .catch(() => {
        /* sem SW o app continua funcionando online normalmente */
      })
  }, [])
  return null
}
