/** Barra de XP do nível atual. */
export function XpBar({ xp, custo }: { xp: number; custo: number }) {
  const pct = Math.min(100, Math.round((xp / Math.max(1, custo)) * 100))
  return (
    <div>
      <div
        className="h-3 bg-system-950 border border-system-800 overflow-hidden"
        role="progressbar"
        aria-valuenow={xp}
        aria-valuemin={0}
        aria-valuemax={custo}
        aria-label="Experiência"
      >
        <div
          className="h-full bg-gradient-to-r from-system-600 to-system-300 shadow-glow-system transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="font-system-body text-xs text-system-400 mt-1 tracking-wider text-right">
        {xp.toLocaleString('pt-BR')} / {custo.toLocaleString('pt-BR')} XP
      </p>
    </div>
  )
}
