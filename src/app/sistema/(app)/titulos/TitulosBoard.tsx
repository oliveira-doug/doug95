'use client'

import { useState, useTransition } from 'react'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Titulo } from '../../_lib/titulos'
import { equiparTitulo } from './actions'

export function TitulosBoard({
  titulos,
  desbloqueados,
  equipado,
}: {
  titulos: Titulo[]
  desbloqueados: string[]
  equipado: string | null
}) {
  const liberados = new Set(desbloqueados)
  const [erro, setErro] = useState<string | null>(null)
  const [pendenteId, setPendenteId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function alternar(titulo: Titulo) {
    if (pendenteId || !liberados.has(titulo.id)) return
    setErro(null)
    setPendenteId(titulo.id)
    startTransition(async () => {
      const res = await equiparTitulo(
        equipado === titulo.id ? null : titulo.id,
      )
      setPendenteId(null)
      if (res.erro) setErro(res.erro)
    })
  }

  return (
    <div className="space-y-3">
      {erro && (
        <p role="alert" className="font-system-body text-sm text-red-400">
          {erro}
        </p>
      )}
      {titulos.map((titulo) => {
        const liberado = liberados.has(titulo.id)
        const ativo = equipado === titulo.id
        return (
          <button
            key={titulo.id}
            type="button"
            onClick={() => alternar(titulo)}
            disabled={!liberado || pendenteId !== null}
            className={cn(
              'holo-panel p-4 w-full text-left transition-all',
              liberado
                ? 'cursor-pointer hover:shadow-glow-system'
                : 'opacity-50 cursor-default',
              ativo && 'border-amber-400/60 shadow-glow-system',
            )}
          >
            <p
              className={cn(
                'font-system-display text-sm font-bold uppercase tracking-[0.15em] flex items-center gap-2',
                ativo ? 'text-amber-300' : liberado ? 'text-system-100' : 'text-system-500',
              )}
            >
              {!liberado && <Lock size={13} />}
              {titulo.nome}
              {ativo && (
                <span className="text-[0.55rem] tracking-[0.25em] text-amber-200">
                  ▸ Em uso
                </span>
              )}
            </p>
            <p className="font-system-body text-sm text-system-400 mt-1">
              {liberado ? titulo.descricao : titulo.requisito}
            </p>
          </button>
        )
      })}
    </div>
  )
}
