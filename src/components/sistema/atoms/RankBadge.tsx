import { RANKS, type Rank } from '@/app/sistema/_lib/game'
import { cn } from '@/lib/utils'

/** Emblema do rank de caçador (E → S). */
export function RankBadge({
  rank,
  size = 'md',
}: {
  rank: Rank
  size?: 'md' | 'lg'
}) {
  return (
    <div
      className={cn(
        'holo-panel flex items-center justify-center font-system-display font-bold',
        RANKS[rank].cor,
        size === 'lg' ? 'w-16 h-16 text-4xl' : 'w-10 h-10 text-xl',
      )}
      title={RANKS[rank].nome}
    >
      {rank}
    </div>
  )
}
