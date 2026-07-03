'use client'

// Flag "está no cliente, pós-hidratação" sem setState em effect
// (padrão sancionado: useSyncExternalStore com snapshots divergentes).

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
