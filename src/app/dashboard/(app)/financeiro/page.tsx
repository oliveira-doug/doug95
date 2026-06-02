import { TrendingUp, ClipboardList, Wallet } from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { hojeISO, intervaloDoDia, diaCurto } from '@/lib/datas'
import { formatarBRL, METODO_LABEL } from '@/lib/dinheiro'
import type { PagamentoMetodo } from '@/lib/supabase/types'
import { FinanceiroFiltro } from './FinanceiroFiltro'

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>
}) {
  const profile = await requireAuth()
  const { de: deRaw, ate: ateRaw } = await searchParams

  // Padrão: do dia 1 do mês até hoje.
  const hoje = hojeISO()
  const de = deRaw && RE_DATA.test(deRaw) ? deRaw : hoje.slice(0, 8) + '01'
  const ate = ateRaw && RE_DATA.test(ateRaw) ? ateRaw : hoje

  const inicioISO = intervaloDoDia(de).inicioISO
  const fimISO = intervaloDoDia(ate).fimISO

  const supabase = await createClient()

  // RLS já limita: admin vê o salão todo; profissional vê só os seus.
  const [atendimentosRes, profissionaisRes] = await Promise.all([
    supabase
      .from('atendimentos')
      .select('*')
      .gte('data', inicioISO)
      .lt('data', fimISO)
      .order('data', { ascending: false }),
    supabase.from('profissionais').select('*').order('ordem'),
  ])

  const atendimentos = atendimentosRes.data ?? []
  const profissionais = profissionaisRes.data ?? []

  // Pagamentos das comandas do período (formas de pagamento).
  const ids = atendimentos.map((a) => a.id)
  const pagamentos =
    ids.length > 0
      ? (await supabase.from('pagamentos').select('*').in('atendimento_id', ids)).data ?? []
      : []

  // ── Agregações ──────────────────────────────────────────────────────────────
  const totalFaturado = atendimentos.reduce((s, a) => s + a.total, 0)
  const totalRecebido = pagamentos.reduce((s, p) => s + p.valor, 0)

  const porProfissional = profissionais
    .map((p) => {
      const seus = atendimentos.filter((a) => a.profissional_id === p.id)
      return {
        id: p.id,
        nome: p.nome,
        total: seus.reduce((s, a) => s + a.total, 0),
        count: seus.length,
      }
    })
    .filter((p) => p.count > 0)
    .sort((a, b) => b.total - a.total)

  const porMetodo = (['pix', 'cartao', 'dinheiro'] as PagamentoMetodo[])
    .map((m) => ({
      metodo: m,
      total: pagamentos.filter((p) => p.metodo === m).reduce((s, p) => s + p.valor, 0),
    }))
    .filter((m) => m.total > 0)

  const ehAdmin = profile.papel === 'admin'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-lg text-charcoal-900">Financeiro</h1>
        <p className="font-body text-body-md text-charcoal-700/70 mt-1">
          {diaCurto(de)} — {diaCurto(ate)}
          {!ehAdmin && ' · seus atendimentos'}
        </p>
      </div>

      <FinanceiroFiltro de={de} ate={ate} />

      {/* Cartões-resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Resumo
          icon={TrendingUp}
          label="Faturamento"
          valor={formatarBRL(totalFaturado)}
        />
        <Resumo
          icon={ClipboardList}
          label="Atendimentos"
          valor={String(atendimentos.length)}
        />
        <Resumo icon={Wallet} label="Recebido" valor={formatarBRL(totalRecebido)} />
      </div>

      {atendimentos.length === 0 ? (
        <div className="rounded-card border border-dashed border-ivory-300 bg-ivory-50/60 p-10 text-center">
          <p className="font-body text-body-md text-charcoal-700/70">
            Nenhum atendimento neste período.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Por profissional */}
          <section className="rounded-card bg-ivory-50 border border-ivory-300 overflow-hidden">
            <header className="px-5 py-3 border-b border-ivory-200">
              <h2 className="font-accent text-body-lg font-semibold text-charcoal-900">
                Por profissional
              </h2>
            </header>
            <ul className="divide-y divide-ivory-200">
              {porProfissional.map((p) => (
                <li
                  key={p.id}
                  className="px-5 py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-body text-body-md text-charcoal-900 truncate">
                      {p.nome}
                    </p>
                    <p className="font-body text-body-sm text-charcoal-700/55">
                      {p.count} {p.count === 1 ? 'atendimento' : 'atendimentos'}
                    </p>
                  </div>
                  <span className="font-accent text-body-md font-semibold text-charcoal-900 shrink-0">
                    {formatarBRL(p.total)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Por forma de pagamento */}
          <section className="rounded-card bg-ivory-50 border border-ivory-300 overflow-hidden">
            <header className="px-5 py-3 border-b border-ivory-200">
              <h2 className="font-accent text-body-lg font-semibold text-charcoal-900">
                Formas de pagamento
              </h2>
            </header>
            {porMetodo.length === 0 ? (
              <p className="px-5 py-6 font-body text-body-sm text-charcoal-700/55 text-center">
                Nenhum pagamento registrado no período. Registre na comanda para
                acompanhar pix, cartão e dinheiro.
              </p>
            ) : (
              <ul className="divide-y divide-ivory-200">
                {porMetodo.map((m) => (
                  <li
                    key={m.metodo}
                    className="px-5 py-3 flex items-center justify-between gap-4"
                  >
                    <span className="font-body text-body-md text-charcoal-900">
                      {METODO_LABEL[m.metodo]}
                    </span>
                    <span className="font-accent text-body-md font-semibold text-charcoal-900">
                      {formatarBRL(m.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function Resumo({
  icon: Icon,
  label,
  valor,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  label: string
  valor: string
}) {
  return (
    <div className="rounded-card bg-ivory-50 border border-ivory-300 p-5 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-full bg-gold-100 border border-gold-200 grid place-items-center text-gold-500">
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-accent text-[11px] uppercase tracking-wide text-charcoal-700/60">
          {label}
        </p>
        <p className="font-display text-display-md text-charcoal-900 mt-0.5">{valor}</p>
      </div>
    </div>
  )
}
