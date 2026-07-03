'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePlayer } from '../../_lib/auth'
import { getTitulo, titulosDesbloqueados } from '../../_lib/titulos'

export type AcaoResult = { ok?: true; erro?: string }

export async function equiparTitulo(
  tituloId: string | null,
): Promise<AcaoResult> {
  const player = await requirePlayer()
  const supabase = await createClient()

  if (tituloId !== null) {
    const titulo = getTitulo(tituloId)
    if (!titulo) return { erro: 'Título inválido.' }

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
    if (!desbloqueados.some((t) => t.id === titulo.id)) {
      return { erro: 'Título ainda não desbloqueado.' }
    }
  }

  await supabase
    .from('sistema_players')
    .update({ titulo: tituloId })
    .eq('user_id', player.user_id)

  if (tituloId) {
    await supabase.from('sistema_log').insert({
      user_id: player.user_id,
      tipo: 'titulo',
      payload: { titulo: getTitulo(tituloId)?.nome },
    })
  }

  revalidatePath('/sistema')
  revalidatePath('/sistema/titulos')
  return { ok: true }
}
