import { cn } from '@/lib/utils'

interface StatItemProps {
  value:     string
  label:     string
  /** 'light' = sobre fundo claro (marfim) · 'dark' = sobre fundo escuro/vídeo. */
  tone?:     'light' | 'dark'
  className?: string
}

export function StatItem({ value, label, tone = 'light', className }: StatItemProps) {
  const isDark = tone === 'dark'
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <span className={cn(
        'font-display text-display-md leading-none tabular-nums',
        // gold-700 no claro garante contraste AA; gold-300 brilha no escuro
        isDark ? 'text-gold-300' : 'text-gold-700',
      )}>
        {value}
      </span>
      <span className={cn(
        'font-accent text-label uppercase tracking-widest',
        isDark ? 'text-ivory-100/70' : 'text-charcoal-700',
      )}>
        {label}
      </span>
    </div>
  )
}
