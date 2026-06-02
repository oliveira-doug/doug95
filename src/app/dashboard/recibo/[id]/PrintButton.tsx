'use client'

import { Printer } from 'lucide-react'

// Botão de imprimir/salvar PDF. Some na impressão (print:hidden) para não
// aparecer no recibo final. Custo zero: usa o diálogo nativo do navegador.
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 h-10 px-5 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-sm font-medium shadow-card-rest hover:brightness-110 transition-all cursor-pointer"
    >
      <Printer size={16} /> Imprimir / salvar PDF
    </button>
  )
}
