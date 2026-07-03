'use client'

import { useActionState } from 'react'
import { signIn, type LoginState } from './actions'

const initial: LoginState = {}

const inputClasses = `h-12 px-4 bg-system-950/80 border border-system-800
  font-system-body text-base text-system-100 tracking-wide
  focus:outline-none focus:border-system-500 focus:shadow-glow-system
  transition-all placeholder:text-system-700`

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}

      <label className="flex flex-col gap-1.5">
        <span className="font-system-display text-xs uppercase tracking-[0.2em] text-system-400">
          E-mail
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-system-display text-xs uppercase tracking-[0.2em] text-system-400">
          Senha
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClasses}
        />
      </label>

      {state.error && (
        <p
          role="alert"
          className="font-system-display text-xs tracking-widest text-red-400 animate-system-pop"
        >
          ⚠ {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 mt-2 holo-panel font-system-display text-sm font-bold uppercase
                   tracking-[0.25em] text-system-300 hover:text-glow-system
                   hover:shadow-glow-system disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all cursor-pointer"
      >
        {pending ? 'Autenticando…' : 'Entrar no Sistema'}
      </button>
    </form>
  )
}
