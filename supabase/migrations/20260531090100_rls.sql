-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Fundação 2.0 — Row Level Security (RLS)                                   ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Regra de ouro: catálogo (profissionais/serviços/horários) é leitura pública;
-- dados de cliente (agendamentos, comanda, pagamentos) NUNCA são públicos —
-- vazariam nome/telefone (LGPD). A disponibilidade é calculada no servidor e
-- devolve só "livre/ocupado", sem expor as linhas.

alter table profiles          enable row level security;
alter table profissionais     enable row level security;
alter table servicos          enable row level security;
alter table horarios          enable row level security;
alter table bloqueios         enable row level security;
alter table agendamentos      enable row level security;
alter table atendimentos      enable row level security;
alter table atendimento_itens enable row level security;
alter table pagamentos        enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────────
create policy "profiles: leitura própria ou admin" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles: atualização própria ou admin" on profiles
  for update using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());
-- (insert é feito pelo trigger handle_new_user; admin gerencia via service role)

-- ── profissionais ─── catálogo público (só ativos), escrita admin ────────────
create policy "profissionais: leitura pública dos ativos" on profissionais
  for select using (ativo = true or is_admin() or profile_id = auth.uid());
create policy "profissionais: escrita admin" on profissionais
  for all using (is_admin()) with check (is_admin());

-- ── servicos ─── catálogo público (só ativos), escrita admin ─────────────────
create policy "servicos: leitura pública dos ativos" on servicos
  for select using (ativo = true or is_admin());
create policy "servicos: escrita admin" on servicos
  for all using (is_admin()) with check (is_admin());

-- ── horarios ─── leitura pública (cliente calcula disponibilidade) ───────────
create policy "horarios: leitura pública" on horarios
  for select using (true);
create policy "horarios: escrita admin ou próprio profissional" on horarios
  for all using (is_admin() or profissional_id = current_profissional_id())
  with check (is_admin() or profissional_id = current_profissional_id());

-- ── bloqueios ─── privado (admin + dono); disponibilidade vem do servidor ────
create policy "bloqueios: leitura admin ou dono" on bloqueios
  for select using (is_admin() or profissional_id = current_profissional_id());
create policy "bloqueios: escrita admin ou dono" on bloqueios
  for all using (is_admin() or profissional_id = current_profissional_id())
  with check (is_admin() or profissional_id = current_profissional_id());

-- ── agendamentos ─── nada público ────────────────────────────────────────────
-- Cliente logado vê os seus; profissional vê os da sua agenda; admin vê tudo.
-- O self-booking de cliente é feito por Server Action com service role (valida
-- disponibilidade no servidor) — por isso não há policy de insert público.
create policy "agendamentos: leitura (dono/profissional/admin)" on agendamentos
  for select using (
    is_admin()
    or profissional_id = current_profissional_id()
    or cliente_id = auth.uid()
  );
create policy "agendamentos: escrita admin ou profissional da agenda" on agendamentos
  for all using (is_admin() or profissional_id = current_profissional_id())
  with check (is_admin() or profissional_id = current_profissional_id());

-- ── atendimentos (comanda) ─── admin + profissional dono ─────────────────────
create policy "atendimentos: admin ou profissional dono" on atendimentos
  for all using (is_admin() or profissional_id = current_profissional_id())
  with check (is_admin() or profissional_id = current_profissional_id());

-- ── atendimento_itens ─── segue o dono do atendimento ────────────────────────
create policy "itens: admin ou dono do atendimento" on atendimento_itens
  for all using (
    is_admin() or exists (
      select 1 from atendimentos a
      where a.id = atendimento_itens.atendimento_id
        and a.profissional_id = current_profissional_id()
    )
  )
  with check (
    is_admin() or exists (
      select 1 from atendimentos a
      where a.id = atendimento_itens.atendimento_id
        and a.profissional_id = current_profissional_id()
    )
  );

-- ── pagamentos ─── segue o dono do atendimento ───────────────────────────────
create policy "pagamentos: admin ou dono do atendimento" on pagamentos
  for all using (
    is_admin() or exists (
      select 1 from atendimentos a
      where a.id = pagamentos.atendimento_id
        and a.profissional_id = current_profissional_id()
    )
  )
  with check (
    is_admin() or exists (
      select 1 from atendimentos a
      where a.id = pagamentos.atendimento_id
        and a.profissional_id = current_profissional_id()
    )
  );
