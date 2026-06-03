import { cn } from '@/lib/utils'

interface SpecialtyCardProps {
  icon:      React.ReactNode
  title:     string
  /** 'light' = fundo claro (marfim) · 'dark' = sobre vídeo/fundo escuro. */
  tone?:     'light' | 'dark'
  className?: string
}

export function SpecialtyCard({ icon, title, tone = 'light', className }: SpecialtyCardProps) {
  const isDark = tone === 'dark'
  return (
    <div className={cn(
      'flex flex-col items-center gap-3 px-6 py-5 rounded-card transition-all duration-300 ease-smooth',
      isDark
        ? 'bg-charcoal-800/40 backdrop-blur-sm border border-ivory-100/15 hover:bg-charcoal-800/60 hover:border-gold-300/40'
        : 'bg-ivory-100 border border-ivory-200 hover:border-gold-200 hover:bg-ivory-50 hover:shadow-card-rest',
      className,
    )}>
      <div className={cn(
        'w-11 h-11 rounded-full flex items-center justify-center',
        isDark
          ? 'bg-gold-300/15 border border-gold-300/30 text-gold-300'
          : 'bg-gold-100 border border-gold-200 text-gold-600',
      )}>
        {icon}
      </div>
      <p className={cn(
        'font-accent text-body-sm font-medium leading-snug text-center',
        isDark ? 'text-ivory-100' : 'text-charcoal-800',
      )}>
        {title}
      </p>
    </div>
  )
}
