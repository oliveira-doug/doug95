'use client'

// Janela de atributos: alocar pontos (+), criar, renomear e excluir.

import { useState, useTransition } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { SistemaAtributo } from '@/lib/supabase/types'
import { IconeSistema } from '@/components/sistema/atoms/IconeSistema'
import {
  alocarPonto,
  criarAtributo,
  excluirAtributo,
  renomearAtributo,
} from './actions'

const ICONES_ESCOLHA = [
  'punho',
  'raio',
  'coracao',
  'cerebro',
  'olho',
  'chama',
  'alvo',
  'faisca',
  'sombra',
  'gema',
]

const inputClasses = `h-11 px-3 bg-system-950/80 border border-system-800 w-full
  font-system-body text-base text-system-100
  focus:outline-none focus:border-system-500 transition-colors`

function AtributoForm({
  atributo,
  onDone,
}: {
  atributo?: SistemaAtributo
  onDone: () => void
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    const input = Object.fromEntries(formData)
    startTransition(async () => {
      const res = atributo
        ? await renomearAtributo(atributo.id, input)
        : await criarAtributo(input)
      if (res.erro) setErro(res.erro)
      else onDone()
    })
  }

  return (
    <form action={submit} className="holo-panel p-4 space-y-3 animate-system-pop">
      <p className="font-system-display text-xs font-bold uppercase tracking-[0.25em] text-system-300">
        {atributo ? 'Editar atributo' : 'Novo atributo'}
      </p>
      <input
        name="nome"
        required
        maxLength={30}
        defaultValue={atributo?.nome}
        placeholder="Nome (ex.: Carisma)"
        className={inputClasses}
      />
      <select
        name="icone"
        defaultValue={atributo?.icone ?? 'raio'}
        className={inputClasses}
      >
        {ICONES_ESCOLHA.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>
      {erro && (
        <p role="alert" className="font-system-body text-sm text-red-400">
          {erro}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 h-11 holo-panel font-system-display text-xs font-bold uppercase
                     tracking-[0.2em] text-system-300 disabled:opacity-50 cursor-pointer"
        >
          {pending ? 'Salvando…' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-11 px-4 border border-system-800 font-system-display text-xs uppercase
                     tracking-[0.2em] text-system-500 hover:text-system-300 cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function AtributosBoard({
  atributos,
  pontosDisponiveis,
}: {
  atributos: SistemaAtributo[]
  pontosDisponiveis: number
}) {
  const [editando, setEditando] = useState<string | 'novo' | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [pendenteId, setPendenteId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function alocar(attr: SistemaAtributo) {
    if (pendenteId) return
    setErro(null)
    setPendenteId(attr.id)
    startTransition(async () => {
      const res = await alocarPonto(attr.id)
      setPendenteId(null)
      if (res.erro) setErro(res.erro)
    })
  }

  function excluir(attr: SistemaAtributo) {
    if (!confirm(`Excluir o atributo "${attr.nome}"?`)) return
    startTransition(async () => {
      const res = await excluirAtributo(attr.id)
      if (res.erro) setErro(res.erro)
    })
  }

  return (
    <div className="space-y-3">
      {pontosDisponiveis > 0 && (
        <p className="font-system-display text-xs uppercase tracking-[0.25em] text-amber-300 animate-pulse-soft">
          ▲ {pontosDisponiveis} ponto(s) disponível(is) — toque em + para alocar
        </p>
      )}
      {erro && (
        <p role="alert" className="font-system-body text-sm text-red-400">
          {erro}
        </p>
      )}

      {atributos.map((attr) => {
        if (editando === attr.id) {
          return (
            <AtributoForm
              key={attr.id}
              atributo={attr}
              onDone={() => setEditando(null)}
            />
          )
        }
        return (
          <div key={attr.id} className="holo-panel p-4 flex items-center gap-3">
            <IconeSistema
              slug={attr.icone}
              size={22}
              className="text-system-500 shrink-0"
            />
            <p className="font-system-body text-base font-semibold tracking-wide text-system-100 flex-1 min-w-0 truncate">
              {attr.nome}
            </p>
            <p className="font-system-display text-2xl font-bold text-system-300">
              {attr.valor}
            </p>
            {pontosDisponiveis > 0 && (
              <button
                type="button"
                onClick={() => alocar(attr)}
                disabled={pendenteId !== null}
                aria-label={`Alocar ponto em ${attr.nome}`}
                className="w-9 h-9 holo-panel flex items-center justify-center text-amber-300
                           hover:shadow-glow-system disabled:opacity-50 transition-all cursor-pointer"
              >
                <Plus size={18} />
              </button>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setEditando(attr.id)}
                aria-label={`Editar ${attr.nome}`}
                className="text-system-700 hover:text-system-300 transition-colors cursor-pointer"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => excluir(attr)}
                aria-label={`Excluir ${attr.nome}`}
                className="text-system-700 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )
      })}

      {editando === 'novo' ? (
        <AtributoForm onDone={() => setEditando(null)} />
      ) : (
        <button
          type="button"
          onClick={() => setEditando('novo')}
          className="w-full h-12 border border-dashed border-system-800 flex items-center
                     justify-center gap-2 font-system-display text-xs uppercase tracking-[0.2em]
                     text-system-500 hover:text-system-300 hover:border-system-500
                     transition-colors cursor-pointer"
        >
          <Plus size={16} /> Novo atributo
        </button>
      )}
    </div>
  )
}
