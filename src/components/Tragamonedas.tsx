import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { posicionGiro, posicionReversa } from '../game/geometria'
import { GIROS, mod, type Slot } from '../game/reglas'
import { esperar, interpolar, salida, suave } from '../game/animacion'
import { AMARILLO, FUENTE_PIXEL, PALETA_SLOTS, TINTA, UVA, UVA_CLARA } from '../game/colores'
import type { Animador } from './animador'
import { useEscala } from './escala'

const ANCHO = 800
const ALTO = 300
const FILA = 100
const CUADRO = 20

type Props = {
  slots: Slot[]
  fuentesListas: boolean
  ocupado: boolean
  onJalar: () => void
  ref?: Ref<Animador>
}

export function Tragamonedas({ slots, fuentesListas, ocupado, onJalar, ref }: Props) {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const posicion = useRef(0)
  const [tirada, setTirada] = useState(false)
  const escala = useEscala(lienzo, ANCHO, CUADRO)
  const n = slots.length

  const mover = useCallback(
    (p: number) => {
      posicion.current = p
      const ctx = lienzo.current?.getContext('2d')
      if (ctx) dibujar(ctx, slots, p, escala)
    },
    [slots, escala],
  )

  useImperativeHandle(
    ref,
    () => ({
      async preparar() {
        setTirada(true)
        await esperar(320)
        setTimeout(() => setTirada(false), 260)
      },
      animar(paso) {
        const p = posicion.current
        if (paso.tipo === 'girar') return interpolar(p, posicionGiro(p, paso.destino, n, 3), 3800, salida, mover)
        if (paso.tipo === 'avanzar') return interpolar(p, Math.round(p) + paso.slots, 550 + Math.abs(paso.slots) * 170, suave, mover)
        if (paso.sentido === 1) return interpolar(p, posicionGiro(p, paso.destino, n, 2), 3200, salida, mover)
        return interpolar(p, posicionReversa(p, paso.destino, n, 2), 3200, salida, mover)
      },
      terminar: () => mover(mod(Math.round(posicion.current), n)),
    }),
    [n, mover],
  )

  useEffect(() => {
    mover(n ? mod(Math.round(posicion.current), n) : 0)
  }, [mover, n, fuentesListas])

  return (
    <div className="maquina-wrap">
      <div className="maquina">
        <div className="maquina__marquesina">
          <span className="focos" />
          TRAGAMONEDAS
          <span className="focos" />
        </div>
        <div className="maquina__visor">
          <span className="flecha flecha--izq" />
          <canvas
            ref={lienzo}
            width={Math.round(ANCHO * escala)}
            height={Math.round(ALTO * escala)}
            role="img"
            aria-label={`Carrete de la tragamonedas con ${n} slots`}
          />
          <span className="flecha flecha--der" />
        </div>
        <div className="maquina__pie">
          <span className="maquina__ranura">INSERT COIN</span>
          <span>{n} SLOTS</span>
        </div>
      </div>
      <button className={`palanca${tirada ? ' palanca--tirada' : ''}`} type="button" aria-label="Jalar la palanca" disabled={ocupado} onClick={onJalar}>
        <span className="palanca__base" />
        <span className="palanca__palo" />
        <span className="palanca__bola" />
      </button>
    </div>
  )
}

function dibujar(ctx: CanvasRenderingContext2D, slots: Slot[], posicion: number, escala: number) {
  const n = slots.length
  ctx.setTransform(escala, 0, 0, escala, 0, 0)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, ANCHO, ALTO)
  if (!n) return

  const base = Math.floor(posicion)
  const fraccion = posicion - base
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let k = -2; k <= 2; k++) {
    const slot = slots[mod(base + k, n)]
    const y = Math.round(ALTO / 2 + (k - fraccion) * FILA - FILA / 2)
    if (slot.tipo === 'giro') {
      for (let cy = 0; cy < FILA; cy += CUADRO)
        for (let cx = 0; cx < ANCHO; cx += CUADRO) {
          ctx.fillStyle = ((cx + cy) / CUADRO) % 2 ? UVA : UVA_CLARA
          ctx.fillRect(cx, y + cy, CUADRO, CUADRO)
        }
      ctx.font = `700 60px ${FUENTE_PIXEL}`
      ctx.fillStyle = AMARILLO
      ctx.fillText(slot.giro === 'reversa' ? '⇄ Reversa' : GIROS[slot.giro].etiqueta, ANCHO / 2, y + FILA / 2 + 2)
    } else {
      const [fondo, texto] = PALETA_SLOTS[slot.color]
      ctx.fillStyle = fondo
      ctx.fillRect(0, y, ANCHO, FILA)
      ctx.font = `700 62px ${FUENTE_PIXEL}`
      ctx.fillStyle = texto
      ctx.fillText(slot.texto.length > 20 ? slot.texto.slice(0, 19) + '…' : slot.texto, ANCHO / 2, y + FILA / 2 + 2)
    }
    ctx.fillStyle = TINTA
    ctx.fillRect(0, y - 3, ANCHO, 6)
  }

  // Sombra arriba y abajo para que se lea como un cilindro.
  const sombra = ctx.createLinearGradient(0, 0, 0, ALTO)
  sombra.addColorStop(0, 'rgba(26, 11, 46, 0.7)')
  sombra.addColorStop(0.3, 'rgba(26, 11, 46, 0)')
  sombra.addColorStop(0.7, 'rgba(26, 11, 46, 0)')
  sombra.addColorStop(1, 'rgba(26, 11, 46, 0.7)')
  ctx.fillStyle = sombra
  ctx.fillRect(0, 0, ANCHO, ALTO)
}
