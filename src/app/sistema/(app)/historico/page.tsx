import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { requirePlayer } from '../../_lib/auth'
import type { SistemaLog, SistemaLogTipo } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Histórico' }

const ROTULOS: Record<SistemaLogTipo, { rotulo: string; cor: string }> = {
  quest_concluida: { rotulo: 'Quest', cor: 'text-system-300' },
  level_up: { rotulo: 'Level up', cor: 'text-amber-300' },
  rank_up: { rotulo: 'Rank up', cor: 'text-red-400' },
  penalidade: { rotulo: 'Penalidade', cor: 'text-red-400' },
  conquista: { rotulo: 'Conquista', cor: 'text-amber-200' },
  streak: { rotulo: 'Streak', cor: 'text-orange-300' },
  compra: { rotulo: 'Compra', cor: 'text-sky-300' },
  classe: { rotulo: 'Despertar', cor: 'text-violet-300' },
  titulo: { rotulo: 'Título', cor: 'text-amber-200' },
  habilidade: { rotulo: 'Habilidade', cor: 'text-system-300' },
  equipamento: { rotulo: 'Equipamento', cor: 'text-sky-300' },
}

function descreve(log: SistemaLog): string {
  const p = log.payload as Record<string, string | number | undefined>
  switch (log.tipo) {
    case 'quest_concluida':
      return `${p.quest} · +${p.xp} XP, +${p.moedas} moedas`
    case 'level_up':
      return `Nível ${p.nivel} · +${p.pontos} atributos, +${p.pontos_habilidade} skill, +${p.moedas} moedas`
    case 'rank_up':
      return `Promovido ao rank ${p.rank}`
    case 'penalidade':
      return `Streak de ${p.streak_perdido} dia(s) perdido — ${p.dias_perdidos} dia(s) sem completar as quests`
    case 'conquista':
      return `${p.conquista} · +${p.moedas} moedas`
    case 'streak':
      return `Streak de ${p.streak} dia(s)`
    case 'compra':
      return `${p.item} · -${p.preco} moedas`
    case 'classe':
      return `Despertou como ${p.classe}`
    case 'titulo':
      return `Título equipado: ${p.titulo}`
    case 'habilidade':
      return `${p.habilidade} · nível ${p.nivel}`
    case 'equipamento':
      return `Equipou ${p.item}`
  }
}

export default async function HistoricoPage() {
  await requirePlayer()
  const supabase = await createClient()
  const { data: logs } = await supabase
    .from('sistema_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <main>
      <SystemHeading
        kicker="⚠ Registro do Sistema"
        title="Histórico"
        subtitle="Os últimos 100 eventos da sua jornada."
      />
      <ol className="space-y-2">
        {(logs ?? []).map((log) => (
          <li
            key={log.id}
            className="border-l-2 border-system-800 pl-3 py-1.5"
          >
            <p className="flex items-baseline gap-2">
              <span
                className={cn(
                  'font-system-display text-[0.6rem] font-bold uppercase tracking-[0.2em] shrink-0',
                  ROTULOS[log.tipo].cor,
                )}
              >
                {ROTULOS[log.tipo].rotulo}
              </span>
              <span className="font-system-body text-[0.7rem] text-system-700 tracking-wider">
                {new Date(log.created_at).toLocaleString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
            <p className="font-system-body text-sm text-system-200 mt-0.5">
              {descreve(log)}
            </p>
          </li>
        ))}
        {(logs ?? []).length === 0 && (
          <p className="font-system-body text-sm text-system-500">
            Nenhum evento ainda. Conclua sua primeira quest.
          </p>
        )}
      </ol>
    </main>
  )
}
