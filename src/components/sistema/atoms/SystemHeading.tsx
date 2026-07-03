/** Cabeçalho de tela no estilo "janela de notificação" do Sistema. */
export function SystemHeading({
  kicker = '⚠ Notificação',
  title,
  subtitle,
}: {
  kicker?: string
  title: string
  subtitle?: string
}) {
  return (
    <header className="mb-6">
      <p className="font-system-display text-[0.6rem] uppercase tracking-[0.4em] text-system-500 animate-system-flicker">
        {kicker}
      </p>
      <h1 className="font-system-display text-2xl font-bold uppercase tracking-[0.12em] text-glow-system mt-1">
        {title}
      </h1>
      {subtitle && (
        <p className="font-system-body text-sm text-system-400 mt-1 tracking-wide">
          {subtitle}
        </p>
      )}
    </header>
  )
}
