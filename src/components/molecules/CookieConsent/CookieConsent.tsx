'use client'

import { useSyncExternalStore } from 'react'
import Script from 'next/script'
import { GA_ID } from '@/lib/analytics'

// Consentimento de cookies (LGPD). O GA4 só é carregado DEPOIS de "Aceitar".
// Se a pessoa recusa, nenhum script do Google entra na página — abordagem
// privacy-first, a mais segura juridicamente.
//
// A escolha vive no localStorage; lemos via useSyncExternalStore (padrão React
// para store externo) — sem setState em effect e sem mismatch de hidratação.

const STORAGE_KEY = 'ira-cookie-consent'
type Consent = 'granted' | 'denied'

const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener('storage', cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', cb)
  }
}

function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'granted' || v === 'denied' ? v : null
}

// No servidor (e na 1ª render de hidratação) ninguém decidiu ainda → null.
function serverConsent(): Consent | null {
  return null
}

function decide(value: Consent) {
  localStorage.setItem(STORAGE_KEY, value)
  listeners.forEach((l) => l())
}

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, readConsent, serverConsent)

  const loadGA = consent === 'granted' && Boolean(GA_ID)
  const showBanner = consent === null

  return (
    <>
      {/* GA4 — injetado só com consentimento e ID configurado */}
      {loadGA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {showBanner && (
        <div
          role="dialog"
          aria-label="Aviso de cookies"
          aria-live="polite"
          className="fixed bottom-4 inset-x-4 z-[70] mx-auto max-w-2xl
                     rounded-card border border-ivory-300 bg-ivory-50/95 backdrop-blur
                     shadow-card-hover p-5 sm:p-6
                     flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <p className="font-body text-body-sm text-charcoal-700 leading-relaxed flex-1">
            Usamos cookies para entender como você navega e melhorar sua
            experiência. Você decide.{' '}
            <span className="text-charcoal-700/60">
              Sem cookies de medição se você recusar.
            </span>
          </p>

          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={() => decide('denied')}
              className="h-10 px-4 rounded-badge font-accent text-body-sm font-medium
                         text-charcoal-700 border border-ivory-300 bg-transparent
                         hover:border-gold-400 hover:text-gold-600
                         transition-all duration-300 ease-smooth cursor-pointer
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={() => decide('granted')}
              className="h-10 px-5 rounded-badge font-accent text-body-sm font-medium tracking-wide
                         bg-gradient-gold text-ivory-50 shadow-card-rest
                         hover:shadow-card-hover hover:brightness-110
                         transition-all duration-300 ease-smooth cursor-pointer
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
            >
              Aceitar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
