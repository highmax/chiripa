export function ComoFunciona() {
  return (
    <header className="hero" id="inicio">
      <div className="hero__intro">
        <div className="insignias">
          <span className="insignia insignia--verde">■ Gratis y sin registro</span>
          <span className="insignia">Sorteos · premios · turnos</span>
        </div>
        <h1 className="hero__titulo">Chiripa</h1>
        <p className="hero__subtitulo">La rueda de los Giros Locos</p>
        <p className="hero__lead">
          Escribe lo que quieras sortear, mezcla unos Giros Locos y gira. La rueda puede{' '}
          <mark>saltar, acelerar o darse la vuelta</mark> antes de decidir.
        </p>
        <a className="btn btn--grande hero__cta" href="#rueda">Ir a la rueda ▸</a>
      </div>

      <section className="como" id="como-funciona" aria-labelledby="como-titulo">
        <h2 className="como__titulo" id="como-titulo">Cómo funciona</h2>
        <ol className="pasos">
          <li className="paso">
            <div className="paso__num">1</div>
            <div>
              <h3>Escribe tus opciones</h3>
              <p>
                Agrega una por una o pega una lista separada por comas. Cada opción se vuelve un slot. Con más de 16
                slots, la rueda se convierte en una tragamonedas con palanca.
              </p>
              <p className="tipos">Sirve para participantes, premios, items, tareas o lo que sea.</p>
            </div>
          </li>
          <li className="paso">
            <div className="paso__num">2</div>
            <div>
              <h3>Suma Giros Locos</h3>
              <p>
                Son slots especiales, como las cartas de acción del UNO. Si la rueda cae en uno, todavía no gana nadie:
                la jugada cambia.
              </p>
              <div className="mini-giros">
                <span>+2</span>
                <span>+4</span>
                <span>Reversa</span>
              </div>
            </div>
          </li>
          <li className="paso">
            <div className="paso__num">3</div>
            <div>
              <h3>Gira y deja que decida</h3>
              <p>
                La rueda solo se detiene en una opción normal. Si cae en un Giro Loco, aplica el efecto y sigue hasta
                encontrar un resultado.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </header>
  )
}
