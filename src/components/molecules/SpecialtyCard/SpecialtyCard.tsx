import { cn } from '@/lib/utils'

interface SpecialtyCardProps {
  icon:      React.ReactNode
  title:     string
  className?: string
}

export function SpecialtyCard({ icon, title, className }: SpecialtyCardProps) {
  return (
    <div className={cn(
      'flex flex-col items-center gap-3 px-6 py-5',
      'bg-ivory-100 rounded-card border border-ivory-200',
      'hover:border-gold-200 hover:bg-ivory-50 hover:shadow-card-rest',
      'transition-all duration-300 ease-smooth',
      className,
    )}>
      <div className="w-11 h-11 rounded-full bg-gold-100 border border-gold-200 flex items-center justify-center text-gold-600">
        {icon}
      </div>
      <p className="font-accent text-body-sm text-charcoal-800 font-medium leading-snug text-center">
        {title}
      </p>
    </div>
  )
}
