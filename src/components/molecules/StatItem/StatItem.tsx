import { cn } from '@/lib/utils'

interface StatItemProps {
  value:     string
  label:     string
  className?: string
}

export function StatItem({ value, label, className }: StatItemProps) {
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <span className="font-display text-display-md text-gold-500 leading-none tabular-nums">
        {value}
      </span>
      <span className="font-accent text-label text-charcoal-700 uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}
