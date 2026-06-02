# Agente WhatsApp — Plano (Evolution API + Claude)

> **Status:** planejado, **adiado**. Entra **depois** de 2.3 (Comanda), 2.4
> (Financeiro) e do deploy. Documentado aqui para não se perder.

## Decisões travadas
- **Webhook na nossa stack**: Route Handler do Next em `/api/webhook/evolution`
  (reusa Supabase, centraliza a IA no hub). Só a **Evolution** roda à parte.
- **Escopo desde o início: tool use** — o Claude consulta disponibilidade real e
  **pré-agenda no Supabase** (`agendamentos`, `origem = 'whatsapp'`), mesma fonte
  de verdade do painel. Não é chatbot genérico.
- **Número de teste** na validação — **nunca** o número real da Íra (risco de ban).
- **Produção** → migrar para **WhatsApp Cloud API (oficial, Meta)**: sem risco de
  ban, tier grátis (~1.000 conversas/mês), exige Business + templates.

## Riscos / verdades
- **Baileys (Evolution) é WhatsApp não-oficial** → viola ToS, pode **banir o
  número**. Aceitável só para teste com chip descartável.
- **Custos** (primeiro recorrente real): Anthropic por token (usar **Haiku** p/
  Q&A barato) + **VPS** 24/7 para a Evolution (Hostinger + Coolify). Local de
  teste = Docker + Ngrok (grátis).

## Arquitetura
```
WhatsApp ⇄ Evolution API (Docker/VPS) ──webhook──► /api/webhook/evolution (Next)
                                                       │
                          ┌────────────────────────────┤
                          ▼                            ▼
                    Claude (Anthropic)          Supabase (agenda/leads)
                    + tools (disponibilidade,   (mesma base do painel)
                     pré-agendar, transbordo)
```

## Fluxo do webhook
1. Recebe `MESSAGES_UPSERT`; **verifica segredo** do webhook; responde 200 rápido.
2. **Idempotência** por id da mensagem (não processa 2x).
3. Filtra: ignora grupos/status; só `conversation` / `extendedTextMessage`.
4. Extrai telefone + texto → Claude com **system prompt** (persona "Bia", skill
   `chatbot-whatsapp-humanizado`) e **tools**.
5. Se Claude chamar uma tool (ex.: checar horário, pré-agendar) → executa contra
   o Supabase, devolve o resultado, Claude responde em linguagem humana.
6. `POST /message/sendText` da Evolution com a resposta.

## Guard-rails (web-app-security)
- Segredo do webhook; secrets (`ANTHROPIC_API_KEY`, `EVOLUTION_API_KEY`) só no
  servidor, nunca `NEXT_PUBLIC`, nunca commitados.
- **Timeout** no Claude + fallback ("já te respondo") para o servidor não cair.
- **Anti-prompt-injection** no system prompt; tools **validam** antes de agir
  (não deixar o usuário extrair dados de terceiros ou agendar em massa).
- **Transbordo para humano** quando travar/pedir.
- **LGPD**: consentimento, retenção mínima das conversas.

## Fases
- **A — Encanamento + tool use (local):** Docker Evolution + Ngrok + Route Handler;
  Claude já consulta agenda e pré-agenda. Valida ponta a ponta (número de teste).
- **B — Persona + guard-rails:** humanização, transbordo, idempotência, LGPD.
- **C — Produção:** Cloud API, Evolution no VPS/Coolify, limites de custo e monitor.
