import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ComandaDetalhe } from './ComandaDetalhe'

export default async function ComandaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth()
  const { id } = await params

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const supabase = await createClient()

  const [atendimentoRes, itensRes, pagamentosRes, servicosRes, profissionaisRes] =
    await Promise.all([
      supabase.from('atendimentos').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('atendimento_itens')
        .select('*')
        .eq('atendimento_id', id)
        .order('created_at'),
      supabase
        .from('pagamentos')
        .select('*')
        .eq('atendimento_id', id)
        .order('created_at'),
      supabase.from('servicos').select('*').eq('ativo', true).order('ordem'),
      supabase.from('profissionais').select('*').eq('ativo', true).order('ordem'),
    ])

  if (!atendimentoRes.data) notFound()

  return (
    <ComandaDetalhe
      atendimento={atendimentoRes.data}
      itens={itensRes.data ?? []}
      pagamentos={pagamentosRes.data ?? []}
      servicos={servicosRes.data ?? []}
      profissionais={profissionaisRes.data ?? []}
    />
  )
}
