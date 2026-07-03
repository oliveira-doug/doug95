import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { requirePlayer } from '../../_lib/auth'
import { formataDia, hojeLocal } from '../../_lib/dias'
import { QuestBoard } from './QuestBoard'

export const metadata: Metadata = { title: 'Quests' }

export default async function QuestsPage() {
  await requirePlayer()
  const supabase = await createClient()
  const hoje = hojeLocal()

  const [quests, conclusoes, atributos] = await Promise.all([
    supabase
      .from('sistema_quests')
      .select('*')
      .eq('ativo', true)
      .order('ordem')
      .order('created_at'),
    supabase
      .from('sistema_quest_conclusoes')
      .select('quest_id')
      .eq('dia', hoje),
    supabase.from('sistema_atributos').select('*').order('ordem'),
  ])

  return (
    <main>
      <SystemHeading
        kicker="⚠ Quest diária"
        title="Quests"
        subtitle={`Complete todas até o fim do dia — ${formataDia(hoje)}. A recompensa pela falha é a penalidade.`}
      />
      <QuestBoard
        quests={quests.data ?? []}
        feitasHoje={(conclusoes.data ?? [])
          .map((c) => c.quest_id)
          .filter((id): id is string => id !== null)}
        atributos={atributos.data ?? []}
      />
    </main>
  )
}
