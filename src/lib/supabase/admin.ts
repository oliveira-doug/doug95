// Cliente Supabase com SERVICE ROLE — chave-mestra que BYPASSA o RLS.
// ⚠️ Só em servidor confiável (ex.: Server Action validando o self-booking,
// webhook de pagamento). NUNCA importar em código client. A chave é secreta —
// jamais com prefixo NEXT_PUBLIC. Se vazar, vaza o banco inteiro.

import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY não definida no servidor')

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
