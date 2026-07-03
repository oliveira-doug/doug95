-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ "O Sistema" — app pessoal de gamificação estilo Solo Leveling (/sistema)  ║
-- ║ Independente do schema do salão: tudo referencia auth.users diretamente,  ║
-- ║ sem profiles/tenant_id. Prefixo sistema_ para isolamento.                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Convenções: PK uuid, tempo timestamptz (UTC), "dia" = date no fuso
-- America/Sao_Paulo calculado pela aplicação. Catálogos de classes, títulos,
-- itens da loja, habilidades e conquistas vivem em código (src/app/sistema/_lib)
-- — o banco guarda apenas o estado do jogador (slugs).

-- ── sistema_players ─── estado central do jogador ────────────────────────────
create table sistema_players (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  nome_cacador        text not null default 'Jogador',
  nivel               int  not null default 1  check (nivel >= 1),
  -- xp dentro do nível atual; xp_total é o acumulado da vida (conquistas)
  xp                  int    not null default 0 check (xp >= 0),
  xp_total            bigint not null default 0,
  pontos_disponiveis  int not null default 0 check (pontos_disponiveis >= 0),
  pontos_habilidade   int not null default 0 check (pontos_habilidade >= 0),
  moedas              int not null default 0 check (moedas >= 0),
  classe              text,   -- slug do catálogo (escolhida no Despertar, nível 10)
  titulo              text,   -- slug do título equipado
  streak_atual        int not null default 0,
  melhor_streak       int not null default 0,
  -- reset preguiçoso: último dia local já avaliado / último dia com streak ganho
  ultimo_dia_processado date,
  ultimo_dia_streak     date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table sistema_players is 'Jogador do Sistema (1 por usuário). Criado no primeiro login.';

-- ── sistema_atributos ─── janela de status editável ─────────────────────────
create table sistema_atributos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  nome       text not null,
  valor      int  not null default 10 check (valor >= 0),
  icone      text not null default 'zap',   -- nome de ícone lucide
  ordem      int  not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, nome)
);

-- ── sistema_quests ─── quests diárias editáveis ──────────────────────────────
create table sistema_quests (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  titulo                text not null,
  descricao             text,
  xp_recompensa         int not null default 25 check (xp_recompensa between 0 and 10000),
  moedas_recompensa     int not null default 10 check (moedas_recompensa between 0 and 10000),
  -- pontos diretos em atributos: { "<atributo_id>": pontos }
  recompensa_atributos  jsonb not null default '{}',
  recorrencia           text not null default 'diaria' check (recorrencia in ('diaria')),
  ativo                 boolean not null default true,
  ordem                 int not null default 0,
  created_at            timestamptz not null default now()
);
create index idx_sistema_quests_user on sistema_quests (user_id) where ativo;

-- ── sistema_quest_conclusoes ─── histórico; "feita hoje" é derivado daqui ────
create table sistema_quest_conclusoes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  quest_id        uuid references sistema_quests(id) on delete set null,
  titulo_snapshot text not null,        -- histórico sobrevive ao delete da quest
  dia             date not null,        -- dia LOCAL (America/Sao_Paulo)
  xp_ganho        int not null default 0,
  concluida_em    timestamptz not null default now(),
  unique (quest_id, dia)                -- impede double-check no mesmo dia
);
create index idx_sistema_conclusoes_user_dia on sistema_quest_conclusoes (user_id, dia);

-- ── sistema_conquistas_desbloqueadas ─── catálogo vive em código ─────────────
create table sistema_conquistas_desbloqueadas (
  user_id         uuid not null references auth.users(id) on delete cascade,
  conquista_id    text not null,        -- slug do catálogo em _lib/conquistas.ts
  desbloqueada_em timestamptz not null default now(),
  primary key (user_id, conquista_id)
);

-- ── sistema_inventario ─── itens da loja comprados (catálogo em código) ──────
create table sistema_inventario (
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     text not null,            -- slug do catálogo em _lib/itens.ts
  slot        text not null,            -- arma | armadura | escudo | acessorio (snapshot)
  equipado    boolean not null default false,
  comprado_em timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- ── sistema_habilidades ─── habilidades desbloqueadas/melhoradas ─────────────
create table sistema_habilidades (
  user_id         uuid not null references auth.users(id) on delete cascade,
  habilidade_id   text not null,        -- slug do catálogo em _lib/habilidades.ts
  nivel           int not null default 1 check (nivel >= 1),
  desbloqueada_em timestamptz not null default now(),
  primary key (user_id, habilidade_id)
);

-- ── sistema_log ─── feed de eventos (histórico) ──────────────────────────────
create table sistema_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  tipo       text not null check (tipo in (
    'quest_concluida', 'level_up', 'rank_up', 'penalidade', 'conquista',
    'streak', 'compra', 'classe', 'titulo', 'habilidade', 'equipamento'
  )),
  payload    jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index idx_sistema_log_user on sistema_log (user_id, created_at desc);

-- ── sistema_push_subscriptions ─── web push (v1.5) ───────────────────────────
create table sistema_push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

-- ── RLS: cada jogador só enxerga o próprio universo ──────────────────────────
alter table sistema_players                  enable row level security;
alter table sistema_atributos                enable row level security;
alter table sistema_quests                   enable row level security;
alter table sistema_quest_conclusoes         enable row level security;
alter table sistema_conquistas_desbloqueadas enable row level security;
alter table sistema_inventario               enable row level security;
alter table sistema_habilidades              enable row level security;
alter table sistema_log                      enable row level security;
alter table sistema_push_subscriptions       enable row level security;

create policy sistema_players_own on sistema_players
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sistema_atributos_own on sistema_atributos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sistema_quests_own on sistema_quests
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sistema_conclusoes_own on sistema_quest_conclusoes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sistema_conquistas_own on sistema_conquistas_desbloqueadas
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sistema_inventario_own on sistema_inventario
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sistema_habilidades_own on sistema_habilidades
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sistema_log_own on sistema_log
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sistema_push_own on sistema_push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Helpers de jogo ──────────────────────────────────────────────────────────

-- Curva de XP: custo do nível n → n+1. DUPLICADA em src/app/sistema/_lib/game.ts
-- (xpParaProximoNivel) — alterou aqui, altere lá.
create or replace function sistema_xp_para_proximo_nivel(n int)
returns int language sql immutable as $$
  select floor(100 * power(n, 1.5))::int;
$$;

-- Rank derivado do nível: E(1-9) D(10-19) C(20-29) B(30-39) A(40-49) S(50+).
-- DUPLICADO em _lib/game.ts (rankDoNivel) — manter em sincronia.
create or replace function sistema_rank_do_nivel(n int)
returns text language sql immutable as $$
  select case
    when n >= 50 then 'S'
    when n >= 40 then 'A'
    when n >= 30 then 'B'
    when n >= 20 then 'C'
    when n >= 10 then 'D'
    else 'E'
  end;
$$;

-- ── RPC: concluir quest (atômico) ────────────────────────────────────────────
-- Insere a conclusão, credita XP/moedas/atributos, processa level-ups
-- (+3 pontos de atributo, +1 ponto de habilidade e +50·nível em moedas por
-- nível ganho) e o streak do dia. security invoker → RLS continua valendo.
create or replace function sistema_concluir_quest(p_quest_id uuid, p_dia date)
returns jsonb language plpgsql security invoker as $$
declare
  v_quest       sistema_quests%rowtype;
  v_player      sistema_players%rowtype;
  v_nivel       int;
  v_xp          int;
  v_custo       int;
  v_levels      int := 0;
  v_pontos      int := 0;
  v_pontos_hab  int := 0;
  v_moedas      int := 0;
  v_rank_antes  text;
  v_rank_depois text;
  v_streak      boolean := false;
  v_attr        record;
  v_total_ativas int;
  v_total_feitas int;
begin
  select * into v_quest from sistema_quests
    where id = p_quest_id and user_id = auth.uid() and ativo;
  if not found then
    raise exception 'Quest não encontrada';
  end if;

  -- lock do player contra conclusões concorrentes
  select * into v_player from sistema_players
    where user_id = auth.uid() for update;
  if not found then
    raise exception 'Jogador não encontrado';
  end if;

  -- unique (quest_id, dia) barra o double-check
  insert into sistema_quest_conclusoes (user_id, quest_id, titulo_snapshot, dia, xp_ganho)
  values (auth.uid(), p_quest_id, v_quest.titulo, p_dia, v_quest.xp_recompensa);

  -- XP + level-ups em loop
  v_nivel := v_player.nivel;
  v_xp    := v_player.xp + v_quest.xp_recompensa;
  v_rank_antes := sistema_rank_do_nivel(v_nivel);
  v_custo := sistema_xp_para_proximo_nivel(v_nivel);
  while v_xp >= v_custo loop
    v_xp     := v_xp - v_custo;
    v_nivel  := v_nivel + 1;
    v_levels := v_levels + 1;
    v_pontos     := v_pontos + 3;
    v_pontos_hab := v_pontos_hab + 1;
    v_moedas     := v_moedas + 50 * v_nivel;
    v_custo := sistema_xp_para_proximo_nivel(v_nivel);
  end loop;
  v_rank_depois := sistema_rank_do_nivel(v_nivel);
  v_moedas := v_moedas + v_quest.moedas_recompensa;

  -- pontos diretos em atributos definidos na quest
  for v_attr in
    select key::uuid as atributo_id, value::text::int as pontos
      from jsonb_each(v_quest.recompensa_atributos)
  loop
    update sistema_atributos
       set valor = valor + v_attr.pontos
     where id = v_attr.atributo_id and user_id = auth.uid();
  end loop;

  -- streak: credita quando TODAS as quests ativas do dia foram concluídas
  select count(*) into v_total_ativas from sistema_quests
    where user_id = auth.uid() and ativo;
  select count(distinct quest_id) into v_total_feitas from sistema_quest_conclusoes c
    where c.user_id = auth.uid() and c.dia = p_dia
      and exists (select 1 from sistema_quests q where q.id = c.quest_id and q.ativo);
  if v_total_feitas >= v_total_ativas
     and (v_player.ultimo_dia_streak is null or v_player.ultimo_dia_streak < p_dia) then
    v_streak := true;
  end if;

  update sistema_players set
    nivel              = v_nivel,
    xp                 = v_xp,
    xp_total           = xp_total + v_quest.xp_recompensa,
    pontos_disponiveis = pontos_disponiveis + v_pontos,
    pontos_habilidade  = pontos_habilidade + v_pontos_hab,
    moedas             = moedas + v_moedas,
    streak_atual       = case when v_streak then streak_atual + 1 else streak_atual end,
    melhor_streak      = greatest(melhor_streak,
                           case when v_streak then streak_atual + 1 else streak_atual end),
    ultimo_dia_streak  = case when v_streak then p_dia else ultimo_dia_streak end,
    updated_at         = now()
  where user_id = auth.uid();

  insert into sistema_log (user_id, tipo, payload) values
    (auth.uid(), 'quest_concluida', jsonb_build_object(
      'quest', v_quest.titulo, 'xp', v_quest.xp_recompensa,
      'moedas', v_quest.moedas_recompensa, 'dia', p_dia));
  if v_levels > 0 then
    insert into sistema_log (user_id, tipo, payload) values
      (auth.uid(), 'level_up', jsonb_build_object(
        'nivel', v_nivel, 'pontos', v_pontos, 'pontos_habilidade', v_pontos_hab,
        'moedas', v_moedas - v_quest.moedas_recompensa));
  end if;
  if v_rank_depois <> v_rank_antes then
    insert into sistema_log (user_id, tipo, payload) values
      (auth.uid(), 'rank_up', jsonb_build_object('rank', v_rank_depois));
  end if;
  if v_streak then
    insert into sistema_log (user_id, tipo, payload) values
      (auth.uid(), 'streak', jsonb_build_object('streak', v_player.streak_atual + 1, 'dia', p_dia));
  end if;

  return jsonb_build_object(
    'leveled_up',        v_levels > 0,
    'niveis_ganhos',     v_levels,
    'nivel_novo',        v_nivel,
    'pontos_ganhos',     v_pontos,
    'pontos_habilidade', v_pontos_hab,
    'moedas_ganhas',     v_moedas,
    'rank_up',           v_rank_depois <> v_rank_antes,
    'rank',              v_rank_depois,
    'streak_ganho',      v_streak,
    'streak',            case when v_streak then v_player.streak_atual + 1
                              else v_player.streak_atual end
  );
end; $$;

-- ── RPC: processar virada de dia (reset preguiçoso, idempotente) ─────────────
-- Chamada em todo carregamento do app. Se algum dia terminou sem o streak ser
-- ganho (nem todas as quests ativas concluídas), zera o streak e loga a
-- PENALIDADE. Simplificação assumida: usa o conjunto ATUAL de quests ativas.
create or replace function sistema_processar_dia(p_hoje date)
returns jsonb language plpgsql security invoker as $$
declare
  v_player      sistema_players%rowtype;
  v_tem_quests  boolean;
  v_dia         date;
  v_falhou      boolean := false;
  v_dias_perdidos int := 0;
begin
  select * into v_player from sistema_players
    where user_id = auth.uid() for update;
  if not found then
    raise exception 'Jogador não encontrado';
  end if;

  if v_player.ultimo_dia_processado is null then
    update sistema_players set ultimo_dia_processado = p_hoje, updated_at = now()
      where user_id = auth.uid();
    return jsonb_build_object('penalidade', false);
  end if;

  if v_player.ultimo_dia_processado >= p_hoje then
    return jsonb_build_object('penalidade', false);
  end if;

  select exists (select 1 from sistema_quests where user_id = auth.uid() and ativo)
    into v_tem_quests;

  -- avalia cada dia que terminou desde a última visita
  if v_tem_quests then
    v_dia := v_player.ultimo_dia_processado;
    while v_dia < p_hoje loop
      if v_player.ultimo_dia_streak is null or v_player.ultimo_dia_streak <> v_dia then
        -- o streak daquele dia não foi ganho → dia perdido
        if not exists (
          select 1 from sistema_quest_conclusoes c
           where c.user_id = auth.uid() and c.dia = v_dia
           having count(distinct c.quest_id) >= (
             select count(*) from sistema_quests q where q.user_id = auth.uid() and q.ativo)
        ) then
          v_falhou := true;
          v_dias_perdidos := v_dias_perdidos + 1;
        end if;
      end if;
      v_dia := v_dia + 1;
    end loop;
  end if;

  update sistema_players set
    ultimo_dia_processado = p_hoje,
    streak_atual = case when v_falhou then 0 else streak_atual end,
    updated_at   = now()
  where user_id = auth.uid();

  if v_falhou then
    insert into sistema_log (user_id, tipo, payload) values
      (auth.uid(), 'penalidade', jsonb_build_object(
        'dias_perdidos', v_dias_perdidos,
        'streak_perdido', v_player.streak_atual));
  end if;

  return jsonb_build_object('penalidade', v_falhou, 'dias_perdidos', v_dias_perdidos);
end; $$;

-- ── RPC: comprar item da loja (atômico) ──────────────────────────────────────
-- O preço/slot vêm do catálogo em código, validados pela server action.
create or replace function sistema_comprar_item(p_item_id text, p_preco int, p_slot text, p_nome text)
returns jsonb language plpgsql security invoker as $$
declare
  v_player sistema_players%rowtype;
begin
  select * into v_player from sistema_players
    where user_id = auth.uid() for update;
  if not found then
    raise exception 'Jogador não encontrado';
  end if;
  if exists (select 1 from sistema_inventario
              where user_id = auth.uid() and item_id = p_item_id) then
    raise exception 'Item já adquirido';
  end if;
  if v_player.moedas < p_preco then
    raise exception 'Moedas insuficientes';
  end if;

  update sistema_players set moedas = moedas - p_preco, updated_at = now()
    where user_id = auth.uid();
  insert into sistema_inventario (user_id, item_id, slot)
    values (auth.uid(), p_item_id, p_slot);
  insert into sistema_log (user_id, tipo, payload) values
    (auth.uid(), 'compra', jsonb_build_object('item', p_nome, 'preco', p_preco));

  return jsonb_build_object('moedas_restantes', v_player.moedas - p_preco);
end; $$;

-- ── RPC: gastar ponto de habilidade (desbloquear ou melhorar) ────────────────
-- p_nivel_max vem do catálogo em código, validado pela server action.
create or replace function sistema_gastar_ponto_habilidade(p_habilidade_id text, p_nivel_max int, p_nome text)
returns jsonb language plpgsql security invoker as $$
declare
  v_player sistema_players%rowtype;
  v_nivel  int;
begin
  select * into v_player from sistema_players
    where user_id = auth.uid() for update;
  if not found then
    raise exception 'Jogador não encontrado';
  end if;
  if v_player.pontos_habilidade < 1 then
    raise exception 'Sem pontos de habilidade';
  end if;

  select nivel into v_nivel from sistema_habilidades
    where user_id = auth.uid() and habilidade_id = p_habilidade_id;

  if v_nivel is null then
    insert into sistema_habilidades (user_id, habilidade_id, nivel)
      values (auth.uid(), p_habilidade_id, 1);
    v_nivel := 1;
  else
    if v_nivel >= p_nivel_max then
      raise exception 'Habilidade já está no nível máximo';
    end if;
    update sistema_habilidades set nivel = nivel + 1
      where user_id = auth.uid() and habilidade_id = p_habilidade_id;
    v_nivel := v_nivel + 1;
  end if;

  update sistema_players set
    pontos_habilidade = pontos_habilidade - 1, updated_at = now()
    where user_id = auth.uid();
  insert into sistema_log (user_id, tipo, payload) values
    (auth.uid(), 'habilidade', jsonb_build_object('habilidade', p_nome, 'nivel', v_nivel));

  return jsonb_build_object('nivel', v_nivel,
    'pontos_restantes', v_player.pontos_habilidade - 1);
end; $$;
