'use client'

// Notificações v1 (sem servidor): pede permissão e, com quests pendentes,
// mostra um lembrete local via service worker ao abrir o app.

import { useEffect, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { useMounted } from '../useMounted'
import { salvarInscricaoPush } from '@/app/sistema/(app)/config/actions'

// Chave pública VAPID (opcional). Sem ela, o app fica só com o lembrete
// local ao abrir; com ela, também recebe o push diário do servidor.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/** Inscreve o aparelho no web push (se houver chave VAPID configurada). */
async function inscreverPush() {
  if (!VAPID_PUBLIC_KEY || !('PushManager' in window)) return
  try {
    const registration = await navigator.serviceWorker.ready
    const sub =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }))
    await salvarInscricaoPush(JSON.parse(JSON.stringify(sub)))
  } catch {
    /* push é opcional — o lembrete local continua funcionando */
  }
}

export function NotificationOptIn({
  questsPendentes,
}: {
  questsPendentes: number
}) {
  const mounted = useMounted()
  // null = ainda não interagiu nesta sessão; lê Notification.permission direto.
  const [permissaoNova, setPermissaoNova] =
    useState<NotificationPermission | null>(null)

  const suportado =
    mounted && 'Notification' in window && 'serviceWorker' in navigator
  const permissao = suportado
    ? (permissaoNova ?? Notification.permission)
    : 'default'

  // Com permissão concedida, garante a inscrição de push deste aparelho.
  useEffect(() => {
    if (suportado && permissao === 'granted') void inscreverPush()
  }, [suportado, permissao])

  // Lembrete local ao abrir com quests pendentes (1×/dia por sessão) —
  // efeito puro de sistema externo, sem setState.
  useEffect(() => {
    if (!suportado || permissao !== 'granted' || questsPendentes === 0) return
    const hoje = new Date().toDateString()
    if (sessionStorage.getItem('sistema-lembrete') === hoje) return
    sessionStorage.setItem('sistema-lembrete', hoje)

    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification('⚠ O Sistema', {
        body: `Você tem ${questsPendentes} quest(s) diária(s) pendente(s). A penalidade aguarda os fracos.`,
        icon: '/sistema/icons/icon-192.png',
        badge: '/sistema/icons/icon-192.png',
        tag: 'quests-pendentes',
      })
    })
    if ('setAppBadge' in navigator) {
      ;(
        navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }
      ).setAppBadge(questsPendentes)
    }
  }, [suportado, permissao, questsPendentes])

  if (!suportado) return null

  return (
    <div className="holo-panel p-4">
      <p className="font-system-display text-xs font-bold uppercase tracking-[0.25em] text-system-300 flex items-center gap-2">
        {permissao === 'granted' ? <BellRing size={14} /> : <Bell size={14} />}{' '}
        Notificações
      </p>
      {permissao === 'granted' ? (
        <p className="font-system-body text-sm text-system-400 mt-2">
          Ativadas — o Sistema vai lembrá-lo das quests pendentes ao abrir o
          app.
        </p>
      ) : permissao === 'denied' ? (
        <p className="font-system-body text-sm text-system-400 mt-2">
          Bloqueadas no navegador. Libere nas configurações do site para
          receber lembretes.
        </p>
      ) : (
        <button
          type="button"
          onClick={async () =>
            setPermissaoNova(await Notification.requestPermission())
          }
          className="w-full h-11 mt-3 holo-panel font-system-display text-xs font-bold uppercase
                     tracking-[0.2em] text-system-300 hover:shadow-glow-system transition-all cursor-pointer"
        >
          Ativar notificações
        </button>
      )}
    </div>
  )
}
