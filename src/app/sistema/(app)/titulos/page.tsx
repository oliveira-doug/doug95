import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { requirePlayer } from '../../_lib/auth'
import { TITULOS, titulosDesbloqueados } from '../../_lib/titulos'
import { TitulosBoard } from './TitulosBoard'

export const metadata: Metadata = { title: 'Títulos' }

export default async function TitulosPage() {
  const player = await requirePlayer()
  const supabase = await createClient()

  const [conquistas, conclusoes] = await Promise.all([
    supabase.from('sistema_conquistas_desbloqueadas').select('conquista_id'),
    supabase
      .from('sistema_quest_conclusoes')
      .select('*', { count: 'exact', head: true }),
  ])

  const desbloqueados = titulosDesbloqueados({
    player,
    conquistas: (conquistas.data ?? []).map((c) => c.conquista_id),
    totalQuestsConcluidas: conclusoes.count ?? 0,
  })

  return (
    <main>
      <SystemHeading
        kicker="⚠ Títulos"
        title="Títulos"
        subtitle="Conquiste feitos lendários e escolha o título exibido na sua janela de status."
      />
      <TitulosBoard
        titulos={TITULOS}
        desbloqueados={desbloqueados.map((t) => t.id)}
        equipado={player.titulo}
      />
    </main>
  )
}
