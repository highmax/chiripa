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

## Publicar en Cloudflare Pages

Chiripa se publica como sitio estático en Cloudflare Pages, conectado a este repo: cada push a `main` despliega producción y cada PR recibe su propia URL de vista previa.

Configuración del proyecto en Cloudflare:

| Campo | Valor |
| --- | --- |
| Framework preset | `React (Vite)` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (vacío) |
| Production branch | `main` |

- La versión de Node la fija `.node-version` (22), que Cloudflare lee al construir.
- `public/_headers` define la caché de los archivos con hash y algunas cabeceras de seguridad.
- No hace falta `_redirects`: es una sola página y, sin un `404.html`, Cloudflare Pages ya sirve `index.html` en cualquier ruta.

Pasos para conectarlo la primera vez:

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) y ve a **Workers & Pages → Create → Pages → Connect to Git**.
2. Autoriza la app de Cloudflare en GitHub y elige el repo `chiripa`.
3. Completa la tabla de arriba y pulsa **Save and Deploy**. El sitio queda en `https://<nombre>.pages.dev`.
4. (Opcional) En **Custom domains** del proyecto agrega un dominio propio.
