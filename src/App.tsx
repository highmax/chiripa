import { Encabezado } from './components/Encabezado'
import { ComoFunciona } from './components/ComoFunciona'
import { GirosLocos } from './components/GirosLocos'
import { Sorteo } from './components/Sorteo'

export default function App() {
  return (
    <div className="ventana">
      <div className="interior">
        <Encabezado />
        <ComoFunciona />
        <GirosLocos />
        <section className="bloque" id="rueda" aria-labelledby="rueda-titulo">
          <div className="cabeza">
            <h2 id="rueda-titulo">A girar</h2>
            <p>Elige qué vas a sortear, agrega tus opciones y suma Giros Locos. Tu lista se guarda en este navegador.</p>
          </div>
          <Sorteo />
        </section>
        <footer className="pie">
          <span className="pie__marca">CHIRIPA</span>
          <span>Para sorteos, premios y turnos. Todo pasa en tu navegador.</span>
        </footer>
      </div>
    </div>
  )
}
