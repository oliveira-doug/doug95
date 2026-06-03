import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  /** Texto do selo (eyebrow) acima do título. */
  eyebrow: string
  /** Título da seção. Aceita JSX (ex.: <span> dourado em destaque). */
  title: ReactNode
  /** Parágrafo de apoio opcional. */
  description?: ReactNode
  /** 'light' = fundo claro (marfim) · 'dark' = fundo escuro (charcoal). */
  tone?: 'light' | 'dark'
  /** 'center' (padrão) · 'left' = quebra a simetria, estilo editorial. */
  align?: 'center' | 'left'
  /** Classes extras no wrapper (ex.: margens, animações). */
  className?: string
  /** Classes extras no <h2> (ex.: max-w para controlar a quebra). */
  titleClassName?: string
}

/* Cabeçalho de seção padronizado: kicker (filete dourado + label) + título +
   descrição. O kicker substitui o selo ✦ repetido por um único elemento sóbrio. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = 'light',
  align = 'center',
  className,
  titleClassName,
}: SectionHeadingProps) {
  const isDark = tone === 'dark'

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'left' ? 'items-start text-left' : 'items-center text-center',
        className,
      )}
    >
      <span
        className="kicker"
        style={isDark ? { color: 'var(--color-gold-300)' } : undefined}
      >
        {eyebrow}
      </span>

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
