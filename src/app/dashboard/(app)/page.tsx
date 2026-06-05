import Link from 'next/link'
import {
  TrendingUp,
  ClipboardList,
  CalendarDays,
  Hourglass,
  Users,
  ArrowRight,
} from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  hojeISO,
  addDias,
  intervaloDoDia,
  dataLocal,
  horaLocal,
  diaCurto,
  agoraMs,
} from '@/lib/datas'
import { formatarBRL } from '@/lib/dinheiro'
import type { Agendamento, AgendamentoStatus } from '@/lib/supabase/types'

const STATUS_COR: Record<AgendamentoStatus, string> = {
  pendente: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmado: 'bg-gold-100 text-gold-700 border-gold-300',
  em_atendimento: 'bg-blue-50 text-blue-700 border-blue-200',
  concluido: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelado: 'bg-ivory-100 text-charcoal-700/50 border-ivory-300',
}
const STATUS_LABEL: Record<AgendamentoStatus, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  em_atendimento: 'Em atendimento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export default async function DashboardHome() {
  const profile = await requireAuth()
  const ehAdmin = profile.papel === 'admin'
  const primeiroNome = profile.nome.split(' ')[0]

  // ── Janelas de tempo ────────────────────────────────────────────────────────
  const hoje = hojeISO()
  const primeiroDiaMes = hoje.slice(0, 8) + '01'
  const inicioMesISO = intervaloDoDia(primeiroDiaMes).inicioISO
  const inicioHojeISO = intervaloDoDia(hoje).inicioISO
  const fimHojeISO = intervaloDoDia(hoje).fimISO
  const inicio14ISO = intervaloDoDia(addDias(hoje, -13)).inicioISO
  const desdeISO =
    new Date(inicioMesISO) < new Date(inicio14ISO) ? inicioMesISO : inicio14ISO

  const supabase = await createClient()
  // RLS faz o recorte: admin vê o salão; profissional vê só o seu.
  const [atendRes, agendRes, profsRes] = await Promise.all([
    supabase
      .from('atendimentos')
      .select('*')
      .gte('data', desdeISO)
      .lt('data', fimHojeISO)
      .order('data'),
    supabase
      .from('agendamentos')
      .select('*')
      .gte('inicio', inicioHojeISO)
      .neq('status', 'cancelado')
      .order('inicio')
      .limit(80),
    supabase.from('profissionais').select('*').eq('ativo', true).order('ordem'),
  ])

  const atendimentos = atendRes.data ?? []
  const agendamentos = agendRes.data ?? []
  const profissionais = profsRes.data ?? []

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const tMes = new Date(inicioMesISO).getTime()
  const tFimHoje = new Date(fimHojeISO).getTime()
  const agora = agoraMs()

  const atendimentosMes = atendimentos.filter((a) => new Date(a.data).getTime() >= tMes)
  const faturamentoMes = atendimentosMes.reduce((s, a) => s + a.total, 0)
  const agHoje = agendamentos.filter((a) => new Date(a.inicio).getTime() < tFimHoje)
  const pendentes = agendamentos.filter((a) => a.status === 'pendente').length

  // ── Gráfico: faturamento por dia (14 dias) ──────────────────────────────────
  const dias14 = Array.from({ length: 14 }, (_, i) => addDias(hoje, -13 + i))
  const faturamentoPorDia = dias14.map((dia) => ({
    dia,
    valor: atendimentos
      .filter((a) => dataLocal(a.data) === dia)
      .reduce((s, a) => s + a.total, 0),
  }))
  const maxDia = Math.max(...faturamentoPorDia.map((d) => d.valor), 1)
  const temFaturamento = faturamentoPorDia.some((d) => d.valor > 0)

  // ── Próximos agendamentos ───────────────────────────────────────────────────
  const proximos = agendamentos
    .filter((a) => new Date(a.inicio).getTime() >= agora)
    .slice(0, 6)

  // ── Ranking por profissional (mês) ──────────────────────────────────────────
  const ranking = profissionais
    .map((p) => ({
      nome: p.nome,
      total: atendimentosMes
        .filter((a) => a.profissional_id === p.id)
        .reduce((s, a) => s + a.total, 0),
    }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
  const maxRank = Math.max(...ranking.map((r) => r.total), 1)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-lg text-charcoal-900">
          Olá, {primeiroNome} 👋
        </h1>
        <p className="font-body text-body-md text-charcoal-700/70 mt-1">
          {ehAdmin
            ? 'Visão geral do salão — agenda, atendimentos e financeiro.'
            : 'Sua agenda e seus atendimentos.'}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={TrendingUp}
          label="Faturamento (mês)"
          valor={formatarBRL(faturamentoMes)}
        />
        <Kpi
          icon={ClipboardList}
          label="Atendimentos (mês)"
          valor={String(atendimentosMes.length)}
        />
        <Kpi icon={CalendarDays} label="Agendamentos hoje" valor={String(agHoje.length)} />
        <Kpi
          icon={Hourglass}
          label="Pendentes"
          valor={String(pendentes)}
          destaque={pendentes > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico de faturamento */}
        <section className="lg:col-span-2 rounded-card bg-ivory-50 border border-ivory-300 p-5">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-accent text-body-lg font-semibold text-charcoal-900">
              Faturamento
            </h2>
            <span className="font-accent text-label uppercase tracking-widest text-charcoal-700/50">
              Últimos 14 dias
            </span>
          </div>

          {temFaturamento ? (
            <>
              <div
                role="img"
                aria-label={`Faturamento por dia nos últimos 14 dias. Total: ${formatarBRL(
                  faturamentoPorDia.reduce((s, d) => s + d.valor, 0),
                )}`}
                className="flex items-end gap-1.5 h-44 border-b border-ivory-300 pb-px"
              >
                {faturamentoPorDia.map((d) => {
                  const h = d.valor > 0 ? Math.max((d.valor / maxDia) * 100, 5) : 0
                  return (
                    <div
                      key={d.dia}
                      className="flex-1 rounded-t-[3px] bg-gradient-gold hover:brightness-110 transition-all"
                      style={{ height: `${h}%` }}
                      title={`${diaCurto(d.dia)} — ${formatarBRL(d.valor)}`}
                    />
                  )
                })}
              </div>
              <div className="flex gap-1.5 mt-2">
                {faturamentoPorDia.map((d) => (
                  <span
                    key={d.dia}
                    className="flex-1 text-center font-body text-[10px] text-charcoal-700/45 tabular-nums"
                  >
                    {d.dia.slice(8)}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex items-center justify-center text-center">
              <p className="font-body text-body-sm text-charcoal-700/50">
                Sem faturamento nos últimos 14 dias.
                <br />
                Lance procedimentos na comanda para ver o gráfico crescer. 💛
              </p>
            </div>
          )}
        </section>

        {/* Próximos agendamentos */}
        <section className="rounded-card bg-ivory-50 border border-ivory-300 overflow-hidden">
          <div className="px-5 py-4 border-b border-ivory-200 flex items-center justify-between">
            <h2 className="font-accent text-body-lg font-semibold text-charcoal-900">
              Próximos
            </h2>
            <Link
              href="/dashboard/agenda"
              className="font-accent text-body-sm font-medium text-gold-600 hover:text-gold-700 inline-flex items-center gap-1"
            >
              Agenda <ArrowRight size={14} />
            </Link>
          </div>
          {proximos.length === 0 ? (
            <p className="px-5 py-8 text-center font-body text-body-sm text-charcoal-700/50">
              Nenhum agendamento próximo.
            </p>
          ) : (
            <ul className="divide-y divide-ivory-200">
              {proximos.map((a) => (
                <ProximoItem key={a.id} ag={a} />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Ranking por profissional (admin) */}
      {ehAdmin && (
        <section className="rounded-card bg-ivory-50 border border-ivory-300 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} strokeWidth={1.5} className="text-gold-500" />
            <h2 className="font-accent text-body-lg font-semibold text-charcoal-900">
              Faturamento por profissional
            </h2>
            <span className="font-accent text-label uppercase tracking-widest text-charcoal-700/50 ml-auto">
              Este mês
            </span>
          </div>
          {ranking.length === 0 ? (
            <p className="font-body text-body-sm text-charcoal-700/50 text-center py-4">
              Sem atendimentos lançados neste mês ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {ranking.map((r) => (
                <li key={r.nome} className="flex items-center gap-4">
                  <span className="w-32 shrink-0 font-body text-body-sm text-charcoal-900 truncate">
                    {r.nome}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-ivory-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-gold"
                      style={{ width: `${Math.max((r.total / maxRank) * 100, 3)}%` }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right font-accent text-body-sm font-semibold text-charcoal-900 tabular-nums">
                    {formatarBRL(r.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function Kpi({
  icon: Icon,
  label,
  valor,
  destaque,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  label: string
  valor: string
  destaque?: boolean
}) {
  return (
    <div
      className={`rounded-card bg-ivory-50 border p-4 sm:p-5 flex flex-col gap-3 ${
        destaque ? 'border-amber-200' : 'border-ivory-300'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full grid place-items-center border ${
          destaque
            ? 'bg-amber-50 border-amber-200 text-amber-500'
            : 'bg-gold-100 border-gold-200 text-gold-500'
        }`}
      >
        <Icon size={17} strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-accent text-[11px] uppercase tracking-wide text-charcoal-700/55">
          {label}
        </p>
        <p className="font-display text-display-md text-charcoal-900 mt-0.5 tabular-nums">
          {valor}
        </p>
      </div>
    </div>
  )
}

// ── Item de próximo agendamento ───────────────────────────────────────────────
function ProximoItem({ ag }: { ag: Agendamento }) {
  const dia = dataLocal(ag.inicio)
  const ehHoje = dia === hojeISO()
  return (
    <li className="px-5 py-3 flex items-center gap-3">
      <div className="text-center shrink-0 w-12">
        <p className="font-display text-body-lg text-charcoal-900 leading-none tabular-nums">
          {horaLocal(ag.inicio)}
        </p>
        <p className="font-body text-[10px] text-charcoal-700/50 mt-0.5">
          {ehHoje ? 'hoje' : diaCurto(dia).slice(0, 3)}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-body text-body-sm font-medium text-charcoal-900 truncate">
          {ag.cliente_nome}
        </p>
      </div>
      <span
        className={`shrink-0 px-2 py-0.5 rounded-badge border font-accent text-[10px] font-medium ${
          STATUS_COR[ag.status]
        }`}
      >
        {STATUS_LABEL[ag.status]}
      </span>
    </li>
  )
}
