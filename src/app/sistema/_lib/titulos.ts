// Catálogo de títulos — desbloqueados por nível, classe, streak ou conquistas.
// O jogador escolhe qual título exibir (sistema_players.titulo = slug).

import type { SistemaPlayer } from '@/lib/supabase/types'

export type ContextoTitulo = {
  player: SistemaPlayer
  conquistas: string[] // slugs desbloqueados
  totalQuestsConcluidas: number
}

export type Titulo = {
  id: string
  nome: string
  descricao: string
  requisito: string // texto exibido quando bloqueado
  desbloqueado: (ctx: ContextoTitulo) => boolean
}

export const TITULOS: Titulo[] = [
  {
    id: 'o-mais-fraco',
    nome: 'O Caçador Mais Fraco',
    descricao: 'Todo Monarca já foi rank E um dia.',
    requisito: 'Disponível desde o início',
    desbloqueado: () => true,
  },
  {
    id: 'desperto',
    nome: 'O Desperto',
    descricao: 'Sobreviveu à Dupla Ascensão e despertou de verdade.',
    requisito: 'Alcance o nível 10 e escolha uma classe',
    desbloqueado: ({ player }) => player.classe !== null,
  },
  {
    id: 'lobo-solitario',
    nome: 'Lobo Solitário',
    descricao: 'Caça todos os dias, sem exceção.',
    requisito: 'Streak de 7 dias',
    desbloqueado: ({ player }) => player.melhor_streak >= 7,
  },
  {
    id: 'inabalavel',
    nome: 'Inabalável',
    descricao: 'Um mês inteiro sem falhar uma única quest diária.',
    requisito: 'Streak de 30 dias',
    desbloqueado: ({ player }) => player.melhor_streak >= 30,
  },
  {
    id: 'maquina-de-guerra',
    nome: 'Máquina de Guerra',
    descricao: 'Cem dias de disciplina absoluta.',
    requisito: 'Streak de 100 dias',
    desbloqueado: ({ player }) => player.melhor_streak >= 100,
  },
  {
    id: 'cacador-de-elite',
    nome: 'Caçador de Elite',
    descricao: 'Entrou para o grupo dos caçadores de alto nível.',
    requisito: 'Alcance o rank C (nível 20)',
    desbloqueado: ({ player }) => player.nivel >= 20,
  },
  {
    id: 'rank-nacional',
    nome: 'Caçador de Rank Nacional',
    descricao: 'Um dos poucos reconhecidos pelo próprio Estado.',
    requisito: 'Alcance o rank A (nível 40)',
    desbloqueado: ({ player }) => player.nivel >= 40,
  },
  {
    id: 'monarca-das-sombras',
    nome: 'Monarca das Sombras',
    descricao: 'Levante-se. O trono das sombras tem um novo dono.',
    requisito: 'Necromante no rank S (nível 50)',
    desbloqueado: ({ player }) =>
      player.classe === 'necromante' && player.nivel >= 50,
  },
  {
    id: 'lamina-fantasma',
    nome: 'Lâmina Fantasma',
    descricao: 'A morte silenciosa que caminha entre as sombras.',
    requisito: 'Assassino no rank S (nível 50)',
    desbloqueado: ({ player }) =>
      player.classe === 'assassino' && player.nivel >= 50,
  },
  {
    id: 'arquimago',
    nome: 'Arquimago',
    descricao: 'A mana obedece antes mesmo da palavra ser dita.',
    requisito: 'Mago no rank S (nível 50)',
    desbloqueado: ({ player }) => player.classe === 'mago' && player.nivel >= 50,
  },
  {
    id: 'punho-do-monarca',
    nome: 'Punho do Monarca',
    descricao: 'Cada golpe carrega o peso de uma montanha.',
    requisito: 'Lutador no rank S (nível 50)',
    desbloqueado: ({ player }) =>
      player.classe === 'lutador' && player.nivel >= 50,
  },
  {
    id: 'muralha-eterna',
    nome: 'Muralha Eterna',
    descricao: 'Nenhum portão caiu sob sua guarda.',
    requisito: 'Tank no rank S (nível 50)',
    desbloqueado: ({ player }) => player.classe === 'tank' && player.nivel >= 50,
  },
  {
    id: 'olho-do-ceu',
    nome: 'Olho do Céu',
    descricao: 'Vê o alvo antes do alvo saber que existe.',
    requisito: 'Ranger no rank S (nível 50)',
    desbloqueado: ({ player }) =>
      player.classe === 'ranger' && player.nivel >= 50,
  },
  {
    id: 'incansavel',
    nome: 'Incansável',
    descricao: 'Quinhentas quests concluídas. O grind nunca para.',
    requisito: 'Conclua 500 quests',
    desbloqueado: ({ totalQuestsConcluidas }) => totalQuestsConcluidas >= 500,
  },
]

export function getTitulo(id: string | null): Titulo | null {
  return TITULOS.find((t) => t.id === id) ?? null
}

export function titulosDesbloqueados(ctx: ContextoTitulo): Titulo[] {
  return TITULOS.filter((t) => t.desbloqueado(ctx))
}
