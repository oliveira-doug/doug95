'use client'

// Board de quests diárias: concluir (com overlay de recompensas), criar,
// editar e excluir. "Feita hoje" é derivado das conclusões do dia.

import { useState, useTransition } from 'react'
import { CircleCheck, Circle, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SistemaAtributo, SistemaQuest } from '@/lib/supabase/types'
import {
  LevelUpOverlay,
  type ResultadoQuest,
} from '@/components/sistema/molecules/LevelUpOverlay'
import { concluirQuest, excluirQuest } from './actions'
import { QuestForm } from './QuestForm'

export function QuestBoard({
  quests,
  feitasHoje,
  atributos,
}: {
  quests: SistemaQuest[]
  feitasHoje: string[]
  atributos: SistemaAtributo[]
}) {
  const feitas = new Set(feitasHoje)
  const [editando, setEditando] = useState<string | 'nova' | null>(null)
  const [resultado, setResultado] = useState<ResultadoQuest | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [pendenteId, setPendenteId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function concluir(quest: SistemaQuest) {
    if (feitas.has(quest.id) || pendenteId) return
    setErro(null)
    setPendenteId(quest.id)
    startTransition(async () => {
      const res = await concluirQuest(quest.id)
      setPendenteId(null)
      if (res.erro) setErro(res.erro)
      else if (res.resultado) setResultado(res.resultado)
    })
  }

  function excluir(quest: SistemaQuest) {
    if (!confirm(`Excluir a quest "${quest.titulo}"?`)) return
    startTransition(async () => {
      const res = await excluirQuest(quest.id)
      if (res.erro) setErro(res.erro)
    })
  }

  return (
    <div className="space-y-3">
      {erro && (
        <p role="alert" className="font-system-body text-sm text-red-400">
          {erro}
        </p>
      )}

      {quests.map((quest) => {
        const feita = feitas.has(quest.id)
        if (editando === quest.id) {
          return (
            <QuestForm
              key={quest.id}
              quest={quest}
              atributos={atributos}
              onDone={() => setEditando(null)}
            />
          )
        }
        return (
          <div
            key={quest.id}
            className={cn(
              'holo-panel p-4 flex items-start gap-3 transition-opacity',
              feita && 'opacity-60',
            )}
          >
            <button
              type="button"
              onClick={() => concluir(quest)}
              disabled={feita || pendenteId !== null}
              aria-label={
                feita ? `${quest.titulo} concluída` : `Concluir ${quest.titulo}`
              }
              className={cn(
                'shrink-0 mt-0.5 transition-all cursor-pointer disabled:cursor-default',
                feita
                  ? 'text-system-300'
                  : 'text-system-700 hover:text-system-400',
                pendenteId === quest.id && 'animate-pulse-soft',
              )}
            >
              {feita ? <CircleCheck size={28} /> : <Circle size={28} />}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'font-system-body text-base font-semibold tracking-wide text-system-100',
                  feita && 'line-through decoration-system-500/60',
                )}
              >
                {quest.titulo}
              </p>
              {quest.descricao && (
                <p className="font-system-body text-sm text-system-400 mt-0.5">
                  {quest.descricao}
                </p>
              )}
              <p className="font-system-display text-[0.6rem] uppercase tracking-[0.2em] text-system-500 mt-1.5">
                +{quest.xp_recompensa} XP · +{quest.moedas_recompensa} moedas
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditando(quest.id)}
                aria-label={`Editar ${quest.titulo}`}
                className="text-system-700 hover:text-system-300 transition-colors cursor-pointer"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => excluir(quest)}
                aria-label={`Excluir ${quest.titulo}`}
                className="text-system-700 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )
      })}

      {editando === 'nova' ? (
        <QuestForm atributos={atributos} onDone={() => setEditando(null)} />
      ) : (
        <button
          type="button"
          onClick={() => setEditando('nova')}
          className="w-full h-12 border border-dashed border-system-800 flex items-center
                     justify-center gap-2 font-system-display text-xs uppercase tracking-[0.2em]
                     text-system-500 hover:text-system-300 hover:border-system-500
                     transition-colors cursor-pointer"
        >
          <Plus size={16} /> Nova quest
        </button>
      )}

      {resultado && (
        <LevelUpOverlay
          resultado={resultado}
          onClose={() => setResultado(null)}
        />
      )}
    </div>
  )
}
