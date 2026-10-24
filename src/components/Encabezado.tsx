import { Sprite } from './Sprite'
import { LOGO } from '../data/sprites'

export function Encabezado() {
  return (
    <nav className="menu" aria-label="Principal">
      <a className="menu__logo" href="#inicio">
        <Sprite {...LOGO} className="menu__sprite" />
        CHIRIPA
      </a>
      <ul className="menu__enlaces">
        <li><a href="#como-funciona">Cómo funciona</a></li>
        <li><a href="#giros-locos">Giros Locos</a></li>
        <li><a href="#rueda">La rueda</a></li>
      </ul>
      <a className="btn btn--menu" href="#rueda">Ir a la rueda</a>
    </nav>
  )
}
