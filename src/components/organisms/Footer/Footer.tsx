// ── Footer ──────────────────────────────────────────────────────────────────
// Rodapé minimalista. Fundo marfim levemente mais escuro que a seção anterior
// para criar um limite sutil, sem competir com o CTA principal.

import { LogoMark } from '@/components/atoms/Logo/Logo'

export function Footer() {
  return (
    <footer
      aria-label="Rodapé do Studio Íra Oliveira"
      className="w-full bg-ivory-200 border-t border-ivory-300 py-10"
    >
      <div className="max-w-content mx-auto px-6 lg:px-8 flex flex-col items-center gap-3 text-center">
        {/* Selo da marca */}
        <LogoMark size={32} className="opacity-80" />

        <p className="font-body text-xs sm:text-sm text-charcoal-700/60 tracking-wide">
          Desenvolvido por Safe Solution Automation, Montes Claros-MG 2026
        </p>
      </div>
    </footer>
  )
}
