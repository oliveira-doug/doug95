'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, Receipt } from 'lucide-react'
import type {
  Atendimento,
  AtendimentoItem,
  Profissional,
  Servico,
} from '@/lib/supabase/types'
import { diaLongo, dataLocal, horaLocal } from '@/lib/datas'
import { formatarBRL, parseBRL } from '@/lib/dinheiro'
import {
  adicionarItem,
  removerItem,
  salvarObservacoes,
  excluirAtendimento,
} from '../actions'

type Props = {
  atendimento: Atendimento
  itens: AtendimentoItem[]
  servicos: Servico[]
  profissionais: Profissional[]
}

export function ComandaDetalhe({ atendimento, itens, servicos, profissionais }: Props) {
  const router = useRouter()
  const prof = profissionais.find((p) => p.id === atendimento.profissional_id)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        href="/dashboard/comanda"
        className="inline-flex items-center gap-1 font-accent text-body-sm font-medium text-charcoal-700/60 hover:text-gold-600 transition-colors w-fit"
      >
        <ChevronLeft size={16} /> Comandas
      </Link>

      {/* Cabeçalho da comanda */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-lg text-charcoal-900">
            {atendimento.cliente_nome ?? 'Cliente'}
          </h1>
          <p className="font-body text-body-md text-charcoal-700/70 mt-1 capitalize">
            {diaLongo(dataLocal(atendimento.data))} · {horaLocal(atendimento.data)}
            {prof && <span className="capitalize"> · {prof.nome}</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="font-accent text-label uppercase tracking-widest text-gold-600">
            Total
          </p>
          <p className="font-display text-display-lg text-charcoal-900">
            {formatarBRL(atendimento.total)}
          </p>
        </div>
      </div>

      {/* Itens lançados */}
      <section className="rounded-card bg-ivory-50 border border-ivory-300 overflow-hidden">
        <header className="px-5 py-3 border-b border-ivory-200">
          <h2 className="font-accent text-body-lg font-semibold text-charcoal-900">
            Procedimentos
          </h2>
        </header>

        {itens.length === 0 ? (
          <p className="px-5 py-6 font-body text-body-sm text-charcoal-700/60 text-center">
            Nenhum procedimento lançado ainda. Adicione abaixo. 💛
          </p>
        ) : (
          <ul className="divide-y divide-ivory-200">
            {itens.map((it) => (
              <ItemLinha
                key={it.id}
                item={it}
                atendimentoId={atendimento.id}
                onMudou={() => router.refresh()}
              />
            ))}
          </ul>
        )}

        <AddItemForm
          atendimentoId={atendimento.id}
          servicos={servicos}
          onAdicionou={() => router.refresh()}
        />
      </section>

      {/* Observações */}
      <Observacoes
        atendimentoId={atendimento.id}
        inicial={atendimento.observacoes ?? ''}
        onSalvou={() => router.refresh()}
      />

      {/* Recibo + excluir */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <span className="inline-flex items-center gap-2 font-body text-body-sm text-charcoal-700/50">
          <Receipt size={16} /> Recibo e cobrança chegam na sub-entrega 2.4–2.5.
        </span>
        <ExcluirComanda
          atendimentoId={atendimento.id}
          onExcluiu={() => router.push('/dashboard/comanda')}
        />
      </div>
    </div>
  )
}

// ── Uma linha de item (com remover) ───────────────────────────────────────────
function ItemLinha({
  item,
  atendimentoId,
  onMudou,
}: {
  item: AtendimentoItem
  atendimentoId: string
  onMudou: () => void
}) {
  const [pending, start] = useTransition()

  function remover() {
    start(async () => {
      const res = await removerItem(item.id, atendimentoId)
      if (!res.erro) onMudou()
    })
  }

  return (
    <li className="px-5 py-3 flex items-center justify-between gap-4">
      <span className="font-body text-body-md text-charcoal-900 min-w-0 truncate">
        {item.descricao}
      </span>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-accent text-body-md font-medium text-charcoal-900">
          {formatarBRL(item.valor)}
        </span>
        <button
          onClick={remover}
          disabled={pending}
          aria-label="Remover item"
          className="text-charcoal-700/30 hover:text-red-500 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  )
}

// ── Form de adicionar item ────────────────────────────────────────────────────
function AddItemForm({
  atendimentoId,
  servicos,
  onAdicionou,
}: {
  atendimentoId: string
  servicos: Servico[]
  onAdicionou: () => void
}) {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string>()

  // Ao escolher um serviço do catálogo, prefill nome + preço (ambos editáveis).
  function escolherServico(id: string) {
    const s = servicos.find((x) => x.id === id)
    if (!s) return
    setDescricao(s.nome)
    if (s.preco != null) setValor(String(s.preco).replace('.', ','))
  }

  function enviar() {
    setErro(undefined)
    const v = parseBRL(valor)
    if (v == null) {
      setErro('Informe um valor válido (ex.: 150,00).')
      return
    }
    if (descricao.trim().length < 2) {
      setErro('Descreva o procedimento.')
      return
    }
    start(async () => {
      const res = await adicionarItem({
        atendimento_id: atendimentoId,
        descricao,
        valor: v,
      })
      if (res.erro) setErro(res.erro)
      else {
        setDescricao('')
        setValor('')
        onAdicionou()
      }
    })
  }

  return (
    <div className="px-5 py-4 border-t border-ivory-200 bg-ivory-50/60 flex flex-col gap-3">
      <select
        defaultValue=""
        onChange={(e) => escolherServico(e.target.value)}
        className={inputCls}
      >
        <option value="">Escolher do catálogo (opcional)…</option>
        {servicos.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome}
            {s.preco != null ? ` — ${formatarBRL(s.preco)}` : ''}
          </option>
        ))}
      </select>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Procedimento realizado"
          className={inputCls + ' sm:flex-1'}
        />
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          inputMode="decimal"
          placeholder="Valor (R$)"
          className={inputCls + ' sm:w-40'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              enviar()
            }
          }}
        />
        <button
          onClick={enviar}
          disabled={pending}
          className="h-11 px-5 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-md font-medium shadow-card-rest hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shrink-0"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {erro && (
        <p role="alert" className="font-body text-body-sm text-red-600">
          {erro}
        </p>
      )}
    </div>
  )
}

// ── Observações ───────────────────────────────────────────────────────────────
function Observacoes({
  atendimentoId,
  inicial,
  onSalvou,
}: {
  atendimentoId: string
  inicial: string
  onSalvou: () => void
}) {
  const [texto, setTexto] = useState(inicial)
  const [pending, start] = useTransition()
  const [salvo, setSalvo] = useState(false)

  const mudou = texto !== inicial

  function salvar() {
    setSalvo(false)
    start(async () => {
      const res = await salvarObservacoes({
        atendimento_id: atendimentoId,
        observacoes: texto,
      })
      if (!res.erro) {
        setSalvo(true)
        onSalvou()
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-accent text-body-sm font-medium text-charcoal-700">
        Observações
      </label>
      <textarea
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setSalvo(false)
        }}
        rows={3}
        placeholder="Anotações sobre o atendimento (opcional)…"
        className="px-4 py-3 rounded-card bg-ivory-50 border border-ivory-300 font-body text-body-md text-charcoal-900 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/30 transition-colors resize-y"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={pending || !mudou}
          className="h-9 px-4 rounded-badge border border-ivory-300 text-charcoal-700 font-accent text-body-sm font-medium hover:border-gold-400 hover:text-gold-600 disabled:opacity-50 transition-all cursor-pointer"
        >
          {pending ? 'Salvando…' : 'Salvar observações'}
        </button>
        {salvo && !mudou && (
          <span className="font-body text-body-sm text-emerald-600">Salvo ✓</span>
        )}
      </div>
    </div>
  )
}

// ── Excluir comanda ───────────────────────────────────────────────────────────
function ExcluirComanda({
  atendimentoId,
  onExcluiu,
}: {
  atendimentoId: string
  onExcluiu: () => void
}) {
  const [confirmar, setConfirmar] = useState(false)
  const [pending, start] = useTransition()

  function excluir() {
    start(async () => {
      const res = await excluirAtendimento(atendimentoId)
      if (!res.erro) onExcluiu()
    })
  }

  if (!confirmar) {
    return (
      <button
        onClick={() => setConfirmar(true)}
        className="inline-flex items-center gap-2 h-9 px-4 rounded-badge border border-red-200 text-red-600 font-accent text-body-sm font-medium hover:bg-red-50 transition-all cursor-pointer"
      >
        <Trash2 size={15} /> Excluir comanda
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-body text-body-sm text-charcoal-700">Tem certeza?</span>
      <button
        onClick={excluir}
        disabled={pending}
        className="h-9 px-4 rounded-badge bg-red-500 text-ivory-50 font-accent text-body-sm font-medium hover:bg-red-600 disabled:opacity-60 transition-all cursor-pointer"
      >
        {pending ? 'Excluindo…' : 'Sim, excluir'}
      </button>
      <button
        onClick={() => setConfirmar(false)}
        className="h-9 px-4 rounded-badge border border-ivory-300 text-charcoal-700 font-accent text-body-sm font-medium hover:border-gold-400 transition-all cursor-pointer"
      >
        Cancelar
      </button>
    </div>
  )
}

const inputCls =
  'h-11 px-4 rounded-badge bg-ivory-50 border border-ivory-300 font-body text-body-md text-charcoal-900 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/30 transition-colors w-full'
