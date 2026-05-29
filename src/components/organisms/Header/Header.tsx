// ── Header ──────────────────────────────────────────────────────────────────
// Barra de marca minimalista no topo. Mesmo espírito do Footer (paleta Ouro
// sobre Marfim, fundo discreto). Apenas a assinatura do studio, centralizada.

export function Header() {
  return (
    <header
      aria-label="Cabeçalho do Studio Íra Oliveira"
      className="w-full bg-ivory-100/80 backdrop-blur-sm border-b border-ivory-300 py-6 md:py-8"
    >
      <div className="max-w-content mx-auto px-6 lg:px-8 flex justify-center">
        <p className="font-display italic text-[clamp(1.25rem,3.5vw,2rem)]
                      text-charcoal-800 leading-none tracking-wide text-center select-none">
          Studio{' '}
          <span className="not-italic text-gold-400 mx-1.5 md:mx-2 font-light">|</span>
          Ira Oliveira{' '}
          <span className="not-italic text-gold-400 mx-1.5 md:mx-2 font-light">|</span>
          Salão de Beleza
        </p>
      </div>
    </header>
  )
}
