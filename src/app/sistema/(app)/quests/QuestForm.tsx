'use client'

// Formulário de criar/editar quest (inline, dentro do board).

import { useState, useTransition } from 'react'
import type { SistemaAtributo, SistemaQuest } from '@/lib/supabase/types'
import { atualizarQuest, criarQuest } from './actions'

const inputClasses = `h-11 px-3 bg-system-950/80 border border-system-800 w-full
  font-system-body text-base text-system-100
  focus:outline-none focus:border-system-500 transition-colors`

const labelClasses =
  'font-system-display text-[0.6rem] uppercase tracking-[0.2em] text-system-500'

export function QuestForm({
  quest,
  atributos,
  onDone,
}: {
  quest?: SistemaQuest
  atributos: SistemaAtributo[]
  onDone: () => void
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const recompensaAtual = quest
    ? Object.entries(quest.recompensa_atributos)[0]
    : undefined

  function submit(formData: FormData) {
    const input = Object.fromEntries(formData)
    startTransition(async () => {
      const res = quest
        ? await atualizarQuest(quest.id, input)
        : await criarQuest(input)
      if (res.erro) setErro(res.erro)
      else onDone()
    })
  }

  return (
    <form action={submit} className="holo-panel p-4 space-y-3 animate-system-pop">
      <p className="font-system-display text-xs font-bold uppercase tracking-[0.25em] text-system-300">
        {quest ? 'Editar quest' : 'Nova quest diária'}
      </p>

      <label className="block space-y-1">
        <span className={labelClasses}>Título</span>
        <input
          name="titulo"
          required
          maxLength={80}
          defaultValue={quest?.titulo}
          className={inputClasses}
        />
      </label>

      <label className="block space-y-1">
        <span className={labelClasses}>Descrição (opcional)</span>
        <input
          name="descricao"
          maxLength={300}
          defaultValue={quest?.descricao ?? ''}
          className={inputClasses}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className={labelClasses}>XP</span>
          <input
            name="xp_recompensa"
            type="number"
            min={1}
            max={10000}
            required
            defaultValue={quest?.xp_recompensa ?? 25}
            className={inputClasses}
          />
        </label>
        <label className="block space-y-1">
          <span className={labelClasses}>Moedas</span>
          <input
            name="moedas_recompensa"
            type="number"
            min={0}
            max={10000}
            required
            defaultValue={quest?.moedas_recompensa ?? 10}
            className={inputClasses}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className={labelClasses}>Bônus de atributo</span>
          <select
            name="atributo_id"
            defaultValue={recompensaAtual?.[0] ?? ''}
            className={inputClasses}
          >
            <option value="">Nenhum</option>
            {atributos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className={labelClasses}>Pontos</span>
          <input
            name="atributo_pontos"
            type="number"
            min={0}
            max={100}
            defaultValue={recompensaAtual?.[1] ?? 0}
            className={inputClasses}
          />
        </label>
      </div>

      {erro && (
        <p role="alert" className="font-system-body text-sm text-red-400">
          {erro}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 h-11 holo-panel font-system-display text-xs font-bold uppercase
                     tracking-[0.2em] text-system-300 hover:text-glow-system
                     disabled:opacity-50 transition-all cursor-pointer"
        >
          {pending ? 'Salvando…' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-11 px-4 border border-system-800 font-system-display text-xs uppercase
                     tracking-[0.2em] text-system-500 hover:text-system-300 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
