import type { Metadata } from 'next'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { SystemPanel } from '@/components/sistema/atoms/SystemPanel'
import { IconeSistema } from '@/components/sistema/atoms/IconeSistema'
import { requirePlayer } from '../../_lib/auth'
import { CLASSES, getClasse } from '../../_lib/classes'
import { NIVEL_DESPERTAR } from '../../_lib/game'
import { ClassePicker } from './ClassePicker'

export const metadata: Metadata = { title: 'Classe' }

export default async function ClassePage() {
  const player = await requirePlayer()
  const classe = getClasse(player.classe)

  if (classe) {
    return (
      <main>
        <SystemHeading kicker="⚠ Despertar concluído" title="Sua classe" />
        <SystemPanel className="text-center py-8">
          <IconeSistema
            slug={classe.icone}
            size={48}
            className={`${classe.cor} mx-auto`}
          />
          <p className="font-system-display text-2xl font-bold uppercase tracking-[0.15em] text-glow-system mt-4">
            {classe.nome}
          </p>
          <p className="font-system-body text-sm text-system-400 mt-2 max-w-xs mx-auto leading-relaxed">
            {classe.descricao}
          </p>
        </SystemPanel>
      </main>
    )
  }

  if (player.nivel < NIVEL_DESPERTAR) {
    return (
      <main>
        <SystemHeading kicker="⚠ Bloqueado" title="Despertar" />
        <SystemPanel className="text-center py-8">
          <p className="font-system-display text-lg font-bold uppercase tracking-[0.15em] text-system-500">
            Requisito não cumprido
          </p>
          <p className="font-system-body text-sm text-system-400 mt-2">
            A quest de mudança de classe é liberada no nível{' '}
            <strong className="text-system-300">{NIVEL_DESPERTAR}</strong>.
            Você está no nível {player.nivel} — continue caçando.
          </p>
        </SystemPanel>
      </main>
    )
  }

  return (
    <main>
      <SystemHeading
        kicker="⚠ Quest de mudança de classe"
        title="Despertar"
        subtitle="Escolha o caminho que definirá sua jornada. Esta decisão é permanente."
      />
      <ClassePicker classes={CLASSES} />
    </main>
  )
}
