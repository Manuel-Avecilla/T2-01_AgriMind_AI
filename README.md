# AgriMind AI

**Agricultura de precisión: decisiones de riego que se pueden explicar.**

AgriMind AI es una aplicación web donde cada agricultor gestiona sus parcelas, registra lecturas de humedad del suelo y recibe alertas de riego con la **causa** que las originó. Cada usuario ve solo sus propios datos (Row Level Security de Supabase). No hay pasarela de pago ni modelos de IA en el cliente: la versión actual implementa reglas agronómicas explícitas y auditables.

Proyecto **T2-01 · Desarrollo de una aplicación web con herramientas de inteligencia artificial**. Repositorio: <https://github.com/Manuel-Avecilla/T2-01_AgriMind_AI>.

> **Estado:** versión 2.0.0, migrada a **React**. El plan original ([`docs/PLAN_MIGRACION_VERCEL_SUPABASE.md`](docs/PLAN_MIGRACION_VERCEL_SUPABASE.md)) y parte de [`AGENTS.md`](AGENTS.md) describen el stack anterior (JavaScript vanilla); la migración a React está documentada en [`docs/fases_react/`](docs/fases_react/) y el código vigente es `package.json` + `src/`. Faltan la Fase 6 (clima) y la Fase 7 (extras opcionales).

## Funcionalidades

- **Acceso:** registro con nombre, login con correo/contraseña y botón de Google (requiere habilitar el proveedor en Supabase), cierre de sesión y nombre del perfil en la cabecera. Mensajes de error traducidos y cuenta atrás de 60 s cuando Supabase devuelve un *rate limit*.
- **Parcelas:** alta, edición y borrado con confirmación; nombre, cultivo, superficie (ha), coordenadas opcionales, humedad y notas. El semáforo se calcula solo a partir de la humedad.
- **Datos de demo:** botón «Cargar parcelas de ejemplo» que inserta 3 parcelas (verde/amarillo/rojo) desde `src/datos/datosEjemplo.js`, nunca desde SQL.
- **Lecturas:** registro de humedad (0–100 %), pH opcional (0–14) y fecha/hora; historial de hasta 100 lecturas ordenadas por fecha, con estadísticas de última, mínima y máxima.
- **Gráfica:** evolución de la humedad con Chart.js, franjas de color por umbral, escala 0–100 % y *tooltip* con el pH. Chart.js se carga de forma diferida (`import()`).
- **Alertas explicables:** se crean o actualizan automáticamente al guardar una lectura; cada una muestra el motivo («Humedad 18 % < umbral 20 %») y se puede **resolver** o **descartar**. Una lectura en verde resuelve las activas de la parcela.
- **Panel resumen:** contadores de parcelas totales, en verde, amarillo y rojo, y de alertas activas; derivados de los datos cargados, sin estado duplicado.
- **Exportación:** CSV de parcelas y de lecturas por parcela, generado en el cliente con BOM, separador `;` y comillas dobles (Excel en español).
- **Accesibilidad y diseño:** interfaz en español, navegación por teclado, `aria-live` para avisos y cambios de vista, foco al navegar, tabla adaptada a fichas en móvil, tipografía Public Sans y tokens de marca propios (azul marino / verde esmeralda / naranja).

## Stack

| Capa | Tecnología |
|---|---|
| Interfaz | **React 19** (componentes funcionales y hooks), un único `index.html` con `<div id="root">` |
| Estilos | **Tailwind CSS 4** (`@tailwindcss/vite`) + tokens de marca en `src/styles.css` |
| Build / dev server | **Vite 7** (sin `vercel.json`: Vercel detecta Vite automáticamente) |
| Auth y base de datos | **Supabase** (Postgres + Auth + RLS) mediante `@supabase/supabase-js` v2 |
| Gráficas | **Chart.js 4** |
| Tipografía | `@fontsource-variable/public-sans` |
| Despliegue | **Vercel** (plan Hobby). No hay servidor propio ni endpoints `/api/*` |
| Entorno de desarrollo | pnpm 9.15.9, OpenCode con MCPs y skills (ver sección correspondiente) |

## Requisitos

- Node.js `^20.19.0 || >=22.12.0` (exigido por Vite 7) y **pnpm 9.15.9** (hay `pnpm-lock.yaml`; npm puede reescribirlo).
- Un proyecto de Supabase. Vercel solo hace falta para desplegar.

## Puesta en marcha

1. Copia `.env.example` a `.env` y rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores públicos de tu proyecto Supabase.
2. En Supabase → *SQL Editor*, ejecuta [`supabase/schema.sql`](supabase/schema.sql). Es **idempotente**: crea `profiles`, `parcelas`, `lecturas` y `alertas`, con RLS, políticas, GRANTs, índices y el trigger que crea el perfil al registrarse. No inserta datos de ejemplo.
3. En Supabase → *Authentication*, activa el proveedor email/contraseña. Para una demo conviene desactivar «Confirm email» (y volver a activarlo si se quiere más realismo). Para el botón de Google, habilita y configura el proveedor.
4. Instala y arranca:

   ```bash
   pnpm install
   pnpm dev
   ```

5. Abre <http://localhost:5173>, regístrate y pulsa «Cargar parcelas de ejemplo».

Si `pnpm`/`npm` no están en el PATH de la sesión, el build funciona con `node node_modules/vite/bin/vite.js build`.

> En desarrollo, `src/supabaseClient.js` expone el cliente como `window.supabase` para poder iniciar sesión desde la consola. Esa exposición desaparece en el build de producción (`import.meta.env.DEV`).

## Comandos

| Comando | Acción |
|---|---|
| `pnpm dev` | Servidor de desarrollo de Vite |
| `pnpm build` | Genera `dist/` (salida estática, ignorada por Git) |
| `pnpm preview` | Sirve localmente el contenido de `dist/` |

No hay scripts de test, lint, formatter ni typecheck.

## Variables de entorno y seguridad

| Variable | Dónde | Pública | Uso |
|---|---|---|---|
| `VITE_SUPABASE_URL` | `.env` local y Vercel | Sí | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `.env` local y Vercel | Sí, por diseño | Clave pública; segura **solo mientras RLS esté activo** |

- **Nunca** uses la clave `service_role` en el cliente ni la subas a Git: `.env` está en `.gitignore` y solo se versiona `.env.example`.
- `user_id` lo rellena el `default auth.uid()` de la tabla; el cliente nunca lo envía.
- Si se añade un asistente IA, la clave del modelo irá solo en variables de entorno de Vercel **sin** prefijo `VITE_`.
- Tras cualquier cambio de esquema, pasa los *advisors* de seguridad de Supabase.

## Estructura del proyecto

```
index.html                  # única página; carga /src/main.jsx
src/
├── main.jsx                # montaje de React (createRoot)
├── App.jsx                 # compone sesión, ruta, panel, cabecera y pie
├── supabaseClient.js       # createClient con variables VITE_*
├── styles.css              # Tailwind 4 + tokens de marca
├── hooks/
│   ├── useSesion.js        # sesión resuelta antes de pintar; cola de cambios
│   ├── useRuta.js          # rutas por hash, títulos, foco y redirecciones
│   └── usePanel.js         # carga parcelas + alertas en paralelo y recarga
├── componentes/
│   ├── Acceso.jsx          # login, registro y Google
│   ├── Panel.jsx           # orquesta resumen, alertas, formulario y lista
│   ├── Resumen.jsx         # contadores derivados
│   ├── AlertasActivas.jsx  # resolver / descartar
│   ├── FormularioParcela.jsx / ListaParcelas.jsx
│   ├── DialogoLectura.jsx  # medir e historial (<dialog>)
│   ├── GraficoHumedad.jsx  # Chart.js con franjas de umbral
│   ├── Cabecera.jsx / Pie.jsx / Inicio.jsx / Logo.jsx / navegacion.js
└── datos/                  # capa de datos: solo supabase-js, sin DOM
    ├── auth.js             # sesión, login, registro, OAuth y mensajes de error
    ├── parcelas.js         # CRUD de parcelas + inserción de ejemplos
    ├── lecturas.js         # historial y guardado de lecturas
    ├── alertas.js          # semáforo, UMBRALES y ciclo de alertas
    ├── csv.js              # exportación compatible con Excel en español
    └── datosEjemplo.js     # parcelas del botón de demo
public/agrimind_logo.svg    # logotipo
supabase/schema.sql         # esquema + RLS + perfil automático
docs/                       # informe técnico, plan por fases y herramientas de IA
opencode.json / .opencode/skills / skills-lock.json  # configuración de OpenCode
dist/                       # generado por Vite, ignorado por Git
```

No existen `server.js`, `Dockerfile`, `docker-compose.yml`, `db/` ni endpoints `/api/*`: son restos de la versión anterior y no deben reintroducirse.

## Arquitectura y rutas

- **Rutas por hash** ([`src/hooks/useRuta.js`](src/hooks/useRuta.js)): `#/inicio`, `#/acceso`, `#/panel` y `#/acceso?tab=registro`. Sin sesión, `#/panel` redirige a acceso; con sesión, acceso redirige a panel. Se actualizan `document.title`, el foco del título y un anuncio `aria-live`.
- **Sesión** ([`src/hooks/useSesion.js`](src/hooks/useSesion.js)): se resuelve con `getSession()` antes de pintar para evitar parpadeo, se ignora el `INITIAL_SESSION` posterior del listener y los cambios se serializan en una cola. Mientras no se conozca, `App.jsx` muestra una pantalla de arranque.
- **Datos** ([`src/datos/`](src/datos/)): única capa de acceso a Supabase; las vistas solo reciben props. `usePanel` carga parcelas y alertas con `Promise.allSettled` y expone `recargar()` tras cada cambio.
- **Tablas:** `profiles`, `parcelas`, `lecturas` y `alertas`, filtradas por `auth.uid()` mediante RLS. `lecturas` y `alertas` comprueban además que la parcela referenciada pertenece al usuario.

### Semáforo y alertas

`evaluarParcela()` en [`src/datos/alertas.js`](src/datos/alertas.js) es una **función pura**; umbrales en `UMBRALES` (20 / 30 / 70 / 80):

| Humedad del suelo | Estado | Mensaje |
|---|---|---|
| < 20 % | 🔴 rojo | Humedad crítica: riega hoy |
| 20–29 % | 🟡 amarillo | Humedad baja: planifica el riego |
| 30–70 % | 🟢 verde | Sin incidencias |
| 71–80 % | 🟡 amarillo | Exceso de agua: evita regar |
| > 80 % | 🔴 rojo | Encharcamiento: revisa el drenaje |

Si cambias los umbrales, actualiza también los tokens de color de `src/styles.css` y las franjas `bandasUmbral` de `src/componentes/GraficoHumedad.jsx`. Cada alerta guarda su **causa** (p. ej. «Humedad 18 % < umbral 20 %»).

**Flujo al guardar una lectura** ([`src/datos/lecturas.js`](src/datos/lecturas.js)): insert en `lecturas` → update de `humedad_suelo`/`estado` en `parcelas` → `sincronizarAlerta()`. Existe un índice único parcial `(parcela_id, tipo) where estado = 'activa'` que evita duplicados por doble clic o pestañas concurrentes; el código gestiona el error `23505` actualizando la alerta existente. **No eliminar** esa red de seguridad.

`evaluarParcela` ya acepta `prevision.probabilidadLluvia24h` (lluvia ≥ 60 % cambia el mensaje de humedad baja por «Espera a la lluvia prevista»), pero la Fase 6 aún no está implementada: no existe `src/clima.js`.

## Despliegue en Vercel

1. Importa el repositorio desde GitHub: Vercel detecta Vite automáticamente (no hay `vercel.json`).
2. Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en *Settings → Environment Variables*.
3. En Supabase → *Authentication → URL Configuration*, registra la URL de Vercel como **Site URL** y añádela a **Redirect URLs**.
4. Cada push a la rama principal despliega solo. El enlace de producción se obtiene en el dashboard de Vercel (no está versionado en el repositorio).
5. El plan gratuito de Supabase pausa proyectos inactivos: reactívalo antes de una demo.

## Documentación y herramientas de IA

| Documento | Contenido |
|---|---|
| [`docs/informe_tecnico.md`](docs/informe_tecnico.md) | Memoria del proyecto: idea de negocio, arquitectura de IA propuesta, impacto y conclusiones |
| [Enunciado de la tarea](<docs/PROYECTO_ DESARROLLO DE UNA APLICACIÓN WEB CON HERRAMIENTAS DE INTELIGENCIA ARTIFICIAL.md>) | Objetivos, entregables y criterios de evaluación |
| [`docs/PLAN_MIGRACION_VERCEL_SUPABASE.md`](docs/PLAN_MIGRACION_VERCEL_SUPABASE.md) | Plan por fases, alcance, modelo de datos y criterios de aceptación |
| [`docs/fases_react/`](docs/fases_react/) | Migración a React, fase a fase |
| [`docs/HERRAMIENTAS_IA.md`](docs/HERRAMIENTAS_IA.md) | Skills, MCPs, provider y plugins: justificación, instalación y evidencias |
| [`docs/prompts.md`](docs/prompts.md) | Registro de la IA usada para los prompts |

Entorno de desarrollo: [`opencode.json`](opencode.json) configura el plugin **Dynamic Context Pruning** (DCP) y los MCPs remotos de **Supabase** (limitado por `project_ref` y `features`) y **Vercel**. Las skills locales se listan en `skills-lock.json` y viven en `.opencode/skills/` (entre ellas `supabase`, `frontend-design` y `supabase-postgres-best-practices`). El proveedor de modelos se conecta desde OpenCode (`/connect`, `/models`); no se guardan claves en el repositorio. No instalar MCPs ni skills que no se vayan a usar: el enunciado lo exige.

## Trabajo futuro

- **Fase 6:** previsión de Open-Meteo (temperatura y probabilidad de lluvia a 3 días) y recomendación de riego por parcela (`src/clima.js`, aún no existe).
- **Fase 7 (elegir una):** asistente IA con clave en Vercel (sin prefijo `VITE_`), mapa con Leaflet + OpenStreetMap o consulta por voz con Web Speech API.
- Fuera de alcance: pasarela de pago, sensores IoT reales, imágenes Sentinel, CNN, aprendizaje por refuerzo, cooperativas multiusuario, app móvil nativa y modo sin conexión.

Las reglas para agentes que trabajen en este repositorio están en [`AGENTS.md`](AGENTS.md).
