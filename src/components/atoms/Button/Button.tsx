'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  fullWidth?: boolean
}

const base = [
  'inline-flex items-center justify-center gap-2',
  'font-accent font-medium tracking-wide',
  'transition-all duration-300 ease-smooth',
  'focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-gold-500 focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  'select-none cursor-pointer',
].join(' ')

const variants: Record<ButtonVariant, string> = {
  primary:   'bg-gradient-gold text-ivory-50 shadow-card-rest hover:shadow-card-hover hover:brightness-110 active:scale-[0.97]',
  secondary: 'border border-gold-500 text-gold-600 bg-transparent hover:bg-gold-50 hover:border-gold-600 active:scale-[0.97]',
  ghost:     'text-charcoal-700 bg-transparent hover:text-charcoal-900 hover:bg-ivory-100',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9  px-4 text-body-sm rounded-badge',
  md: 'h-11 px-6 text-body-md rounded-badge',
  lg: 'h-14 px-8 text-body-lg rounded-badge',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
