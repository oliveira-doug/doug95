'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePlayer } from '../../_lib/auth'
import { verificarEPremiarConquistas } from '../../_lib/conquistas'

export type AcaoResult = { ok?: true; erro?: string }

function revalidar() {
  revalidatePath('/sistema')
  revalidatePath('/sistema/atributos')
}

export async function alocarPonto(atributoId: string): Promise<AcaoResult> {
  const player = await requirePlayer()
  if (player.pontos_disponiveis < 1) return { erro: 'Sem pontos disponíveis.' }

  const supabase = await createClient()

  // Lock otimista: só debita se o saldo ainda for o que lemos.
  const { data: debitado } = await supabase
    .from('sistema_players')
    .update({ pontos_disponiveis: player.pontos_disponiveis - 1 })
    .eq('user_id', player.user_id)
    .eq('pontos_disponiveis', player.pontos_disponiveis)
    .select()
  if (!debitado || debitado.length === 0) {
    return { erro: 'Tente novamente.' }
  }

  const { data: attr } = await supabase
    .from('sistema_atributos')
    .select('valor')
    .eq('id', atributoId)
    .single()
  if (!attr) {
    // devolve o ponto se o atributo sumiu
    await supabase
      .from('sistema_players')
      .update({ pontos_disponiveis: player.pontos_disponiveis })
      .eq('user_id', player.user_id)
    return { erro: 'Atributo não encontrado.' }
  }

  await supabase
    .from('sistema_atributos')
    .update({ valor: attr.valor + 1 })
    .eq('id', atributoId)

  await verificarEPremiarConquistas(supabase, player.user_id)
  revalidar()
  return { ok: true }
}

const atributoSchema = z.object({
  nome: z.string().trim().min(2, 'Dê um nome ao atributo').max(30),
  icone: z.string().trim().max(30).default('raio'),
})

export async function criarAtributo(input: unknown): Promise<AcaoResult> {
  const player = await requirePlayer()
  const parsed = atributoSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { count } = await supabase
    .from('sistema_atributos')
    .select('*', { count: 'exact', head: true })
  const { error } = await supabase.from('sistema_atributos').insert({
    user_id: player.user_id,
    nome: parsed.data.nome,
    icone: parsed.data.icone,
    ordem: count ?? 0,
  })
  if (error) {
    if (error.code === '23505') return { erro: 'Já existe um atributo com esse nome.' }
    return { erro: 'Não foi possível criar o atributo.' }
  }
  revalidar()
  return { ok: true }
}

export async function renomearAtributo(
  id: string,
  input: unknown,
): Promise<AcaoResult> {
  await requirePlayer()
  const parsed = atributoSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('sistema_atributos')
    .update({ nome: parsed.data.nome, icone: parsed.data.icone })
    .eq('id', id)
  if (error) {
    if (error.code === '23505') return { erro: 'Já existe um atributo com esse nome.' }
    return { erro: 'Não foi possível renomear o atributo.' }
  }
  revalidar()
  return { ok: true }
}

export async function excluirAtributo(id: string): Promise<AcaoResult> {
  await requirePlayer()
  const supabase = await createClient()
  const { error } = await supabase
    .from('sistema_atributos')
    .delete()
    .eq('id', id)
  if (error) return { erro: 'Não foi possível excluir o atributo.' }
  revalidar()
  return { ok: true }
}
