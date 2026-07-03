// Mapa central slug → ícone lucide. Os catálogos (_lib) e o banco guardam
// apenas o slug; a UI resolve aqui. Slug desconhecido cai no padrão (zap).

import {
  Axe,
  BicepsFlexed,
  BowArrow,
  Brain,
  Castle,
  CircleCheck,
  Coins,
  Crown,
  Eye,
  Flame,
  Gem,
  Ghost,
  Hammer,
  Heart,
  Medal,
  Shield,
  ShieldHalf,
  ShoppingBag,
  Skull,
  Slice,
  Sparkles,
  Sword,
  Swords,
  Target,
  WandSparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const ICONES: Record<string, LucideIcon> = {
  punho: BicepsFlexed,
  raio: Zap,
  coracao: Heart,
  cerebro: Brain,
  olho: Eye,
  espada: Sword,
  espadas: Swords,
  adaga: Slice,
  machado: Axe,
  cajado: WandSparkles,
  arco: BowArrow,
  escudo: Shield,
  armadura: ShieldHalf,
  caveira: Skull,
  coroa: Crown,
  chama: Flame,
  faisca: Sparkles,
  sombra: Ghost,
  alvo: Target,
  castelo: Castle,
  martelo: Hammer,
  gema: Gem,
  anel: Gem,
  medalha: Medal,
  sacola: ShoppingBag,
  check: CircleCheck,
  moeda: Coins,
}

export function IconeSistema({
  slug,
  className,
  size,
}: {
  slug: string
  className?: string
  size?: number
}) {
  const Icone = ICONES[slug] ?? Zap
  return <Icone className={className} size={size} aria-hidden />
}
