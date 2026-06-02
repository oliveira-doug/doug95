'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_TENANT_ID } from '@/config/tenant'
import {
  diaDaSemana,
  horaParaMin,
  intervaloDoDia,
  slotParaData,
  SLOT_MIN,
} from '@/lib/datas'
import { calcularSlotsLivres } from '@/lib/disponibilidade'

const uuid = z.string().uuid()
const diaRe = /^\d{4}-\d{2}-\d{2}$/
const horaRe = /^\d{2}:\d{2}$/

/**
 * Horários livres de um profissional num dia. Usa service role (servidor
 * confiável) para ler agendamentos/bloqueios privados, mas devolve SÓ os slots
 * livres — nunca dados de cliente.
 */
export async function horariosDisponiveis(
  profissionalId: string,
  dia: string,
): Promise<string[]> {
  if (!uuid.safeParse(profissionalId).success) return []
  if (!diaRe.test(dia)) return []

  const supabase = createAdminClient()
  const dow = diaDaSemana(dia)

  const { data: horario } = await supabase
    .from('horarios')
    .select('abre, fecha')
    .eq('tenant_id', DEFAULT_TENANT_ID)
    .eq('profissional_id', profissionalId)
    .eq('dia_semana', dow)
    .maybeSingle()

  if (!horario) return [] // não atende neste dia

  const { inicioISO, fimISO } = intervaloDoDia(dia)

  const [ags, blqs] = await Promise.all([
    supabase
      .from('agendamentos')
      .select('inicio, fim')
      .eq('tenant_id', DEFAULT_TENANT_ID)
      .eq('profissional_id', profissionalId)
      .neq('status', 'cancelado')
      .gte('inicio', inicioISO)
      .lt('inicio', fimISO),
    supabase
      .from('bloqueios')
      .select('inicio, fim')
      .eq('tenant_id', DEFAULT_TENANT_ID)
      .eq('profissional_id', profissionalId)
      .lt('inicio', fimISO)
      .gt('fim', inicioISO),
  ])

  return calcularSlotsLivres({
    dia,
    abreMin: horaParaMin(horario.abre),
    fechaMin: horaParaMin(horario.fecha),
    ocupados: [...(ags.data ?? []), ...(blqs.data ?? [])],
  })
}

const solicitarSchema = z.object({
  profissional_id: uuid,
  servico_id: uuid.optional().or(z.literal('')),
  dia: z.string().regex(diaRe, 'Data inválida'),
  hora: z.string().regex(horaRe, 'Horário inválido'),
  cliente_nome: z.string().trim().min(2, 'Informe seu nome'),
  cliente_telefone: z.string().trim().min(8, 'Informe um telefone válido'),
  website: z.string().optional(), // honeypot — humanos deixam vazio
})

export type SolicitarResult = { ok?: true; erro?: string }

export async function solicitarAgendamento(input: unknown): Promise<SolicitarResult> {
  const parsed = solicitarSchema.safeParse(input)
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? 'Confira os dados.' }
  }
  const d = parsed.data

  // Honeypot: se o campo oculto veio preenchido, é bot — finge sucesso e ignora.
  if (d.website && d.website.length > 0) return { ok: true }

  // Re-checa disponibilidade no servidor (o slot pode ter sido preenchido).
  const livres = await horariosDisponiveis(d.profissional_id, d.dia)
  if (!livres.includes(d.hora)) {
    return { erro: 'Esse horário acabou de ser preenchido. Escolha outro, por favor.' }
  }

  const supabase = createAdminClient()

  // Duração a partir do serviço (se houver); senão, 2h padrão.
  let duracao = SLOT_MIN
  if (d.servico_id) {
    const { data: s } = await supabase
      .from('servicos')
      .select('duracao_min')
      .eq('id', d.servico_id)
      .maybeSingle()
    if (s) duracao = s.duracao_min
  }

  const inicio = slotParaData(d.dia, d.hora)
  const fim = new Date(inicio.getTime() + duracao * 60_000)

  const { error } = await supabase.from('agendamentos').insert({
    tenant_id: DEFAULT_TENANT_ID,
    profissional_id: d.profissional_id,
    servico_id: d.servico_id ? d.servico_id : null,
    cliente_nome: d.cliente_nome,
    cliente_telefone: d.cliente_telefone,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    status: 'pendente', // entra como pendente; o salão confirma no painel
    origem: 'site',
  })

  if (error) {
    // Rede de segurança final: constraint anti-overbooking no banco.
    if (error.code === '23P01') {
      return { erro: 'Esse horário acabou de ser preenchido. Escolha outro, por favor.' }
    }
    return { erro: 'Não foi possível concluir o agendamento. Tente novamente.' }
  }

  return { ok: true }
}
