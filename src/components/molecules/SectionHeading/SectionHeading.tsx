import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/atoms/Badge/Badge'

interface SectionHeadingProps {
  /** Texto do selo (eyebrow) acima do título. */
  eyebrow: string
  /** Título da seção. Aceita JSX (ex.: <span> dourado em destaque). */
  title: ReactNode
  /** Parágrafo de apoio opcional. */
  description?: ReactNode
  /** 'light' = fundo claro (marfim) · 'dark' = fundo escuro (charcoal). */
  tone?: 'light' | 'dark'
  /** Classes extras no wrapper (ex.: margens, animações). */
  className?: string
  /** Classes extras no <h2> (ex.: max-w para controlar a quebra). */
  titleClassName?: string
}

/* Cabeçalho de seção padronizado: selo + título + descrição, centralizado.
   Usado em Vitrine, Serviços e Localização para manter consistência visual. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = 'light',
  className,
  titleClassName,
}: SectionHeadingProps) {
  const isDark = tone === 'dark'

  return (
    <div className={cn('flex flex-col items-center text-center gap-4', className)}>
      {isDark ? (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-badge
                     bg-gold-900/40 text-gold-300 border border-gold-800/60
                     font-accent text-label font-semibold uppercase tracking-widest"
        >
          <span aria-hidden="true">✦</span>
          {eyebrow}
        </span>
      ) : (
        <Badge variant="gold">
          <span aria-hidden="true">✦</span>
          {eyebrow}
        </Badge>
      )}

      <h2
        className={cn(
          'font-display text-display-xl tracking-tight text-balance',
          isDark ? 'text-ivory-50' : 'text-charcoal-900',
          titleClassName,
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            'font-body text-body-md max-w-[44ch]',
            isDark ? 'text-ivory-300' : 'text-charcoal-700',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
