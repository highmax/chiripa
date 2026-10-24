import { useEffect, useState, type RefObject } from 'react'

// Escala del lienzo para que su resolución real siga a la de la pantalla (2×, 3×).
// Se redondea para que cada bloque de `bloque` unidades mida píxeles enteros y no haya costuras.
export function useEscala(lienzo: RefObject<HTMLCanvasElement | null>, ancho: number, bloque: number) {
  const [escala, setEscala] = useState(1)
  useEffect(() => {
    const cv = lienzo.current
    if (!cv) return
    const medir = () => {
      const ideal = (cv.clientWidth * (window.devicePixelRatio || 1)) / ancho
      setEscala(Math.max(1, Math.ceil(ideal * bloque) / bloque))
    }
    medir()
    if (typeof ResizeObserver !== 'function') return
    const observador = new ResizeObserver(medir)
    observador.observe(cv)
    return () => observador.disconnect()
  }, [lienzo, ancho, bloque])
  return escala
}
