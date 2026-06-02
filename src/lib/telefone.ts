// ── Telefone → formato wa.me ─────────────────────────────────────────────────
// O cliente digita o telefone de qualquer jeito ("(38) 98808-5086", "38988085086").
// Para montar o link do WhatsApp precisamos de só dígitos com DDI 55.

export function normalizarTelefoneWa(tel: string): string | null {
  const dig = tel.replace(/\D/g, '')
  if (dig.length < 10) return null // curto demais para ser válido
  if (dig.startsWith('55') && dig.length >= 12) return dig
  // 10 (DDD + 8 díg.) ou 11 (DDD + 9 díg.) → prefixa o DDI do Brasil
  if (dig.length === 10 || dig.length === 11) return '55' + dig
  return dig
}
