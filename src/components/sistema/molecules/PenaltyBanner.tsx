import { TriangleAlert } from 'lucide-react'

/** Aviso de penalidade — exibido quando um dia terminou com quests pendentes. */
export function PenaltyBanner() {
  return (
    <div
      role="alert"
      className="holo-panel border-red-500/50 p-4 mb-6 animate-system-pop"
      style={{ boxShadow: 'inset 0 0 24px 0 rgba(239,68,68,0.12)' }}
    >
      <p className="font-system-display text-xs font-bold uppercase tracking-[0.3em] text-red-400 flex items-center gap-2">
        <TriangleAlert size={14} /> Penalidade
      </p>
      <p className="font-system-body text-sm text-system-200 mt-2">
        Você falhou em concluir as quests diárias. Seu streak foi zerado.
        O Sistema não perdoa — recomece hoje.
      </p>
    </div>
  )
}
