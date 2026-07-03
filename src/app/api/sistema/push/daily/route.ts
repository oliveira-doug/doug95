// Push diário do Sistema: "suas quests estão disponíveis".
// Chamada pelo cron da Vercel (vercel.json) — a Vercel envia automaticamente
// Authorization: Bearer ${CRON_SECRET} quando essa env existe no projeto.
// Usa o client admin (bypassa RLS) para varrer todos os jogadores.

import { NextResponse, after } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { hojeLocal } from '@/app/sistema/_lib/dias'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: 'VAPID não configurado' }, { status: 503 })
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
    publicKey,
    privateKey,
  )

  const supabase = createAdminClient()
  const hoje = hojeLocal()

  const [inscricoes, quests, conclusoes] = await Promise.all([
    supabase.from('sistema_push_subscriptions').select('*'),
    supabase.from('sistema_quests').select('id, user_id').eq('ativo', true),
    supabase
      .from('sistema_quest_conclusoes')
      .select('quest_id, user_id')
      .eq('dia', hoje),
  ])

  // pendentes por usuário = quests ativas − concluídas hoje
  const feitas = new Set(
    (conclusoes.data ?? []).map((c) => `${c.user_id}:${c.quest_id}`),
  )
  const pendentesPorUser = new Map<string, number>()
  for (const q of quests.data ?? []) {
    if (!feitas.has(`${q.user_id}:${q.id}`)) {
      pendentesPorUser.set(q.user_id, (pendentesPorUser.get(q.user_id) ?? 0) + 1)
    }
  }

  let enviados = 0
  const mortas: string[] = []

  await Promise.allSettled(
    (inscricoes.data ?? []).map(async (sub) => {
      const pendentes = pendentesPorUser.get(sub.user_id) ?? 0
      if (pendentes === 0) return
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            title: '⚠ O Sistema',
            body: `Quest diária disponível: ${pendentes} pendente(s). A penalidade aguarda os fracos.`,
            url: '/sistema/quests',
            tag: 'quest-diaria',
          }),
        )
        enviados++
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) mortas.push(sub.endpoint)
      }
    }),
  )

  // limpa inscrições de aparelhos que sumiram, fora do caminho da resposta
  if (mortas.length > 0) {
    after(async () => {
      await supabase
        .from('sistema_push_subscriptions')
        .delete()
        .in('endpoint', mortas)
    })
  }

  return NextResponse.json({ enviados, removidas: mortas.length })
}
