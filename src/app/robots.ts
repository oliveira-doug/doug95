import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/config/site'

// Gera /robots.txt — libera o site todo aos buscadores e aponta o sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
