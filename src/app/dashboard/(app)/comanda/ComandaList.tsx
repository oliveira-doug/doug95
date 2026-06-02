'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus, X, ClipboardList, ChevronRightCircle } from 'lucide-react'
import type { Atendimento, Papel, Profissional } from '@/lib/supabase/types'
import { addDias, diaLongo, hojeISO, horaLocal } from '@/lib/datas'
import { formatarBRL } from '@/lib/dinheiro'
import { criarAtendimento } from './actions'

type Props = {
  dia: string
  papel: Papel
  profissionais: Profissional[]
  atendimentos: Atendimento[]
}

export function ComandaList({ dia, papel, profissionais, atendimentos }: Props) {
  const router = useRouter()
  const [novaAberta, setNovaAberta] = useState(false)

  const nomeProf = (id: string) =>
    profissionais.find((p) => p.id === id)?.nome ?? '—'

  function irPara(novoDia: string) {
    router.push(`/dashboard/comanda?data=${novoDia}`)
  }

  const ehHoje = dia === hojeISO()

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho + navegação de data */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-lg text-charcoal-900">Comandas</h1>
          <p className="font-body text-body-md text-charcoal-700/70 mt-1 capitalize">
            {diaLongo(dia)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => irPara(addDias(dia, -1))}
            aria-label="Dia anterior"
            className="h-10 w-10 grid place-items-center rounded-badge border border-ivory-300 text-charcoal-700 hover:border-gold-400 hover:text-gold-600 transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          {!ehHoje && (
            <button
              onClick={() => irPara(hojeISO())}
              className="h-10 px-4 rounded-badge border border-ivory-300 text-charcoal-700 font-accent text-body-sm font-medium hover:border-gold-400 hover:text-gold-600 transition-all cursor-pointer"
            >
              Hoje
            </button>
          )}
          <button
            onClick={() => irPara(addDias(dia, 1))}
            aria-label="Próximo dia"
            className="h-10 w-10 grid place-items-center rounded-badge border border-ivory-300 text-charcoal-700 hover:border-gold-400 hover:text-gold-600 transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setNovaAberta(true)}
            className="h-10 px-4 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-sm font-medium shadow-card-rest hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus size={16} /> Nova comanda
          </button>
        </div>
      </div>

      {/* Lista */}
      {atendimentos.length === 0 ? (
        <div className="rounded-card border border-dashed border-ivory-300 bg-ivory-50/60 p-10 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-ivory-100 border border-ivory-300 grid place-items-center text-charcoal-700/40">
            <ClipboardList size={22} strokeWidth={1.5} />
          </div>
          <p className="font-body text-body-md text-charcoal-700/70">
            Nenhuma comanda neste dia.
          </p>
          <button
            onClick={() => setNovaAberta(true)}
            className="font-accent text-body-sm font-medium text-gold-600 hover:text-gold-700 cursor-pointer"
          >
            + Abrir uma comanda
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {atendimentos.map((a) => (
            <li key={a.id}>
              <Link
                href={`/dashboard/comanda/${a.id}`}
                className="group flex items-center justify-between gap-4 rounded-card bg-ivory-50 border border-ivory-300 p-4 hover:border-gold-400 hover:shadow-card-rest transition-all"
              >
                <div className="min-w-0">
                  <p className="font-accent text-body-lg font-semibold text-charcoal-900 truncate">
                    {a.cliente_nome ?? 'Cliente'}
                  </p>
                  <p className="font-body text-body-sm text-charcoal-700/60 mt-0.5">
                    {horaLocal(a.data)} · {nomeProf(a.profissional_id)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-accent text-body-lg font-semibold text-charcoal-900">
                    {formatarBRL(a.total)}
                  </span>
                  <ChevronRightCircle
                    size={20}
                    className="text-charcoal-700/30 group-hover:text-gold-500 transition-colors"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {novaAberta && (
        <NovaComanda
          papel={papel}
          profissionais={profissionais}
          onFechar={() => setNovaAberta(false)}
        />
      )}
    </div>
  )
}

// ── Modal: nova comanda avulsa ────────────────────────────────────────────────
function NovaComanda({
  papel,
  profissionais,
  onFechar,
}: {
  papel: Papel
  profissionais: Profissional[]
  onFechar: () => void
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string>()

  function onSubmit(formData: FormData) {
    setErro(undefined)
    start(async () => {
      const res = await criarAtendimento({
        cliente_nome: String(formData.get('cliente_nome') ?? ''),
        profissional_id: String(formData.get('profissional_id') ?? ''),
      })
      if (res.erro) setErro(res.erro)
      else if (res.id) router.push(`/dashboard/comanda/${res.id}`)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-charcoal-900/40 backdrop-blur-sm p-4"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-md rounded-card bg-ivory-50 border border-ivory-300 shadow-card-hover p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-display-md text-charcoal-900">Nova comanda</h2>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="text-charcoal-700/50 hover:text-charcoal-900 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form action={onSubmit} className="flex flex-col gap-3">
          <input
            name="cliente_nome"
            placeholder="Nome do cliente"
            required
            autoFocus
            className={inputCls}
          />
          {papel === 'admin' && (
            <select name="profissional_id" defaultValue="" required className={inputCls}>
              <option value="" disabled>
                Profissional…
              </option>
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          )}

          {erro && (
            <p role="alert" className="font-body text-body-sm text-red-600">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-11 mt-1 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-md font-medium shadow-card-rest hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer"
          >
            {pending ? 'Abrindo…' : 'Abrir comanda'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputCls =
  'h-11 px-4 rounded-badge bg-ivory-50 border border-ivory-300 font-body text-body-md text-charcoal-900 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/30 transition-colors w-full'
