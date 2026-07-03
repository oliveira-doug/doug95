import { cn } from '@/lib/utils'

/** Painel holográfico padrão do Sistema (cantos recortados + glow). */
export function SystemPanel({
  title,
  className,
  children,
}: {
  title?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn('holo-panel p-4', className)}>
      {title && (
        <h2 className="font-system-display text-[0.65rem] font-bold uppercase tracking-[0.3em] text-system-500 mb-3">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}
