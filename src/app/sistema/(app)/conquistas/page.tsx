import type { Metadata } from 'next'
import { Coins, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { IconeSistema } from '@/components/sistema/atoms/IconeSistema'
import { requirePlayer } from '../../_lib/auth'
import { CONQUISTAS } from '../../_lib/conquistas'

export const metadata: Metadata = { title: 'Conquistas' }

export default async function ConquistasPage() {
  await requirePlayer()
  const supabase = await createClient()
  const { data } = await supabase
    .from('sistema_conquistas_desbloqueadas')
    .select('conquista_id')
  const desbloqueadas = new Set((data ?? []).map((c) => c.conquista_id))

  return (
    <main>
      <SystemHeading
        kicker="⚠ Conquistas"
        title="Conquistas"
        subtitle={`${desbloqueadas.size} de ${CONQUISTAS.length} desbloqueadas. Cada conquista paga moedas para a Loja.`}
      />
      <div className="space-y-3">
        {CONQUISTAS.map((conquista) => {
          const tem = desbloqueadas.has(conquista.id)
          return (
            <div
              key={conquista.id}
              className={cn(
                'holo-panel p-4 flex items-start gap-3',
                tem ? 'border-amber-400/40' : 'opacity-50',
              )}
            >
              <IconeSistema
                slug={conquista.icone}
                size={24}
                className={cn(
                  'shrink-0 mt-0.5',
                  tem ? 'text-amber-300' : 'text-system-700',
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="font-system-body text-base font-semibold tracking-wide text-system-100 flex items-center gap-2">
                  {conquista.nome}
                  {!tem && <Lock size={13} className="text-system-700" />}
                </p>
                <p className="font-system-body text-sm text-system-400 mt-0.5">
                  {conquista.descricao}
                </p>
              </div>
              <span
                className={cn(
                  'font-system-display text-[0.6rem] uppercase tracking-[0.15em] flex items-center gap-1 shrink-0 mt-1',
                  tem ? 'text-amber-200' : 'text-system-600',
                )}
              >
                <Coins size={11} /> {conquista.moedas.toLocaleString('pt-BR')}
              </span>
            </div>
          )
        })}
      </div>
    </main>
  )
}
