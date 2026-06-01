import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// ── OG image — miniatura de compartilhamento (WhatsApp, Instagram, Google) ───
// Gerada com next/og (Satori). 1200×630 = padrão Open Graph.

export const alt = 'Studio Íra Oliveira — Salão de Beleza em Montes Claros'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Selo/monograma dourado embutido como SVG (mesma marca do site/favicon).
const MONOGRAM =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 48 48' fill='none'>
      <defs><linearGradient id='g' x1='8' y1='6' x2='40' y2='42' gradientUnits='userSpaceOnUse'>
        <stop offset='0%' stop-color='#e4c06e'/><stop offset='55%' stop-color='#c49a2a'/><stop offset='100%' stop-color='#a67e1e'/>
      </linearGradient></defs>
      <circle cx='24' cy='26' r='13' stroke='url(#g)' stroke-width='1.3'/>
      <circle cx='24' cy='26' r='10' stroke='url(#g)' stroke-width='0.5' opacity='0.45'/>
      <line x1='24' y1='20.5' x2='24' y2='31.5' stroke='url(#g)' stroke-width='2' stroke-linecap='round'/>
      <line x1='21' y1='20.5' x2='27' y2='20.5' stroke='url(#g)' stroke-width='1.3' stroke-linecap='round'/>
      <line x1='21' y1='31.5' x2='27' y2='31.5' stroke='url(#g)' stroke-width='1.3' stroke-linecap='round'/>
      <path d='M24 7 25.05 9.6 27.6 10.6 25.05 11.65 24 14.2 22.95 11.65 20.4 10.6 22.95 9.6 Z' fill='url(#g)'/>
    </svg>`,
  )

// Fontes Cormorant Garamond (woff2 estático, peso fixo) embutidas no projeto e
// lidas do disco no build — a OG nunca depende de rede e o Satori não engasga
// com eixos de fonte variável.
const FONTS_DIR = join(process.cwd(), 'src', 'app', '_fonts')
const cormorant = readFileSync(join(FONTS_DIR, 'cormorant-600-normal.woff'))
const cormorantItalic = readFileSync(join(FONTS_DIR, 'cormorant-500-italic.woff'))

export default async function OpengraphImage() {
  const serif = 'Cormorant'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fdfcf8',
          backgroundImage: 'linear-gradient(160deg, #fdfcf8 0%, #f0ebe0 100%)',
          position: 'relative',
        }}
      >
        {/* Moldura dourada fina — toque editorial */}
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            border: '1px solid rgba(196,154,42,0.35)',
            borderRadius: 10,
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MONOGRAM} width={140} height={140} alt="" style={{ marginBottom: 10 }} />

        <div
          style={{
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 88,
            color: '#1e1b18',
            letterSpacing: '-2px',
          }}
        >
          Studio Íra Oliveira
        </div>

        {/* Divisor ornamental — losango em CSS (sem dependência de fonte) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '22px 0' }}>
          <div style={{ width: 90, height: 1, backgroundColor: '#c49a2a' }} />
          <div style={{ width: 10, height: 10, backgroundColor: '#c49a2a', transform: 'rotate(45deg)' }} />
          <div style={{ width: 90, height: 1, backgroundColor: '#c49a2a' }} />
        </div>

        <div
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 44,
            color: '#a67e1e',
          }}
        >
          Realce a sua beleza natural
        </div>

        <div
          style={{
            marginTop: 30,
            fontSize: 22,
            letterSpacing: '6px',
            color: '#2d2926',
          }}
        >
          SALÃO DE BELEZA · MONTES CLAROS — MG
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: serif, data: cormorant, weight: 600, style: 'normal' },
        { name: serif, data: cormorantItalic, weight: 500, style: 'italic' },
      ],
    },
  )
}
