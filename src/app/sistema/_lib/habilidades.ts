// Catálogo de habilidades — 1 ponto de habilidade por nível ganho.
// Desbloquear custa 1 ponto; cada melhoria custa mais 1 (até nivelMax).
// Habilidades de classe só aparecem para a classe correspondente.

import type { ClasseId } from './classes'

export type Habilidade = {
  id: string
  nome: string
  descricao: string
  classe: ClasseId | null // null = geral (qualquer jogador)
  nivelMax: number
  nivelJogadorMinimo: number
  icone: string // slug do IconeSistema
}

export const HABILIDADES: Habilidade[] = [
  // ── Gerais ──
  {
    id: 'vontade-inabalavel',
    nome: 'Vontade Inabalável',
    descricao: 'A determinação de quem se recusa a desistir. +Foco nas quests diárias.',
    classe: null,
    nivelMax: 5,
    nivelJogadorMinimo: 1,
    icone: 'chama',
  },
  {
    id: 'percepcao-aguda',
    nome: 'Percepção Aguda',
    descricao: 'Detecta oportunidades (e perigos) antes de todos.',
    classe: null,
    nivelMax: 5,
    nivelJogadorMinimo: 3,
    icone: 'olho',
  },
  {
    id: 'recuperacao-acelerada',
    nome: 'Recuperação Acelerada',
    descricao: 'Descansa menos, rende mais. O corpo se reconstrói sozinho.',
    classe: null,
    nivelMax: 5,
    nivelJogadorMinimo: 5,
    icone: 'coracao',
  },
  {
    id: 'instinto-de-batalha',
    nome: 'Instinto de Batalha',
    descricao: 'O corpo reage antes do pensamento.',
    classe: null,
    nivelMax: 5,
    nivelJogadorMinimo: 8,
    icone: 'raio',
  },
  // ── Assassino ──
  {
    id: 'furtividade',
    nome: 'Furtividade',
    descricao: 'Desaparece da percepção de qualquer observador.',
    classe: 'assassino',
    nivelMax: 5,
    nivelJogadorMinimo: 10,
    icone: 'sombra',
  },
  {
    id: 'investida-mortal',
    nome: 'Investida Mortal',
    descricao: 'Um passo, um corte, um fim.',
    classe: 'assassino',
    nivelMax: 5,
    nivelJogadorMinimo: 15,
    icone: 'adaga',
  },
  {
    id: 'danca-das-laminas',
    nome: 'Dança das Lâminas',
    descricao: 'Ataques em sequência impossível de acompanhar.',
    classe: 'assassino',
    nivelMax: 3,
    nivelJogadorMinimo: 25,
    icone: 'espadas',
  },
  // ── Mago ──
  {
    id: 'projetil-de-mana',
    nome: 'Projétil de Mana',
    descricao: 'O feitiço fundamental, aperfeiçoado ao extremo.',
    classe: 'mago',
    nivelMax: 5,
    nivelJogadorMinimo: 10,
    icone: 'faisca',
  },
  {
    id: 'tempestade-arcana',
    nome: 'Tempestade Arcana',
    descricao: 'O céu escurece quando o Mago ergue o cajado.',
    classe: 'mago',
    nivelMax: 5,
    nivelJogadorMinimo: 15,
    icone: 'raio',
  },
  {
    id: 'dominio-de-mana',
    nome: 'Domínio de Mana',
    descricao: 'A mana ao redor obedece como parte do próprio corpo.',
    classe: 'mago',
    nivelMax: 3,
    nivelJogadorMinimo: 25,
    icone: 'gema',
  },
  // ── Necromante ──
  {
    id: 'extracao-de-sombras',
    nome: 'Extração de Sombras',
    descricao: '"Levante-se." O exército cresce a cada vitória.',
    classe: 'necromante',
    nivelMax: 5,
    nivelJogadorMinimo: 10,
    icone: 'caveira',
  },
  {
    id: 'troca-de-sombras',
    nome: 'Troca de Sombras',
    descricao: 'Troca de lugar com qualquer sombra do seu exército.',
    classe: 'necromante',
    nivelMax: 5,
    nivelJogadorMinimo: 15,
    icone: 'sombra',
  },
  {
    id: 'autoridade-do-monarca',
    nome: 'Autoridade do Monarca',
    descricao: 'A pressão da presença de um Monarca dobra o campo de batalha.',
    classe: 'necromante',
    nivelMax: 3,
    nivelJogadorMinimo: 25,
    icone: 'coroa',
  },
  // ── Lutador ──
  {
    id: 'punho-de-aco',
    nome: 'Punho de Aço',
    descricao: 'Os punhos endurecem além de qualquer metal.',
    classe: 'lutador',
    nivelMax: 5,
    nivelJogadorMinimo: 10,
    icone: 'punho',
  },
  {
    id: 'furia-crescente',
    nome: 'Fúria Crescente',
    descricao: 'Cada golpe recebido aumenta a força do contra-ataque.',
    classe: 'lutador',
    nivelMax: 5,
    nivelJogadorMinimo: 15,
    icone: 'chama',
  },
  {
    id: 'golpe-do-colosso',
    nome: 'Golpe do Colosso',
    descricao: 'Um único soco que racha o chão da dungeon.',
    classe: 'lutador',
    nivelMax: 3,
    nivelJogadorMinimo: 25,
    icone: 'martelo',
  },
  // ── Tank ──
  {
    id: 'postura-de-ferro',
    nome: 'Postura de Ferro',
    descricao: 'Imóvel. Inabalável. Intransponível.',
    classe: 'tank',
    nivelMax: 5,
    nivelJogadorMinimo: 10,
    icone: 'escudo',
  },
  {
    id: 'provocacao',
    nome: 'Provocação',
    descricao: 'Todo inimigo no raio de visão ataca você — e se arrepende.',
    classe: 'tank',
    nivelMax: 5,
    nivelJogadorMinimo: 15,
    icone: 'alvo',
  },
  {
    id: 'fortaleza-viva',
    nome: 'Fortaleza Viva',
    descricao: 'Enquanto um aliado estiver de pé, o Tank não cai.',
    classe: 'tank',
    nivelMax: 3,
    nivelJogadorMinimo: 25,
    icone: 'castelo',
  },
  // ── Ranger ──
  {
    id: 'tiro-certeiro',
    nome: 'Tiro Certeiro',
    descricao: 'A flecha encontra o alvo. Sempre.',
    classe: 'ranger',
    nivelMax: 5,
    nivelJogadorMinimo: 10,
    icone: 'arco',
  },
  {
    id: 'olhos-de-aguia',
    nome: 'Olhos de Águia',
    descricao: 'Enxerga o ponto fraco a um quilômetro de distância.',
    classe: 'ranger',
    nivelMax: 5,
    nivelJogadorMinimo: 15,
    icone: 'olho',
  },
  {
    id: 'chuva-de-flechas',
    nome: 'Chuva de Flechas',
    descricao: 'O céu inteiro vira ponta de flecha.',
    classe: 'ranger',
    nivelMax: 3,
    nivelJogadorMinimo: 25,
    icone: 'flechas',
  },
]

export function getHabilidade(id: string): Habilidade | null {
  return HABILIDADES.find((h) => h.id === id) ?? null
}

/** Habilidades visíveis para o jogador (gerais + da classe dele). */
export function habilidadesDisponiveis(classe: string | null): Habilidade[] {
  return HABILIDADES.filter((h) => h.classe === null || h.classe === classe)
}
