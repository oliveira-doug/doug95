'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import type { Classe } from '../../_lib/classes'
import { IconeSistema } from '@/components/sistema/atoms/IconeSistema'
import { escolherClasse } from './actions'

export function ClassePicker({ classes }: { classes: Classe[] }) {
  const [selecionada, setSelecionada] = useState<Classe | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function confirmar() {
    if (!selecionada || pending) return
    setErro(null)
    startTransition(async () => {
      const res = await escolherClasse(selecionada.id)
      if (res.erro) setErro(res.erro)
    })
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {classes.map((classe) => (
          <button
            key={classe.id}
            type="button"
            onClick={() => setSelecionada(classe)}
            className={cn(
              'holo-panel p-4 text-left transition-all cursor-pointer',
              selecionada?.id === classe.id
                ? 'shadow-glow-system border-system-400'
                : 'hover:shadow-glow-system',
            )}
          >
            <IconeSistema
              slug={classe.icone}
              size={28}
              className={classe.cor}
            />
            <p className="font-system-display text-sm font-bold uppercase tracking-[0.15em] text-system-100 mt-2">
              {classe.nome}
            </p>
            <p className="font-system-body text-xs text-system-400 mt-1 leading-relaxed">
              {classe.descricao}
            </p>
          </button>
        ))}
      </div>

      {erro && (
        <p role="alert" className="font-system-body text-sm text-red-400 mt-4">
          {erro}
        </p>
      )}

      {selecionada && (
        <div className="holo-panel border-amber-400/50 p-4 mt-4 animate-system-pop">
          <p className="font-system-body text-sm text-system-200">
            Despertar como{' '}
            <strong className="text-amber-300">{selecionada.nome}</strong>?
            A escolha é <strong>definitiva</strong> — habilidades exclusivas e
            títulos dessa classe serão liberados.
          </p>
          <button
            type="button"
            onClick={confirmar}
            disabled={pending}
            className="w-full h-12 mt-3 holo-panel font-system-display text-xs font-bold
                       uppercase tracking-[0.25em] text-amber-300 hover:shadow-glow-system
                       disabled:opacity-50 transition-all cursor-pointer"
          >
            {pending ? 'Despertando…' : 'Confirmar Despertar'}
          </button>
        </div>
      )}
    </div>
  )
}
