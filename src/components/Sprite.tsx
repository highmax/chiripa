import { useEffect, useRef, type CSSProperties } from 'react'

type Props = {
  filas: string[]
  paleta: Record<string, string>
  className?: string
  style?: CSSProperties
}

// Dibuja pixel art a partir de filas de texto: cada carácter es un pixel y `.` es transparente.
export function Sprite({ filas, paleta, className, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const ancho = Math.max(...filas.map((f) => f.length))

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, ancho, filas.length)
    filas.forEach((fila, y) =>
      [...fila].forEach((c, x) => {
        if (!paleta[c]) return
        ctx.fillStyle = paleta[c]
        ctx.fillRect(x, y, 1, 1)
      }),
    )
  }, [filas, paleta, ancho])

  return <canvas ref={ref} width={ancho} height={filas.length} className={`sprite ${className ?? ''}`} style={style} aria-hidden="true" />
}
