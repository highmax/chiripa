import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { rotacionGiro, rotacionReversa } from '../game/geometria'
import { GIROS, mod, type Slot } from '../game/reglas'
import { interpolar, salida, suave } from '../game/animacion'
import { AMARILLO, BLANCO, FUENTE_PIXEL, PALETA_SLOTS, TINTA, UVA, UVA_CLARA } from '../game/colores'
import { Sprite } from './Sprite'
import { PUNTERO } from '../data/sprites'
import type { Animador } from './animador'
import { useEscala } from './escala'

const LADO = 560
const CENTRO = LADO / 2
const PIXEL = 8
const RADIO = CENTRO - 4
const FOCOS = 24

type Props = { slots: Slot[]; fuentesListas: boolean; ref?: Ref<Animador> }

export function Rueda({ slots, fuentesListas, ref }: Props) {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const rotacion = useRef(0)
  const escala = useEscala(lienzo, LADO, PIXEL)
  const n = slots.length

  const rotar = useCallback((grados: number) => {
    rotacion.current = grados
    if (lienzo.current) lienzo.current.style.transform = `rotate(${grados}deg)`
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      preparar: () => Promise.resolve(),
      animar(paso) {
        const r = rotacion.current
        if (paso.tipo === 'girar') return interpolar(r, rotacionGiro(r, paso.destino, n, 5, Math.random()), 4200, salida, rotar)
        if (paso.tipo === 'avanzar') return interpolar(r, r + (paso.slots * 360) / n, 600 + Math.abs(paso.slots) * 180, suave, rotar)
        if (paso.sentido === 1) return interpolar(r, rotacionGiro(r, paso.destino, n, 2, Math.random()), 3200, salida, rotar)
        return interpolar(r, rotacionReversa(r, paso.destino, n, 2, Math.random()), 3200, salida, rotar)
      },
      terminar: () => rotar(mod(rotacion.current, 360)),
    }),
    [n, rotar],
  )

  useEffect(() => {
    const ctx = lienzo.current?.getContext('2d')
    if (ctx) dibujar(ctx, slots, escala)
  }, [slots, fuentesListas, escala])

  return (
    <div className="rueda">
      <Sprite {...PUNTERO} className="rueda__puntero" />
      <canvas
        ref={lienzo}
        width={Math.round(LADO * escala)}
        height={Math.round(LADO * escala)}
        className="rueda__lienzo"
        role="img"
        aria-label={`Rueda con ${n} slots`}
      />
    </div>
  )
}

// La rueda se dibuja en bloques de PIXEL×PIXEL para el look pixel art.
function dibujar(ctx: CanvasRenderingContext2D, slots: Slot[], escala: number) {
  const n = Math.max(slots.length, 1)
  const seg = 360 / n
  ctx.setTransform(escala, 0, 0, escala, 0, 0)
  ctx.clearRect(0, 0, LADO, LADO)

  for (let y = 0; y < LADO; y += PIXEL) {
    for (let x = 0; x < LADO; x += PIXEL) {
      const dx = x + PIXEL / 2 - CENTRO
      const dy = y + PIXEL / 2 - CENTRO
      const r = Math.hypot(dx, dy)
      if (r > RADIO) continue
      ctx.fillStyle = colorDeBloque(slots, n, seg, x, y, dx, dy, r)
      ctx.fillRect(x, y, PIXEL, PIXEL)
    }
  }

  for (let k = 0; k < FOCOS; k++) {
    const a = (k / FOCOS) * Math.PI * 2
    const fx = Math.round((CENTRO + Math.sin(a) * (RADIO - 1.5 * PIXEL)) / PIXEL) * PIXEL - PIXEL
    const fy = Math.round((CENTRO - Math.cos(a) * (RADIO - 1.5 * PIXEL)) / PIXEL) * PIXEL - PIXEL
    ctx.fillStyle = k % 2 ? BLANCO : AMARILLO
    ctx.fillRect(fx, fy, PIXEL * 1.5, PIXEL * 1.5)
  }

  const tamano = n > 12 ? 23 : n > 8 ? 28 : 33
  const borde = RADIO - 4.5 * PIXEL
  slots.forEach((slot, i) => {
    // Ángulo horario del centro del slot (los slots avanzan en sentido antihorario).
    const angulo = mod(-(i + 0.5) * seg, 360)
    const izquierda = angulo > 180
    ctx.save()
    ctx.translate(CENTRO, CENTRO)
    ctx.rotate(((izquierda ? angulo + 90 : angulo - 90) * Math.PI) / 180)
    ctx.textAlign = izquierda ? 'left' : 'right'
    ctx.textBaseline = 'middle'
    const x = izquierda ? -borde : borde
    if (slot.tipo === 'giro') {
      ctx.font = `700 ${tamano + 6}px ${FUENTE_PIXEL}`
      ctx.fillStyle = AMARILLO
      ctx.fillText(slot.giro === 'reversa' ? '⇄ Rev' : GIROS[slot.giro].etiqueta, x, 0)
    } else {
      ctx.font = `700 ${tamano}px ${FUENTE_PIXEL}`
      ctx.fillStyle = PALETA_SLOTS[slot.color][1]
      ctx.fillText(slot.texto.length > 13 ? slot.texto.slice(0, 12) + '…' : slot.texto, x, 0)
    }
    ctx.restore()
  })
}

function colorDeBloque(slots: Slot[], n: number, seg: number, x: number, y: number, dx: number, dy: number, r: number) {
  if (r > RADIO - 3 * PIXEL) return TINTA
  if (r < 3 * PIXEL) return r < 2 * PIXEL ? AMARILLO : TINTA
  if (!slots.length) return UVA_CLARA
  const antihorario = mod((-Math.atan2(dx, -dy) * 180) / Math.PI, 360)
  const i = Math.floor(antihorario / seg) % n
  const alBorde = (Math.min(antihorario - i * seg, (i + 1) * seg - antihorario) * Math.PI * r) / 180
  if (slots.length > 1 && alBorde < PIXEL * 0.55) return TINTA
  const slot = slots[i]
  if (slot.tipo === 'giro') return (x / PIXEL + y / PIXEL) % 2 ? UVA : UVA_CLARA
  return PALETA_SLOTS[slot.color][0]
}
