// ── Footer ──────────────────────────────────────────────────────────────────
// Rodapé minimalista. Fundo marfim levemente mais escuro que a seção anterior
// para criar um limite sutil, sem competir com o CTA principal.

export function Footer() {
  return (
    <footer
      aria-label="Rodapé do Studio Íra Oliveira"
      className="w-full bg-ivory-200 border-t border-ivory-300 py-10"
    >
      <div className="max-w-content mx-auto px-6 lg:px-8 flex flex-col items-center gap-3 text-center">
        {/* Ornamento dourado discreto */}
        <span aria-hidden="true" className="text-gold-400/60 text-xs leading-none select-none">
          ✦
        </span>

        <p className="font-body text-xs sm:text-sm text-charcoal-700/60 tracking-wide">
          Desenvolvido por Safe Solution Automation, Montes Claros-MG 2026
        </p>
      </div>
    </footer>
  )
}
