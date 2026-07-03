import type { Metadata } from 'next'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { InstallPrompt } from '@/components/sistema/molecules/InstallPrompt'
import { NotificationOptIn } from '@/components/sistema/molecules/NotificationOptIn'
import { requirePlayer } from '../../_lib/auth'
import { hojeLocal } from '../../_lib/dias'
import { signOut } from '../../login/actions'
import { NomeForm } from './NomeForm'

export const metadata: Metadata = { title: 'Configurações' }

export default async function ConfigPage() {
  const player = await requirePlayer()
  const supabase = await createClient()
  const hoje = hojeLocal()

  const [quests, conclusoes] = await Promise.all([
    supabase.from('sistema_quests').select('id').eq('ativo', true),
    supabase.from('sistema_quest_conclusoes').select('quest_id').eq('dia', hoje),
  ])
  const pendentes =
    (quests.data?.length ?? 0) -
    new Set((conclusoes.data ?? []).map((c) => c.quest_id)).size

  return (
    <main>
      <SystemHeading kicker="⚠ Configurações" title="Config" />
      <div className="space-y-4">
        <NomeForm nomeAtual={player.nome_cacador} />
        <NotificationOptIn questsPendentes={Math.max(0, pendentes)} />
        <InstallPrompt />

        <form action={signOut}>
          <button
            type="submit"
            className="w-full h-12 border border-red-500/40 flex items-center justify-center gap-2
                       font-system-display text-xs font-bold uppercase tracking-[0.25em]
                       text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={15} /> Sair do Sistema
          </button>
        </form>
      </div>
    </main>
  )
}
