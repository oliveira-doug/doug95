// Dia "local" do jogador — sempre America/Sao_Paulo, calculado no servidor.
// O reset diário das quests é derivado (conclusões com dia = hoje), sem cron.

const FUSO = 'America/Sao_Paulo'

/** Data de hoje em SP no formato YYYY-MM-DD (en-CA gera exatamente isso). */
export function hojeLocal(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Formata um YYYY-MM-DD para exibição pt-BR (ex.: "3 de julho"). */
export function formataDia(dia: string): string {
  const [ano, mes, diaN] = dia.split('-').map(Number)
  return new Date(Date.UTC(ano, mes - 1, diaN)).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}
