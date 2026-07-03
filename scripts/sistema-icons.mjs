// Gera os PNGs da PWA do Sistema a partir de public/sistema/icons/icon.svg.
// Uso: node scripts/sistema-icons.mjs
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'

const DIR = new URL('../public/sistema/icons/', import.meta.url)
const svg = await readFile(new URL('icon.svg', DIR))

await sharp(svg).resize(192, 192).png().toFile(new URL('icon-192.png', DIR).pathname)
await sharp(svg).resize(512, 512).png().toFile(new URL('icon-512.png', DIR).pathname)
await sharp(svg).resize(180, 180).png().toFile(new URL('apple-touch-icon.png', DIR).pathname)

// Maskable: a arte ocupa ~80% (zona segura) sobre o fundo navy.
const arte = await sharp(svg).resize(410, 410).png().toBuffer()
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#0a1220' },
})
  .composite([{ input: arte, gravity: 'center' }])
  .png()
  .toFile(new URL('maskable-512.png', DIR).pathname)

console.log('Ícones gerados em public/sistema/icons/')
