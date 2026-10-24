import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  GIROS,
  MAX_SLOTS,
  armarSlots,
  motivoSinGiro,
  resolverJugada,
  vistaPara,
  type GiroLoco,
  type Paso,
} from '../game/reglas'
import { esperar } from '../game/animacion'
import { EJEMPLOS, MODOS, type Modo } from '../data/ejemplos'
import { Rueda } from './Rueda'
import { Tragamonedas } from './Tragamonedas'
import { Confeti, type ConfetiHandle } from './Confeti'
import type { Animador } from './animador'

const CLAVE = 'chiripa:sorteo'
const GIROS_INICIALES: GiroLoco[] = ['mas2', 'reversa']
const AYUDA = 'Hasta 16 slots se juega en la rueda; desde 17 aparece la tragamonedas. Los Giros Locos se reparten entre las opciones.'

type Guardado = { modo: Modo; opciones: string[]; giros: GiroLoco[] }
type Resultado =
  | { estado: 'listo' }
  | { estado: 'girando'; registro: string[]; aviso?: string }
  | { estado: 'ganador'; registro: string[]; texto: string }
  | { estado: 'caos'; registro: string[] }

function leerGuardado(): Guardado {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) ?? 'null') as Guardado | null
    if (g && MODOS.includes(g.modo) && Array.isArray(g.opciones) && Array.isArray(g.giros)) {
      return { modo: g.modo, opciones: g.opciones.map(String), giros: g.giros.filter((x) => x in GIROS) }
    }
  } catch {
    // Sin almacenamiento disponible: se usan los ejemplos.
  }
  return { modo: 'participantes', opciones: EJEMPLOS.participantes.opciones, giros: GIROS_INICIALES }
}

const etiquetaPaso = (paso: Paso, giro: GiroLoco) => (paso.tipo === 'reversa' ? '⇄ REVERSA' : GIROS[giro].etiqueta)

export function Sorteo() {
  const [inicial] = useState(leerGuardado)
  const [modo, setModo] = useState<Modo>(inicial.modo)
  const [opciones, setOpciones] = useState<string[]>(inicial.opciones)
  const [giros, setGiros] = useState<GiroLoco[]>(inicial.giros)
  const [texto, setTexto] = useState('')
  const [ayuda, setAyuda] = useState({ texto: AYUDA, error: false })
  const [resultado, setResultado] = useState<Resultado>({ estado: 'listo' })
  const [fuentesListas, setFuentesListas] = useState(false)
  const [confirmarLimpieza, setConfirmarLimpieza] = useState(false)

  const animador = useRef<Animador>(null)
  const entrada = useRef<HTMLInputElement>(null)
  const confeti = useRef<ConfetiHandle>(null)

  const slots = useMemo(() => armarSlots(opciones, giros), [opciones, giros])
  const vista = vistaPara(slots.length)
  const ocupado = resultado.estado === 'girando'
  const ejemplo = EJEMPLOS[modo]

  useEffect(() => {
    document.fonts?.ready.then(() => setFuentesListas(true))
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ modo, opciones, giros }))
    } catch {
      // Guardar es solo una comodidad.
    }
  }, [modo, opciones, giros])

  const avisar = (texto: string, error = false) => setAyuda({ texto, error })

  function agregar(e: FormEvent) {
    e.preventDefault()
    const nuevas = texto.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
    if (!nuevas.length) return avisar('Escribe al menos una opción.', true)
    const libres = MAX_SLOTS - slots.length
    if (libres <= 0) return avisar(`Chiripa admite hasta ${MAX_SLOTS} slots. Quita alguno para agregar más.`, true)
    const agregadas = nuevas.slice(0, libres)
    setOpciones([...opciones, ...agregadas])
    setTexto('')
    if (nuevas.length > libres) avisar(`Se agregaron ${libres}; Chiripa admite hasta ${MAX_SLOTS} slots.`, true)
    else if (vista === 'rueda' && vistaPara(slots.length + agregadas.length) === 'tragamonedas')
      avisar('Pasaste de 16 slots: ahora se juega en la tragamonedas. Jala la palanca.')
    else avisar(AYUDA)
  }

  function quitarOpcion(i: number) {
    const siguientes = opciones.filter((_, k) => k !== i)
    setOpciones(siguientes)
    setGiros(giros.slice(0, siguientes.length))
    avisar(AYUDA)
  }

  function limpiarLista() {
    setOpciones([])
    setGiros([])
    setResultado({ estado: 'listo' })
    setConfirmarLimpieza(false)
    avisar('Lista vacía. Agrega al menos 2 opciones para girar.')
    entrada.current?.focus()
  }

  function agregarGiro(giro: GiroLoco) {
    const motivo = motivoSinGiro(opciones.length, giros.length)
    if (motivo) return avisar(motivo, true)
    setGiros([...giros, giro])
  }

  function cambiarModo(m: Modo) {
    setConfirmarLimpieza(false)
    setModo(m)
    setOpciones(EJEMPLOS[m].opciones)
    setGiros(giros.slice(0, EJEMPLOS[m].opciones.length))
    setResultado({ estado: 'listo' })
    avisar(AYUDA)
  }

  function alternarMuchas() {
    setConfirmarLimpieza(false)
    setResultado({ estado: 'listo' })
    if (opciones.length > ejemplo.opciones.length) {
      setOpciones(ejemplo.opciones)
      setGiros(GIROS_INICIALES)
      avisar(AYUDA)
    } else {
      setOpciones([...ejemplo.opciones, ...ejemplo.extra])
      setGiros(['mas2', 'mas4', 'reversa', 'mas2'])
      avisar('24 opciones y 4 Giros Locos: ya no caben en la rueda, así que aparece la tragamonedas.')
    }
  }

  async function girar() {
    if (ocupado || !animador.current) return
    if (opciones.length < 2) return avisar('Necesitas al menos 2 opciones para girar.', true)
    const vistaActiva = animador.current
    const jugada = resolverJugada(slots)
    const registro: string[] = []
    setResultado({ estado: 'girando', registro })
    await vistaActiva.preparar()

    for (const [i, paso] of jugada.pasos.entries()) {
      if (i > 0) {
        // El paso anterior dejó la vista sobre un Giro Loco.
        const previo = jugada.pasos[i - 1]
        const slot = slots[previo.destino]
        if (slot.tipo === 'giro') {
          registro.push(etiquetaPaso(paso, slot.giro))
          setResultado({
            estado: 'girando',
            registro: [...registro],
            aviso:
              paso.tipo === 'reversa'
                ? `⇄ Reversa: gira ${paso.sentido === -1 ? 'al revés' : 'otra vez hacia adelante'}`
                : `${GIROS[slot.giro].etiqueta}: avanza ${GIROS[slot.giro].avance} slots`,
          })
          await esperar(750)
        }
      }
      await vistaActiva.animar(paso)
    }
    vistaActiva.terminar()

    if (jugada.ganador === null) return setResultado({ estado: 'caos', registro })
    const ganador = slots[jugada.ganador]
    const nombre = ganador.tipo === 'opcion' ? ganador.texto : ''
    setResultado({ estado: 'ganador', registro: [...registro, nombre], texto: nombre })
    confeti.current?.lanzar()
  }

  const etiqueta =
    resultado.estado === 'listo' ? 'Listo para girar'
    : resultado.estado === 'girando' ? (resultado.aviso ? '¡Giro Loco!' : 'Girando…')
    : resultado.estado === 'caos' ? 'Demasiado caos'
    : ejemplo.ganador
  const valor =
    resultado.estado === 'listo' ? ejemplo.pregunta
    : resultado.estado === 'girando' ? (resultado.aviso ?? '· · ·')
    : resultado.estado === 'caos' ? 'Seis Giros Locos seguidos. Gira otra vez.'
    : resultado.texto
  const registro = resultado.estado === 'listo' ? [] : resultado.registro

  return (
    <div className="sorteo">
      <div className="sorteo__escenario">
        <div className="sorteo__cabecera">
          <span>{vista === 'rueda' ? 'LA RUEDA' : 'MODO TRAGAMONEDAS'}</span>
          <span className={`contador${vista === 'tragamonedas' ? ' contador--maquina' : ''}`}>
            {slots.length} SLOTS
          </span>
        </div>
        <div className="sorteo__juego">
          {vista === 'rueda' ? (
            <Rueda ref={animador} slots={slots} fuentesListas={fuentesListas} />
          ) : (
            <Tragamonedas ref={animador} slots={slots} fuentesListas={fuentesListas} ocupado={ocupado} onJalar={girar} />
          )}
          <Confeti ref={confeti} />
        </div>
        <div className="resultado" aria-live="polite">
          <div className="resultado__etiqueta">{etiqueta}</div>
          <div className="resultado__valor">{valor}</div>
          {registro.length > 0 && (
            <ol className="resultado__registro">
              {registro.map((r, i) => (
                <li key={i} className={i < registro.length - 1 || resultado.estado !== 'ganador' ? 'es-giro' : ''}>
                  {r}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="sorteo__panel">
        <button className="btn btn--grande" type="button" onClick={girar} disabled={ocupado}>
          {vista === 'rueda' ? 'Girar la rueda' : 'Jalar la palanca'}
        </button>

        <div className="panel__grupo">
          <div className="panel__titulo">¿Qué vas a sortear?</div>
          <div className="pestanas" role="group" aria-label="Qué vas a sortear">
            {MODOS.map((m) => (
              <button key={m} type="button" className="pestana" aria-pressed={m === modo} disabled={ocupado} onClick={() => cambiarModo(m)}>
                {EJEMPLOS[m].pestana}
              </button>
            ))}
          </div>
        </div>

        <div className="panel__grupo">
          <div className="panel__fila">
            <label className="panel__titulo" htmlFor="nueva-opcion">Agrega opciones</label>
            {opciones.length > 0 && !confirmarLimpieza && (
              <button type="button" className="limpiar" disabled={ocupado} onClick={() => setConfirmarLimpieza(true)}>
                Limpiar lista
              </button>
            )}
          </div>
          {confirmarLimpieza && (
            <div className="confirmar" role="alertdialog" aria-labelledby="confirmar-texto">
              <p id="confirmar-texto">
                ¿Borrar {opciones.length === 1 ? 'la opción' : `las ${opciones.length} opciones`}
                {giros.length > 0 && ' y los Giros Locos'}? No se puede deshacer.
              </p>
              <div className="confirmar__botones">
                <button type="button" className="btn btn--peligro" disabled={ocupado} onClick={limpiarLista} autoFocus>
                  Sí, borrar todo
                </button>
                <button type="button" className="btn btn--claro" onClick={() => setConfirmarLimpieza(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
          <form className="agregar" onSubmit={agregar}>
            <input
              ref={entrada}
              id="nueva-opcion"
              type="text"
              autoComplete="off"
              placeholder={ejemplo.pista}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <button className="btn" type="submit" disabled={ocupado}>Agregar</button>
          </form>
          <div className="chips">
            {opciones.map((o, i) => (
              <span className="chip" key={`${o}-${i}`}>
                <span className="chip__texto">{o}</span>
                <button type="button" aria-label={`Quitar ${o}`} disabled={ocupado} onClick={() => quitarOpcion(i)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="panel__grupo">
          <div className="panel__titulo">Giros Locos</div>
          <div className="giros">
            {(Object.keys(GIROS) as GiroLoco[]).map((g) => (
              <button key={g} type="button" className="btn btn--giro" disabled={ocupado} onClick={() => agregarGiro(g)}>
                + {GIROS[g].etiqueta}
              </button>
            ))}
          </div>
          {giros.length > 0 && (
            <div className="chips">
              {giros.map((g, i) => (
                <span className="chip chip--giro" key={`${g}-${i}`}>
                  <span className="chip__texto">{GIROS[g].etiqueta}</span>
                  <button type="button" aria-label={`Quitar Giro Loco ${GIROS[g].etiqueta}`} disabled={ocupado} onClick={() => setGiros(giros.filter((_, k) => k !== i))}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="panel__pie">
          <button className="btn btn--claro" type="button" disabled={ocupado} onClick={alternarMuchas}>
            {opciones.length > ejemplo.opciones.length ? `Volver a ${ejemplo.opciones.length} opciones` : 'Probar con 24 opciones'}
          </button>
          <p className={`ayuda${ayuda.error ? ' ayuda--error' : ''}`} role="status">{ayuda.texto}</p>
        </div>
      </div>
    </div>
  )
}
