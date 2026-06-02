import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { hojeISO, intervaloDoDia } from '@/lib/datas'
import { ComandaList } from './ComandaList'

export default async function ComandaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  const profile = await requireAuth()

  const { data } = await searchParams
  const dia = data && /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : hojeISO()
  const { inicioISO, fimISO } = intervaloDoDia(dia)

  const supabase = await createClient()

  const [profissionais, atendimentos] = await Promise.all([
    supabase.from('profissionais').select('*').eq('ativo', true).order('ordem'),
    supabase
      .from('atendimentos')
      .select('*')
      .gte('data', inicioISO)
      .lt('data', fimISO)
      .order('data', { ascending: false }),
  ])

  return (
    <ComandaList
      dia={dia}
      papel={profile.papel}
      profissionais={profissionais.data ?? []}
      atendimentos={atendimentos.data ?? []}
    />
  )
}
