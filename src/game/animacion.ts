export const reducirMovimiento = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export const salida = (t: number) => 1 - Math.pow(1 - t, 4)
export const suave = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export function interpolar(desde: number, hasta: number, ms: number, curva: (t: number) => number, aplicar: (v: number) => void) {
  if (reducirMovimiento()) {
    aplicar(hasta)
    return Promise.resolve()
  }
  const t0 = performance.now()
  return new Promise<void>((listo) => {
    const cuadro = (ahora: number) => {
      const p = Math.min((ahora - t0) / ms, 1)
      aplicar(desde + (hasta - desde) * curva(p))
      if (p < 1) requestAnimationFrame(cuadro)
      else listo()
    }
    requestAnimationFrame(cuadro)
  })
}

// Las pausas se mantienen aunque se reduzca el movimiento: así cada Giro Loco se alcanza a leer.
export const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
