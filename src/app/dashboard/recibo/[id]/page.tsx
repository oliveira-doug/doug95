import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { diaLongo, dataLocal, horaLocal } from '@/lib/datas'
import { formatarBRL, METODO_LABEL } from '@/lib/dinheiro'
import { SITE, ADDRESS, BUSINESS } from '@/config/site'
import { PrintButton } from './PrintButton'

export default async function ReciboPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const supabase = await createClient()
  const [atendimentoRes, itensRes, pagamentosRes, profissionaisRes] = await Promise.all([
    supabase.from('atendimentos').select('*').eq('id', id).maybeSingle(),
    supabase.from('atendimento_itens').select('*').eq('atendimento_id', id).order('created_at'),
    supabase.from('pagamentos').select('*').eq('atendimento_id', id).order('created_at'),
    supabase.from('profissionais').select('*'),
  ])

  const atendimento = atendimentoRes.data
  if (!atendimento) notFound()

  const itens = itensRes.data ?? []
  const pagamentos = pagamentosRes.data ?? []
  const prof = (profissionaisRes.data ?? []).find((p) => p.id === atendimento.profissional_id)
  const pago = pagamentos.reduce((s, p) => s + p.valor, 0)
  const saldo = atendimento.total - pago

  return (
    <div className="min-h-screen bg-ivory-100 print:bg-white py-8 px-4">
      {/* Barra de ação (some na impressão) */}
      <div className="print:hidden max-w-[640px] mx-auto mb-6 flex items-center justify-between gap-4">
        <Link
          href={`/dashboard/comanda/${atendimento.id}`}
          className="inline-flex items-center gap-1 font-accent text-body-sm font-medium text-charcoal-700/60 hover:text-gold-600 transition-colors"
        >
          <ChevronLeft size={16} /> Voltar à comanda
        </Link>
        <PrintButton />
      </div>

      {/* Folha do recibo */}
      <article className="max-w-[640px] mx-auto bg-white border border-ivory-300 print:border-0 rounded-card print:rounded-none shadow-card-rest print:shadow-none p-8 sm:p-10 text-charcoal-900">
        {/* Cabeçalho */}
        <header className="text-center border-b border-ivory-300 pb-5 mb-5">
          <h1 className="font-display text-display-md">{SITE.name}</h1>
          <p className="font-body text-body-sm text-charcoal-700/70 mt-1">
            {ADDRESS.street} — {ADDRESS.neighborhood}, {ADDRESS.city}
          </p>
          <p className="font-body text-body-sm text-charcoal-700/70">
            {BUSINESS.phone}
          </p>
        </header>

        <h2 className="font-accent text-body-lg font-semibold tracking-wide uppercase text-center mb-5">
          Recibo de Atendimento
        </h2>

        {/* Dados do atendimento */}
        <dl className="grid grid-cols-2 gap-y-1.5 gap-x-4 font-body text-body-sm mb-6">
          <dt className="text-charcoal-700/60">Cliente</dt>
          <dd className="text-right font-medium">{atendimento.cliente_nome ?? '—'}</dd>
          <dt className="text-charcoal-700/60">Profissional</dt>
          <dd className="text-right font-medium">{prof?.nome ?? '—'}</dd>
          <dt className="text-charcoal-700/60">Data</dt>
          <dd className="text-right font-medium capitalize">
            {diaLongo(dataLocal(atendimento.data))} · {horaLocal(atendimento.data)}
          </dd>
        </dl>

        {/* Itens */}
        <table className="w-full font-body text-body-sm mb-2">
          <thead>
            <tr className="border-b border-ivory-300 text-charcoal-700/60 text-left">
              <th className="py-2 font-medium">Procedimento</th>
              <th className="py-2 font-medium text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-3 text-center text-charcoal-700/50">
                  Sem procedimentos lançados.
                </td>
              </tr>
            ) : (
              itens.map((it) => (
                <tr key={it.id} className="border-b border-ivory-200">
                  <td className="py-2">{it.descricao}</td>
                  <td className="py-2 text-right">{formatarBRL(it.valor)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex items-center justify-between border-t-2 border-charcoal-900/80 pt-3 mt-1 mb-6">
          <span className="font-accent text-body-lg font-semibold">Total</span>
          <span className="font-accent text-body-lg font-semibold">
            {formatarBRL(atendimento.total)}
          </span>
        </div>

        {/* Pagamentos */}
        {pagamentos.length > 0 && (
          <div className="font-body text-body-sm mb-6">
            <p className="text-charcoal-700/60 mb-1.5">Pagamento</p>
            <ul className="flex flex-col gap-1">
              {pagamentos.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span>{METODO_LABEL[p.metodo]}</span>
                  <span className="font-medium">{formatarBRL(p.valor)}</span>
                </li>
              ))}
              {saldo > 0 && (
                <li className="flex justify-between text-charcoal-700/70 pt-1 border-t border-ivory-200">
                  <span>Saldo em aberto</span>
                  <span className="font-medium">{formatarBRL(saldo)}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Rodapé */}
        <footer className="text-center border-t border-ivory-300 pt-5 mt-6">
          <p className="font-body text-body-sm text-charcoal-700/70">
            Obrigada pela preferência! 💛
          </p>
          <p className="font-body text-[11px] text-charcoal-700/45 mt-1">
            Emitido em{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
              timeZone: 'America/Sao_Paulo',
            }).format(new Date())}
          </p>
        </footer>
      </article>
    </div>
  )
}
