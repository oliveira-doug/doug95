# "O Sistema" — PWA de gamificação pessoal (`/sistema`)

App pessoal estilo **Solo Leveling**, isolado do site do salão: quests
diárias, XP/nível, ranks (E→S), atributos, classes, títulos, habilidades,
loja de itens, conquistas, streak com penalidade e histórico. Instala no
celular como PWA (tela cheia, ícone próprio, offline básico, notificações).

## Setup (uma vez)

1. **Aplicar a migration** no Supabase do projeto:
   - `npx supabase db push`, ou
   - copiar `supabase/migrations/20260703090000_sistema.sql` no SQL Editor.
2. **Criar o usuário** no painel do Supabase (Authentication → Users →
   Add user, com e-mail/senha). Não há signup público — app pessoal.
3. Acessar `https://<seu-dominio>/sistema/login`. No primeiro login o
   Sistema cria o jogador com 5 atributos padrão e 3 quests de exemplo.

As mesmas variáveis de ambiente do site já bastam
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Instalar no celular

- **Android/Chrome**: banner "Instalar aplicativo" ou Config → Instalar o
  Sistema. Requer HTTPS (produção/preview da Vercel).
- **iOS/Safari**: Compartilhar → "Adicionar à Tela de Início"
  (notificações exigem iOS 16.4+ com o app instalado).

## Mecânica

- **XP**: custo do nível n→n+1 = `floor(100·n^1.5)`. A curva vive em
  `src/app/sistema/_lib/game.ts` E na função SQL
  `sistema_xp_para_proximo_nivel` — alterar sempre nos dois lugares.
- **Level up**: +3 pontos de atributo, +1 ponto de habilidade e
  +50·nível em moedas.
- **Dia**: calculado no servidor em `America/Sao_Paulo`
  (`_lib/dias.ts`); o "reset" diário é derivado das conclusões, sem cron.
  Dia terminado sem completar tudo → streak zerado + log de PENALIDADE
  (avaliado no primeiro acesso do dia, RPC `sistema_processar_dia`).
- **Classe**: escolhida no Despertar (nível 10), definitiva; libera
  habilidades e títulos exclusivos (ex.: Necromante nível 50 →
  "Monarca das Sombras").
- **Moedas**: quests, level-ups e conquistas pagam; a Loja consome.
- **Catálogos** (classes, títulos, itens, habilidades, conquistas) vivem
  em código em `src/app/sistema/_lib/` — para adicionar conteúdo, edite
  esses arquivos; o banco guarda apenas slugs.

## Ícones da PWA

Fonte versionada em `public/sistema/icons/icon.svg`; regenerar PNGs com
`node scripts/sistema-icons.mjs`.

## Push diário do servidor (opcional)

Já implementado — falta só configurar as envs. Sem elas o app funciona
normal (fica o lembrete local ao abrir + badge).

1. Gerar o par de chaves: `npx web-push generate-vapid-keys`.
2. Na Vercel (Project → Settings → Environment Variables), definir:
   `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
   `VAPID_SUBJECT` (`mailto:seu-email`) e `CRON_SECRET`
   (string aleatória longa — a Vercel usa para autenticar o cron).
3. Redeploy. O cron do `vercel.json` roda todo dia às 10:00 UTC
   (07:00 em São Paulo) chamando `/api/sistema/push/daily`, que envia
   "Quest diária disponível" a cada aparelho inscrito que ainda tenha
   quests pendentes no dia.
4. No app: Config → Ativar notificações (o aparelho se inscreve sozinho
   quando a permissão é concedida). iOS exige o app instalado na tela de
   início (iOS 16.4+).

Teste manual: `curl -H "Authorization: Bearer $CRON_SECRET" \
https://<seu-dominio>/api/sistema/push/daily`.
