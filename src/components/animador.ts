import type { Paso } from '../game/reglas'

// Lo que el sorteo le pide a la vista activa (rueda o tragamonedas).
export type Animador = {
  preparar(): Promise<void>
  animar(paso: Paso): Promise<void>
  terminar(): void
}
