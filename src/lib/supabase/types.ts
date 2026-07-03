// ── Tipos do banco (Supabase) ───────────────────────────────────────────────
// Mantidos à mão para refletir as migrations em supabase/migrations/.
// Usamos `type` (não `interface`): só type alias satisfaz a constraint
// Record<string, unknown> que o supabase-js exige para inferir Insert/Update.
// Para gerar automaticamente quando crescer:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts

export type Papel = 'admin' | 'profissional' | 'cliente'
export type AgendamentoStatus =
  | 'pendente'
  | 'confirmado'
  | 'em_atendimento'
  | 'concluido'
  | 'cancelado'
export type PagamentoMetodo = 'pix' | 'cartao' | 'dinheiro' | 'link'
export type PagamentoStatus = 'pendente' | 'pago' | 'estornado' | 'falhou'

export type Tenant = {
  id: string
  nome: string
  dominio: string | null
  ativo: boolean
  created_at: string
}

export type Profile = {
  id: string
  tenant_id: string
  nome: string
  telefone: string | null
  papel: Papel
  super_admin: boolean
  created_at: string
}

export type Profissional = {
  id: string
  tenant_id: string
  nome: string
  bio: string | null
  profile_id: string | null
  ativo: boolean
  ordem: number
  created_at: string
}

export type Servico = {
  id: string
  tenant_id: string
  nome: string
  categoria: string
  descricao: string | null
  duracao_min: number
  preco: number | null
  ativo: boolean
  ordem: number
  created_at: string
}

export type Horario = {
  id: string
  tenant_id: string
  profissional_id: string
  dia_semana: number
  abre: string
  fecha: string
}

export type Bloqueio = {
  id: string
  tenant_id: string
  profissional_id: string
  inicio: string
  fim: string
  motivo: string | null
  created_at: string
}

export type Agendamento = {
  id: string
  tenant_id: string
  profissional_id: string
  servico_id: string | null
  cliente_id: string | null
  cliente_nome: string
  cliente_telefone: string
  inicio: string
  fim: string
  status: AgendamentoStatus
  origem: string
  observacoes: string | null
  created_at: string
}

export type Atendimento = {
  id: string
  tenant_id: string
  agendamento_id: string | null
  profissional_id: string
  cliente_nome: string | null
  data: string
  total: number
  observacoes: string | null
  created_at: string
}

export type AtendimentoItem = {
  id: string
  tenant_id: string
  atendimento_id: string
  servico_id: string | null
  descricao: string
  valor: number
  created_at: string
}

export type Pagamento = {
  id: string
  tenant_id: string
  atendimento_id: string
  metodo: PagamentoMetodo
  valor: number
  status: PagamentoStatus
  ref_gateway: string | null
  link_url: string | null
  created_at: string
}

// ── "O Sistema" (/sistema) — app pessoal de gamificação ────────────────────
// Tabelas independentes do salão; ver supabase/migrations/*_sistema.sql.

export type SistemaLogTipo =
  | 'quest_concluida'
  | 'level_up'
  | 'rank_up'
  | 'penalidade'
  | 'conquista'
  | 'streak'
  | 'compra'
  | 'classe'
  | 'titulo'
  | 'habilidade'
  | 'equipamento'

export type SistemaPlayer = {
  user_id: string
  nome_cacador: string
  nivel: number
  xp: number
  xp_total: number
  pontos_disponiveis: number
  pontos_habilidade: number
  moedas: number
  classe: string | null
  titulo: string | null
  streak_atual: number
  melhor_streak: number
  ultimo_dia_processado: string | null
  ultimo_dia_streak: string | null
  created_at: string
  updated_at: string
}

export type SistemaAtributo = {
  id: string
  user_id: string
  nome: string
  valor: number
  icone: string
  ordem: number
  created_at: string
}

export type SistemaQuest = {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  xp_recompensa: number
  moedas_recompensa: number
  recompensa_atributos: Record<string, number>
  recorrencia: 'diaria'
  ativo: boolean
  ordem: number
  created_at: string
}

export type SistemaQuestConclusao = {
  id: string
  user_id: string
  quest_id: string | null
  titulo_snapshot: string
  dia: string
  xp_ganho: number
  concluida_em: string
}

export type SistemaConquistaDesbloqueada = {
  user_id: string
  conquista_id: string
  desbloqueada_em: string
}

export type SistemaInventarioItem = {
  user_id: string
  item_id: string
  slot: string
  equipado: boolean
  comprado_em: string
}

export type SistemaHabilidade = {
  user_id: string
  habilidade_id: string
  nivel: number
  desbloqueada_em: string
}

export type SistemaLog = {
  id: string
  user_id: string
  tipo: SistemaLogTipo
  payload: Record<string, unknown>
  created_at: string
}

export type SistemaPushSubscription = {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

/** Retorno da RPC sistema_concluir_quest. */
export type SistemaConcluirQuestResult = {
  leveled_up: boolean
  niveis_ganhos: number
  nivel_novo: number
  pontos_ganhos: number
  pontos_habilidade: number
  moedas_ganhas: number
  rank_up: boolean
  rank: string
  streak_ganho: boolean
  streak: number
}

// Estrutura que o supabase-js consome (genérico Database).
type Row<T> = {
  Row: T
  Insert: Partial<T>
  Update: Partial<T>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      tenants: Row<Tenant>
      profiles: Row<Profile>
      profissionais: Row<Profissional>
      servicos: Row<Servico>
      horarios: Row<Horario>
      bloqueios: Row<Bloqueio>
      agendamentos: Row<Agendamento>
      atendimentos: Row<Atendimento>
      atendimento_itens: Row<AtendimentoItem>
      pagamentos: Row<Pagamento>
      sistema_players: Row<SistemaPlayer>
      sistema_atributos: Row<SistemaAtributo>
      sistema_quests: Row<SistemaQuest>
      sistema_quest_conclusoes: Row<SistemaQuestConclusao>
      sistema_conquistas_desbloqueadas: Row<SistemaConquistaDesbloqueada>
      sistema_inventario: Row<SistemaInventarioItem>
      sistema_habilidades: Row<SistemaHabilidade>
      sistema_log: Row<SistemaLog>
      sistema_push_subscriptions: Row<SistemaPushSubscription>
    }
    Views: Record<string, never>
    Functions: {
      sistema_concluir_quest: {
        Args: { p_quest_id: string; p_dia: string }
        Returns: SistemaConcluirQuestResult
      }
      sistema_processar_dia: {
        Args: { p_hoje: string }
        Returns: { penalidade: boolean; dias_perdidos?: number }
      }
      sistema_comprar_item: {
        Args: { p_item_id: string; p_preco: number; p_slot: string; p_nome: string }
        Returns: { moedas_restantes: number }
      }
      sistema_gastar_ponto_habilidade: {
        Args: { p_habilidade_id: string; p_nivel_max: number; p_nome: string }
        Returns: { nivel: number; pontos_restantes: number }
      }
    }
    Enums: {
      papel: Papel
      agendamento_status: AgendamentoStatus
      pagamento_metodo: PagamentoMetodo
      pagamento_status: PagamentoStatus
    }
    CompositeTypes: Record<string, never>
  }
}
