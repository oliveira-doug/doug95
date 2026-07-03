'use client'

// Notificações v1 (sem servidor): pede permissão e, com quests pendentes,
// mostra um lembrete local via service worker ao abrir o app.

import { useEffect, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { useMounted } from '../useMounted'

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
