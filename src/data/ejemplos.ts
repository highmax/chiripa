export type Modo = 'participantes' | 'premios' | 'items'

type Ejemplo = {
  pestana: string
  opciones: string[]
  extra: string[]
  pista: string
  ganador: string
  pregunta: string
}

export const EJEMPLOS: Record<Modo, Ejemplo> = {
  participantes: {
    pestana: 'Participantes',
    opciones: ['Ana', 'Luis', 'Camila', 'Mateo', 'Sofía', 'Diego'],
    extra: ['Valentina', 'Tomás', 'Isabella', 'Martín', 'Lucía', 'Sebastián', 'Mariana', 'Nicolás', 'Gabriela', 'Samuel', 'Daniela', 'Emilio', 'Paula', 'Andrés', 'Renata', 'Joaquín', 'Carla', 'Felipe'],
    pista: 'Ej: Valentina, Tomás',
    ganador: 'Le toca a',
    pregunta: '¿Quién será?',
  },
  premios: {
    pestana: 'Premios',
    opciones: ['Café gratis', 'Stickers', 'Taza', 'Camiseta', 'Gift card $20', 'Abrazo'],
    extra: ['Libreta', 'Llavero', 'Gorra', 'Termo', 'Chocolates', 'Vale de pizza', 'Tote bag', 'Pin', 'Póster', 'Calcetines', 'Audífonos', 'Planta', 'Libro', 'Peluche', 'Entrada al cine', 'Botella', 'Mousepad', 'Postre'],
    pista: 'Ej: Audífonos, Entrada al cine',
    ganador: 'Te ganaste',
    pregunta: '¿Qué premio sale?',
  },
  items: {
    pestana: 'Items',
    opciones: ['Pizza', 'Tacos', 'Sushi', 'Ramen', 'Arepas', 'Hamburguesa'],
    extra: ['Empanadas', 'Pasta', 'Ensalada', 'Pollo frito', 'Burrito', 'Ceviche', 'Curry', 'Dumplings', 'Falafel', 'Hot dog', 'Poke', 'Lasaña', 'Paella', 'Pupusas', 'Shawarma', 'Tamales', 'Waffles', 'Wok'],
    pista: 'Ej: Empanadas, Pasta',
    ganador: 'Hoy toca',
    pregunta: '¿Qué comemos hoy?',
  },
}

export const MODOS = Object.keys(EJEMPLOS) as Modo[]
