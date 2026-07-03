import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { requirePlayer } from '../../_lib/auth'
import { AtributosBoard } from './AtributosBoard'

export const metadata: Metadata = { title: 'Atributos' }

export default async function AtributosPage() {
  const player = await requirePlayer()
  const supabase = await createClient()
  const { data: atributos } = await supabase
    .from('sistema_atributos')
    .select('*')
    .order('ordem')

  return (
    <main>
      <SystemHeading
        kicker="⚠ Janela de Status"
        title="Atributos"
        subtitle="Cada level up concede 3 pontos. Distribua com sabedoria — ou crie os seus próprios atributos."
      />
      <AtributosBoard
        atributos={atributos ?? []}
        pontosDisponiveis={player.pontos_disponiveis}
      />
    </main>
  )
}
