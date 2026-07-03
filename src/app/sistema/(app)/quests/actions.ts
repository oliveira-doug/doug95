'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePlayer } from '../../_lib/auth'
import { hojeLocal } from '../../_lib/dias'
import { verificarEPremiarConquistas } from '../../_lib/conquistas'
import type { ResultadoQuest } from '@/components/sistema/molecules/LevelUpOverlay'

export type AcaoResult = { ok?: true; erro?: string }
export type ConcluirResult = { resultado?: ResultadoQuest; erro?: string }

const questSchema = z.object({
  titulo: z.string().trim().min(2, 'Dê um nome à quest').max(80),
  descricao: z.string().trim().max(300).optional().or(z.literal('')),
  xp_recompensa: z.coerce.number().int().min(1).max(10000),
  moedas_recompensa: z.coerce.number().int().min(0).max(10000),
  atributo_id: z.string().uuid().optional().or(z.literal('')),
  atributo_pontos: z.coerce.number().int().min(0).max(100).default(0),
})

function montaRecompensaAtributos(d: z.infer<typeof questSchema>) {
  return d.atributo_id && d.atributo_pontos > 0
    ? { [d.atributo_id]: d.atributo_pontos }
    : {}
}

export async function criarQuest(input: unknown): Promise<AcaoResult> {
  const player = await requirePlayer()
  const parsed = questSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  const d = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.from('sistema_quests').insert({
    user_id: player.user_id,
    titulo: d.titulo,
    descricao: d.descricao || null,
    xp_recompensa: d.xp_recompensa,
    moedas_recompensa: d.moedas_recompensa,
    recompensa_atributos: montaRecompensaAtributos(d),
  })
  if (error) return { erro: 'Não foi possível criar a quest.' }

  revalidatePath('/sistema')
  revalidatePath('/sistema/quests')
  return { ok: true }
}

export async function atualizarQuest(
  id: string,
  input: unknown,
): Promise<AcaoResult> {
  await requirePlayer()
  const parsed = questSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  const d = parsed.data

  const supabase = await createClient()
  const { error } = await supabase
    .from('sistema_quests')
    .update({
      titulo: d.titulo,
      descricao: d.descricao || null,
      xp_recompensa: d.xp_recompensa,
      moedas_recompensa: d.moedas_recompensa,
      recompensa_atributos: montaRecompensaAtributos(d),
    })
    .eq('id', id)
  if (error) return { erro: 'Não foi possível salvar a quest.' }

  revalidatePath('/sistema')
  revalidatePath('/sistema/quests')
  return { ok: true }
}

export async function excluirQuest(id: string): Promise<AcaoResult> {
  await requirePlayer()
  const supabase = await createClient()
  // Delete real: o histórico sobrevive via titulo_snapshot nas conclusões.
  const { error } = await supabase.from('sistema_quests').delete().eq('id', id)
  if (error) return { erro: 'Não foi possível excluir a quest.' }

  revalidatePath('/sistema')
  revalidatePath('/sistema/quests')
  return { ok: true }
}

export async function concluirQuest(id: string): Promise<ConcluirResult> {
  const player = await requirePlayer()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('sistema_concluir_quest', {
    p_quest_id: id,
    p_dia: hojeLocal(),
  })
  if (error || !data) {
    // 23505 = unique_violation (quest já concluída hoje)
    if (error?.code === '23505') return { erro: 'Quest já concluída hoje.' }
    return { erro: 'Não foi possível concluir a quest.' }
  }

  const novas = await verificarEPremiarConquistas(supabase, player.user_id)

  revalidatePath('/sistema')
  revalidatePath('/sistema/quests')
  return {
    resultado: {
      ...data,
      conquistasNovas: novas.map((c) => ({ nome: c.nome, moedas: c.moedas })),
    },
  }
}
