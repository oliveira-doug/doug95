'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePlayer } from '../../_lib/auth'
import { NIVEL_DESPERTAR } from '../../_lib/game'
import { getClasse } from '../../_lib/classes'
import { verificarEPremiarConquistas } from '../../_lib/conquistas'

export type AcaoResult = { ok?: true; erro?: string }

export async function escolherClasse(classeId: string): Promise<AcaoResult> {
  const player = await requirePlayer()

  const classe = getClasse(classeId)
  if (!classe) return { erro: 'Classe inválida.' }
  if (player.classe) return { erro: 'Você já despertou sua classe.' }
  if (player.nivel < NIVEL_DESPERTAR) {
    return { erro: `O Despertar exige nível ${NIVEL_DESPERTAR}.` }
  }

  const supabase = await createClient()
  // Guarda contra corrida: só grava se a classe ainda estiver vazia.
  const { data } = await supabase
    .from('sistema_players')
    .update({ classe: classe.id })
    .eq('user_id', player.user_id)
    .is('classe', null)
    .select()
  if (!data || data.length === 0) return { erro: 'Você já despertou sua classe.' }

  await supabase.from('sistema_log').insert({
    user_id: player.user_id,
    tipo: 'classe',
    payload: { classe: classe.nome },
  })
  await verificarEPremiarConquistas(supabase, player.user_id)

  revalidatePath('/sistema')
  revalidatePath('/sistema/classe')
  revalidatePath('/sistema/habilidades')
  return { ok: true }
}
