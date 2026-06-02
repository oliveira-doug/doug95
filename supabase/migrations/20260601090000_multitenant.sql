-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Multi-tenant — camada SaaS (Hub & Spoke / SafeSolution)                   ║
-- ║ Idempotente: pode ser rodado várias vezes sem erro.                       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Regra de ouro: TODA tabela de negócio tem tenant_id; o RLS isola por tenant.
-- Studio Ira é o tenant fixo nº 1 até existir resolução por domínio.

-- ── Tabela de tenants ────────────────────────────────────────────────────────
create table if not exists tenants (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  dominio    text unique,
  ativo      boolean not null default true,
  created_at timestamptz not null default now()
);

insert into tenants (id, nome, dominio) values
  ('00000000-0000-0000-0000-000000000001', 'Studio Ira Oliveira', 'studioira.com.br')
on conflict (id) do nothing;

-- ── Colunas (super_admin + tenant_id em todas as tabelas) ────────────────────
alter table profiles          add column if not exists super_admin boolean not null default false;

alter table profiles          add column if not exists tenant_id uuid;
alter table profissionais     add column if not exists tenant_id uuid;
alter table servicos          add column if not exists tenant_id uuid;
alter table horarios          add column if not exists tenant_id uuid;
alter table bloqueios         add column if not exists tenant_id uuid;
alter table agendamentos      add column if not exists tenant_id uuid;
alter table atendimentos      add column if not exists tenant_id uuid;
alter table atendimento_itens add column if not exists tenant_id uuid;
alter table pagamentos        add column if not exists tenant_id uuid;

-- ── Backfill: tudo que já existe pertence ao Studio Ira ──────────────────────
update profiles          set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update profissionais     set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update servicos          set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update horarios          set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update bloqueios         set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update agendamentos      set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update atendimentos      set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update atendimento_itens set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update pagamentos        set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;

-- ── NOT NULL + FK + índice (idempotente) ─────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','profissionais','servicos','horarios','bloqueios',
    'agendamentos','atendimentos','atendimento_itens','pagamentos'
  ] loop
    execute format('alter table %I alter column tenant_id set not null', t);
    if not exists (select 1 from pg_constraint where conname = t||'_tenant_fk') then
      execute format('alter table %I add constraint %I foreign key (tenant_id) references tenants(id)', t, t||'_tenant_fk');
    end if;
    execute format('create index if not exists %I on %I (tenant_id)', 'idx_'||t||'_tenant', t);
  end loop;
end $$;

-- ── Funções auxiliares ───────────────────────────────────────────────────────
create or replace function is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select super_admin from profiles where id = auth.uid()), false);
$$;

create or replace function current_tenant_id()
returns uuid language sql stable security definer set search_path = public as $$
  select tenant_id from profiles where id = auth.uid();
$$;

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, nome, telefone, papel, tenant_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.raw_user_meta_data->>'telefone',
    'cliente',
    '00000000-0000-0000-0000-000000000001'
  );
  return new;
end; $$;

create or replace function guard_profile_papel()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_super_admin() then
    if new.papel is distinct from old.papel and not is_admin() then
      raise exception 'Apenas admin pode alterar o papel de um perfil';
    end if;
    if new.tenant_id is distinct from old.tenant_id then
      raise exception 'Não é permitido mudar o tenant do perfil';
    end if;
    if new.super_admin is distinct from old.super_admin then
      raise exception 'Não é permitido alterar super_admin';
    end if;
  end if;
  return new;
end; $$;

-- ── tenants: RLS ─────────────────────────────────────────────────────────────
alter table tenants enable row level security;
drop policy if exists "tenants: leitura do próprio ou super admin" on tenants;
drop policy if exists "tenants: escrita só super admin" on tenants;
create policy "tenants: leitura do próprio ou super admin" on tenants
  for select using (is_super_admin() or id = current_tenant_id());
create policy "tenants: escrita só super admin" on tenants
  for all using (is_super_admin()) with check (is_super_admin());

-- ── Policies escopadas por tenant (derruba antigas E novas, recria) ──────────
-- profiles
drop policy if exists "profiles: leitura própria ou admin" on profiles;
drop policy if exists "profiles: atualização própria ou admin" on profiles;
drop policy if exists "profiles: leitura" on profiles;
drop policy if exists "profiles: atualização" on profiles;
create policy "profiles: leitura" on profiles
  for select using (id = auth.uid() or is_super_admin() or (is_admin() and tenant_id = current_tenant_id()));
create policy "profiles: atualização" on profiles
  for update using (id = auth.uid() or is_super_admin() or (is_admin() and tenant_id = current_tenant_id()))
  with check (id = auth.uid() or is_super_admin() or (is_admin() and tenant_id = current_tenant_id()));

-- profissionais
drop policy if exists "profissionais: leitura pública dos ativos" on profissionais;
drop policy if exists "profissionais: escrita admin" on profissionais;
drop policy if exists "profissionais: leitura" on profissionais;
drop policy if exists "profissionais: escrita" on profissionais;
create policy "profissionais: leitura" on profissionais
  for select using (ativo = true or is_super_admin() or tenant_id = current_tenant_id());
create policy "profissionais: escrita" on profissionais
  for all using (is_super_admin() or (is_admin() and tenant_id = current_tenant_id()))
  with check (is_super_admin() or (is_admin() and tenant_id = current_tenant_id()));

-- servicos
drop policy if exists "servicos: leitura pública dos ativos" on servicos;
drop policy if exists "servicos: escrita admin" on servicos;
drop policy if exists "servicos: leitura" on servicos;
drop policy if exists "servicos: escrita" on servicos;
create policy "servicos: leitura" on servicos
  for select using (ativo = true or is_super_admin() or tenant_id = current_tenant_id());
create policy "servicos: escrita" on servicos
  for all using (is_super_admin() or (is_admin() and tenant_id = current_tenant_id()))
  with check (is_super_admin() or (is_admin() and tenant_id = current_tenant_id()));

-- horarios
drop policy if exists "horarios: leitura pública" on horarios;
drop policy if exists "horarios: escrita admin ou próprio profissional" on horarios;
drop policy if exists "horarios: leitura" on horarios;
drop policy if exists "horarios: escrita" on horarios;
create policy "horarios: leitura" on horarios for select using (true);
create policy "horarios: escrita" on horarios
  for all using (is_super_admin() or ((is_admin() or profissional_id = current_profissional_id()) and tenant_id = current_tenant_id()))
  with check (is_super_admin() or ((is_admin() or profissional_id = current_profissional_id()) and tenant_id = current_tenant_id()));

-- bloqueios
drop policy if exists "bloqueios: leitura admin ou dono" on bloqueios;
drop policy if exists "bloqueios: escrita admin ou dono" on bloqueios;
drop policy if exists "bloqueios: acesso" on bloqueios;
create policy "bloqueios: acesso" on bloqueios
  for all using (is_super_admin() or ((is_admin() or profissional_id = current_profissional_id()) and tenant_id = current_tenant_id()))
  with check (is_super_admin() or ((is_admin() or profissional_id = current_profissional_id()) and tenant_id = current_tenant_id()));

-- agendamentos
drop policy if exists "agendamentos: leitura (dono/profissional/admin)" on agendamentos;
drop policy if exists "agendamentos: escrita admin ou profissional da agenda" on agendamentos;
drop policy if exists "agendamentos: leitura" on agendamentos;
drop policy if exists "agendamentos: escrita" on agendamentos;
create policy "agendamentos: leitura" on agendamentos
  for select using (is_super_admin() or (tenant_id = current_tenant_id() and (is_admin() or profissional_id = current_profissional_id() or cliente_id = auth.uid())));
create policy "agendamentos: escrita" on agendamentos
  for all using (is_super_admin() or (tenant_id = current_tenant_id() and (is_admin() or profissional_id = current_profissional_id())))
  with check (is_super_admin() or (tenant_id = current_tenant_id() and (is_admin() or profissional_id = current_profissional_id())));

-- atendimentos
drop policy if exists "atendimentos: admin ou profissional dono" on atendimentos;
drop policy if exists "atendimentos: acesso" on atendimentos;
create policy "atendimentos: acesso" on atendimentos
  for all using (is_super_admin() or (tenant_id = current_tenant_id() and (is_admin() or profissional_id = current_profissional_id())))
  with check (is_super_admin() or (tenant_id = current_tenant_id() and (is_admin() or profissional_id = current_profissional_id())));

-- atendimento_itens
drop policy if exists "itens: admin ou dono do atendimento" on atendimento_itens;
drop policy if exists "itens: acesso" on atendimento_itens;
create policy "itens: acesso" on atendimento_itens
  for all using (is_super_admin() or (tenant_id = current_tenant_id() and (is_admin() or exists (select 1 from atendimentos a where a.id = atendimento_itens.atendimento_id and a.profissional_id = current_profissional_id()))))
  with check (is_super_admin() or (tenant_id = current_tenant_id() and (is_admin() or exists (select 1 from atendimentos a where a.id = atendimento_itens.atendimento_id and a.profissional_id = current_profissional_id()))));

-- pagamentos
drop policy if exists "pagamentos: admin ou dono do atendimento" on pagamentos;
drop policy if exists "pagamentos: acesso" on pagamentos;
create policy "pagamentos: acesso" on pagamentos
  for all using (is_super_admin() or (tenant_id = current_tenant_id() and (is_admin() or exists (select 1 from atendimentos a where a.id = pagamentos.atendimento_id and a.profissional_id = current_profissional_id()))))
  with check (is_super_admin() or (tenant_id = current_tenant_id() and (is_admin() or exists (select 1 from atendimentos a where a.id = pagamentos.atendimento_id and a.profissional_id = current_profissional_id()))));
