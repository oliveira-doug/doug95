'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
  next: z.string().optional(),
})

export type LoginState = { error?: string }

export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Preencha e-mail e senha corretamente.' }

  const { email, password, next } = parsed.data
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  // Mensagem genérica — não revela se o e-mail existe (segurança).
  if (error) return { error: 'E-mail ou senha incorretos.' }

  redirect(next && next.startsWith('/dashboard') ? next : '/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/dashboard/login')
}
