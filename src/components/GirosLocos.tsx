import type { CSSProperties } from 'react'
import { Sprite } from './Sprite'
import { ESTRELLA } from '../data/sprites'
import { MAX_CADENA } from '../game/reglas'

const CARTAS = [
  {
    id: 'G1',
    simbolo: '+2',
    color: 'var(--fucsia)',
    rol: 'El empujón',
    nombre: '+2',
    texto: 'La rueda avanza 2 slots más en el mismo sentido. Lo que estaba a punto de ganar se queda con las ganas.',
    avance: { valor: '2 SLOTS', barras: 2 },
    caos: 3,
  },
  {
    id: 'G2',
    simbolo: '+4',
    color: 'var(--morado)',
    rol: 'El turbo',
    nombre: '+4',
    texto: 'Avanza 4 slots más. Con ruedas pequeñas casi da media vuelta, y puede caer en otro Giro Loco.',
    avance: { valor: '4 SLOTS', barras: 4 },
    caos: 6,
  },
  {
    id: 'G3',
    simbolo: '⇄',
    color: 'var(--menta)',
    rol: 'La vuelta',
    nombre: 'Reversa',
    texto: 'La rueda vuelve a girar, ahora en sentido contrario, y cae donde caiga. El resultado empieza de cero.',
    avance: { valor: 'GIRO NUEVO', barras: 10 },
    caos: 8,
  },
]

function Barras({ n }: { n: number }) {
  return (
    <div className="barras" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < n ? 'on' : ''} />)}
    </div>
  )
}

export function GirosLocos() {
  return (
    <section className="bloque cielo" id="giros-locos" aria-labelledby="giros-titulo">
      <Sprite {...ESTRELLA} className="estrella" style={{ left: '6%', top: 38 }} />
      <Sprite {...ESTRELLA} className="estrella" style={{ right: '9%', top: 70 }} />
      <Sprite {...ESTRELLA} className="estrella estrella--chica" style={{ right: '32%', top: 22 }} />
      <div className="cabeza">
        <h2 id="giros-titulo">Los Giros Locos</h2>
        <p>
          Caen como cualquier slot, pero en lugar de dar un resultado mueven la rueda. Ponlos para que el sorteo tenga
          suspenso hasta el último segundo.
        </p>
      </div>
      <div className="cartas">
        {CARTAS.map((c) => (
          <article className="carta" key={c.id}>
            <div className="carta__arte">
              <span className="carta__id">{c.id}</span>
              <div className="uno" style={{ '--c': c.color } as CSSProperties}>
                <small>{c.simbolo}</small>
                <b>{c.simbolo}</b>
              </div>
            </div>
            <div className="carta__cuerpo">
              <div className="carta__rol">{c.rol}</div>
              <h3>{c.nombre}</h3>
              <p>{c.texto}</p>
              <div className="stat">
                <div className="stat__top"><span>AVANCE</span><span>{c.avance.valor}</span></div>
                <Barras n={c.avance.barras} />
              </div>
              <div className="stat">
                <div className="stat__top"><span>CAOS</span><span>{c.caos}/10</span></div>
                <Barras n={c.caos} />
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="regla">
        <b>REGLA</b>
        <p>
          Los Giros Locos se encadenan: si un +2 te deja en una Reversa, se aplica la Reversa. En la tragamonedas
          funcionan igual: +2 y +4 bajan el carrete 2 o 4 filas, y Reversa lo hace girar hacia arriba. Límite de{' '}
          {MAX_CADENA} seguidos; al siguiente, toca girar otra vez.
        </p>
      </div>
    </section>
  )
}
