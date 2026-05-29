import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

type HeadingLevel   = 'h1' | 'h2' | 'h3' | 'h4'
type HeadingVariant = 'display' | 'section' | 'sub'

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?:      HeadingLevel
  variant?: HeadingVariant
}

const variants: Record<HeadingVariant, string> = {
  display: 'font-display text-display-2xl text-charcoal-900 tracking-tight',
  section: 'font-display text-display-xl  text-charcoal-900 tracking-tight',
  sub:     'font-accent  text-display-md  text-charcoal-700 font-medium',
}

export function Heading({ as: Tag = 'h2', variant = 'section', className, children, ...props }: HeadingProps) {
  return (
    <Tag className={cn(variants[variant], className)} {...props}>
      {children}
    </Tag>
  )
}
