// Catálogo da Loja do Sistema — comprados com moedas (ganhas em quests,
// level-ups e conquistas). O banco guarda só o slug em sistema_inventario.

export type Slot = 'arma' | 'armadura' | 'escudo' | 'acessorio'
export type Raridade = 'comum' | 'raro' | 'epico' | 'lendario'

export type Item = {
  id: string
  nome: string
  descricao: string
  slot: Slot
  raridade: Raridade
  preco: number
  icone: string // slug do IconeSistema
  nivelMinimo: number
}

export const SLOTS: Record<Slot, string> = {
  arma: 'Arma',
  armadura: 'Armadura',
  escudo: 'Escudo',
  acessorio: 'Acessório',
}

export const RARIDADES: Record<
  Raridade,
  { nome: string; cor: string; borda: string }
> = {
  comum: { nome: 'Comum', cor: 'text-system-200', borda: 'border-system-800' },
  raro: { nome: 'Raro', cor: 'text-sky-300', borda: 'border-sky-500/40' },
  epico: { nome: 'Épico', cor: 'text-violet-300', borda: 'border-violet-500/40' },
  lendario: {
    nome: 'Lendário',
    cor: 'text-amber-300',
    borda: 'border-amber-400/50',
  },
}

export const ITENS: Item[] = [
  // ── Armas ──
  {
    id: 'espada-ferro',
    nome: 'Espada de Ferro',
    descricao: 'Simples, confiável, afiada. Toda lenda começa com uma dessas.',
    slot: 'arma',
    raridade: 'comum',
    preco: 150,
    icone: 'espada',
    nivelMinimo: 1,
  },
  {
    id: 'adaga-cacador',
    nome: 'Adagas do Caçador',
    descricao: 'Par de lâminas curtas balanceadas para golpes rápidos.',
    slot: 'arma',
    raridade: 'comum',
    preco: 200,
    icone: 'adaga',
    nivelMinimo: 1,
  },
  {
    id: 'cajado-aprendiz',
    nome: 'Cajado do Aprendiz',
    descricao: 'Um núcleo de mana instável, mas funcional.',
    slot: 'arma',
    raridade: 'comum',
    preco: 200,
    icone: 'cajado',
    nivelMinimo: 1,
  },
  {
    id: 'faca-do-cacador-b',
    nome: 'Faca de Caçador Rank B',
    descricao: 'Forjada com essência de portão. Corta aço como papel.',
    slot: 'arma',
    raridade: 'raro',
    preco: 800,
    icone: 'adaga',
    nivelMinimo: 10,
  },
  {
    id: 'espada-cavaleiro-sangue',
    nome: 'Espada do Cavaleiro de Sangue',
    descricao: 'Despojo de um chefe de dungeon. Sussurra em batalha.',
    slot: 'arma',
    raridade: 'epico',
    preco: 2500,
    icone: 'espada',
    nivelMinimo: 20,
  },
  {
    id: 'cajado-arcano',
    nome: 'Cajado Arcano do Abismo',
    descricao: 'Canaliza mana do outro lado dos portões.',
    slot: 'arma',
    raridade: 'epico',
    preco: 2500,
    icone: 'cajado',
    nivelMinimo: 20,
  },
  {
    id: 'adaga-demonio',
    nome: 'Adaga do Monarca Demônio',
    descricao: 'A lâmina que atravessou reis. Digna de um Monarca.',
    slot: 'arma',
    raridade: 'lendario',
    preco: 8000,
    icone: 'adaga',
    nivelMinimo: 40,
  },
  // ── Armaduras ──
  {
    id: 'armadura-couro',
    nome: 'Armadura de Couro',
    descricao: 'Leve e discreta. Não impressiona, mas salva vidas.',
    slot: 'armadura',
    raridade: 'comum',
    preco: 250,
    icone: 'armadura',
    nivelMinimo: 1,
  },
  {
    id: 'cota-malha-reforcada',
    nome: 'Cota de Malha Reforçada',
    descricao: 'Padrão dos esquadrões de elite das guildas.',
    slot: 'armadura',
    raridade: 'raro',
    preco: 1000,
    icone: 'armadura',
    nivelMinimo: 10,
  },
  {
    id: 'armadura-sombras',
    nome: 'Vestes das Sombras',
    descricao: 'Tecida com a escuridão de um portão rank S.',
    slot: 'armadura',
    raridade: 'epico',
    preco: 3000,
    icone: 'armadura',
    nivelMinimo: 25,
  },
  {
    id: 'armadura-monarca',
    nome: 'Armadura do Monarca',
    descricao: 'A presença dela sozinha faz inimigos recuarem.',
    slot: 'armadura',
    raridade: 'lendario',
    preco: 9000,
    icone: 'armadura',
    nivelMinimo: 45,
  },
  // ── Escudos ──
  {
    id: 'escudo-madeira',
    nome: 'Escudo de Madeira',
    descricao: 'Melhor que nada. Bem melhor que nada.',
    slot: 'escudo',
    raridade: 'comum',
    preco: 150,
    icone: 'escudo',
    nivelMinimo: 1,
  },
  {
    id: 'escudo-torre',
    nome: 'Escudo Torre de Aço',
    descricao: 'Uma parede portátil para segurar a linha de frente.',
    slot: 'escudo',
    raridade: 'raro',
    preco: 900,
    icone: 'escudo',
    nivelMinimo: 12,
  },
  {
    id: 'egide-portao',
    nome: 'Égide do Portão',
    descricao: 'Bloqueou o sopro de um dragão. Uma vez.',
    slot: 'escudo',
    raridade: 'epico',
    preco: 2800,
    icone: 'escudo',
    nivelMinimo: 25,
  },
  // ── Acessórios ──
  {
    id: 'anel-vigor',
    nome: 'Anel do Vigor',
    descricao: 'Reduz a fadiga do portador. Café em forma de anel.',
    slot: 'acessorio',
    raridade: 'comum',
    preco: 300,
    icone: 'anel',
    nivelMinimo: 1,
  },
  {
    id: 'colar-mana',
    nome: 'Colar de Cristal de Mana',
    descricao: 'Um fragmento de núcleo de portão lapidado.',
    slot: 'acessorio',
    raridade: 'raro',
    preco: 1200,
    icone: 'gema',
    nivelMinimo: 15,
  },
  {
    id: 'sino-do-despertar',
    nome: 'Sino do Despertar',
    descricao: 'Dizem que tocou sozinho no dia da Dupla Ascensão.',
    slot: 'acessorio',
    raridade: 'lendario',
    preco: 10000,
    icone: 'gema',
    nivelMinimo: 50,
  },
]

export function getItem(id: string): Item | null {
  return ITENS.find((i) => i.id === id) ?? null
}
