// ── Configuração central do site — fonte única da verdade ───────────────────
// Dados de contato, localização e negócio do Studio Íra Oliveira.
// Mudou o WhatsApp, o Instagram, o endereço ou o horário? Edite APENAS aqui.

// URL pública do site. Em produção, defina NEXT_PUBLIC_SITE_URL no Vercel
// (ex.: https://studio-ira.vercel.app ou https://studioira.com.br) para que a
// OG image, o sitemap e os dados estruturados resolvam com URL absoluta correta.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const SITE = {
  name: 'Studio Íra Oliveira',
  shortName: 'Studio Íra',
  city: 'Montes Claros — MG',
} as const

// Número cru (só dígitos, com DDI 55) — base para montar links do WhatsApp.
const WHATSAPP_NUMBER = '5538988085086'

export const CONTACT = {
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
  whatsappNumber: WHATSAPP_NUMBER,
  instagram: 'https://www.instagram.com/ira_studio/',
  instagramHandle: '@ira_studio',
} as const

/**
 * Monta um link de WhatsApp com mensagem pré-preenchida (conversão + rastreio
 * de origem). Sem mensagem, retorna o link simples.
 *
 * @example waLink('Olá! Vim pelo site e quero agendar 💛')
 */
export function waLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export const ADDRESS = {
  street: 'Rua Ary Colen, 47-A',
  neighborhood: 'Funcionários',
  city: 'Montes Claros — MG',
  // Embed do Google Maps (endereço real). Gere um novo em maps.google.com →
  // Compartilhar → Incorporar um mapa, e cole apenas a URL do src do iframe.
  mapEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3820.783061663292!2d-43.87777632706916!3d-16.737672746884513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xab5367bd02e551%3A0xa2f6d268be726731!2sR.%20Ari%20Colen%2C%2047%20-%20Funcion%C3%A1rios%2C%20Montes%20Claros%20-%20MG%2C%2039401-032!5e0!3m2!1spt-BR!2sbr!4v1780025982296!5m2!1spt-BR!2sbr',
} as const

// ── Dados de negócio (para SEO local / Google) ───────────────────────────────
// Estes campos alimentam os dados estruturados (JSON-LD HairSalon) que o Google
// usa para exibir o salão na busca com endereço, horário e mapa.
// ⚠️ Douglas: confirme com a Íra os HORÁRIOS reais antes de publicar — eles
// aparecem no Google e horário errado frustra cliente. (Mesmos da seção Local.)
export const BUSINESS = {
  // Telefone em formato internacional legível (E.164 amigável).
  phone: '+55 38 98808-5086',
  postalCode: '39401-032',
  // Faixa de preço (escala do Google: $ a $$$$).
  priceRange: '$$',
  // Coordenadas do endereço (extraídas do embed do Maps).
  geo: { lat: -16.737673, lng: -43.877776 },
  // Horário de funcionamento. Dias em inglês (padrão schema.org), hora 24h.
  openingHours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '19:00',
    },
    { days: ['Saturday'], opens: '09:00', closes: '17:00' },
  ],
} as const
