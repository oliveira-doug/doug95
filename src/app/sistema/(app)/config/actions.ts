'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePlayer } from '../../_lib/auth'

export type AcaoResult = { ok?: true; erro?: string }

const nomeSchema = z.object({
  nome_cacador: z.string().trim().min(2, 'Informe um nome').max(40),
})

const inscricaoSchema = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({
    p256dh: z.string().min(1).max(300),
    auth: z.string().min(1).max(100),
  }),
})

/** Guarda a inscrição de web push do aparelho (para o lembrete diário). */
export async function salvarInscricaoPush(input: unknown): Promise<AcaoResult> {
  const player = await requirePlayer()
  const parsed = inscricaoSchema.safeParse(input)
  if (!parsed.success) return { erro: 'Inscrição inválida.' }

  const supabase = await createClient()
  const { error } = await supabase.from('sistema_push_subscriptions').upsert(
    {
      user_id: player.user_id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    },
    { onConflict: 'endpoint' },
  )
  if (error) return { erro: 'Não foi possível salvar a inscrição.' }
  return { ok: true }
}

export async function removerInscricaoPush(
  endpoint: string,
): Promise<AcaoResult> {
  await requirePlayer()
  const supabase = await createClient()
  await supabase
    .from('sistema_push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
  return { ok: true }
}

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
