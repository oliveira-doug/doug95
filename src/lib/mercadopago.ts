// Cliente do Mercado Pago (Checkout Pro) — SOMENTE servidor.
// O Access Token é secreto: nunca com prefixo NEXT_PUBLIC, nunca no client.
// Usamos a API REST diretamente (sem SDK) para manter o bundle leve.

import 'server-only'
import type { PagamentoMetodo } from '@/lib/supabase/types'

const API = 'https://api.mercadopago.com'

function token(): string {
  const t = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!t) throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado')
  return t
}

/** O gateway está configurado? (Para a UI avisar antes de tentar cobrar.) */
export function mercadoPagoConfigurado(): boolean {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN)
}

type CriarPreferenciaInput = {
  valor: number
  descricao: string
  /** Correlação com a nossa linha de pagamento (volta no webhook). */
  externalReference: string
  notificationUrl: string
  backUrl: string
  pagadorNome?: string
}

type Preferencia = { id: string; initPoint: string }

/** Cria uma preferência (link de checkout) onde o cliente escolhe como pagar. */
export async function criarPreferencia(
  input: CriarPreferenciaInput,
): Promise<Preferencia> {
  const res = await fetch(`${API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [
        {
          title: input.descricao,
          quantity: 1,
          unit_price: input.valor,
          currency_id: 'BRL',
        },
      ],
      external_reference: input.externalReference,
      notification_url: input.notificationUrl,
      back_urls: {
        success: input.backUrl,
        pending: input.backUrl,
        failure: input.backUrl,
      },
      ...(input.pagadorNome ? { payer: { name: input.pagadorNome } } : {}),
    }),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Mercado Pago (preferência) ${res.status}: ${txt}`)
  }

  const data = (await res.json()) as {
    id: string
    init_point?: string
    sandbox_init_point?: string
  }
  const initPoint = data.init_point ?? data.sandbox_init_point
  if (!initPoint) throw new Error('Mercado Pago não retornou o link de pagamento.')

  return { id: String(data.id), initPoint }
}

type PagamentoMP = {
  id: number
  status: string // approved | pending | rejected | ...
  external_reference: string | null
  payment_type_id: string | null // credit_card | bank_transfer | account_money | ...
}

/** Consulta um pagamento (fonte da verdade — nunca confiar só na notificação). */
export async function consultarPagamento(paymentId: string): Promise<PagamentoMP> {
  const res = await fetch(`${API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Mercado Pago (pagamento) ${res.status}: ${txt}`)
  }
  return (await res.json()) as PagamentoMP
}

/** Traduz o tipo de pagamento do MP para o nosso enum de método. */
export function metodoDoTipoMP(paymentTypeId: string | null): PagamentoMetodo {
  switch (paymentTypeId) {
    case 'credit_card':
    case 'debit_card':
    case 'prepaid_card':
      return 'cartao'
    case 'bank_transfer': // Pix entra como bank_transfer
    case 'account_money': // saldo MP
      return 'pix'
    default:
      return 'link' // boleto/ticket e outros — mantém genérico
  }
}
