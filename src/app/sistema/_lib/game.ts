// Regras centrais de progressão do Sistema.
// ATENÇÃO: curva de XP e ranks estão DUPLICADOS nas funções SQL
// sistema_xp_para_proximo_nivel / sistema_rank_do_nivel
// (supabase/migrations/*_sistema.sql). Alterou aqui, altere lá.

/** Custo em XP do nível n → n+1. */
export function xpParaProximoNivel(n: number): number {
  return Math.floor(100 * Math.pow(n, 1.5))
}

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'

/** Rank de caçador derivado do nível (nunca persistido). */
export function rankDoNivel(n: number): Rank {
  if (n >= 50) return 'S'
  if (n >= 40) return 'A'
  if (n >= 30) return 'B'
  if (n >= 20) return 'C'
  if (n >= 10) return 'D'
  return 'E'
}

export const RANKS: Record<Rank, { nome: string; cor: string }> = {
  E: { nome: 'Caçador Rank E', cor: 'text-system-200' },
  D: { nome: 'Caçador Rank D', cor: 'text-emerald-300' },
  C: { nome: 'Caçador Rank C', cor: 'text-sky-300' },
  B: { nome: 'Caçador Rank B', cor: 'text-violet-300' },
  A: { nome: 'Caçador Rank A', cor: 'text-amber-300' },
  S: { nome: 'Caçador Rank S', cor: 'text-red-400' },
}

/** Nível em que o Despertar (escolha de classe) fica disponível. */
export const NIVEL_DESPERTAR = 10

/** Recompensas por nível ganho (espelham a RPC sistema_concluir_quest). */
export const PONTOS_ATRIBUTO_POR_NIVEL = 3
export const PONTOS_HABILIDADE_POR_NIVEL = 1
export const MOEDAS_POR_NIVEL = 50 // × nível alcançado
