// ── Footer ──────────────────────────────────────────────────────────────────
// Rodapé premium: marca + navegação + contato + horário, com crédito da
// agência (Safe Solution Automation). Fundo marfim levemente mais escuro que a
// seção anterior, filete dourado no topo como limite editorial. Server Component
// (conteúdo estático; dados vêm de config/site).

import { MapPin, Clock, Phone } from 'lucide-react'
import { LogoMark } from '@/components/atoms/Logo/Logo'
import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon/WhatsAppIcon'
import { SITE, CONTACT, ADDRESS, BUSINESS, waLink } from '@/config/site'

const NAV = [
  { href: '#inicio', label: 'Início' },
  { href: '#galeria', label: 'Vitrine' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#agendar', label: 'Agendar' },
  { href: '#localizacao', label: 'Localização' },
] as const

const FOOTER_WA = 'Olá! Vim pelo site do Studio Ira e gostaria de mais informações. 💛'

/* Ícone do Instagram (não há fiel no Lucide; SVG próprio, traço fino). */
function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

const colHeading =
  'font-accent text-label uppercase tracking-widest text-charcoal-900/70 mb-4'
const socialBtn =
  'w-10 h-10 rounded-full border border-ivory-300 bg-ivory-50 flex items-center justify-center text-charcoal-700 hover:border-gold-400 hover:text-gold-600 hover:bg-gold-50/50 transition-all duration-300 ease-smooth'
const linkCls =
  'font-body text-body-sm text-charcoal-700/75 hover:text-gold-600 transition-colors w-fit'

export function Footer() {
  const ano = new Date().getFullYear()

  return (
    <footer
      aria-label="Rodapé do Studio Ira Oliveira"
      className="relative w-full bg-ivory-200 border-t border-ivory-300"
    >
      {/* Filete dourado no topo — limite editorial sutil */}
      <div
        aria-hidden="true"
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(196,154,42,0.5), transparent)',
        }}
      />

      <div className="max-w-content mx-auto px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* ── Marca ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <LogoMark size={36} />
              <span className="font-display text-display-md text-charcoal-900 leading-none">
                Studio Ira
              </span>
            </div>
            <p className="font-body text-body-sm text-charcoal-700/70 max-w-[34ch] leading-relaxed">
              Beleza com sofisticação em {SITE.city}. Realce a sua beleza natural
              com técnica, cuidado e atenção a cada detalhe.
            </p>
            <div className="flex gap-2.5 mt-1">
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtn}
                aria-label="Instagram do Studio Ira Oliveira"
              >
                <InstagramIcon />
              </a>
              <a
                href={waLink(FOOTER_WA)}
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtn}
                aria-label="WhatsApp do Studio Ira Oliveira"
              >
                <WhatsAppIcon size={17} />
              </a>
            </div>
          </div>

          {/* ── Navegação ── */}
          <nav aria-label="Navegação do rodapé">
            <h3 className={colHeading}>Navegação</h3>
            <ul className="flex flex-col gap-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={linkCls}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Contato ── */}
          <div>
            <h3 className={colHeading}>Contato</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold-500" />
                <span className="font-body text-body-sm text-charcoal-700/75 leading-relaxed">
                  {ADDRESS.street}
                  <br />
                  {ADDRESS.neighborhood} · {ADDRESS.city}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} strokeWidth={1.5} className="shrink-0 text-gold-500" />
                <a
                  href={waLink(FOOTER_WA)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-body-sm text-charcoal-700/75 hover:text-gold-600 transition-colors"
                >
                  {BUSINESS.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="shrink-0 text-gold-500">
                  <InstagramIcon size={16} />
                </span>
                <a
                  href={CONTACT.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-body-sm text-charcoal-700/75 hover:text-gold-600 transition-colors"
                >
                  {CONTACT.instagramHandle}
                </a>
              </li>
            </ul>
          </div>

          {/* ── Atendimento ── */}
          <div>
            <h3 className={colHeading}>Atendimento</h3>
            <ul className="flex flex-col gap-2 font-body text-body-sm text-charcoal-700/75">
              <li className="flex items-center gap-2.5">
                <Clock size={16} strokeWidth={1.5} className="shrink-0 text-gold-500" />
                <span>Seg–Sex · 9h às 19h</span>
              </li>
              <li className="pl-[26px]">Sáb · 9h às 17h</li>
              <li className="pl-[26px] text-charcoal-700/50">Dom · Fechado</li>
            </ul>
          </div>
        </div>

        {/* ── Barra inferior: copyright + crédito da agência ── */}
        <div className="mt-12 pt-6 border-t border-ivory-300 flex flex-col-reverse sm:flex-row items-center justify-between gap-5">
          <p className="font-body text-xs text-charcoal-700/55 text-center sm:text-left">
            © {ano} {SITE.name} · Todos os direitos reservados
          </p>

          <div className="flex flex-col items-center sm:items-end gap-1.5">
            <span className="font-accent text-[11px] uppercase tracking-widest text-charcoal-700/45">
              Desenvolvido por
            </span>
            {/* Logo da agência (processada: fundo transparente + recorte justo) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/safe-solution-automation.png"
              alt="Safe Solution Automation"
              className="w-36 sm:w-44 h-auto opacity-75 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
