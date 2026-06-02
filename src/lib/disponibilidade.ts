// ── Cálculo de horários livres (puro, testável) ─────────────────────────────
// Roda no servidor. Cruza o expediente do profissional com os horários já
// ocupados (agendamentos + bloqueios) e devolve só os slots LIVRES — nunca
// expõe dados de outros clientes (LGPD).

import { SLOT_MIN, slotParaData, minParaHora } from './datas'

type Intervalo = { inicio: string; fim: string } // ISO/UTC

export function calcularSlotsLivres(params: {
  dia: string // 'YYYY-MM-DD'
  abreMin: number | null // minutos desde a meia-noite; null = fechado
  fechaMin: number | null
  ocupados: Intervalo[] // agendamentos + bloqueios
  agora?: Date
}): string[] {
  const { dia, abreMin, fechaMin, ocupados, agora = new Date() } = params
  if (abreMin == null || fechaMin == null) return []

  const livres: string[] = []

  // Só oferece slots de 2h que cabem inteiros dentro do expediente.
  for (let m = abreMin; m + SLOT_MIN <= fechaMin; m += SLOT_MIN) {
    const hhmm = minParaHora(m)
    const inicio = slotParaData(dia, hhmm)
    const fim = new Date(inicio.getTime() + SLOT_MIN * 60_000)

    // Não oferece horário no passado.
    if (inicio <= agora) continue

    // Livre = não sobrepõe nenhum ocupado.
    const conflita = ocupados.some((o) => {
      const oi = new Date(o.inicio)
      const of = new Date(o.fim)
      return inicio < of && oi < fim
    })

    if (!conflita) livres.push(hhmm)
  }

  return livres
}
