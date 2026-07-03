'use client'

// Árvore de habilidades: desbloquear (1 ponto) e melhorar (1 ponto/nível).

import { useState, useTransition } from 'react'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Habilidade } from '../../_lib/habilidades'
import { IconeSistema } from '@/components/sistema/atoms/IconeSistema'
import { gastarPontoHabilidade } from './actions'

function NivelPips({ atual, max }: { atual: number; max: number }) {
  return (
    <span className="flex gap-1" aria-label={`Nível ${atual} de ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cn(
            'w-2.5 h-2.5 border',
            i < atual
              ? 'bg-system-400 border-system-300 shadow-glow-system'
              : 'bg-transparent border-system-800',
          )}
        />
      ))}
    </span>
  )
}

export function HabilidadesBoard({
  habilidades,
  niveis,
  nivelJogador,
  pontos,
}: {
  habilidades: Habilidade[]
  niveis: Record<string, number>
  nivelJogador: number
  pontos: number
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [pendenteId, setPendenteId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function usar(habilidade: Habilidade) {
    if (pendenteId) return
    setErro(null)
    setPendenteId(habilidade.id)
    startTransition(async () => {
      const res = await gastarPontoHabilidade(habilidade.id)
      setPendenteId(null)
      if (res.erro) setErro(res.erro)
    })
  }

  const gerais = habilidades.filter((h) => h.classe === null)
  const daClasse = habilidades.filter((h) => h.classe !== null)

  function renderGrupo(titulo: string, grupo: Habilidade[]) {
    if (grupo.length === 0) return null
    return (
      <section className="mb-6">
        <h2 className="font-system-display text-[0.65rem] font-bold uppercase tracking-[0.3em] text-system-500 mb-3">
          {titulo}
        </h2>
        <div className="space-y-3">
          {grupo.map((habilidade) => {
            const nivel = niveis[habilidade.id] ?? 0
            const bloqueada = nivelJogador < habilidade.nivelJogadorMinimo
            const noMaximo = nivel >= habilidade.nivelMax
            const podeUsar = !bloqueada && !noMaximo && pontos > 0
            return (
              <div
                key={habilidade.id}
                className={cn('holo-panel p-4', bloqueada && 'opacity-50')}
              >
                <div className="flex items-start gap-3">
                  <IconeSistema
                    slug={habilidade.icone}
                    size={24}
                    className={cn(
                      'shrink-0 mt-0.5',
                      nivel > 0 ? 'text-system-300' : 'text-system-700',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-system-body text-base font-semibold tracking-wide text-system-100 flex items-center gap-2">
                      {habilidade.nome}
                      {bloqueada && <Lock size={13} className="text-system-700" />}
                    </p>
                    <p className="font-system-body text-sm text-system-400 mt-0.5 leading-relaxed">
                      {habilidade.descricao}
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                      <NivelPips atual={nivel} max={habilidade.nivelMax} />
                      {bloqueada ? (
                        <span className="font-system-display text-[0.6rem] uppercase tracking-[0.2em] text-system-700">
                          Nv. {habilidade.nivelJogadorMinimo}
                        </span>
                      ) : noMaximo ? (
                        <span className="font-system-display text-[0.6rem] uppercase tracking-[0.2em] text-amber-300">
                          Máximo
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => usar(habilidade)}
                          disabled={!podeUsar || pendenteId !== null}
                          className="holo-panel px-3 py-1.5 font-system-display text-[0.6rem] font-bold
                                     uppercase tracking-[0.2em] text-system-300
                                     hover:shadow-glow-system disabled:opacity-40
                                     transition-all cursor-pointer disabled:cursor-default"
                        >
                          {nivel === 0 ? 'Desbloquear' : 'Melhorar'} · 1 pt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <div>
      <p
        className={cn(
          'font-system-display text-xs uppercase tracking-[0.25em] mb-4',
          pontos > 0 ? 'text-amber-300 animate-pulse-soft' : 'text-system-500',
        )}
      >
        ◆ {pontos} ponto(s) de habilidade
      </p>
      {erro && (
        <p role="alert" className="font-system-body text-sm text-red-400 mb-3">
          {erro}
        </p>
      )}
      {renderGrupo('Habilidades gerais', gerais)}
      {renderGrupo('Habilidades de classe', daClasse)}
    </div>
  )
}
