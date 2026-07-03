'use client'

// Overlay full-screen exibido após concluir uma quest com level-up, rank-up,
// streak ou conquistas novas. Fecha ao tocar em qualquer lugar.

import { RANKS, type Rank } from '@/app/sistema/_lib/game'
import type { SistemaConcluirQuestResult } from '@/lib/supabase/types'

export type ResultadoQuest = SistemaConcluirQuestResult & {
  conquistasNovas: { nome: string; moedas: number }[]
}

export function LevelUpOverlay({
  resultado,
  onClose,
}: {
  resultado: ResultadoQuest
  onClose: () => void
}) {
  const rank = resultado.rank as Rank

  return (
    <div
      className="fixed inset-0 z-50 bg-system-950/90 backdrop-blur-sm
                 flex items-center justify-center p-6 cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Resultado da quest"
    >
      <div className="holo-panel max-w-sm w-full p-8 text-center animate-level-up-burst shadow-glow-system-strong">
        {resultado.leveled_up ? (
          <>
            <p className="font-system-display text-[0.6rem] uppercase tracking-[0.4em] text-system-500">
              ⚠ Notificação
            </p>
            <p className="font-system-display text-4xl font-black uppercase tracking-[0.1em] text-glow-system mt-4">
              Level Up!
            </p>
            <p className="font-system-display text-6xl font-black text-system-100 mt-2 [text-shadow:0_0_24px_rgba(0,207,255,0.6)]">
              {resultado.nivel_novo}
            </p>
            <div className="font-system-body text-sm text-system-300 mt-4 space-y-1 tracking-wide">
              <p>+{resultado.pontos_ganhos} pontos de atributo</p>
              <p>+{resultado.pontos_habilidade} ponto(s) de habilidade</p>
              <p>+{resultado.moedas_ganhas.toLocaleString('pt-BR')} moedas</p>
            </div>
          </>
        ) : (
          <>
            <p className="font-system-display text-[0.6rem] uppercase tracking-[0.4em] text-system-500">
              ⚠ Quest concluída
            </p>
            <p className="font-system-display text-2xl font-bold uppercase tracking-[0.1em] text-glow-system mt-4">
              Recompensas recebidas
            </p>
            <p className="font-system-body text-sm text-system-300 mt-3 tracking-wide">
              +{resultado.moedas_ganhas.toLocaleString('pt-BR')} moedas
            </p>
          </>
        )}

        {resultado.rank_up && (
          <p
            className={`font-system-display text-sm font-bold uppercase tracking-[0.25em] mt-5 ${RANKS[rank].cor}`}
          >
            ▲ Promovido a {RANKS[rank].nome}
          </p>
        )}

        {resultado.streak_ganho && (
          <p className="font-system-display text-xs uppercase tracking-[0.25em] text-amber-300 mt-4">
            🔥 Streak: {resultado.streak} dia(s)
          </p>
        )}

        {resultado.conquistasNovas.length > 0 && (
          <div className="mt-5 pt-4 border-t border-system-800 space-y-1">
            {resultado.conquistasNovas.map((c) => (
              <p
                key={c.nome}
                className="font-system-body text-sm text-amber-200 tracking-wide"
              >
                🏆 {c.nome} · +{c.moedas.toLocaleString('pt-BR')} moedas
              </p>
            ))}
          </div>
        )}

        <p className="font-system-body text-xs text-system-700 mt-6 tracking-widest uppercase">
          Toque para continuar
        </p>
      </div>
    </div>
  )
}
