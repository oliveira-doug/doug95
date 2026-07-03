import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { requirePlayer } from '../../_lib/auth'
import { ITENS } from '../../_lib/itens'
import { LojaBoard } from './LojaBoard'

export const metadata: Metadata = { title: 'Loja' }

export default async function LojaPage() {
  const player = await requirePlayer()
  const supabase = await createClient()
  const { data: inventario } = await supabase
    .from('sistema_inventario')
    .select('item_id, equipado')

  return (
    <main>
      <SystemHeading
        kicker="⚠ Loja do Sistema"
        title="Loja"
        subtitle="Moedas vêm de quests, level-ups e conquistas. Gaste como um caçador de elite."
      />
      <LojaBoard
        itens={ITENS}
        possuidos={(inventario ?? []).map((i) => i.item_id)}
        equipados={(inventario ?? [])
          .filter((i) => i.equipado)
          .map((i) => i.item_id)}
        moedas={player.moedas}
        nivelJogador={player.nivel}
      />
    </main>
  )
}
