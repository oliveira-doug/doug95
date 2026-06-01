interface LogoMarkProps {
  size?: number
  className?: string
}

/* Selo/monograma do Studio Íra Oliveira — "Í" + "O" desenhados como um anel
   fino (O) com haste serifada central (I) e o ornamento ✦ (acento). Vetorial,
   nítido em qualquer tamanho. Usa o gradiente Ouro Envelhecido. */
export function LogoMark({ size = 40, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Studio Íra Oliveira"
      className={className}
    >
      <defs>
        <linearGradient id="ira-gold" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e4c06e" />
          <stop offset="55%" stopColor="#c49a2a" />
          <stop offset="100%" stopColor="#a67e1e" />
        </linearGradient>
      </defs>

      {/* Anel externo (O) */}
      <circle cx="24" cy="26.5" r="14" stroke="url(#ira-gold)" strokeWidth="1.4" />
      {/* Anel interno sutil */}
      <circle cx="24" cy="26.5" r="11" stroke="url(#ira-gold)" strokeWidth="0.6" opacity="0.45" />

      {/* Haste central (I) com serifas */}
      <line x1="24" y1="20" x2="24" y2="33" stroke="url(#ira-gold)" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20.5" y1="20" x2="27.5" y2="20" stroke="url(#ira-gold)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="20.5" y1="33" x2="27.5" y2="33" stroke="url(#ira-gold)" strokeWidth="1.3" strokeLinecap="round" />

      {/* Ornamento ✦ — o acento de "Í" */}
      <path
        d="M24 3.2 25.15 6.05 28 7.2 25.15 8.35 24 11.2 22.85 8.35 20 7.2 22.85 6.05 Z"
        fill="url(#ira-gold)"
      />
    </svg>
  )
}
