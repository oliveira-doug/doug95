'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePlayer } from '../../_lib/auth'

export type AcaoResult = { ok?: true; erro?: string }

const nomeSchema = z.object({
  nome_cacador: z.string().trim().min(2, 'Informe um nome').max(40),
})

export async function renomearCacador(input: unknown): Promise<AcaoResult> {
  const player = await requirePlayer()
  const parsed = nomeSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Nome inválido' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('sistema_players')
    .update({ nome_cacador: parsed.data.nome_cacador })
    .eq('user_id', player.user_id)
  if (error) return { erro: 'Não foi possível salvar o nome.' }

  revalidatePath('/sistema')
  revalidatePath('/sistema/config')
  return { ok: true }
}
