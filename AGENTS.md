# AgriMind AI

App de agricultura de precisión: **Vite + JavaScript vanilla + Tailwind 4 + Supabase**, desplegada en Vercel. `README.md` está desactualizado (describe la versión antigua Express/Postgres/Docker con `public/`): en código, manda `package.json` y `src/`.

## Comandos

- `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm preview` (`packageManager: pnpm@9.15.9`, ESM). No hay scripts de test, lint ni typecheck; `dist/` es generado y está ignorado.
- Si pnpm/npm no están en el PATH de la sesión, el build funciona con `node node_modules/vite/bin/vite.js build`.
- Copiar `.env.example` a `.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`; `src/supabaseClient.js` lanza error si faltan. Solo claves públicas: nunca `service_role` ni una key de modelo con prefijo `VITE_`.

## Arranque y Rutas

- `index.html` en la raíz es la fuente (carga `/src/main.js`); `dist/` es solo salida de Vite. Ya no existen `server.js`, `Dockerfile` ni endpoints `/api/*` propios.
- `src/main.js` resuelve la sesión con `getSession()` antes de pintar para evitar parpadeo, ignora el `INITIAL_SESSION` posterior del listener y serializa los cambios de sesión en una cola. No dupliques ese flujo al tocar autenticación.
- Rutas por hash (`src/router.js`): `#/inicio`, `#/acceso`, `#/panel` y `#/acceso?tab=registro`. Sin sesión, `#/panel` redirige a acceso; con sesión, acceso redirige a panel. Las vistas permanecen ocultas hasta conocer la sesión.
- En desarrollo `window.supabase` queda expuesto a propósito para probar login desde la consola; no existe en producción.

## Datos (Supabase)

- Única capa de datos es supabase-js. Tablas `profiles`, `parcelas`, `lecturas`, `alertas`, con RLS por `auth.uid()`; `user_id` usa `default auth.uid()` y no se envía desde el cliente. Toda tabla nueva necesita RLS + políticas + GRANTs explícitos (ver `supabase/schema.sql`, idempotente).
- No meter datos de ejemplo en SQL: los inserta el botón F11 desde `src/datosEjemplo.js`.
- Al modificar el esquema, pasar los advisores de seguridad de Supabase; la anon key es segura solo mientras RLS esté activo.

## Semáforo y alertas

- `evaluarParcela()` en `src/alertas.js` es pura; sus umbrales están en `UMBRALES` (20/30/70/80). Si los cambias, actualiza también los tokens de color de `src/styles.css` y las franjas `bandasUmbral` en `src/lecturas.js`.
- Guardar lectura (`src/lecturas.js`): insert en `lecturas` → update de `humedad_suelo`/`estado` en `parcelas` → `sincronizarAlerta()`. Hay un índice único parcial `(parcela_id, tipo) where estado = 'activa'`; el código maneja el error `23505` actualizando la alerta existente. No lo elimines: cubre dobles clics y pestañas concurrentes.
- `evaluarParcela` ya acepta `prevision.probabilidadLluvia24h` (lluvia ≥ 60 % cambia el mensaje de humedad baja), pero la Fase 6 (Open-Meteo) aún no está implementada: no existe `src/clima.js`.
- Los CSV se generan en el cliente con BOM, separador `;` y comillas dobles para Excel en español; conserva ese formato.

## Convenciones y operación

- Textos de interfaz en español; nombres de funciones y variables en español, coherentes con `src/`. Sin frameworks de UI: módulos ES en `src/`, estilos en `src/styles.css` (Tailwind 4 + tokens propios).
- Cambios pequeños, un archivo o función por petición; no reescribir lo que ya funciona. El plan por fases está en `docs/PLAN_MIGRACION_VERCEL_SUPABASE.md` (estado actual: Fase 5.2). Estilo de trabajo: plan breve → confirmación → implementación → cómo probarlo → commit por fase.
- `opencode.json` define el plugin DCP y los MCPs remotos Supabase (limitado por `project_ref` y `features`) y Vercel; las skills viven en `.opencode/skills/`. No instalar MCPs/skills que no se vayan a usar: el enunciado lo exige.
- Despliegue sin `vercel.json`: Vercel detecta Vite. Definir las dos variables `VITE_*` en Vercel y registrar la URL resultante como Site URL y Redirect URL en Supabase Auth. El plan gratuito pausa proyectos inactivos: reactivar antes de una demo.
