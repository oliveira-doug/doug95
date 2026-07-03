'use client'

import { useState, useTransition } from 'react'
import { renomearCacador } from './actions'

export function NomeForm({ nomeAtual }: { nomeAtual: string }) {
  const [msg, setMsg] = useState<{ erro?: string; ok?: boolean } | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setMsg(null)
    startTransition(async () => {
      const res = await renomearCacador(Object.fromEntries(formData))
      setMsg(res.erro ? { erro: res.erro } : { ok: true })
    })
  }

  return (
    <form action={submit} className="holo-panel p-4">
      <label className="block space-y-2">
        <span className="font-system-display text-xs font-bold uppercase tracking-[0.25em] text-system-300">
          Nome do caçador
        </span>
        <div className="flex gap-2">
          <input
            name="nome_cacador"
            required
            maxLength={40}
            defaultValue={nomeAtual}
            className="h-11 px-3 flex-1 min-w-0 bg-system-950/80 border border-system-800
                       font-system-body text-base text-system-100
                       focus:outline-none focus:border-system-500 transition-colors"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-11 px-4 holo-panel font-system-display text-xs font-bold uppercase
                       tracking-[0.15em] text-system-300 disabled:opacity-50 cursor-pointer"
          >
            {pending ? '…' : 'Salvar'}
          </button>
        </div>
      </label>
      {msg?.erro && (
        <p role="alert" className="font-system-body text-sm text-red-400 mt-2">
          {msg.erro}
        </p>
      )}
      {msg?.ok && (
        <p className="font-system-body text-sm text-system-300 mt-2">
          Nome atualizado.
        </p>
      )}
    </form>
  )
}
