'use client'

// Instalação da PWA: botão nativo no Android/Chrome (beforeinstallprompt)
// e instrução manual no iOS (Safari não expõe o prompt).

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { useMounted } from '../useMounted'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
}

export function InstallPrompt() {
  const mounted = useMounted()
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!mounted) return null

  const instalado = window.matchMedia('(display-mode: standalone)').matches
  if (instalado) return null
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  return (
    <div className="holo-panel p-4">
      <p className="font-system-display text-xs font-bold uppercase tracking-[0.25em] text-system-300 flex items-center gap-2">
        <Download size={14} /> Instalar o Sistema
      </p>
      {promptEvent ? (
        <button
          type="button"
          onClick={() => promptEvent.prompt()}
          className="w-full h-11 mt-3 holo-panel font-system-display text-xs font-bold uppercase
                     tracking-[0.2em] text-system-300 hover:shadow-glow-system transition-all cursor-pointer"
        >
          Adicionar à tela inicial
        </button>
      ) : (
        <p className="font-system-body text-sm text-system-400 mt-2 leading-relaxed">
          {isIOS
            ? 'No Safari: toque em Compartilhar (⎋) e depois em "Adicionar à Tela de Início".'
            : 'No menu do navegador, escolha "Instalar aplicativo" ou "Adicionar à tela inicial".'}
        </p>
      )}
    </div>
  )
}
