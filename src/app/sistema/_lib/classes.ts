// Catálogo de classes — escolhidas no Despertar (nível 10, ver NIVEL_DESPERTAR).
// A escolha é definitiva (fiel ao "job change" de Solo Leveling).

export type ClasseId =
  | 'assassino'
  | 'mago'
  | 'necromante'
  | 'lutador'
  | 'tank'
  | 'ranger'

export type Classe = {
  id: ClasseId
  nome: string
  descricao: string
  icone: string // slug do IconeSistema
  cor: string // classe Tailwind de texto
}

export const CLASSES: Classe[] = [
  {
    id: 'assassino',
    nome: 'Assassino',
    descricao:
      'Mestre das sombras e das adagas. Ataca onde ninguém vê e desaparece antes do contra-ataque.',
    icone: 'adaga',
    cor: 'text-violet-300',
  },
  {
    id: 'mago',
    nome: 'Mago',
    descricao:
      'Canaliza mana pura em destruição arcana. Frágil de perto, devastador à distância.',
    icone: 'cajado',
    cor: 'text-sky-300',
  },
  {
    id: 'necromante',
    nome: 'Necromante',
    descricao:
      'Comanda um exército que não conhece o medo. O caminho do Monarca das Sombras.',
    icone: 'caveira',
    cor: 'text-purple-400',
  },
  {
    id: 'lutador',
    nome: 'Lutador',
    descricao:
      'O corpo é a arma definitiva. Força e técnica levadas ao limite humano — e além.',
    icone: 'punho',
    cor: 'text-orange-300',
  },
  {
    id: 'tank',
    nome: 'Tank',
    descricao:
      'A muralha da linha de frente. Enquanto o Tank estiver de pé, ninguém cai.',
    icone: 'escudo',
    cor: 'text-emerald-300',
  },
  {
    id: 'ranger',
    nome: 'Ranger',
    descricao:
      'Olhos de águia, flechas certeiras. Nenhum alvo escapa da sua percepção.',
    icone: 'arco',
    cor: 'text-lime-300',
  },
]

export function getClasse(id: string | null): Classe | null {
  return CLASSES.find((c) => c.id === id) ?? null
}
