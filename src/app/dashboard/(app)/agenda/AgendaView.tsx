'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, X, Phone, Ban } from 'lucide-react'
import type {
  Agendamento,
  AgendamentoStatus,
  Bloqueio,
  Horario,
  Papel,
  Profissional,
  Servico,
} from '@/lib/supabase/types'
import {
  addDias,
  dataLocal,
  diaDaSemana,
  diaLongo,
  hojeISO,
  horaLocal,
  horaParaMin,
  minParaHora,
  slotParaData,
  SLOT_MIN,
} from '@/lib/datas'
import {
  criarAgendamento,
  editarAgendamento,
  mudarStatus,
  criarBloqueio,
  removerBloqueio,
} from './actions'
import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon/WhatsAppIcon'
import { normalizarTelefoneWa } from '@/lib/telefone'
import { SITE, ADDRESS } from '@/config/site'

type Props = {
  dia: string
  papel: Papel
  profissionais: Profissional[]
  servicos: Servico[]
  horarios: Horario[]
  agendamentos: Agendamento[]
  bloqueios: Bloqueio[]
}

const STATUS_INFO: Record<
  AgendamentoStatus,
  { label: string; classe: string }
> = {
  pendente: { label: 'Pendente', classe: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmado: { label: 'Confirmado', classe: 'bg-gold-100 text-gold-700 border-gold-300' },
  em_atendimento: { label: 'Em atendimento', classe: 'bg-blue-50 text-blue-700 border-blue-200' },
  concluido: { label: 'Concluído', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelado: { label: 'Cancelado', classe: 'bg-ivory-100 text-charcoal-700/50 border-ivory-300' },
}

export function AgendaView({
  dia,
  papel,
  profissionais,
  servicos,
  horarios,
  agendamentos,
  bloqueios,
}: Props) {
  const router = useRouter()
  const [novoSlot, setNovoSlot] = useState<{ profId: string; slotMin: number } | null>(null)
  const [detalhe, setDetalhe] = useState<Agendamento | null>(null)
  const [editando, setEditando] = useState<Agendamento | null>(null)
  const [novoBloqueio, setNovoBloqueio] = useState(false)
  const [bloqDetalhe, setBloqDetalhe] = useState<Bloqueio | null>(null)

  const dow = diaDaSemana(dia)

  // Expediente por profissional neste dia da semana.
  const expediente = useMemo(() => {
    const map = new Map<string, { abre: number; fecha: number }>()
    for (const h of horarios) {
      if (h.dia_semana === dow) {
        map.set(h.profissional_id, {
          abre: horaParaMin(h.abre),
          fecha: horaParaMin(h.fecha),
        })
      }
    }
    return map
  }, [horarios, dow])

  // Linhas de horário (slots) — do mais cedo ao mais tarde entre quem atende hoje.
  const slots = useMemo(() => {
    const abertos = [...expediente.values()]
    if (abertos.length === 0) return []
    const min = Math.min(...abertos.map((e) => e.abre))
    const max = Math.max(...abertos.map((e) => e.fecha))
    const out: number[] = []
    for (let m = min; m < max; m += SLOT_MIN) out.push(m)
    return out
  }, [expediente])

  // Agendamento por profissional + minuto de início (local).
  const agPorProf = useMemo(() => {
    const map = new Map<string, { ag: Agendamento; inicioMin: number }[]>()
    for (const ag of agendamentos) {
      const inicioMin = horaParaMin(horaLocal(ag.inicio))
      const arr = map.get(ag.profissional_id) ?? []
      arr.push({ ag, inicioMin })
      map.set(ag.profissional_id, arr)
    }
    return map
  }, [agendamentos])

  // Bloqueios por profissional (intervalos absolutos, para checar sobreposição).
  const bloqPorProf = useMemo(() => {
    const map = new Map<string, { bloq: Bloqueio; ini: number; fim: number }[]>()
    for (const b of bloqueios) {
      const arr = map.get(b.profissional_id) ?? []
      arr.push({ bloq: b, ini: new Date(b.inicio).getTime(), fim: new Date(b.fim).getTime() })
      map.set(b.profissional_id, arr)
    }
    return map
  }, [bloqueios])

  function irPara(novoDia: string) {
    router.push(`/dashboard/agenda?data=${novoDia}`)
  }

  const ativos = profissionais
  const totalDia = agendamentos.length

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho + navegação de dia */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-display-lg text-charcoal-900">Agenda</h1>
          <p className="font-body text-body-sm text-charcoal-700/70 capitalize">
            {diaLongo(dia)} · {totalDia} agendamento{totalDia === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNovoBloqueio(true)}
            className="h-10 px-4 rounded-badge border border-ivory-300 bg-ivory-50 inline-flex items-center gap-1.5 font-accent text-body-sm font-medium text-charcoal-700 hover:border-gold-400 hover:text-gold-600 transition-colors cursor-pointer"
          >
            <Ban size={15} /> Bloquear
          </button>
          <span className="w-px h-6 bg-ivory-300 mx-1" aria-hidden="true" />
          <button
            onClick={() => irPara(addDias(dia, -1))}
            aria-label="Dia anterior"
            className="w-10 h-10 rounded-badge border border-ivory-300 bg-ivory-50 flex items-center justify-center text-charcoal-700 hover:border-gold-400 hover:text-gold-600 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => irPara(hojeISO())}
            className="h-10 px-4 rounded-badge border border-ivory-300 bg-ivory-50 font-accent text-body-sm font-medium text-charcoal-700 hover:border-gold-400 hover:text-gold-600 transition-colors cursor-pointer"
          >
            Hoje
          </button>
          <button
            onClick={() => irPara(addDias(dia, 1))}
            aria-label="Próximo dia"
            className="w-10 h-10 rounded-badge border border-ivory-300 bg-ivory-50 flex items-center justify-center text-charcoal-700 hover:border-gold-400 hover:text-gold-600 transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-card border border-ivory-300 bg-ivory-50 p-10 text-center">
          <p className="font-body text-body-md text-charcoal-700/70">
            Nenhum profissional atende neste dia.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-ivory-300 bg-ivory-50">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-ivory-300">
                <th className="w-28 p-3 text-left font-accent text-label uppercase tracking-wide text-charcoal-700/60">
                  Hora
                </th>
                {ativos.map((p) => (
                  <th
                    key={p.id}
                    className="p-3 text-left font-accent text-body-sm font-semibold text-charcoal-900 border-l border-ivory-200"
                  >
                    {p.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slotMin) => (
                <tr key={slotMin} className="border-b border-ivory-200 last:border-0">
                  <td className="p-3 align-top font-accent text-body-sm font-medium text-charcoal-700/70 whitespace-nowrap">
                    {minParaHora(slotMin)}–{minParaHora(slotMin + SLOT_MIN)}
                  </td>
                  {ativos.map((p) => {
                    const exp = expediente.get(p.id)
                    const fora = !exp || slotMin < exp.abre || slotMin >= exp.fecha
                    const ocupado = (agPorProf.get(p.id) ?? []).find(
                      (x) => x.inicioMin >= slotMin && x.inicioMin < slotMin + SLOT_MIN,
                    )
                    const slotIni = slotParaData(dia, minParaHora(slotMin)).getTime()
                    const slotFim = slotIni + SLOT_MIN * 60_000
                    const bloqueado = (bloqPorProf.get(p.id) ?? []).find(
                      (b) => b.ini < slotFim && slotIni < b.fim,
                    )

                    return (
                      <td
                        key={p.id}
                        className="p-2 align-top border-l border-ivory-200 min-w-[140px]"
                      >
                        {fora ? (
                          <div className="h-14 rounded-lg bg-ivory-100/60" aria-hidden="true" />
                        ) : ocupado ? (
                          <button
                            onClick={() => setDetalhe(ocupado.ag)}
                            className={`w-full h-full min-h-14 rounded-lg border px-3 py-2 text-left transition-all hover:brightness-95 cursor-pointer ${STATUS_INFO[ocupado.ag.status].classe}`}
                          >
                            <p className="font-accent text-body-sm font-semibold leading-tight truncate">
                              {ocupado.ag.cliente_nome}
                            </p>
                            <p className="font-body text-[11px] opacity-80 mt-0.5">
                              {horaLocal(ocupado.ag.inicio)}–{horaLocal(ocupado.ag.fim)}
                            </p>
                          </button>
                        ) : bloqueado ? (
                          <button
                            onClick={() => setBloqDetalhe(bloqueado.bloq)}
                            className="w-full min-h-14 rounded-lg border border-ivory-300 bg-ivory-100 px-3 py-2 flex items-center gap-1.5 text-charcoal-700/55 hover:border-charcoal-700/30 transition-all cursor-pointer"
                            aria-label="Ver bloqueio"
                          >
                            <Ban size={13} className="shrink-0" />
                            <span className="font-accent text-body-sm font-medium truncate">
                              {bloqueado.bloq.motivo || 'Bloqueado'}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setNovoSlot({ profId: p.id, slotMin })}
                            className="w-full min-h-14 rounded-lg border border-dashed border-ivory-300 flex items-center justify-center text-charcoal-700/30 hover:border-gold-400 hover:text-gold-500 hover:bg-gold-50/40 transition-all cursor-pointer"
                            aria-label={`Agendar ${minParaHora(slotMin)} com ${p.nome}`}
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {novoSlot && (
        <NovoAgendamento
          dia={dia}
          slotMin={novoSlot.slotMin}
          profissional={ativos.find((p) => p.id === novoSlot.profId)!}
          servicos={servicos}
          onFechar={() => setNovoSlot(null)}
          onSucesso={() => {
            setNovoSlot(null)
            router.refresh()
          }}
        />
      )}

      {detalhe && (
        <DetalheAgendamento
          ag={detalhe}
          servicos={servicos}
          profissional={ativos.find((p) => p.id === detalhe.profissional_id)}
          onFechar={() => setDetalhe(null)}
          onEditar={(ag) => {
            setDetalhe(null)
            setEditando(ag)
          }}
          onAtualizado={() => router.refresh()}
        />
      )}

      {editando && (
        <EditarAgendamento
          ag={editando}
          profissionais={ativos}
          servicos={servicos}
          onFechar={() => setEditando(null)}
          onSucesso={() => {
            setEditando(null)
            router.refresh()
          }}
        />
      )}

      {novoBloqueio && (
        <NovoBloqueio
          dia={dia}
          profissionais={ativos}
          permiteTodos={papel === 'admin'}
          onFechar={() => setNovoBloqueio(false)}
          onSucesso={() => {
            setNovoBloqueio(false)
            router.refresh()
          }}
        />
      )}

      {bloqDetalhe && (
        <BloqueioDetalhe
          bloq={bloqDetalhe}
          profissional={ativos.find((p) => p.id === bloqDetalhe.profissional_id)}
          onFechar={() => setBloqDetalhe(null)}
          onRemovido={() => {
            setBloqDetalhe(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

// ── Modal genérico ────────────────────────────────────────────────────────────
function Modal({ children, onFechar, titulo }: { children: React.ReactNode; onFechar: () => void; titulo: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-md rounded-card bg-ivory-50 border border-ivory-300 shadow-card-hover p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-display-md text-charcoal-900">{titulo}</h2>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-700/60 hover:bg-ivory-100 hover:text-charcoal-900 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const inputCls =
  'h-11 px-4 rounded-badge bg-ivory-50 border border-ivory-300 font-body text-body-md text-charcoal-900 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/30 transition-colors w-full'

// ── Novo agendamento ──────────────────────────────────────────────────────────
function NovoAgendamento({
  dia,
  slotMin,
  profissional,
  servicos,
  onFechar,
  onSucesso,
}: {
  dia: string
  slotMin: number
  profissional: Profissional
  servicos: Servico[]
  onFechar: () => void
  onSucesso: () => void
}) {
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string>()

  function onSubmit(formData: FormData) {
    setErro(undefined)
    const servicoId = String(formData.get('servico_id') ?? '')
    const servico = servicos.find((s) => s.id === servicoId)
    const inicioISO = slotParaData(dia, minParaHora(slotMin)).toISOString()

    start(async () => {
      const res = await criarAgendamento({
        profissional_id: profissional.id,
        servico_id: servicoId,
        cliente_nome: String(formData.get('cliente_nome') ?? ''),
        cliente_telefone: String(formData.get('cliente_telefone') ?? ''),
        inicio: inicioISO,
        duracao_min: servico?.duracao_min ?? SLOT_MIN,
        observacoes: String(formData.get('observacoes') ?? ''),
      })
      if (res.erro) setErro(res.erro)
      else onSucesso()
    })
  }

  return (
    <Modal titulo="Novo agendamento" onFechar={onFechar}>
      <p className="font-body text-body-sm text-charcoal-700/70 mb-4">
        <span className="font-semibold text-charcoal-900">{profissional.nome}</span> ·{' '}
        {minParaHora(slotMin)} · {diaLongo(dia)}
      </p>

      <form action={onSubmit} className="flex flex-col gap-3">
        <input name="cliente_nome" placeholder="Nome do cliente" required className={inputCls} />
        <input name="cliente_telefone" placeholder="Telefone / WhatsApp" required className={inputCls} />

        <select name="servico_id" defaultValue="" className={inputCls}>
          <option value="">Serviço (opcional)</option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome} ({s.duracao_min} min)
            </option>
          ))}
        </select>

        <textarea
          name="observacoes"
          placeholder="Observações (opcional)"
          rows={2}
          className={inputCls + ' h-auto py-2 resize-none'}
        />

        {erro && (
          <p role="alert" className="font-body text-body-sm text-red-600">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-11 mt-1 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-md font-medium tracking-wide shadow-card-rest hover:shadow-card-hover hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {pending ? 'Salvando…' : 'Agendar'}
        </button>
      </form>
    </Modal>
  )
}

// ── Detalhe / gestão de status ────────────────────────────────────────────────
function DetalheAgendamento({
  ag,
  servicos,
  profissional,
  onFechar,
  onEditar,
  onAtualizado,
}: {
  ag: Agendamento
  servicos: Servico[]
  profissional?: Profissional
  onFechar: () => void
  onEditar: (ag: Agendamento) => void
  onAtualizado: () => void
}) {
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string>()
  const [statusAtual, setStatusAtual] = useState<AgendamentoStatus>(ag.status)
  const servico = servicos.find((s) => s.id === ag.servico_id)
  const editavel = statusAtual !== 'cancelado' && statusAtual !== 'concluido'

  function alterar(novo: AgendamentoStatus) {
    setErro(undefined)
    start(async () => {
      const res = await mudarStatus(ag.id, novo)
      if (res.erro) setErro(res.erro)
      else {
        setStatusAtual(novo)
        onAtualizado() // atualiza a grade ao fundo; o modal continua aberto
      }
    })
  }

  // Ações disponíveis conforme o status atual.
  const acoes: { label: string; status: AgendamentoStatus }[] = []
  if (statusAtual === 'pendente') acoes.push({ label: 'Confirmar', status: 'confirmado' })
  if (statusAtual === 'confirmado') acoes.push({ label: 'Iniciar atendimento', status: 'em_atendimento' })
  if (statusAtual === 'em_atendimento') acoes.push({ label: 'Concluir', status: 'concluido' })

  // Mensagem de confirmação pronta para o cliente (envio com 1 clique, custo zero).
  const tel = normalizarTelefoneWa(ag.cliente_telefone)
  const msgConfirmacao =
    `Oi ${ag.cliente_nome}! 💛 Seu horário no ${SITE.name} está *confirmado* ✅\n\n` +
    `🗓️ ${diaLongo(dataLocal(ag.inicio))} às ${horaLocal(ag.inicio)}\n` +
    `💇 ${profissional?.nome ?? ''}${servico ? ` · ${servico.nome}` : ''}\n` +
    `📍 ${ADDRESS.street} — ${ADDRESS.neighborhood}\n\n` +
    `Qualquer coisa, é só chamar por aqui. Até breve! ✨`
  const waHref = tel
    ? `https://wa.me/${tel}?text=${encodeURIComponent(msgConfirmacao)}`
    : null

  return (
    <Modal titulo={ag.cliente_nome} onFechar={onFechar}>
      <div className="flex flex-col gap-3">
        <span
          className={`self-start px-3 py-1 rounded-badge border font-accent text-body-sm font-medium ${STATUS_INFO[statusAtual].classe}`}
        >
          {STATUS_INFO[statusAtual].label}
        </span>

        <dl className="flex flex-col gap-2 font-body text-body-sm text-charcoal-700">
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal-700/60">Horário</dt>
            <dd className="text-charcoal-900 font-medium">
              {horaLocal(ag.inicio)}–{horaLocal(ag.fim)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal-700/60">Profissional</dt>
            <dd className="text-charcoal-900 font-medium">{profissional?.nome ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal-700/60">Serviço</dt>
            <dd className="text-charcoal-900 font-medium">{servico?.nome ?? 'Não informado'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal-700/60">Telefone</dt>
            <dd className="text-charcoal-900 font-medium flex items-center gap-1.5">
              <Phone size={13} /> {ag.cliente_telefone}
            </dd>
          </div>
          {ag.observacoes && (
            <div className="pt-1">
              <dt className="text-charcoal-700/60 mb-0.5">Observações</dt>
              <dd className="text-charcoal-900">{ag.observacoes}</dd>
            </div>
          )}
        </dl>

        {erro && (
          <p role="alert" className="font-body text-body-sm text-red-600">
            {erro}
          </p>
        )}

        {/* Avisar o cliente — aparece quando o horário está confirmado */}
        {statusAtual === 'confirmado' && (
          <div className="rounded-card border border-emerald-200 bg-emerald-50/60 p-3 flex flex-col gap-2">
            <p className="font-body text-body-sm text-charcoal-700">
              Confirmado! Avise o cliente com a mensagem pronta:
            </p>
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-sm font-medium shadow-card-rest hover:brightness-110 transition-all"
              >
                <WhatsAppIcon size={16} /> Enviar confirmação no WhatsApp
              </a>
            ) : (
              <p className="font-body text-body-sm text-red-600">
                Telefone do cliente inválido para WhatsApp.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {acoes.map((a) => (
            <button
              key={a.status}
              onClick={() => alterar(a.status)}
              disabled={pending}
              className="h-10 px-4 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-sm font-medium shadow-card-rest hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer"
            >
              {a.label}
            </button>
          ))}
          {editavel && (
            <button
              onClick={() => onEditar(ag)}
              disabled={pending}
              className="h-10 px-4 rounded-badge border border-ivory-300 text-charcoal-700 bg-transparent font-accent text-body-sm font-medium hover:border-gold-400 hover:text-gold-600 disabled:opacity-60 transition-all cursor-pointer"
            >
              Editar
            </button>
          )}
          {editavel && (
            <button
              onClick={() => alterar('cancelado')}
              disabled={pending}
              className="h-10 px-4 rounded-badge border border-red-200 text-red-600 bg-transparent font-accent text-body-sm font-medium hover:bg-red-50 disabled:opacity-60 transition-all cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ── Editar agendamento ────────────────────────────────────────────────────────
function EditarAgendamento({
  ag,
  profissionais,
  servicos,
  onFechar,
  onSucesso,
}: {
  ag: Agendamento
  profissionais: Profissional[]
  servicos: Servico[]
  onFechar: () => void
  onSucesso: () => void
}) {
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string>()

  // Duração atual (caso nenhum serviço seja escolhido, preserva o intervalo).
  const duracaoAtual = Math.round(
    (new Date(ag.fim).getTime() - new Date(ag.inicio).getTime()) / 60_000,
  )

  function onSubmit(formData: FormData) {
    setErro(undefined)
    const data = String(formData.get('data') ?? '')
    const hora = String(formData.get('hora') ?? '')
    const servicoId = String(formData.get('servico_id') ?? '')
    const servico = servicos.find((s) => s.id === servicoId)
    const inicioISO = slotParaData(data, hora).toISOString()

    start(async () => {
      const res = await editarAgendamento({
        id: ag.id,
        profissional_id: String(formData.get('profissional_id') ?? ''),
        servico_id: servicoId,
        cliente_nome: String(formData.get('cliente_nome') ?? ''),
        cliente_telefone: String(formData.get('cliente_telefone') ?? ''),
        inicio: inicioISO,
        duracao_min: servico?.duracao_min ?? duracaoAtual,
        observacoes: String(formData.get('observacoes') ?? ''),
      })
      if (res.erro) setErro(res.erro)
      else onSucesso()
    })
  }

  return (
    <Modal titulo="Editar agendamento" onFechar={onFechar}>
      <form action={onSubmit} className="flex flex-col gap-3">
        <input
          name="cliente_nome"
          defaultValue={ag.cliente_nome}
          placeholder="Nome do cliente"
          required
          className={inputCls}
        />
        <input
          name="cliente_telefone"
          defaultValue={ag.cliente_telefone}
          placeholder="Telefone / WhatsApp"
          required
          className={inputCls}
        />

        <div className="flex gap-3">
          <label className="flex-1 flex flex-col gap-1">
            <span className="font-accent text-body-sm text-charcoal-700/70">Data</span>
            <input name="data" type="date" defaultValue={dataLocal(ag.inicio)} required className={inputCls} />
          </label>
          <label className="w-32 flex flex-col gap-1">
            <span className="font-accent text-body-sm text-charcoal-700/70">Hora</span>
            <input name="hora" type="time" step={1800} defaultValue={horaLocal(ag.inicio)} required className={inputCls} />
          </label>
        </div>

        <select name="profissional_id" defaultValue={ag.profissional_id} className={inputCls}>
          {profissionais.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <select name="servico_id" defaultValue={ag.servico_id ?? ''} className={inputCls}>
          <option value="">Serviço (opcional)</option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome} ({s.duracao_min} min)
            </option>
          ))}
        </select>

        <textarea
          name="observacoes"
          defaultValue={ag.observacoes ?? ''}
          placeholder="Observações (opcional)"
          rows={2}
          className={inputCls + ' h-auto py-2 resize-none'}
        />

        {erro && (
          <p role="alert" className="font-body text-body-sm text-red-600">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-11 mt-1 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-md font-medium tracking-wide shadow-card-rest hover:shadow-card-hover hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {pending ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>
    </Modal>
  )
}

// ── Novo bloqueio (almoço, feriado, folga) ────────────────────────────────────
function NovoBloqueio({
  dia,
  profissionais,
  permiteTodos,
  onFechar,
  onSucesso,
}: {
  dia: string
  profissionais: Profissional[]
  permiteTodos: boolean
  onFechar: () => void
  onSucesso: () => void
}) {
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string>()

  function onSubmit(formData: FormData) {
    setErro(undefined)
    const data = String(formData.get('data') ?? '')
    const ini = String(formData.get('inicio') ?? '')
    const fim = String(formData.get('fim') ?? '')

    start(async () => {
      const res = await criarBloqueio({
        profissional_id: String(formData.get('profissional_id') ?? ''),
        inicio: slotParaData(data, ini).toISOString(),
        fim: slotParaData(data, fim).toISOString(),
        motivo: String(formData.get('motivo') ?? ''),
      })
      if (res.erro) setErro(res.erro)
      else onSucesso()
    })
  }

  return (
    <Modal titulo="Bloquear horário" onFechar={onFechar}>
      <p className="font-body text-body-sm text-charcoal-700/70 mb-4">
        Bloqueie um intervalo (almoço, feriado, folga). Ninguém poderá agendar
        nesse período — nem pelo site.
      </p>

      <form action={onSubmit} className="flex flex-col gap-3">
        <select name="profissional_id" defaultValue="" className={inputCls}>
          <option value="" disabled>
            Profissional…
          </option>
          {permiteTodos && <option value="todos">Todos (feriado)</option>}
          {profissionais.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <label className="flex flex-col gap-1">
          <span className="font-accent text-body-sm text-charcoal-700/70">Dia</span>
          <input name="data" type="date" defaultValue={dia} required className={inputCls} />
        </label>

        <div className="flex gap-3">
          <label className="flex-1 flex flex-col gap-1">
            <span className="font-accent text-body-sm text-charcoal-700/70">Início</span>
            <input name="inicio" type="time" step={1800} defaultValue="12:00" required className={inputCls} />
          </label>
          <label className="flex-1 flex flex-col gap-1">
            <span className="font-accent text-body-sm text-charcoal-700/70">Fim</span>
            <input name="fim" type="time" step={1800} defaultValue="13:00" required className={inputCls} />
          </label>
        </div>

        <input
          name="motivo"
          placeholder="Motivo (almoço, feriado, folga…)"
          className={inputCls}
        />

        {erro && (
          <p role="alert" className="font-body text-body-sm text-red-600">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-11 mt-1 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-md font-medium tracking-wide shadow-card-rest hover:shadow-card-hover hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {pending ? 'Bloqueando…' : 'Bloquear'}
        </button>
      </form>
    </Modal>
  )
}

// ── Detalhe do bloqueio (remover) ─────────────────────────────────────────────
function BloqueioDetalhe({
  bloq,
  profissional,
  onFechar,
  onRemovido,
}: {
  bloq: Bloqueio
  profissional?: Profissional
  onFechar: () => void
  onRemovido: () => void
}) {
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string>()

  function remover() {
    setErro(undefined)
    start(async () => {
      const res = await removerBloqueio(bloq.id)
      if (res.erro) setErro(res.erro)
      else onRemovido()
    })
  }

  return (
    <Modal titulo={bloq.motivo || 'Bloqueio'} onFechar={onFechar}>
      <div className="flex flex-col gap-3">
        <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-badge border border-ivory-300 bg-ivory-100 font-accent text-body-sm font-medium text-charcoal-700/60">
          <Ban size={13} /> Bloqueado
        </span>

        <dl className="flex flex-col gap-2 font-body text-body-sm text-charcoal-700">
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal-700/60">Quando</dt>
            <dd className="text-charcoal-900 font-medium capitalize text-right">
              {diaLongo(dataLocal(bloq.inicio))}
              <br />
              {horaLocal(bloq.inicio)}–{horaLocal(bloq.fim)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal-700/60">Profissional</dt>
            <dd className="text-charcoal-900 font-medium">{profissional?.nome ?? '—'}</dd>
          </div>
        </dl>

        {erro && (
          <p role="alert" className="font-body text-body-sm text-red-600">
            {erro}
          </p>
        )}

        <button
          onClick={remover}
          disabled={pending}
          className="h-10 mt-1 px-4 rounded-badge border border-red-200 text-red-600 bg-transparent font-accent text-body-sm font-medium hover:bg-red-50 disabled:opacity-60 transition-all cursor-pointer"
        >
          {pending ? 'Removendo…' : 'Remover bloqueio'}
        </button>
      </div>
    </Modal>
  )
}
