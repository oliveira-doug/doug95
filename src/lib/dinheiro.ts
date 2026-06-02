// ── Dinheiro (Real brasileiro) ──────────────────────────────────────────────
// O banco guarda numeric(10,2). Aqui centralizamos formatação e parsing para
// não espalhar Intl/regex pela UI e evitar o clássico "150,00 virou 15000".

/** Formata um número como moeda BRL: 150 -> "R$ 150,00". */
export function formatarBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

/** Rótulos amigáveis das formas de pagamento. */
export const METODO_LABEL: Record<'pix' | 'cartao' | 'dinheiro', string> = {
  pix: 'Pix',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
}

/**
 * Converte o que o usuário digitou em número (>= 0) ou null se inválido.
 * Aceita "R$ 1.234,56", "1234,56", "150" e "150.00". Heurística: se houver
 * vírgula, ela é o separador decimal e pontos são milhar; sem vírgula, o ponto
 * é tratado como decimal (ex.: "150.00").
 */
export function parseBRL(input: string): number | null {
  let s = input.trim().replace(/[R$\s]/g, '')
  if (s === '') return null
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.')
  }
  const n = Number(s)
  return Number.isFinite(n) && n >= 0 ? n : null
}
