-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Fundação 2.0 — Schema do Studio Ira Oliveira                              ║
-- ║ Agenda por profissional · comanda (atendimentos) · financeiro · papéis   ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Convenções: PK uuid, tempo timestamptz (UTC), dinheiro numeric(10,2),
-- histórico não se deleta (status). RLS é ligado na migration seguinte.

-- btree_gist: necessário para a constraint anti-overbooking (uuid = + range &&)
create extension if not exists btree_gist;

-- ── Enums ────────────────────────────────────────────────────────────────────
create type papel as enum ('admin', 'profissional', 'cliente');
create type agendamento_status as enum
  ('pendente', 'confirmado', 'em_atendimento', 'concluido', 'cancelado');
create type pagamento_metodo as enum ('pix', 'cartao', 'dinheiro');
create type pagamento_status as enum ('pendente', 'pago', 'estornado', 'falhou');

-- ── profiles ─── espelho de auth.users com o papel de acesso ─────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  telefone    text,
  papel       papel not null default 'cliente',
  created_at  timestamptz not null default now()
);
comment on table profiles is 'Perfil de acesso (papel). Criado automaticamente no signup.';

-- ── profissionais ─── Ira, Profissional 1, Profissional 2 ────────────────────
create table profissionais (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  bio         text,
  -- vínculo opcional com um login (para o profissional acessar a própria agenda)
  profile_id  uuid unique references profiles(id) on delete set null,
  ativo       boolean not null default true,
  ordem       int not null default 0,
  created_at  timestamptz not null default now()
);

-- ── servicos ─── catálogo (preço null = "sob consulta") ──────────────────────
create table servicos (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  categoria   text not null,                 -- Cabelo | Coloração | Tratamentos | Visagismo
  descricao   text,
  duracao_min int not null default 120,      -- padrão: 2h por procedimento
  preco       numeric(10,2),                 -- null = sob consulta
  ativo       boolean not null default true,
  ordem       int not null default 0,
  created_at  timestamptz not null default now()
);

-- ── horarios ─── expediente por profissional (dow: 0=domingo … 6=sábado) ─────
create table horarios (
  id              uuid primary key default gen_random_uuid(),
  profissional_id uuid not null references profissionais(id) on delete cascade,
  dia_semana      int not null check (dia_semana between 0 and 6),
  abre            time not null,
  fecha           time not null,
  unique (profissional_id, dia_semana),
  check (fecha > abre)
);

-- ── bloqueios ─── folga, almoço, feriado (indisponibilidade) ─────────────────
create table bloqueios (
  id              uuid primary key default gen_random_uuid(),
  profissional_id uuid not null references profissionais(id) on delete cascade,
  inicio          timestamptz not null,
  fim             timestamptz not null,
  motivo          text,
  created_at      timestamptz not null default now(),
  check (fim > inicio)
);

-- ── agendamentos ─────────────────────────────────────────────────────────────
create table agendamentos (
  id              uuid primary key default gen_random_uuid(),
  profissional_id uuid not null references profissionais(id) on delete restrict,
  servico_id      uuid references servicos(id) on delete set null,
  cliente_id      uuid references profiles(id) on delete set null,  -- se logado
  cliente_nome    text not null,
  cliente_telefone text not null,
  inicio          timestamptz not null,
  fim             timestamptz not null,
  status          agendamento_status not null default 'pendente',
  origem          text not null default 'site',  -- site | whatsapp | painel
  observacoes     text,
  created_at      timestamptz not null default now(),
  check (fim > inicio)
);

-- Anti-overbooking: o banco RECUSA dois agendamentos sobrepostos do mesmo
-- profissional (rede de segurança contra corrida no self-booking). Cancelados
-- não contam.
alter table agendamentos
  add constraint agendamentos_sem_sobreposicao
  exclude using gist (
    profissional_id with =,
    tstzrange(inicio, fim) with &&
  ) where (status <> 'cancelado');

create index idx_agendamentos_prof_inicio on agendamentos (profissional_id, inicio);
create index idx_agendamentos_pendentes  on agendamentos (status) where status = 'pendente';
create index idx_agendamentos_cliente    on agendamentos (cliente_id);

-- ── atendimentos ─── a "comanda" do que foi realizado ────────────────────────
create table atendimentos (
  id              uuid primary key default gen_random_uuid(),
  agendamento_id  uuid references agendamentos(id) on delete set null,
  profissional_id uuid not null references profissionais(id) on delete restrict,
  cliente_nome    text,
  data            timestamptz not null default now(),
  total           numeric(10,2) not null default 0,   -- recalculado por trigger
  observacoes     text,
  created_at      timestamptz not null default now()
);
create index idx_atendimentos_prof_data on atendimentos (profissional_id, data);

-- ── atendimento_itens ─── N procedimentos + valores por atendimento ──────────
create table atendimento_itens (
  id             uuid primary key default gen_random_uuid(),
  atendimento_id uuid not null references atendimentos(id) on delete cascade,
  servico_id     uuid references servicos(id) on delete set null,
  descricao      text not null,                       -- snapshot do nome do procedimento
  valor          numeric(10,2) not null check (valor >= 0),
  created_at     timestamptz not null default now()
);
create index idx_itens_atendimento on atendimento_itens (atendimento_id);

-- ── pagamentos ───────────────────────────────────────────────────────────────
create table pagamentos (
  id             uuid primary key default gen_random_uuid(),
  atendimento_id uuid not null references atendimentos(id) on delete cascade,
  metodo         pagamento_metodo not null,
  valor          numeric(10,2) not null check (valor >= 0),
  status         pagamento_status not null default 'pendente',
  ref_gateway    text,                                -- id da cobrança no Mercado Pago
  created_at     timestamptz not null default now()
);
create index idx_pagamentos_atendimento on pagamentos (atendimento_id);

-- ── Funções auxiliares (usadas nas policies de RLS) ──────────────────────────
-- SECURITY DEFINER evita recursão de RLS ao checar papel/identidade.

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and papel = 'admin');
$$;

create or replace function current_profissional_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from profissionais where profile_id = auth.uid();
$$;

-- ── Trigger: criar profile automaticamente no signup ─────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, nome, telefone, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.raw_user_meta_data->>'telefone',
    'cliente'
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Trigger: impedir que não-admin troque o próprio papel (escalonamento) ────
create or replace function guard_profile_papel()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Bloqueia só um USUÁRIO LOGADO não-admin tentando trocar o papel.
  -- Comandos sem sessão (SQL Editor, service role) são administrativos → liberados.
  if new.papel is distinct from old.papel
     and auth.uid() is not null
     and not is_admin() then
    raise exception 'Apenas admin pode alterar o papel de um perfil';
  end if;
  return new;
end; $$;

create trigger trg_guard_papel
  before update on profiles
  for each row execute function guard_profile_papel();

-- ── Trigger: recalcular o total do atendimento quando os itens mudam ─────────
create or replace function recompute_atendimento_total()
returns trigger language plpgsql as $$
begin
  update atendimentos a
     set total = coalesce(
       (select sum(valor) from atendimento_itens where atendimento_id = a.id), 0)
   where a.id = coalesce(new.atendimento_id, old.atendimento_id);
  return null;
end; $$;

create trigger trg_itens_total
  after insert or update or delete on atendimento_itens
  for each row execute function recompute_atendimento_total();
