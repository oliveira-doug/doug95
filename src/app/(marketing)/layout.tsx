import { hairSalonJsonLd } from '@/lib/structured-data'
import { CookieConsent } from '@/components/molecules/CookieConsent/CookieConsent'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Dados estruturados (SEO local) — Google lê o salão: endereço,
          horário, telefone, mapa. Não renderiza nada visível. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hairSalonJsonLd()) }}
      />
      {children}
      {/* Consentimento de cookies + GA4 (carrega só após aceitar) */}
      <CookieConsent />
    </>
  )
}
