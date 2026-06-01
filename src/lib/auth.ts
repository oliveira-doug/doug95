// Helpers de autenticação/autorização no servidor.
// Sempre via getUser() (valida o JWT) — nunca confiar só no cookie.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'

/** Perfil do usuário logado (com papel), ou null se não autenticado. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

/** Exige sessão. Sem ela, redireciona ao login. Retorna o perfil. */
export async function requireAuth(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect('/dashboard/login')
  return profile
}

/** Exige papel admin (Íra). Profissional/cliente são barrados. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireAuth()
  if (profile.papel !== 'admin') redirect('/dashboard')
  return profile
}
