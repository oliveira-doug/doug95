'use client'

import { useRouter } from 'next/navigation'
import { hojeISO, addDias } from '@/lib/datas'

// Seletor de período do financeiro. Atualiza a URL (?de=&ate=) para o servidor
// recalcular. Inclui atalhos comuns (hoje, 7/30 dias, este mês).
export function FinanceiroFiltro({ de, ate }: { de: string; ate: string }) {
  const router = useRouter()

  function aplicar(novoDe: string, novoAte: string) {
    router.push(`/dashboard/financeiro?de=${novoDe}&ate=${novoAte}`)
  }

  function primeiroDiaDoMes(): string {
    return hojeISO().slice(0, 8) + '01'
  }

  const presets: { label: string; de: string; ate: string }[] = [
    { label: 'Hoje', de: hojeISO(), ate: hojeISO() },
    { label: '7 dias', de: addDias(hojeISO(), -6), ate: hojeISO() },
    { label: '30 dias', de: addDias(hojeISO(), -29), ate: hojeISO() },
    { label: 'Este mês', de: primeiroDiaDoMes(), ate: hojeISO() },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const ativo = p.de === de && p.ate === ate
          return (
            <button
              key={p.label}
              onClick={() => aplicar(p.de, p.ate)}
              className={`h-9 px-3.5 rounded-badge font-accent text-body-sm font-medium transition-all cursor-pointer border ${
                ativo
                  ? 'bg-gold-100 border-gold-300 text-gold-700'
                  : 'border-ivory-300 text-charcoal-700/70 hover:border-gold-400 hover:text-gold-600'
              }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-accent text-[11px] uppercase tracking-wide text-charcoal-700/60">
            De
          </span>
          <input
            type="date"
            defaultValue={de}
            max={ate}
            onChange={(e) => e.target.value && aplicar(e.target.value, ate)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-accent text-[11px] uppercase tracking-wide text-charcoal-700/60">
            Até
          </span>
          <input
            type="date"
            defaultValue={ate}
            min={de}
            max={hojeISO()}
            onChange={(e) => e.target.value && aplicar(de, e.target.value)}
            className={inputCls}
          />
        </label>
      </div>
    </div>
  )
}

const inputCls =
  'h-10 px-3 rounded-badge bg-ivory-50 border border-ivory-300 font-body text-body-sm text-charcoal-900 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/30 transition-colors'
