// Catálogo de conquistas — checadas nas server actions após cada evento.
// Cada conquista paga MOEDAS (a economia da Loja). O banco guarda só o slug.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, SistemaPlayer } from '@/lib/supabase/types'

export type ContextoConquista = {
  player: SistemaPlayer
  totalQuestsConcluidas: number
  maiorAtributo: number
  totalItens: number
  totalHabilidades: number
}

export type Conquista = {
  id: string
  nome: string
  descricao: string
  moedas: number
  icone: string // slug do IconeSistema
  atingida: (ctx: ContextoConquista) => boolean
}

export const CONQUISTAS: Conquista[] = [
  {
    id: 'primeiro-passo',
    nome: 'Primeiro Passo',
    descricao: 'Conclua sua primeira quest diária.',
    moedas: 100,
    icone: 'check',
    atingida: (c) => c.totalQuestsConcluidas >= 1,
  },
  {
    id: 'maratonista',
    nome: 'Maratonista',
    descricao: 'Conclua 50 quests.',
    moedas: 300,
    icone: 'check',
    atingida: (c) => c.totalQuestsConcluidas >= 50,
  },
  {
    id: 'centuriao',
    nome: 'Centurião',
    descricao: 'Conclua 100 quests.',
    moedas: 600,
    icone: 'espadas',
    atingida: (c) => c.totalQuestsConcluidas >= 100,
  },
  {
    id: 'lendario-500',
    nome: 'Grind Lendário',
    descricao: 'Conclua 500 quests.',
    moedas: 2000,
    icone: 'coroa',
    atingida: (c) => c.totalQuestsConcluidas >= 500,
  },
  {
    id: 'semana-perfeita',
    nome: 'Semana Perfeita',
    descricao: 'Mantenha um streak de 7 dias.',
    moedas: 250,
    icone: 'chama',
    atingida: (c) => c.player.melhor_streak >= 7,
  },
  {
    id: 'mes-perfeito',
    nome: 'Mês Perfeito',
    descricao: 'Mantenha um streak de 30 dias.',
    moedas: 1000,
    icone: 'chama',
    atingida: (c) => c.player.melhor_streak >= 30,
  },
  {
    id: 'cem-dias',
    nome: 'Os 100 Dias',
    descricao: 'Mantenha um streak de 100 dias.',
    moedas: 5000,
    icone: 'chama',
    atingida: (c) => c.player.melhor_streak >= 100,
  },
  {
    id: 'despertar',
    nome: 'O Despertar',
    descricao: 'Alcance o nível 10 e desperte sua classe.',
    moedas: 500,
    icone: 'raio',
    atingida: (c) => c.player.classe !== null,
  },
  {
    id: 'rank-c',
    nome: 'Subindo na Associação',
    descricao: 'Alcance o nível 20 (rank C).',
    moedas: 800,
    icone: 'medalha',
    atingida: (c) => c.player.nivel >= 20,
  },
  {
    id: 'rank-a',
    nome: 'Elite dos Caçadores',
    descricao: 'Alcance o nível 40 (rank A).',
    moedas: 2000,
    icone: 'medalha',
    atingida: (c) => c.player.nivel >= 40,
  },
  {
    id: 'rank-s',
    nome: 'Rank S',
    descricao: 'Alcance o nível 50. Bem-vindo ao topo.',
    moedas: 5000,
    icone: 'coroa',
    atingida: (c) => c.player.nivel >= 50,
  },
  {
    id: 'atributo-50',
    nome: 'Além do Humano',
    descricao: 'Eleve um atributo a 50 pontos.',
    moedas: 1000,
    icone: 'punho',
    atingida: (c) => c.maiorAtributo >= 50,
  },
  {
    id: 'primeiro-item',
    nome: 'Cliente da Loja',
    descricao: 'Compre seu primeiro item na Loja do Sistema.',
    moedas: 150,
    icone: 'sacola',
    atingida: (c) => c.totalItens >= 1,
  },
  {
    id: 'arsenal',
    nome: 'Arsenal Completo',
    descricao: 'Possua 10 itens no inventário.',
    moedas: 1000,
    icone: 'armadura',
    atingida: (c) => c.totalItens >= 10,
  },
  {
    id: 'primeira-habilidade',
    nome: 'Desbloqueio',
    descricao: 'Aprenda sua primeira habilidade.',
    moedas: 150,
    icone: 'faisca',
    atingida: (c) => c.totalHabilidades >= 1,
  },
]

export function getConquista(id: string): Conquista | null {
  return CONQUISTAS.find((c) => c.id === id) ?? null
}

/**
 * Reavalia o catálogo contra o estado atual e premia o que faltar.
 * Idempotente: o insert ignora conflito; moedas só são pagas quando a linha
 * é realmente criada. Retorna as conquistas recém-desbloqueadas (para toast).
 */
export async function verificarEPremiarConquistas(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Conquista[]> {
  const [player, conquistas, conclusoes, atributos, itens, habilidades] =
    await Promise.all([
      supabase.from('sistema_players').select('*').eq('user_id', userId).single(),
      supabase.from('sistema_conquistas_desbloqueadas').select('conquista_id'),
      supabase
        .from('sistema_quest_conclusoes')
        .select('*', { count: 'exact', head: true }),
      supabase.from('sistema_atributos').select('valor'),
      supabase.from('sistema_inventario').select('*', { count: 'exact', head: true }),
      supabase.from('sistema_habilidades').select('*', { count: 'exact', head: true }),
    ])
  if (!player.data) return []

  const ctx: ContextoConquista = {
    player: player.data,
    totalQuestsConcluidas: conclusoes.count ?? 0,
    maiorAtributo: Math.max(0, ...(atributos.data ?? []).map((a) => a.valor)),
    totalItens: itens.count ?? 0,
    totalHabilidades: habilidades.count ?? 0,
  }
  const jaTem = new Set((conquistas.data ?? []).map((c) => c.conquista_id))
  const novas: Conquista[] = []

  for (const conquista of CONQUISTAS) {
    if (jaTem.has(conquista.id) || !conquista.atingida(ctx)) continue

    // upsert com ignoreDuplicates: só premia se a linha foi criada agora
    const { data: inserida } = await supabase
      .from('sistema_conquistas_desbloqueadas')
      .upsert(
        { user_id: userId, conquista_id: conquista.id },
        { onConflict: 'user_id,conquista_id', ignoreDuplicates: true },
      )
      .select()

    if (inserida && inserida.length > 0) {
      novas.push(conquista)
      await supabase
        .from('sistema_players')
        .update({ moedas: ctx.player.moedas + conquista.moedas })
        .eq('user_id', userId)
      ctx.player.moedas += conquista.moedas
      await supabase.from('sistema_log').insert({
        user_id: userId,
        tipo: 'conquista',
        payload: { conquista: conquista.nome, moedas: conquista.moedas },
      })
    }
  }
  return novas
}
