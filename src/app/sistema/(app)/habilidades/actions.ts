'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePlayer } from '../../_lib/auth'
import { getHabilidade } from '../../_lib/habilidades'
import { verificarEPremiarConquistas } from '../../_lib/conquistas'

export type AcaoResult = { ok?: true; erro?: string }

export async function gastarPontoHabilidade(
  habilidadeId: string,
): Promise<AcaoResult> {
  const player = await requirePlayer()

  const habilidade = getHabilidade(habilidadeId)
  if (!habilidade) return { erro: 'Habilidade inválida.' }
  if (habilidade.classe && habilidade.classe !== player.classe) {
    return { erro: 'Habilidade exclusiva de outra classe.' }
  }
  if (player.nivel < habilidade.nivelJogadorMinimo) {
    return { erro: `Requer nível ${habilidade.nivelJogadorMinimo}.` }
  }
  if (player.pontos_habilidade < 1) {
    return { erro: 'Sem pontos de habilidade. Suba de nível para ganhar mais.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('sistema_gastar_ponto_habilidade', {
    p_habilidade_id: habilidade.id,
    p_nivel_max: habilidade.nivelMax,
    p_nome: habilidade.nome,
  })
  if (error) {
    return { erro: error.message.includes('máximo')
      ? 'Habilidade já está no nível máximo.'
      : 'Não foi possível usar o ponto. Tente novamente.' }
  }

  await verificarEPremiarConquistas(supabase, player.user_id)
  revalidatePath('/sistema')
  revalidatePath('/sistema/habilidades')
  return { ok: true }
}
