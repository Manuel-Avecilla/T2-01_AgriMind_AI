# AgriMind AI

App de agricultura de precisión: **Vite 7 + React 19 + Tailwind 4 + Supabase**, desplegada en Vercel. Fuente de verdad: `package.json` y `src/`; `README.md` está al día, pero `docs/PLAN_MIGRACION_VERCEL_SUPABASE.md` y parte de `docs/` siguen describiendo el stack vanilla anterior.

## Comandos

- `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm preview` (`packageManager: pnpm@9.15.9`, ESM). No hay test, lint ni typecheck: `pnpm build` es la única verificación automática.
- Si pnpm/npm no están en el PATH: `node node_modules/vite/bin/vite.js build`.
- Copiar `.env.example` a `.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`; `src/supabaseClient.js` lanza error si faltan. Solo claves públicas: nunca `service_role` ni una key de modelo con prefijo `VITE_`.

## Arranque y navegación

- `index.html` en la raíz carga `/src/main.jsx` (`createRoot`), **no** `main.js`. `dist/` es generado/ignorado. No hay servidor propio ni endpoints `/api/*`.
- `useSesion` (`src/hooks/`) resuelve `getSession()` antes de pintar, ignora el `INITIAL_SESSION` posterior del listener y serializa cambios en una cola. No dupliques ese flujo al tocar autenticación.
- `useRuta`: hash `#/inicio`, `#/acceso`, `#/panel`, `#/acceso?tab=registro`; sin sesión panel→acceso, con sesión acceso→panel. Las vistas siguen ocultas hasta conocer la sesión (`App.jsx`).
- `usePanel` carga parcelas + alertas con `Promise.allSettled` y usa `generacionRef` para descartar respuestas obsoletas; conserva ese patrón al recargar.
- `window.supabase` queda expuesto a propósito solo en desarrollo; no existe en producción.

## Datos y reglas de negocio

- Única capa de datos: `src/datos/` (supabase-js, sin DOM). Tablas `profiles`, `parcelas`, `lecturas`, `alertas`, con RLS por `auth.uid()`; `user_id` usa `default auth.uid()` y no se envía desde el cliente. Toda tabla nueva necesita RLS + políticas + GRANTs en `supabase/schema.sql` (idempotente) y pasar los advisores de seguridad; la anon key es segura solo mientras RLS esté activo.
- No meter datos de ejemplo en SQL: los inserta el botón de `Panel.jsx` mediante `insertarEjemplos()` (`src/datos/parcelas.js` → `datosEjemplo.js`).
- `evaluarParcela()` en `src/datos/alertas.js` es pura; umbrales en `UMBRALES` (20/30/70/80). Si los cambias, actualiza los tokens de `src/styles.css` y las franjas `bandasUmbral` en `src/componentes/GraficoHumedad.jsx`.
- Guardar lectura (`src/datos/lecturas.js`): insert en `lecturas` → update de `humedad_suelo`/`estado` en `parcelas` → `sincronizarAlerta()`. No elimines el índice único parcial `(parcela_id, tipo) where estado = 'activa'` ni el manejo del error `23505`: cubre dobles clics y pestañas concurrentes.
- `evaluarParcela` ya acepta `prevision.probabilidadLluvia24h` (lluvia ≥ 60 % cambia el mensaje), pero la Fase 6 (Open-Meteo) no está implementada: no existe `src/clima.js`.
- CSV generado en el cliente con BOM, separador `;` y comillas dobles para Excel en español; conserva ese formato.

## Convenciones y operación

- Interfaz y variables/funciones en español; componentes funcionales con hooks, sin framework de UI; estilos en `src/styles.css` (Tailwind 4 + tokens propios).
- Cambios pequeños, un archivo o función por petición; no reescribir lo que ya funciona. Estilo de trabajo: plan breve → confirmación → implementación → cómo probarlo → commit por fase.
- El plan por fases original (`docs/PLAN_MIGRACION_VERCEL_SUPABASE.md`) es vanilla; la migración a React está en `docs/fases_react/` (fases 1-5). Fase 6 y 7 pendientes.
- `opencode.json` define el plugin DCP y los MCPs remotos Supabase (limitado por `project_ref` y `features`) y Vercel; las skills viven en `.opencode/skills/`. No instalar MCPs/skills que no se vayan a usar: el enunciado lo exige.
- Despliegue sin `vercel.json`: Vercel detecta Vite. Definir las dos variables `VITE_*` en Vercel y registrar la URL como Site URL y Redirect URL en Supabase Auth. El plan gratuito pausa proyectos inactivos: reactivar antes de una demo.
