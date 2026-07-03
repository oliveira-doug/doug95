'use client'

// Loja do Sistema: comprar com moedas e equipar (1 item por slot).

import { useState, useTransition } from 'react'
import { Coins, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RARIDADES, SLOTS, type Item, type Slot } from '../../_lib/itens'
import { IconeSistema } from '@/components/sistema/atoms/IconeSistema'
import { comprarItem, equiparItem } from './actions'

export function LojaBoard({
  itens,
  possuidos,
  equipados,
  moedas,
  nivelJogador,
}: {
  itens: Item[]
  possuidos: string[]
  equipados: string[]
  moedas: number
  nivelJogador: number
}) {
  const meus = new Set(possuidos)
  const equipadosSet = new Set(equipados)
  const [erro, setErro] = useState<string | null>(null)
  const [pendenteId, setPendenteId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function agir(item: Item, acao: 'comprar' | 'equipar') {
    if (pendenteId) return
    if (acao === 'comprar' && !confirm(`Comprar ${item.nome} por ${item.preco.toLocaleString('pt-BR')} moedas?`)) return
    setErro(null)
    setPendenteId(item.id)
    startTransition(async () => {
      const res =
        acao === 'comprar'
          ? await comprarItem(item.id)
          : await equiparItem(item.id)
      setPendenteId(null)
      if (res.erro) setErro(res.erro)
    })
  }

  const slots = Object.keys(SLOTS) as Slot[]

  return (
    <div>
      <p className="font-system-display text-sm uppercase tracking-[0.25em] text-amber-200 mb-4 flex items-center gap-2">
        <Coins size={16} /> {moedas.toLocaleString('pt-BR')} moedas
      </p>
      {erro && (
        <p role="alert" className="font-system-body text-sm text-red-400 mb-3">
          {erro}
        </p>
      )}

      {slots.map((slot) => {
        const doSlot = itens.filter((i) => i.slot === slot)
        if (doSlot.length === 0) return null
        return (
          <section key={slot} className="mb-6">
            <h2 className="font-system-display text-[0.65rem] font-bold uppercase tracking-[0.3em] text-system-500 mb-3">
              {SLOTS[slot]}s
            </h2>
            <div className="space-y-3">
              {doSlot.map((item) => {
                const possui = meus.has(item.id)
                const equipado = equipadosSet.has(item.id)
                const bloqueado = nivelJogador < item.nivelMinimo
                const raridade = RARIDADES[item.raridade]
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'holo-panel p-4 flex items-start gap-3',
                      raridade.borda,
                      bloqueado && !possui && 'opacity-50',
                    )}
                  >
                    <IconeSistema
                      slug={item.icone}
                      size={26}
                      className={cn('shrink-0 mt-0.5', raridade.cor)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-system-body text-base font-semibold tracking-wide text-system-100">
                        {item.nome}
                        {equipado && (
                          <span className="ml-2 font-system-display text-[0.55rem] uppercase tracking-[0.2em] text-system-300">
                            ▸ Equipado
                          </span>
                        )}
                      </p>
                      <p
                        className={cn(
                          'font-system-display text-[0.6rem] uppercase tracking-[0.2em] mt-0.5',
                          raridade.cor,
                        )}
                      >
                        {raridade.nome}
                        {item.nivelMinimo > 1 && ` · Nv. ${item.nivelMinimo}`}
                      </p>
                      <p className="font-system-body text-sm text-system-400 mt-1 leading-relaxed">
                        {item.descricao}
                      </p>
                      <div className="mt-2.5">
                        {possui ? (
                          <button
                            type="button"
                            onClick={() => agir(item, 'equipar')}
                            disabled={pendenteId !== null}
                            className="holo-panel px-3 py-1.5 font-system-display text-[0.6rem] font-bold
                                       uppercase tracking-[0.2em] text-system-300
                                       hover:shadow-glow-system disabled:opacity-40
                                       transition-all cursor-pointer"
                          >
                            {equipado ? 'Desequipar' : 'Equipar'}
                          </button>
                        ) : bloqueado ? (
                          <span className="inline-flex items-center gap-1.5 font-system-display text-[0.6rem] uppercase tracking-[0.2em] text-system-700">
                            <Lock size={12} /> Nível {item.nivelMinimo}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => agir(item, 'comprar')}
                            disabled={pendenteId !== null || moedas < item.preco}
                            className="holo-panel px-3 py-1.5 font-system-display text-[0.6rem] font-bold
                                       uppercase tracking-[0.2em] text-amber-300
                                       hover:shadow-glow-system disabled:opacity-40
                                       transition-all cursor-pointer disabled:cursor-default"
                          >
                            <Coins size={11} className="inline -mt-0.5 mr-1" />
                            {item.preco.toLocaleString('pt-BR')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
