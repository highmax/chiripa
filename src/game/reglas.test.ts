import { describe, expect, it } from 'vitest'
import { MAX_CADENA, armarSlots, motivoSinGiro, resolverJugada, vistaPara, type Slot } from './reglas'
import {
  indiceEnCarrete,
  indiceEnRueda,
  posicionGiro,
  posicionReversa,
  rotacionGiro,
  rotacionReversa,
} from './geometria'

// Azar fijo: devuelve los valores en orden y luego repite el último.
const secuencia = (...valores: number[]) => {
  let i = 0
  return () => valores[Math.min(i++, valores.length - 1)]
}
const azarPara = (indice: number, n: number) => (indice + 0.5) / n

const opcion = (texto: string): Slot => ({ tipo: 'opcion', texto, color: 0 })

describe('armarSlots', () => {
  it('mantiene el orden de las opciones y reparte los Giros Locos', () => {
    const slots = armarSlots(['A', 'B', 'C', 'D', 'E', 'F'], ['mas2', 'reversa'])
    expect(slots).toHaveLength(8)
    expect(slots.filter((s) => s.tipo === 'opcion').map((s) => s.tipo === 'opcion' && s.texto)).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
    const posiciones = slots.flatMap((s, i) => (s.tipo === 'giro' ? [i] : []))
    expect(posiciones).toEqual([2, 5])
  })

  it('deja una opción entre dos Giros Locos aunque haya tantos Giros como opciones', () => {
    const slots = armarSlots(['A', 'B', 'C', 'D', 'E', 'F'], ['mas2', 'mas4', 'reversa', 'mas2', 'mas4', 'reversa'])
    slots.forEach((s, i) => {
      if (s.tipo === 'giro') expect(slots[(i + 1) % slots.length].tipo).toBe('opcion')
    })
  })

  it('asigna colores cíclicos por opción', () => {
    const slots = armarSlots(['A', 'B', 'C', 'D', 'E', 'F', 'G'], [])
    expect(slots.map((s) => s.tipo === 'opcion' && s.color)).toEqual([0, 1, 2, 3, 4, 5, 0])
  })
})

describe('vistaPara', () => {
  it('usa la rueda hasta 16 slots y la tragamonedas desde 17', () => {
    expect(vistaPara(16)).toBe('rueda')
    expect(vistaPara(17)).toBe('tragamonedas')
  })
})

describe('motivoSinGiro', () => {
  it('pide al menos una opción por Giro Loco', () => {
    expect(motivoSinGiro(2, 1)).toBeNull()
    expect(motivoSinGiro(2, 2)).toMatch(/al menos una opción/)
  })
  it('respeta el máximo de slots', () => {
    expect(motivoSinGiro(50, 10)).toMatch(/60 slots/)
  })
})

describe('resolverJugada', () => {
  it('gana la opción donde cae si no es un Giro Loco', () => {
    const slots = [opcion('A'), opcion('B'), opcion('C')]
    const jugada = resolverJugada(slots, secuencia(azarPara(1, 3)))
    expect(jugada).toEqual({ pasos: [{ tipo: 'girar', destino: 1 }], ganador: 1 })
  })

  it('+2 avanza dos slots y da la vuelta al final de la lista', () => {
    const slots: Slot[] = [opcion('A'), opcion('B'), opcion('C'), { tipo: 'giro', giro: 'mas2' }]
    const jugada = resolverJugada(slots, secuencia(azarPara(3, 4)))
    expect(jugada.pasos).toEqual([
      { tipo: 'girar', destino: 3 },
      { tipo: 'avanzar', slots: 2, destino: 1 },
    ])
    expect(jugada.ganador).toBe(1)
  })

  it('encadena Giros Locos: +4 cae en Reversa y la Reversa elige un destino nuevo', () => {
    const slots: Slot[] = [
      { tipo: 'giro', giro: 'mas4' },
      opcion('A'),
      opcion('B'),
      opcion('C'),
      { tipo: 'giro', giro: 'reversa' },
      opcion('D'),
    ]
    const jugada = resolverJugada(slots, secuencia(azarPara(0, 6), azarPara(5, 6)))
    expect(jugada.pasos).toEqual([
      { tipo: 'girar', destino: 0 },
      { tipo: 'avanzar', slots: 4, destino: 4 },
      { tipo: 'reversa', destino: 5, sentido: -1 },
    ])
    expect(jugada.ganador).toBe(5)
  })

  it('después de una Reversa, +2 avanza en el sentido contrario', () => {
    const slots: Slot[] = [
      opcion('A'),
      { tipo: 'giro', giro: 'reversa' },
      opcion('B'),
      opcion('C'),
      { tipo: 'giro', giro: 'mas2' },
      opcion('D'),
    ]
    const jugada = resolverJugada(slots, secuencia(azarPara(1, 6), azarPara(4, 6)))
    expect(jugada.pasos).toEqual([
      { tipo: 'girar', destino: 1 },
      { tipo: 'reversa', destino: 4, sentido: -1 },
      { tipo: 'avanzar', slots: -2, destino: 2 },
    ])
    expect(jugada.ganador).toBe(2)
  })

  it('una segunda Reversa vuelve a girar hacia adelante', () => {
    const slots: Slot[] = [{ tipo: 'giro', giro: 'reversa' }, opcion('A'), { tipo: 'giro', giro: 'reversa' }, opcion('B')]
    const jugada = resolverJugada(slots, secuencia(azarPara(0, 4), azarPara(2, 4), azarPara(3, 4)))
    expect(jugada.pasos.slice(1)).toEqual([
      { tipo: 'reversa', destino: 2, sentido: -1 },
      { tipo: 'reversa', destino: 3, sentido: 1 },
    ])
    expect(jugada.ganador).toBe(3)
  })

  it(`se detiene tras ${MAX_CADENA} Giros Locos seguidos sin ganador`, () => {
    const slots: Slot[] = [{ tipo: 'giro', giro: 'reversa' }, opcion('A')]
    const jugada = resolverJugada(slots, secuencia(0))
    expect(jugada.pasos).toHaveLength(MAX_CADENA + 1)
    expect(jugada.ganador).toBeNull()
  })
})

describe('geometría de la rueda', () => {
  it('rotacionGiro deja el puntero en el destino tras varias vueltas', () => {
    for (const azar of [0, 0.5, 0.999]) {
      const r = rotacionGiro(123, 5, 8, 5, azar)
      expect(r).toBeGreaterThanOrEqual(123 + 5 * 360)
      expect(indiceEnRueda(r, 8)).toBe(5)
    }
  })

  it('avanzar k segmentos suma k al índice', () => {
    const r = rotacionGiro(0, 6, 8, 1, 0.5)
    expect(indiceEnRueda(r + (2 * 360) / 8, 8)).toBe(0)
  })

  it('rotacionReversa gira hacia atrás y cae en el destino', () => {
    const r = rotacionReversa(400, 2, 7, 2, 0.3)
    expect(r).toBeLessThanOrEqual(400 - 2 * 360)
    expect(indiceEnRueda(r, 7)).toBe(2)
  })
})

describe('geometría del carrete', () => {
  it('posicionGiro y posicionReversa terminan en el destino', () => {
    const p = posicionGiro(10, 3, 24, 3)
    expect(p).toBeGreaterThanOrEqual(10 + 3 * 24)
    expect(indiceEnCarrete(p, 24)).toBe(3)
    const q = posicionReversa(p, 20, 24, 2)
    expect(q).toBeLessThanOrEqual(p - 2 * 24)
    expect(indiceEnCarrete(q, 24)).toBe(20)
  })
})
