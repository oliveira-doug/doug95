-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Fundação 2.0 — Seed (dados iniciais)                                      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Catálogo e profissionais iniciais. Os logins (auth.users) são criados à parte
-- pelo Douglas (Supabase → Authentication) e depois vinculados via profile_id.

-- ── Profissionais ────────────────────────────────────────────────────────────
insert into profissionais (nome, ordem) values
  ('Ira Oliveira', 1),
  ('Profissional 1', 2),
  ('Profissional 2', 3);

-- ── Serviços (mesmos da landing; preço "sob consulta" = null; 2h padrão) ─────
insert into servicos (nome, categoria, duracao_min, ordem) values
  ('Corte Feminino', 'Cabelo',       120, 1),
  ('Coloração',      'Coloração',    120, 2),
  ('Hidratação',     'Tratamentos',  120, 3),
  ('Progressiva',    'Cabelo',       120, 4),
  ('Mechas / Luzes', 'Coloração',    120, 5),
  ('Outros',         'Visagismo',    120, 6);

-- ── Horários de expediente ───────────────────────────────────────────────────
-- Seg–Sex (dow 1–5): 09:00–19:00 · Sáb (dow 6): 09:00–17:00 · Dom: fechado.
-- (Mesmos horários exibidos no site. Ajustáveis depois por profissional.)
insert into horarios (profissional_id, dia_semana, abre, fecha)
select p.id, d.dia, '09:00'::time,
       case when d.dia = 6 then '17:00'::time else '19:00'::time end
from profissionais p
cross join (values (1),(2),(3),(4),(5),(6)) as d(dia);
