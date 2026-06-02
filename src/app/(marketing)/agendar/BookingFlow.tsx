'use client'

import { useMemo, useState, useTransition } from 'react'
import { ChevronLeft, Check, Loader2, Info } from 'lucide-react'
import type { Profissional, Servico } from '@/lib/supabase/types'
import { addDias, diaCurto, diaDaSemana, diaLongo, hojeISO } from '@/lib/datas'
import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon/WhatsAppIcon'
import { CONTACT } from '@/config/site'
import { horariosDisponiveis, solicitarAgendamento } from './actions'

type DiaAtendido = { profissional_id: string; dia_semana: number }

type Props = {
  profissionais: Profissional[]
  servicos: Servico[]
  diasAtendidos: DiaAtendido[]
}

const DIAS_A_FRENTE = 21
const cardCls =
  'rounded-card bg-ivory-50/80 backdrop-blur border border-ivory-300 shadow-card-rest p-6 sm:p-8'

export function BookingFlow({ profissionais, servicos, diasAtendidos }: Props) {
  const [profId, setProfId] = useState<string | null>(null)
  const [dia, setDia] = useState<string | null>(null)
  const [hora, setHora] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[] | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string>()
  const [pending, start] = useTransition()

  const prof = profissionais.find((p) => p.id === profId)

  // Próximos dias em que ESTE profissional atende.
  const dias = useMemo(() => {
    if (!profId) return []
    const dows = new Set(
      diasAtendidos.filter((d) => d.profissional_id === profId).map((d) => d.dia_semana),
    )
    const hoje = hojeISO()
    const out: string[] = []
    for (let i = 0; i < DIAS_A_FRENTE; i++) {
      const d = addDias(hoje, i)
      if (dows.has(diaDaSemana(d))) out.push(d)
    }
    return out
  }, [profId, diasAtendidos])

  async function escolherDia(d: string) {
    setDia(d)
    setHora(null)
    setSlots(null)
    setLoadingSlots(true)
    const livres = await horariosDisponiveis(profId!, d)
    setSlots(livres)
    setLoadingSlots(false)
  }

  function enviar(formData: FormData) {
    setErro(undefined)
    start(async () => {
      const res = await solicitarAgendamento({
        profissional_id: profId,
        servico_id: String(formData.get('servico_id') ?? ''),
        dia,
        hora,
        cliente_nome: String(formData.get('cliente_nome') ?? ''),
        cliente_telefone: String(formData.get('cliente_telefone') ?? ''),
        website: String(formData.get('website') ?? ''),
      })
      if (res.erro) setErro(res.erro)
      else setSucesso(true)
    })
  }

  function recomeçar() {
    setProfId(null)
    setDia(null)
    setHora(null)
    setSlots(null)
    setSucesso(false)
    setErro(undefined)
  }

  // ── Sucesso ────────────────────────────────────────────────────────────────
  if (sucesso) {
    return (
      <div className={cardCls + ' text-center flex flex-col items-center gap-4'}>
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <Check size={28} />
        </div>
        <h2 className="font-display text-display-md text-charcoal-900">
          Pedido recebido! 💛
        </h2>
        <p className="font-body text-body-md text-charcoal-700/80 max-w-sm">
          Reservamos <strong>{hora}</strong> de{' '}
          <strong className="capitalize">{dia && diaLongo(dia)}</strong> com{' '}
          <strong>{prof?.nome}</strong>. Em breve confirmamos pelo WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-sm font-medium shadow-card-rest hover:brightness-110 transition-all"
          >
            <WhatsAppIcon size={18} /> Falar no WhatsApp
          </a>
          <button
            onClick={recomeçar}
            className="h-11 px-6 rounded-badge border border-ivory-300 text-charcoal-700 font-accent text-body-sm font-medium hover:border-gold-400 hover:text-gold-600 transition-all cursor-pointer"
          >
            Agendar outro horário
          </button>
        </div>
      </div>
    )
  }

  // ── Passo 1: profissional ───────────────────────────────────────────────────
  if (!profId) {
    return (
      <div className={cardCls}>
        <Passo n={1} total={4} titulo="Escolha o profissional" />
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          {profissionais.map((p) => (
            <button
              key={p.id}
              onClick={() => setProfId(p.id)}
              className="text-left p-4 rounded-card border border-ivory-300 bg-ivory-50 hover:border-gold-400 hover:bg-gold-50/40 transition-all cursor-pointer"
            >
              <p className="font-accent text-body-lg font-semibold text-charcoal-900">
                {p.nome}
              </p>
              {p.bio && (
                <p className="font-body text-body-sm text-charcoal-700/70 mt-1">{p.bio}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Passo 2: dia ─────────────────────────────────────────────────────────────
  if (!dia) {
    return (
      <div className={cardCls}>
        <Voltar onClick={() => setProfId(null)} />
        <Passo n={2} total={4} titulo={`Escolha o dia · ${prof?.nome}`} />
        {dias.length === 0 ? (
          <p className="font-body text-body-md text-charcoal-700/70 mt-5">
            Sem dias disponíveis para este profissional.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5">
            {dias.map((d) => (
              <button
                key={d}
                onClick={() => escolherDia(d)}
                className="p-3 rounded-badge border border-ivory-300 bg-ivory-50 font-accent text-body-sm font-medium text-charcoal-700 capitalize hover:border-gold-400 hover:text-gold-600 transition-all cursor-pointer"
              >
                {diaCurto(d)}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Passo 3: horário ─────────────────────────────────────────────────────────
  if (!hora) {
    return (
      <div className={cardCls}>
        <Voltar onClick={() => setDia(null)} />
        <Passo n={3} total={4} titulo={`Escolha o horário · ${diaCurto(dia)}`} />
        {loadingSlots ? (
          <div className="flex items-center gap-2 text-charcoal-700/60 mt-6">
            <Loader2 size={18} className="animate-spin" /> Buscando horários livres…
          </div>
        ) : slots && slots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-5">
            {slots.map((h) => (
              <button
                key={h}
                onClick={() => setHora(h)}
                className="p-3 rounded-badge border border-ivory-300 bg-ivory-50 font-accent text-body-md font-medium text-charcoal-900 hover:border-gold-400 hover:bg-gold-50/40 hover:text-gold-600 transition-all cursor-pointer"
              >
                {h}
              </button>
            ))}
          </div>
        ) : (
          <p className="font-body text-body-md text-charcoal-700/70 mt-5">
            Nenhum horário livre nesse dia — todos já foram reservados. Volte e
            escolha outra data. 🙂
          </p>
        )}

        {!loadingSlots && (
          <p className="font-body text-body-sm text-charcoal-700/55 mt-5 flex items-start gap-2">
            <Info size={15} className="mt-0.5 shrink-0 text-gold-500" />
            Aparecem só os horários livres. Se um horário não está na lista, é
            porque já foi reservado.
          </p>
        )}
      </div>
    )
  }

  // ── Passo 4: dados ───────────────────────────────────────────────────────────
  return (
    <div className={cardCls}>
      <Voltar onClick={() => setHora(null)} />
      <Passo n={4} total={4} titulo="Seus dados" />

      <p className="font-body text-body-sm text-charcoal-700/70 mt-3 mb-4">
        <strong className="text-charcoal-900">{prof?.nome}</strong> ·{' '}
        <span className="capitalize">{diaLongo(dia)}</span> · <strong>{hora}</strong>
      </p>

      <form action={enviar} className="flex flex-col gap-3">
        {/* honeypot anti-spam (oculto para humanos) */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <input name="cliente_nome" placeholder="Seu nome" required className={inputCls} />
        <input
          name="cliente_telefone"
          type="tel"
          placeholder="Seu WhatsApp (com DDD)"
          required
          className={inputCls}
        />
        <select name="servico_id" defaultValue="" className={inputCls}>
          <option value="">O que você deseja fazer? (opcional)</option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>

        {erro && (
          <p role="alert" className="font-body text-body-sm text-red-600">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-12 mt-1 rounded-badge bg-gradient-gold text-ivory-50 font-accent text-body-lg font-medium tracking-wide shadow-card-rest hover:shadow-card-hover hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {pending ? 'Enviando…' : 'Confirmar agendamento'}
        </button>
      </form>
    </div>
  )
}

const inputCls =
  'h-11 px-4 rounded-badge bg-ivory-50 border border-ivory-300 font-body text-body-md text-charcoal-900 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/30 transition-colors w-full'

function Passo({ n, total, titulo }: { n: number; total: number; titulo: string }) {
  return (
    <div>
      <p className="font-accent text-label uppercase tracking-widest text-gold-600 mb-1">
        Passo {n} de {total}
      </p>
      <h2 className="font-display text-display-md text-charcoal-900">{titulo}</h2>
    </div>
  )
}

function Voltar({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 mb-4 font-accent text-body-sm font-medium text-charcoal-700/60 hover:text-gold-600 transition-colors cursor-pointer"
    >
      <ChevronLeft size={16} /> Voltar
    </button>
  )
}
