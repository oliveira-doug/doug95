// ── Google Analytics 4 — medição do funil de conversão ──────────────────────
// GA só é carregado DEPOIS do consentimento (LGPD) — ver CookieConsent.
// Aqui ficam o ID da propriedade e os helpers de rastreio de eventos.
//
// Douglas: crie a propriedade em analytics.google.com, pegue o ID "G-XXXXXXXXXX"
// e defina NEXT_PUBLIC_GA_ID no Vercel (e em .env.local para testar local).

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID

/** GA está configurado? (sem ID, todo rastreio vira no-op silencioso.) */
export const isAnalyticsEnabled = Boolean(GA_ID)

type GtagFn = (command: string, ...args: unknown[]) => void

declare global {
  interface Window {
    gtag?: GtagFn
    dataLayer?: unknown[]
  }
}

/** Dispara um evento no GA4, se ele já tiver sido carregado (consentido). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', name, params)
}

/**
 * Clique em "agendar/contato" via WhatsApp — o evento-chave da validação.
 * `source` identifica de onde veio (hero, serviços, localização...).
 */
export function trackWhatsApp(source: string) {
  trackEvent('whatsapp_click', { source })
}
