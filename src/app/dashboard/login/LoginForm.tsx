'use client'

import { useActionState } from 'react'
import { signIn, type LoginState } from './actions'

const initial: LoginState = {}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}

      <label className="flex flex-col gap-1.5">
        <span className="font-accent text-body-sm font-medium text-charcoal-700">
          E-mail
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 px-4 rounded-badge bg-ivory-50 border border-ivory-300
                     font-body text-body-md text-charcoal-900
                     focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/30
                     transition-colors"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-accent text-body-sm font-medium text-charcoal-700">
          Senha
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 px-4 rounded-badge bg-ivory-50 border border-ivory-300
                     font-body text-body-md text-charcoal-900
                     focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/30
                     transition-colors"
        />
      </label>

      {state.error && (
        <p role="alert" className="font-body text-body-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 mt-2 rounded-badge bg-gradient-gold text-ivory-50
                   font-accent text-body-md font-medium tracking-wide
                   shadow-card-rest hover:shadow-card-hover hover:brightness-110
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transition-all duration-300 ease-smooth cursor-pointer
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
