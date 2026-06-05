// Webhook do Mercado Pago — recebe a notificação de pagamento.
// Regra de ouro: NUNCA confiar na notificação crua. A gente (1) valida a
// assinatura e (2) reconsulta o pagamento na API do MP (fonte da verdade)
// antes de marcar como pago. Roda sem sessão de usuário → usa service role.

import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { consultarPagamento, metodoDoTipoMP } from '@/lib/mercadopago'

export const runtime = 'nodejs'

/**
 * Valida a assinatura (x-signature) conforme o esquema do Mercado Pago.
 * Manifesto: `id:<dataId>;request-id:<x-request-id>;ts:<ts>;`
 * Se o segredo não estiver configurado, pulamos (a reconsulta na API ainda
 * protege contra falsificação de "pago").
 */
function assinaturaValida(req: Request, dataId: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
  if (!secret) return true // sem segredo configurado → não bloqueia (dev/sandbox)

  const signature = req.headers.get('x-signature')
  const requestId = req.headers.get('x-request-id')
  if (!signature || !requestId) return false

  const parts = Object.fromEntries(
    signature.split(',').map((kv) => kv.split('=').map((s) => s.trim()) as [string, string]),
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const esperado = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(v1))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  // Respondemos 200 quase sempre: o MP reenvia em erro, e não queremos loop.
  try {
    const url = new URL(req.url)
    const body = await req.json().catch(() => ({}) as Record<string, unknown>)

    const tipo =
      url.searchParams.get('type') ??
      url.searchParams.get('topic') ??
      (body as { type?: string }).type

    // Só tratamos eventos de pagamento.
    if (tipo !== 'payment') return NextResponse.json({ ok: true })

    const dataId =
      url.searchParams.get('data.id') ??
      url.searchParams.get('id') ??
      (body as { data?: { id?: string } }).data?.id

    if (!dataId) return NextResponse.json({ ok: true })

    if (!assinaturaValida(req, String(dataId))) {
      return NextResponse.json({ erro: 'assinatura inválida' }, { status: 401 })
    }

    // Fonte da verdade: consulta o pagamento real no MP.
    const pago = await consultarPagamento(String(dataId))
    if (pago.status !== 'approved' || !pago.external_reference) {
      return NextResponse.json({ ok: true }) // ainda não aprovado → ignora
    }

    // Atualiza nossa linha (idempotente: só se ainda não estava paga).
    const supabase = createAdminClient()
    await supabase
      .from('pagamentos')
      .update({
        status: 'pago',
        metodo: metodoDoTipoMP(pago.payment_type_id),
        ref_gateway: String(pago.id),
      })
      .eq('id', pago.external_reference)
      .neq('status', 'pago')

    return NextResponse.json({ ok: true })
  } catch {
    // Erro inesperado: 500 faz o MP reenviar mais tarde.
    return NextResponse.json({ erro: 'falha ao processar' }, { status: 500 })
  }
}
