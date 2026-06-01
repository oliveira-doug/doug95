// ── Configuração central do site — fonte única da verdade ───────────────────
// Dados de contato e localização do Studio Íra Oliveira.
// Mudou o WhatsApp, o Instagram ou o endereço? Edite APENAS aqui.

export const SITE = {
  name: 'Studio Íra Oliveira',
  shortName: 'Studio Íra',
  city: 'Montes Claros — MG',
} as const

export const CONTACT = {
  whatsapp: 'https://wa.me/5538988085086',
  instagram: 'https://www.instagram.com/ira_studio/',
  instagramHandle: '@ira_studio',
} as const

export const ADDRESS = {
  street: 'Rua Ary Colen, 47-A',
  neighborhood: 'Funcionários',
  city: 'Montes Claros — MG',
  // Embed do Google Maps (endereço real). Gere um novo em maps.google.com →
  // Compartilhar → Incorporar um mapa, e cole apenas a URL do src do iframe.
  mapEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3820.783061663292!2d-43.87777632706916!3d-16.737672746884513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xab5367bd02e551%3A0xa2f6d268be726731!2sR.%20Ari%20Colen%2C%2047%20-%20Funcion%C3%A1rios%2C%20Montes%20Claros%20-%20MG%2C%2039401-032!5e0!3m2!1spt-BR!2sbr!4v1780025982296!5m2!1spt-BR!2sbr',
} as const
