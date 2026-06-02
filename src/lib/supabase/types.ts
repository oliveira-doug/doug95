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
export type PagamentoMetodo = 'pix' | 'cartao' | 'dinheiro'
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
  created_at: string
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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      papel: Papel
      agendamento_status: AgendamentoStatus
      pagamento_metodo: PagamentoMetodo
      pagamento_status: PagamentoStatus
    }
    CompositeTypes: Record<string, never>
  }
}
