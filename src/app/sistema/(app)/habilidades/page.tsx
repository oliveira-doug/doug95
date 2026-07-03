import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { requirePlayer } from '../../_lib/auth'
import { habilidadesDisponiveis } from '../../_lib/habilidades'
import { HabilidadesBoard } from './HabilidadesBoard'

export const metadata: Metadata = { title: 'Habilidades' }

export default async function HabilidadesPage() {
  const player = await requirePlayer()
  const supabase = await createClient()
  const { data: aprendidas } = await supabase
    .from('sistema_habilidades')
    .select('habilidade_id, nivel')

  const niveis = Object.fromEntries(
    (aprendidas ?? []).map((h) => [h.habilidade_id, h.nivel]),
  )

  return (
    <main>
      <SystemHeading
        kicker="⚠ Habilidades"
        title="Skills"
        subtitle="Cada nível concede 1 ponto. Desbloqueie novas habilidades ou evolua as que já domina."
      />
      {!player.classe && (
        <p className="font-system-body text-sm text-system-400 mb-4">
          Habilidades de classe serão liberadas após o{' '}
          <Link href="/sistema/classe" className="text-system-300 underline">
            Despertar
          </Link>
          .
        </p>
      )}
      <HabilidadesBoard
        habilidades={habilidadesDisponiveis(player.classe)}
        niveis={niveis}
        nivelJogador={player.nivel}
        pontos={player.pontos_habilidade}
      />
    </main>
  )
}
