// Proxy (antigo "middleware" — renomeado no Next 16). Roda antes das rotas:
// 1) renova a sessão do Supabase (mantém o cookie de auth fresco);
// 2) protege /dashboard — sem sessão, manda para o login.
//
// Importante: o proxy é a 1ª linha, NÃO a única. A autorização real (papel,
// dono do dado) é reforçada nos Server Actions e no RLS. Ver web-app-security.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // SISTEMA_HOME=1 (env do deploy): este deploy é do app pessoal — a raiz
  // vira a porta do Sistema. Sem a env, a raiz segue sendo o site do salão.
  if (process.env.SISTEMA_HOME === '1' && request.nextUrl.pathname === '/') {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/sistema'
    return NextResponse.redirect(redirect)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Antes de provisionar o Supabase, o site segue funcionando normalmente.
  if (!url || !anon) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // getUser() valida o JWT no servidor (não confiar só no cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isDashboard = pathname.startsWith('/dashboard')
  const isLogin = pathname === '/dashboard/login'

  if (isDashboard && !isLogin && !user) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/dashboard/login'
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  // "O Sistema" (/sistema) — mesmo esquema do dashboard, com login próprio.
  const isSistema = pathname.startsWith('/sistema')
  const isSistemaLogin = pathname === '/sistema/login'

  if (isSistema && !isSistemaLogin && !user) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/sistema/login'
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  return response
}

export const config = {
  // Roda em tudo, menos estáticos e imagens.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.svg|opengraph-image|sistema-sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)',
  ],
}
