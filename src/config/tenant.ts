// ── Tenant (multi-tenant / SafeSolution Hub & Spoke) ────────────────────────
// Enquanto a resolução de tenant por domínio não existe, o app opera com um
// tenant fixo: o Studio Íra. Toda gravação de dado de negócio deve carimbar
// este tenant_id. Quando entrar o 2º cliente, troca-se isto por uma resolução
// dinâmica (ex.: pelo host no proxy.ts) — sem mexer no resto do código.

export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'
