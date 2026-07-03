import { createClient } from '@/lib/supabase/server'
import { SystemNav } from '@/components/sistema/organisms/SystemNav'
import { PenaltyBanner } from '@/components/sistema/molecules/PenaltyBanner'
import { requirePlayer } from '../_lib/auth'
import { hojeLocal } from '../_lib/dias'

export default async function SistemaAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const player = await requirePlayer()

  // Reset preguiçoso: avalia dias que terminaram desde a última visita
  // (streak quebrado → penalidade). Idempotente, roda a cada carregamento.
  let penalidade = false
  const hoje = hojeLocal()
  if (player.ultimo_dia_processado !== hoje) {
    const supabase = await createClient()
    const { data } = await supabase.rpc('sistema_processar_dia', {
      p_hoje: hoje,
    })
    penalidade = Boolean(data?.penalidade)
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28">
      {penalidade && <PenaltyBanner />}
      {children}
      <SystemNav />
    </div>
  )
}
