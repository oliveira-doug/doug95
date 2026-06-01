// ── Dados estruturados (JSON-LD) — SEO local ────────────────────────────────
// Schema.org HairSalon: ensina o Google a exibir o salão na busca com nome,
// endereço, telefone, horário, mapa e link do Instagram. Custo zero, alto
// impacto para negócio local. Os dados vêm do site.ts (fonte única).

import { SITE, ADDRESS, CONTACT, BUSINESS, SITE_URL } from '@/config/site'

/**
 * Monta o objeto JSON-LD do tipo HairSalon para injetar no <head> via
 * <script type="application/ld+json">. Use SITE_URL absoluto em produção.
 */
export function hairSalonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': `${SITE_URL}/#salon`,
    name: SITE.name,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    telephone: BUSINESS.phone,
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: 'BRL',
    address: {
      '@type': 'PostalAddress',
      streetAddress: ADDRESS.street,
      addressLocality: 'Montes Claros',
      addressRegion: 'MG',
      postalCode: BUSINESS.postalCode,
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.geo.lat,
      longitude: BUSINESS.geo.lng,
    },
    openingHoursSpecification: BUSINESS.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: [CONTACT.instagram],
  }
}
