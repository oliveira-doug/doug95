// Cliente Supabase para o BROWSER (componentes 'use client').
// Usa a ANON KEY (pública) e está sujeito ao RLS.

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
