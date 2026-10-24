import { useImperativeHandle, useRef, type Ref } from 'react'
import { reducirMovimiento } from '../game/animacion'

export type ConfetiHandle = { lanzar(): void }

const COLORES = ['#FF2E93', '#FFD23F', '#7CF2B0', '#6EC8FF', '#FFFFFF', '#7B2FF7']
const DURACION = 1600

export function Confeti({ ref }: { ref?: Ref<ConfetiHandle> }) {
  const lienzo = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => ({
    lanzar() {
      const cv = lienzo.current
      const ctx = cv?.getContext('2d')
      if (!cv || !ctx || reducirMovimiento()) return
      const w = (cv.width = cv.clientWidth)
      const h = (cv.height = cv.clientHeight)
      const piezas = Array.from({ length: 90 }, () => ({
        x: w / 2,
        y: h / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 3,
        lado: 4 + Math.floor(Math.random() * 3) * 2,
        color: COLORES[Math.floor(Math.random() * COLORES.length)],
      }))
      const t0 = performance.now()
      const cuadro = (ahora: number) => {
        ctx.clearRect(0, 0, w, h)
        for (const p of piezas) {
          p.vy += 0.45
          p.x += p.vx
          p.y += p.vy
          ctx.fillStyle = p.color
          ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, p.lado, p.lado)
        }
        if (ahora - t0 < DURACION) requestAnimationFrame(cuadro)
        else ctx.clearRect(0, 0, w, h)
      }
      requestAnimationFrame(cuadro)
    },
  }))

  return <canvas ref={lienzo} className="confeti" aria-hidden="true" />
}
