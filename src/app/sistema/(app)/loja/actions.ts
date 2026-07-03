'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePlayer } from '../../_lib/auth'
import { getItem } from '../../_lib/itens'
import { verificarEPremiarConquistas } from '../../_lib/conquistas'

export type AcaoResult = { ok?: true; erro?: string }

function revalidar() {
  revalidatePath('/sistema')
  revalidatePath('/sistema/loja')
}

export async function comprarItem(itemId: string): Promise<AcaoResult> {
  const player = await requirePlayer()

  const item = getItem(itemId)
  if (!item) return { erro: 'Item inválido.' }
  if (player.nivel < item.nivelMinimo) {
    return { erro: `Requer nível ${item.nivelMinimo}.` }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('sistema_comprar_item', {
    p_item_id: item.id,
    p_preco: item.preco,
    p_slot: item.slot,
    p_nome: item.nome,
  })
  if (error) {
    if (error.message.includes('insuficientes')) {
      return { erro: 'Moedas insuficientes.' }
    }
    if (error.message.includes('adquirido')) {
      return { erro: 'Você já possui este item.' }
    }
    return { erro: 'Não foi possível comprar o item.' }
  }

  await verificarEPremiarConquistas(supabase, player.user_id)
  revalidar()
  return { ok: true }
}

export async function equiparItem(itemId: string): Promise<AcaoResult> {
  const player = await requirePlayer()
  const item = getItem(itemId)
  if (!item) return { erro: 'Item inválido.' }

  const supabase = await createClient()
  const { data: possuido } = await supabase
    .from('sistema_inventario')
    .select('equipado')
    .eq('user_id', player.user_id)
    .eq('item_id', item.id)
    .maybeSingle()
  if (!possuido) return { erro: 'Você não possui este item.' }

  if (possuido.equipado) {
    await supabase
      .from('sistema_inventario')
      .update({ equipado: false })
      .eq('user_id', player.user_id)
      .eq('item_id', item.id)
  } else {
    // um item por slot: desequipa o slot antes de equipar o novo
    await supabase
      .from('sistema_inventario')
      .update({ equipado: false })
      .eq('user_id', player.user_id)
      .eq('slot', item.slot)
    await supabase
      .from('sistema_inventario')
      .update({ equipado: true })
      .eq('user_id', player.user_id)
      .eq('item_id', item.id)
    await supabase.from('sistema_log').insert({
      user_id: player.user_id,
      tipo: 'equipamento',
      payload: { item: item.nome },
    })
  }

  revalidar()
  return { ok: true }
}
