import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { hojeISO, intervaloDoDia } from '@/lib/datas'
import { AgendaView } from './AgendaView'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  const profile = await requireAuth()

  const { data } = await searchParams
  const dia = data && /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : hojeISO()
  const { inicioISO, fimISO } = intervaloDoDia(dia)

  const supabase = await createClient()

  const [profissionais, servicos, horarios, agendamentos, bloqueios] = await Promise.all([
    supabase.from('profissionais').select('*').eq('ativo', true).order('ordem'),
    supabase.from('servicos').select('*').eq('ativo', true).order('ordem'),
    supabase.from('horarios').select('*'),
    supabase
      .from('agendamentos')
      .select('*')
      .gte('inicio', inicioISO)
      .lt('inicio', fimISO)
      .neq('status', 'cancelado')
      .order('inicio'),
    supabase
      .from('bloqueios')
      .select('*')
      .lt('inicio', fimISO)
      .gt('fim', inicioISO)
      .order('inicio'),
  ])

  return (
    <AgendaView
      dia={dia}
      papel={profile.papel}
      profissionais={profissionais.data ?? []}
      servicos={servicos.data ?? []}
      horarios={horarios.data ?? []}
      agendamentos={agendamentos.data ?? []}
      bloqueios={bloqueios.data ?? []}
    />
  )
}
