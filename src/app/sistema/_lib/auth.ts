// Auth do "O Sistema" — separado do salão de propósito: o requireAuth do
// dashboard redireciona para /dashboard/login e exige o profile do salão.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { SistemaPlayer } from '@/lib/supabase/types'

const ATRIBUTOS_PADRAO = [
  { nome: 'Força', icone: 'punho', ordem: 0 },
  { nome: 'Agilidade', icone: 'raio', ordem: 1 },
  { nome: 'Vitalidade', icone: 'coracao', ordem: 2 },
  { nome: 'Inteligência', icone: 'cerebro', ordem: 3 },
  { nome: 'Percepção', icone: 'olho', ordem: 4 },
]

const QUESTS_PADRAO = [
  {
    titulo: 'Treinar o corpo',
    descricao: '100 flexões, 100 abdominais, 100 agachamentos, 10 km de corrida. Ou a sua versão disso.',
    xp_recompensa: 50,
    moedas_recompensa: 20,
    ordem: 0,
  },
  {
    titulo: 'Alimentar a mente',
    descricao: 'Ler ao menos 20 minutos.',
    xp_recompensa: 30,
    moedas_recompensa: 10,
    ordem: 1,
  },
  {
    titulo: 'Dormir como um caçador',
    descricao: 'Ir para a cama no horário planejado.',
    xp_recompensa: 25,
    moedas_recompensa: 10,
    ordem: 2,
  },
]

/**
 * Exige sessão e garante que o jogador existe (seed no primeiro acesso:
 * player + atributos padrão + quests de exemplo). Retorna o player.
 */
export async function requirePlayer(): Promise<SistemaPlayer> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sistema/login')

  const { data: existente } = await supabase
    .from('sistema_players')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (existente) return existente

  // Primeiro acesso — nasce o jogador (RLS garante user_id = auth.uid()).
  const { data: criado, error } = await supabase
    .from('sistema_players')
    .upsert(
      {
        user_id: user.id,
        nome_cacador: user.email?.split('@')[0] ?? 'Jogador',
      },
      { onConflict: 'user_id', ignoreDuplicates: false },
    )
    .select()
    .single()
  if (error || !criado) redirect('/sistema/login')

  await supabase
    .from('sistema_atributos')
    .upsert(
      ATRIBUTOS_PADRAO.map((a) => ({ ...a, user_id: user.id })),
      { onConflict: 'user_id,nome', ignoreDuplicates: true },
    )

  // Quests de exemplo só na criação do player (depois o jogador edita à vontade)
  const { count } = await supabase
    .from('sistema_quests')
    .select('*', { count: 'exact', head: true })
  if (!count) {
    await supabase
      .from('sistema_quests')
      .insert(QUESTS_PADRAO.map((q) => ({ ...q, user_id: user.id })))
  }

  return criado
}
