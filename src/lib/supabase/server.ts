// Cliente Supabase para o SERVIDOR agindo como o usuário logado.
// Server Components, Server Actions e Route Handlers. Sujeito ao RLS.
// Em Next 16, cookies() é assíncrono — daí o await.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Em Server Components puros o set pode lançar (sem resposta para
          // escrever) — o refresh de sessão acontece no proxy.ts, então é
          // seguro ignorar aqui.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            /* chamado de um Server Component — ok ignorar */
          }
        },
      },
    },
  )
}
