'use client'

import type { ReactNode } from 'react'
import { waLink } from '@/config/site'
import { trackWhatsApp } from '@/lib/analytics'

type WhatsAppLinkProps = {
  /** Mensagem pré-preenchida na conversa (contextual aumenta conversão). */
  message?: string
  /** Origem do clique para o GA (ex.: 'hero', 'servicos', 'localizacao'). */
  source: string
  className?: string
  ariaLabel?: string
  children: ReactNode
}

/**
 * Link de WhatsApp com mensagem contextual + rastreio do clique no GA.
 * Styling fica por conta do `className` de quem usa — este átomo só cuida do
 * href correto, do target seguro e do disparo do evento de conversão.
 */
export function WhatsAppLink({
  message,
  source,
  className,
  ariaLabel,
  children,
}: WhatsAppLinkProps) {
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsApp(source)}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}
