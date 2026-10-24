import { mod } from './reglas'

// Rueda: el slot i ocupa el arco [i·seg, (i+1)·seg] medido en sentido antihorario
// desde arriba. Así, al girar la rueda en sentido horario, el puntero pasa del
// slot i al i+1, igual que el carrete de la tragamonedas.

export function indiceEnRueda(rotacion: number, n: number): number {
  return Math.floor(mod(rotacion, 360) / (360 / n)) % n
}

// `azar` en [0, 1) mueve el punto de parada dentro del slot sin tocar sus bordes.
function anguloDentro(destino: number, n: number, azar: number) {
  const seg = 360 / n
  return destino * seg + seg * (0.25 + 0.5 * azar)
}

export function rotacionGiro(rotacion: number, destino: number, n: number, vueltas: number, azar: number) {
  return rotacion + vueltas * 360 + mod(anguloDentro(destino, n, azar) - rotacion, 360)
}

export function rotacionReversa(rotacion: number, destino: number, n: number, vueltas: number, azar: number) {
  return rotacion - vueltas * 360 - mod(rotacion - anguloDentro(destino, n, azar), 360)
}

// Tragamonedas: `posicion` es el índice (con decimales) de la fila en la línea de premio.

export function indiceEnCarrete(posicion: number, n: number): number {
  return mod(Math.round(posicion), n)
}

export function posicionGiro(posicion: number, destino: number, n: number, vueltas: number) {
  const p = Math.round(posicion)
  return p + vueltas * n + mod(destino - p, n)
}

export function posicionReversa(posicion: number, destino: number, n: number, vueltas: number) {
  const p = Math.round(posicion)
  return p - vueltas * n - mod(p - destino, n)
}
