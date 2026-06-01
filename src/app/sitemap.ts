import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/config/site'

// Gera /sitemap.xml — hoje a landing é página única. Ao adicionar rotas
// (ex.: /agendar, dashboard público), inclua novas entradas aqui.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
