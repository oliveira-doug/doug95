# Supabase — Fundação 2.0 (passo a passo)

Tudo no **free tier**. Eu (Claude) **não crio contas nem insiro chaves** — os
passos abaixo são seus, Douglas. O código já está pronto para receber.

## 1. Criar o projeto

1. Entre em **https://supabase.com** → *New project*.
2. Nome: `studio-ira` · região: **South America (São Paulo)** · defina uma senha
   forte do banco (guarde — é só sua).
3. Aguarde provisionar (~2 min).

## 2. Aplicar as migrations (criar o schema)

**Opção A — SQL Editor (mais simples):**
No projeto → **SQL Editor** → *New query*. Cole e execute, **nesta ordem**, o
conteúdo de cada arquivo de `supabase/migrations/`:

1. `20260531090000_schema.sql`  (tabelas, índices, triggers, anti-overbooking)
2. `20260531090100_rls.sql`     (segurança por linha)
3. `20260531090200_seed.sql`    (3 profissionais, serviços, horários)

**Opção B — CLI** (se preferir versionar):
```bash
npx supabase login
npx supabase link --project-ref <ref-do-projeto>
npx supabase db push
```

## 3. Pegar as chaves e configurar o ambiente

No projeto → **Settings → API**. Copie para um `.env.local` (na raiz do app,
fora do git) — modelo em `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...      # "anon public"
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # "service_role" — SECRETO
```

No **Vercel**, defina as mesmas três em *Settings → Environment Variables*.

> ⚠️ O `service_role` bypassa o RLS. Nunca o exponha no browser, nunca commite.

## 4. Criar os logins (admin e profissionais)

No projeto → **Authentication → Users → Add user** (email + senha).
O perfil é criado automaticamente como `cliente`; promova quem for da equipe:

```sql
-- Vira admin (Íra):
update profiles set papel = 'admin'      where id = '<user-uuid>';
-- Vira profissional:
update profiles set papel = 'profissional' where id = '<user-uuid>';
```

E **vincule** cada login de profissional ao seu cadastro (para ele ver a própria
agenda):

```sql
update profissionais
   set profile_id = '<user-uuid>'
 where nome = 'Íra Oliveira';     -- repita para Profissional 1 e 2
```

## 5. Testar

`npm run dev` → acesse **/dashboard** → deve redirecionar ao login → entre com o
e-mail/senha criados. A home mostra seu nome e papel. ✅

---

### O que já existe (Fundação 2.0)
- Schema completo: profissionais, serviços, horários, bloqueios, agendamentos,
  comanda (atendimentos + itens) e pagamentos.
- RLS: catálogo público; dados de cliente privados; admin vê tudo; profissional
  vê o seu.
- Anti-overbooking no banco (constraint `EXCLUDE gist`).
- Login (admin/profissional), proxy de sessão, shell do dashboard.

### Próximas sub-entregas
- **2.1** Agenda por profissional · **2.2** Disponibilidade + self-booking
- **2.3** Comanda · **2.4** Financeiro + recibo · **2.5** Cobrança (Mercado Pago)
