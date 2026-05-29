import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

type BadgeVariant = 'gold' | 'blush' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  gold:    'bg-gold-100 text-gold-700 border border-gold-200',
  blush:   'bg-blush-100 text-charcoal-700 border border-blush-200',
  neutral: 'bg-ivory-200 text-charcoal-700 border border-ivory-300',
}

export function Badge({ variant = 'gold', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-badge',
        'font-accent text-label font-semibold uppercase tracking-widest',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
