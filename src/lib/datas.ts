// ── Utilidades de data/hora com fuso de Brasília ────────────────────────────
// O banco guarda timestamptz em UTC. A agenda raciocina em horário LOCAL
// (America/Sao_Paulo = UTC−3, sem horário de verão desde 2019). Centralizar a
// conversão aqui evita o clássico bug de "agendou 9h, apareceu 6h".

export const TZ = 'America/Sao_Paulo'
const OFFSET = '-03:00'

/** Data de hoje no fuso local, no formato 'YYYY-MM-DD'. */
export function hojeISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}

/** Soma (ou subtrai) dias a uma data 'YYYY-MM-DD', devolvendo 'YYYY-MM-DD'. */
export function addDias(dia: string, n: number): string {
  const base = new Date(`${dia}T12:00:00${OFFSET}`)
  base.setUTCDate(base.getUTCDate() + n)
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(base)
}

/** Dia da semana (0=domingo … 6=sábado) de uma data 'YYYY-MM-DD'. */
export function diaDaSemana(dia: string): number {
  // Meio-dia local => mesma data em UTC; getUTCDay é estável em qualquer servidor.
  return new Date(`${dia}T12:00:00${OFFSET}`).getUTCDay()
}

/** Converte um slot local (data + 'HH:MM') para um Date em UTC (para gravar). */
export function slotParaData(dia: string, horaHHMM: string): Date {
  return new Date(`${dia}T${horaHHMM}:00${OFFSET}`)
}

/** Data local ('YYYY-MM-DD') de um instante (ISO/UTC) — para preencher inputs. */
export function dataLocal(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso))
}

/** Formata um instante (ISO/UTC) como hora local 'HH:MM'. */
export function horaLocal(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** Rótulo curto: 'seg, 02/06'. */
export function diaCurto(dia: string): string {
  const d = new Date(`${dia}T12:00:00${OFFSET}`)
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(d)
}

/** Rótulo longo e amigável: 'segunda-feira, 2 de jun'. */
export function diaLongo(dia: string): string {
  const d = new Date(`${dia}T12:00:00${OFFSET}`)
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(d)
}

/** 'HH:MM:SS' (coluna time do Postgres) -> minutos desde a meia-noite. */
export function horaParaMin(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

/** minutos desde a meia-noite -> 'HH:MM'. */
export function minParaHora(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Início (inclusive) e fim (exclusivo) do dia local, em ISO/UTC — para filtrar. */
export function intervaloDoDia(dia: string): { inicioISO: string; fimISO: string } {
  return {
    inicioISO: new Date(`${dia}T00:00:00${OFFSET}`).toISOString(),
    fimISO: new Date(`${addDias(dia, 1)}T00:00:00${OFFSET}`).toISOString(),
  }
}

/** Duração padrão de um procedimento, em minutos (2h). */
export const SLOT_MIN = 120
