'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { SLOT_MIN } from '@/lib/datas'
import type { AgendamentoStatus } from '@/lib/supabase/types'

export type AcaoResult = { ok?: true; erro?: string }

const novoSchema = z.object({
  profissional_id: z.string().uuid('Profissional inválido'),
  servico_id: z.string().uuid().optional().or(z.literal('')),
  cliente_nome: z.string().trim().min(2, 'Informe o nome do cliente'),
  cliente_telefone: z.string().trim().min(8, 'Informe um telefone válido'),
  inicio: z.string().datetime('Horário inválido'), // ISO/UTC
  duracao_min: z.coerce.number().int().positive().max(600).default(SLOT_MIN),
  observacoes: z.string().trim().max(500).optional().or(z.literal('')),
})

export async function criarAgendamento(input: unknown): Promise<AcaoResult> {
  const profile = await requireAuth()

  const parsed = novoSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  const d = parsed.data

  const inicio = new Date(d.inicio)
  const fim = new Date(inicio.getTime() + d.duracao_min * 60_000)

  const supabase = await createClient()
  const { error } = await supabase.from('agendamentos').insert({
    tenant_id: profile.tenant_id,
    profissional_id: d.profissional_id,
    servico_id: d.servico_id ? d.servico_id : null,
    cliente_nome: d.cliente_nome,
    cliente_telefone: d.cliente_telefone,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    status: 'confirmado', // criado no painel já entra confirmado
    origem: 'painel',
    observacoes: d.observacoes ? d.observacoes : null,
  })

  if (error) {
    // 23P01 = exclusion_violation (constraint anti-overbooking no banco)
    if (error.code === '23P01') {
      return { erro: 'Já existe um agendamento nesse horário para esse profissional.' }
    }
    return { erro: 'Não foi possível salvar o agendamento. Tente novamente.' }
  }

  revalidatePath('/dashboard/agenda')
  return { ok: true }
}

const editarSchema = novoSchema.extend({
  id: z.string().uuid('Agendamento inválido'),
})

export async function editarAgendamento(input: unknown): Promise<AcaoResult> {
  await requireAuth()

  const parsed = editarSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  const d = parsed.data

  const inicio = new Date(d.inicio)
  const fim = new Date(inicio.getTime() + d.duracao_min * 60_000)

  const supabase = await createClient()
  // RLS garante tenant + permissão; a constraint do banco refaz a checagem de
  // sobreposição (ignorando a própria linha, que não conflita consigo mesma).
  const { error } = await supabase
    .from('agendamentos')
    .update({
      profissional_id: d.profissional_id,
      servico_id: d.servico_id ? d.servico_id : null,
      cliente_nome: d.cliente_nome,
      cliente_telefone: d.cliente_telefone,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      observacoes: d.observacoes ? d.observacoes : null,
    })
    .eq('id', d.id)

  if (error) {
    if (error.code === '23P01') {
      return { erro: 'Já existe um agendamento nesse horário para esse profissional.' }
    }
    return { erro: 'Não foi possível salvar as alterações. Tente novamente.' }
  }

  revalidatePath('/dashboard/agenda')
  return { ok: true }
}

const STATUS_VALIDOS: AgendamentoStatus[] = [
  'pendente',
  'confirmado',
  'em_atendimento',
  'concluido',
  'cancelado',
]

export async function mudarStatus(
  id: string,
  status: AgendamentoStatus,
): Promise<AcaoResult> {
  await requireAuth()

  if (!STATUS_VALIDOS.includes(status)) return { erro: 'Status inválido' }
  if (!z.string().uuid().safeParse(id).success) return { erro: 'Agendamento inválido' }

  const supabase = await createClient()
  // RLS garante que só admin ou o profissional dono altere; tenant isolado.
  const { error } = await supabase.from('agendamentos').update({ status }).eq('id', id)

  if (error) return { erro: 'Não foi possível atualizar. Tente novamente.' }

  revalidatePath('/dashboard/agenda')
  return { ok: true }
}

// ── Bloqueios (almoço, feriado, folga) — barram agendamento naquele intervalo ─

const bloqueioSchema = z.object({
  profissional_id: z.string().uuid().or(z.literal('todos')),
  inicio: z.string().datetime('Início inválido'),
  fim: z.string().datetime('Fim inválido'),
  motivo: z.string().trim().max(120).optional().or(z.literal('')),
})

export async function criarBloqueio(input: unknown): Promise<AcaoResult> {
  const profile = await requireAuth()

  const parsed = bloqueioSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  const d = parsed.data

  if (new Date(d.fim) <= new Date(d.inicio)) {
    return { erro: 'O fim do bloqueio deve ser depois do início.' }
  }
  if (d.profissional_id === 'todos' && profile.papel !== 'admin') {
    return { erro: 'Apenas o admin pode bloquear para todos os profissionais.' }
  }

  const supabase = await createClient()
  const motivo = d.motivo ? d.motivo : null

  if (d.profissional_id === 'todos') {
    const { data: profs } = await supabase
      .from('profissionais')
      .select('id')
      .eq('ativo', true)
      .eq('tenant_id', profile.tenant_id)

    const rows = (profs ?? []).map((p) => ({
      tenant_id: profile.tenant_id,
      profissional_id: p.id,
      inicio: d.inicio,
      fim: d.fim,
      motivo,
    }))
    if (rows.length === 0) return { erro: 'Nenhum profissional ativo.' }

    const { error } = await supabase.from('bloqueios').insert(rows)
    if (error) return { erro: 'Não foi possível criar o bloqueio. Tente novamente.' }
  } else {
    const { error } = await supabase.from('bloqueios').insert({
      tenant_id: profile.tenant_id,
      profissional_id: d.profissional_id,
      inicio: d.inicio,
      fim: d.fim,
      motivo,
    })
    if (error) return { erro: 'Não foi possível criar o bloqueio. Tente novamente.' }
  }

  revalidatePath('/dashboard/agenda')
  return { ok: true }
}

export async function removerBloqueio(id: string): Promise<AcaoResult> {
  await requireAuth()
  if (!z.string().uuid().safeParse(id).success) return { erro: 'Bloqueio inválido' }

  const supabase = await createClient()
  const { error } = await supabase.from('bloqueios').delete().eq('id', id)
  if (error) return { erro: 'Não foi possível remover. Tente novamente.' }

  revalidatePath('/dashboard/agenda')
  return { ok: true }
}
