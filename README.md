# Chiripa

La rueda de los Giros Locos: una rueda de la fortuna para sorteos, premios y turnos, hecha con React, Vite y TypeScript. Es una sola página, sin cuentas y sin backend; la lista de opciones se guarda en el navegador.

## Cómo funciona

1. **Escribe tus opciones**: participantes, premios, items o lo que quieras. Se pueden pegar varias separadas por comas.
2. **Suma Giros Locos**: slots especiales inspirados en las cartas de acción del UNO.
   - **+2**: la rueda avanza 2 slots más.
   - **+4**: la rueda avanza 4 slots más.
   - **Reversa**: la rueda vuelve a girar en sentido contrario.
3. **Gira**: la rueda solo se detiene en una opción normal. Los Giros Locos se encadenan, con un límite de 6 seguidos.

Hasta 16 slots se juega en la rueda. Desde 17, la rueda se convierte en una tragamonedas con palanca y los Giros Locos funcionan igual sobre el carrete.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm test         # tests de la lógica del juego (Vitest)
npm run lint     # oxlint
npm run build    # build de producción en dist/
```

## Estructura

- `src/game/reglas.ts`: reglas puras (armar slots, resolver una jugada con sus Giros Locos).
- `src/game/geometria.ts`: dónde para la rueda o el carrete para caer en un slot.
- `src/components/Rueda.tsx` y `Tragamonedas.tsx`: las dos vistas; animan los pasos que devuelve `resolverJugada`.
- `src/components/Sorteo.tsx`: estado del sorteo y panel de opciones.
- `src/index.css`: paleta pixel/arcade (fucsia, morado, amarillo, menta, celeste) y estilos.

## Publicar en Cloudflare

Chiripa está publicada en Cloudflare Workers (sitio estático), conectada a este repo: https://chiripa.alejandronavarrodimas.workers.dev/. Cada push a `main` vuelve a construir y publicar.

Configuración del build en Cloudflare:

| Campo | Valor |
| --- | --- |
| Build command | `npm run build` |
| Output / assets directory | `dist` |
| Production branch | `main` |

- La versión de Node la fija `.node-version` (22), que Cloudflare lee al construir.
- `public/_headers` define la caché de los archivos con hash y algunas cabeceras de seguridad; Cloudflare lo aplica tanto en Workers como en Pages.
- Es una sola página sin rutas, así que no hace falta configurar un fallback de SPA.

Para un proyecto nuevo en la misma cuenta: **Workers & Pages → Create → Import a repository**, elige el repo y usa la misma configuración de build.
