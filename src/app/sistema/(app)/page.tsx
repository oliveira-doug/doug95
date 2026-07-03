import Link from 'next/link'
import { ChevronRight, Coins, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SystemPanel } from '@/components/sistema/atoms/SystemPanel'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { XpBar } from '@/components/sistema/atoms/XpBar'
import { RankBadge } from '@/components/sistema/atoms/RankBadge'
import { IconeSistema } from '@/components/sistema/atoms/IconeSistema'
import { requirePlayer } from '../_lib/auth'
import { hojeLocal } from '../_lib/dias'
import { NIVEL_DESPERTAR, rankDoNivel, xpParaProximoNivel } from '../_lib/game'
import { getClasse } from '../_lib/classes'
import { getTitulo } from '../_lib/titulos'
import { getItem } from '../_lib/itens'

export default async function StatusPage() {
  const player = await requirePlayer()
  const supabase = await createClient()
  const hoje = hojeLocal()

  const [atributos, quests, conclusoes, equipados] = await Promise.all([
    supabase.from('sistema_atributos').select('*').order('ordem'),
    supabase.from('sistema_quests').select('id').eq('ativo', true),
    supabase.from('sistema_quest_conclusoes').select('quest_id').eq('dia', hoje),
    supabase.from('sistema_inventario').select('*').eq('equipado', true),
  ])

  const rank = rankDoNivel(player.nivel)
  const classe = getClasse(player.classe)
  const titulo = getTitulo(player.titulo)
  const totalQuests = quests.data?.length ?? 0
  const feitasHoje = new Set(
    (conclusoes.data ?? []).map((c) => c.quest_id),
  ).size
  const podeDespertar = player.nivel >= NIVEL_DESPERTAR && !player.classe
  const itensEquipados = (equipados.data ?? [])
    .map((i) => getItem(i.item_id))
    .filter((i) => i !== null)

  return (
    <main>
      <SystemHeading kicker="⚠ Janela de Status" title={player.nome_cacador} />

      {podeDespertar && (
        <Link
          href="/sistema/classe"
          className="holo-panel border-amber-400/60 p-4 mb-4 flex items-center justify-between animate-system-flicker"
        >
          <div>
            <p className="font-system-display text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
              ⚠ Quest de mudança de classe
            </p>
            <p className="font-system-body text-sm text-system-300 mt-1">
              Você atingiu o nível {NIVEL_DESPERTAR}. Desperte sua classe.
            </p>
          </div>
          <ChevronRight className="text-amber-300 shrink-0" />
        </Link>
      )}

      {/* Identidade: rank, nível, classe, título */}
      <SystemPanel className="mb-4">
        <div className="flex items-center gap-4">
          <RankBadge rank={rank} size="lg" />
          <div className="min-w-0">
            <p className="font-system-display text-3xl font-black text-system-100">
              Nv. {player.nivel}
            </p>
            <p className="font-system-body text-sm text-system-400 tracking-wide truncate">
              {classe ? classe.nome : 'Sem classe'}
              {titulo && (
                <span className="text-amber-200"> · {titulo.nome}</span>
              )}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <XpBar xp={player.xp} custo={xpParaProximoNivel(player.nivel)} />
        </div>
        <div className="flex items-center justify-between mt-3 font-system-body text-sm tracking-wide">
          <span className="flex items-center gap-1.5 text-amber-300">
            <Flame size={16} /> {player.streak_atual} dia(s)
          </span>
          <span className="flex items-center gap-1.5 text-amber-200">
            <Coins size={16} /> {player.moedas.toLocaleString('pt-BR')}
          </span>
          <span className="text-system-400">
            Melhor streak: {player.melhor_streak}
          </span>
        </div>
      </SystemPanel>

      {/* Quests do dia */}
      <Link href="/sistema/quests" className="block mb-4">
        <SystemPanel title="Quests diárias">
          <div className="flex items-center justify-between">
            <p className="font-system-body text-base text-system-200 tracking-wide">
              {feitasHoje} / {totalQuests} concluídas hoje
            </p>
            <ChevronRight className="text-system-500" size={18} />
          </div>
          <div className="h-1.5 bg-system-950 border border-system-800 mt-3 overflow-hidden">
            <div
              className="h-full bg-system-500/70 transition-[width] duration-500"
              style={{
                width: `${totalQuests ? Math.round((feitasHoje / totalQuests) * 100) : 0}%`,
              }}
            />
          </div>
        </SystemPanel>
      </Link>

      {/* Atributos */}
      <Link href="/sistema/atributos" className="block mb-4">
        <SystemPanel title="Atributos">
          <ul className="space-y-2.5">
            {(atributos.data ?? []).map((attr) => (
              <li
                key={attr.id}
                className="flex items-center justify-between font-system-body tracking-wide"
              >
                <span className="flex items-center gap-2.5 text-system-200">
                  <IconeSistema
                    slug={attr.icone}
                    size={16}
                    className="text-system-500"
                  />
                  {attr.nome}
                </span>
                <span className="font-system-display font-bold text-system-300">
                  {attr.valor}
                </span>
              </li>
            ))}
          </ul>
          {player.pontos_disponiveis > 0 && (
            <p className="font-system-display text-xs uppercase tracking-[0.2em] text-amber-300 mt-3 animate-pulse-soft">
              ▲ {player.pontos_disponiveis} ponto(s) para distribuir
            </p>
          )}
        </SystemPanel>
      </Link>

      {/* Equipamento */}
      {itensEquipados.length > 0 && (
        <SystemPanel title="Equipamento" className="mb-4">
          <ul className="flex flex-wrap gap-2">
            {itensEquipados.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 border border-system-800 px-3 py-1.5 font-system-body text-sm text-system-200"
              >
                <IconeSistema
                  slug={item.icone}
                  size={14}
                  className="text-system-400"
                />
                {item.nome}
              </li>
            ))}
          </ul>
        </SystemPanel>
      )}
    </main>
  )
}
