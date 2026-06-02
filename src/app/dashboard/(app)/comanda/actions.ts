'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export type AcaoResult = { ok?: true; erro?: string }
export type CriarResult = { ok?: true; id?: string; erro?: string }

type DB = SupabaseClient<Database>

/** Id do profissional vinculado ao usuário logado (null se for só admin/cliente). */
async function profissionalDoUsuario(supabase: DB, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profissionais')
    .select('id')
    .eq('profile_id', userId)
    .maybeSingle()
  return data?.id ?? null
}

// ── Criar comanda avulsa (sem agendamento) ───────────────────────────────────
const criarSchema = z.object({
  cliente_nome: z.string().trim().min(2, 'Informe o nome do cliente'),
  // Admin escolhe o profissional; profissional usa o próprio (campo ausente).
  profissional_id: z.string().uuid().optional().or(z.literal('')),
})

export async function criarAtendimento(input: unknown): Promise<CriarResult> {
  const profile = await requireAuth()
  const parsed = criarSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  const d = parsed.data

  const supabase = await createClient()

  // Quem é o dono da comanda? Admin pode escolher; profissional é ele mesmo.
  let profId = d.profissional_id ? d.profissional_id : null
  if (!profId) profId = await profissionalDoUsuario(supabase, profile.id)
  if (!profId) {
    return { erro: 'Selecione o profissional do atendimento.' }
  }

  const { data, error } = await supabase
    .from('atendimentos')
    .insert({
      tenant_id: profile.tenant_id,
      profissional_id: profId,
      cliente_nome: d.cliente_nome,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { erro: 'Não foi possível abrir a comanda. Tente novamente.' }
  }

  revalidatePath('/dashboard/comanda')
  return { ok: true, id: data.id }
}

// ── Abrir (ou reaproveitar) a comanda de um agendamento ──────────────────────
export async function abrirComandaDoAgendamento(
  agendamentoId: string,
): Promise<CriarResult> {
  const profile = await requireAuth()
  if (!z.string().uuid().safeParse(agendamentoId).success) {
    return { erro: 'Agendamento inválido' }
  }

  const supabase = await createClient()

  // Já existe comanda para esse agendamento? Reaproveita (não duplica).
  const { data: existente } = await supabase
    .from('atendimentos')
    .select('id')
    .eq('agendamento_id', agendamentoId)
    .maybeSingle()
  if (existente) return { ok: true, id: existente.id }

  // Senão, cria a partir dos dados do agendamento (RLS garante o acesso).
  const { data: ag } = await supabase
    .from('agendamentos')
    .select('profissional_id, cliente_nome')
    .eq('id', agendamentoId)
    .single()
  if (!ag) return { erro: 'Agendamento não encontrado.' }

  const { data, error } = await supabase
    .from('atendimentos')
    .insert({
      tenant_id: profile.tenant_id,
      agendamento_id: agendamentoId,
      profissional_id: ag.profissional_id,
      cliente_nome: ag.cliente_nome,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { erro: 'Não foi possível abrir a comanda. Tente novamente.' }
  }

  revalidatePath('/dashboard/comanda')
  return { ok: true, id: data.id }
}

// ── Itens (procedimentos + valores) ──────────────────────────────────────────
const itemSchema = z.object({
  atendimento_id: z.string().uuid('Comanda inválida'),
  descricao: z.string().trim().min(2, 'Descreva o procedimento'),
  valor: z.coerce.number().min(0, 'Valor inválido').max(1_000_000, 'Valor muito alto'),
  servico_id: z.string().uuid().optional().or(z.literal('')),
})

export async function adicionarItem(input: unknown): Promise<AcaoResult> {
  const profile = await requireAuth()
  const parsed = itemSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  const d = parsed.data

  const supabase = await createClient()
  // O total do atendimento é recalculado por trigger no banco.
  const { error } = await supabase.from('atendimento_itens').insert({
    tenant_id: profile.tenant_id,
    atendimento_id: d.atendimento_id,
    servico_id: d.servico_id ? d.servico_id : null,
    descricao: d.descricao,
    valor: d.valor,
  })

  if (error) return { erro: 'Não foi possível adicionar o item. Tente novamente.' }

  revalidatePath(`/dashboard/comanda/${d.atendimento_id}`)
  return { ok: true }
}

export async function removerItem(
  itemId: string,
  atendimentoId: string,
): Promise<AcaoResult> {
  await requireAuth()
  if (!z.string().uuid().safeParse(itemId).success) return { erro: 'Item inválido' }

  const supabase = await createClient()
  const { error } = await supabase.from('atendimento_itens').delete().eq('id', itemId)
  if (error) return { erro: 'Não foi possível remover o item. Tente novamente.' }

  revalidatePath(`/dashboard/comanda/${atendimentoId}`)
  return { ok: true }
}

// ── Observações da comanda ────────────────────────────────────────────────────
const obsSchema = z.object({
  atendimento_id: z.string().uuid('Comanda inválida'),
  observacoes: z.string().trim().max(1000).optional().or(z.literal('')),
})

export async function salvarObservacoes(input: unknown): Promise<AcaoResult> {
  await requireAuth()
  const parsed = obsSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  const d = parsed.data

  const supabase = await createClient()
  const { error } = await supabase
    .from('atendimentos')
    .update({ observacoes: d.observacoes ? d.observacoes : null })
    .eq('id', d.atendimento_id)

  if (error) return { erro: 'Não foi possível salvar. Tente novamente.' }

  revalidatePath(`/dashboard/comanda/${d.atendimento_id}`)
  return { ok: true }
}

// ── Excluir a comanda inteira (itens caem em cascata) ─────────────────────────
export async function excluirAtendimento(id: string): Promise<AcaoResult> {
  await requireAuth()
  if (!z.string().uuid().safeParse(id).success) return { erro: 'Comanda inválida' }

  const supabase = await createClient()
  const { error } = await supabase.from('atendimentos').delete().eq('id', id)
  if (error) return { erro: 'Não foi possível excluir. Tente novamente.' }

  revalidatePath('/dashboard/comanda')
  return { ok: true }
}
