// Reglas del juego: cómo se arman los slots y cómo se resuelve una jugada.
// Todo es puro (sin DOM ni animación) para poder probarlo con tests.

export type GiroLoco = 'mas2' | 'mas4' | 'reversa'

export type Slot =
  | { tipo: 'opcion'; texto: string; color: number }
  | { tipo: 'giro'; giro: GiroLoco }

// Pasos que la vista tiene que animar, en orden.
export type Paso =
  | { tipo: 'girar'; destino: number }
  // `slots` lleva signo: negativo cuando la rueda va en reversa.
  | { tipo: 'avanzar'; slots: number; destino: number }
  // `sentido` es hacia dónde gira después de la Reversa: -1 al revés, 1 de nuevo hacia adelante.
  | { tipo: 'reversa'; destino: number; sentido: 1 | -1 }

export type Jugada = {
  pasos: Paso[]
  // Índice del slot ganador, o null si se alcanzó el límite de Giros Locos seguidos.
  ganador: number | null
}

export type Vista = 'rueda' | 'tragamonedas'

export const MAX_RUEDA = 16
export const MAX_SLOTS = 60
export const MAX_CADENA = 6
export const TOTAL_COLORES = 6

export const GIROS: Record<GiroLoco, { etiqueta: string; avance?: number }> = {
  mas2: { etiqueta: '+2', avance: 2 },
  mas4: { etiqueta: '+4', avance: 4 },
  reversa: { etiqueta: 'Reversa' },
}

export const mod = (a: number, n: number) => ((a % n) + n) % n

// Reparte los Giros Locos entre las opciones para que no queden juntos.
// Con `ceil` siempre queda al menos una opción entre dos Giros Locos, incluso con tantos Giros como opciones.
export function armarSlots(opciones: string[], giros: GiroLoco[]): Slot[] {
  const slots: Slot[] = opciones.map((texto, i) => ({ tipo: 'opcion', texto, color: i % TOTAL_COLORES }))
  giros.forEach((giro, k) => {
    const pos = Math.ceil(((k + 1) * opciones.length) / (giros.length + 1)) + k
    slots.splice(Math.min(pos, slots.length), 0, { tipo: 'giro', giro })
  })
  return slots
}

export function vistaPara(totalSlots: number): Vista {
  return totalSlots > MAX_RUEDA ? 'tragamonedas' : 'rueda'
}

// Devuelve por qué no se puede agregar un Giro Loco, o null si se puede.
export function motivoSinGiro(opciones: number, giros: number): string | null {
  if (opciones + giros >= MAX_SLOTS) return `Chiripa admite hasta ${MAX_SLOTS} slots.`
  if (giros >= opciones) return 'Agrega más opciones antes que más Giros Locos: necesitas al menos una opción por cada uno.'
  return null
}

export function resolverJugada(slots: Slot[], azar: () => number = Math.random): Jugada {
  const n = slots.length
  const alAzar = () => Math.floor(azar() * n) % n
  let actual = alAzar()
  const pasos: Paso[] = [{ tipo: 'girar', destino: actual }]
  let sentido: 1 | -1 = 1

  for (let cadena = 0; cadena < MAX_CADENA; cadena++) {
    const slot = slots[actual]
    if (slot.tipo === 'opcion') return { pasos, ganador: actual }
    const avance = GIROS[slot.giro].avance
    if (avance) {
      actual = mod(actual + sentido * avance, n)
      pasos.push({ tipo: 'avanzar', slots: sentido * avance, destino: actual })
    } else {
      sentido = sentido === 1 ? -1 : 1
      actual = alAzar()
      pasos.push({ tipo: 'reversa', destino: actual, sentido })
    }
  }
  return { pasos, ganador: slots[actual].tipo === 'opcion' ? actual : null }
}
