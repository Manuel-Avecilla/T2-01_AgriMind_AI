# AgriMind AI · Gestión de parcelas

Aplicación web de agricultura de precisión que convierte datos de humedad del suelo en decisiones de riego y alertas explicables. La versión actual cubre las fases 1–5.2 del [plan de migración](docs/PLAN_MIGRACION_VERCEL_SUPABASE.md): usuario registrado, parcelas propias, lecturas de humedad, semáforo automático y panel de alertas. Todavía no hay sensores reales, previsión meteorológica ni modelos de IA.

## Qué hace

- Registro e inicio de sesión con email y contraseña (hay botón de Google; requiere habilitar el proveedor en Supabase).
- Crear, editar y borrar parcelas: nombre, cultivo, superficie (ha), coordenadas, humedad y notas.
- Botón «Cargar parcelas de ejemplo» para demos (datos en `src/datosEjemplo.js`, no en SQL).
- Registrar lecturas de humedad del suelo y pH opcional, con historial y gráfica de Chart.js; exportar a CSV.
- Semáforo calculado por reglas, con alertas que explican la causa y se pueden resolver o descartar.
- Panel con contadores por estado y lista de alertas activas. Cada usuario ve solo sus datos (RLS).

## Stack

| Capa | Tecnología |
|---|---|
| Interfaz | HTML en `index.html` + módulos ES de JavaScript sin framework de UI |
| Estilos | Tailwind CSS 4 y tokens de marca en `src/styles.css` |
| Build y servidor de desarrollo | Vite 7 |
| Auth y base de datos | Supabase (Postgres + Auth + RLS), `@supabase/supabase-js` v2 |
| Gráficas | Chart.js 4 |
| Despliegue | Vercel (plan Hobby); el frontend habla directamente con Supabase, sin API propia |

## Requisitos

- Node.js `^20.19.0 || >=22.12.0` y pnpm 9.15.9. Usa pnpm por el `pnpm-lock.yaml` (npm puede reescribirlo).
- Un proyecto de Supabase. Vercel solo hace falta para desplegar.

## Puesta en marcha

1. Copia `.env.example` a `.env` y rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores de tu proyecto Supabase.
2. En Supabase → *SQL Editor*, ejecuta `supabase/schema.sql`. Es idempotente: crea `profiles`, `parcelas`, `lecturas` y `alertas`, con RLS, políticas, índices y el trigger que crea el perfil al registrarse. No inserta datos de ejemplo.
3. En Supabase → *Authentication*, activa email/contraseña. Para la demo conviene desactivar «Confirm email».
4. Instala y arranca:

   ```bash
   pnpm install
   pnpm dev
   ```

5. Abre http://localhost:5173, regístrate y pulsa «Cargar parcelas de ejemplo».

En desarrollo, `src/supabaseClient.js` expone el cliente como `window.supabase` para poder iniciar sesión desde la consola; esa exposición desaparece en el build de producción.

## Comandos

| Comando | Acción |
|---|---|
| `pnpm dev` | Servidor de desarrollo de Vite |
| `pnpm build` | Genera `dist/` (salida estática, ignorada por Git) |
| `pnpm preview` | Sirve localmente el contenido de `dist/` |

No hay scripts de test, lint, formatter ni typecheck.

## Variables de entorno

| Variable | Dónde | Pública | Uso |
|---|---|---|---|
| `VITE_SUPABASE_URL` | `.env` local y Vercel | Sí | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `.env` local y Vercel | Sí, por diseño | Clave pública; segura solo mientras RLS esté activo |

Nunca uses la clave `service_role` en el cliente ni la subas a Git: `.env` está en `.gitignore` y solo se versiona `.env.example`. Si más adelante se añade un asistente IA, la clave del modelo irá solo en variables de Vercel **sin** prefijo `VITE_`.

## Estructura

```
index.html               # única página (inicio / acceso / panel), carga /src/main.js
src/main.js              # arranque, sesión y recarga del panel
src/router.js            # rutas por hash: #/inicio, #/acceso, #/panel
src/supabaseClient.js    # createClient con variables VITE_*
src/auth.js              # registro, login, logout y nombre del perfil
src/parcelas.js          # CRUD de parcelas
src/lecturas.js          # lecturas, gráfica, CSV y exportación
src/alertas.js           # semáforo (evaluarParcela) y ciclo de alertas
src/datosEjemplo.js      # parcelas del botón de demo
src/styles.css           # Tailwind 4 + tokens de marca
supabase/schema.sql      # esquema, RLS y perfil automático
docs/                    # informe técnico, plan por fases y herramientas de IA
opencode.json            # MCPs y plugin de OpenCode
.opencode/skills/        # skills locales
```

Ya no existen `server.js`, `Dockerfile`, `docker-compose.yml` ni endpoints `/api/*`: son restos de la versión anterior y no deben reintroducirse.

## Reglas del semáforo

| Humedad del suelo | Estado | Mensaje |
|---|---|---|
| < 20 % | 🔴 rojo | Humedad crítica: riega hoy |
| 20–29 % | 🟡 amarillo | Humedad baja: planifica el riego |
| 30–70 % | 🟢 verde | Sin incidencias |
| 71–80 % | 🟡 amarillo | Exceso de agua: evita regar |
| > 80 % | 🔴 rojo | Encharcamiento: revisa el drenaje |

Los umbrales viven en `UMBRALES` (`src/alertas.js`); al cambiarlos hay que actualizar también los colores de `src/styles.css` y las franjas de la gráfica en `src/lecturas.js`. Cada alerta guarda su causa (por ejemplo, «Humedad 18 % < umbral 20 %»). La fase 6 añadirá el ajuste por lluvia prevista: `evaluarParcela` ya acepta `probabilidadLluvia24h`.

## Despliegue en Vercel

- Importa el repositorio desde GitHub: Vercel detecta Vite automáticamente (no hay `vercel.json`).
- Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en *Settings → Environment Variables*.
- En Supabase → *Authentication → URL Configuration*, registra la URL de Vercel como *Site URL* y en *Redirect URLs*.
- Cada push a la rama principal despliega solo. El plan gratuito de Supabase pausa proyectos inactivos: reactívalo antes de una demo.

## Herramientas de IA

| Herramienta | Uso |
|---|---|
| Claude (Anthropic) | Plan de desarrollo, generación de código y documentación inicial |
| OpenCode | Desarrollo por fases con agentes; configuración en `opencode.json` |

El detalle de skills (`supabase`, `frontend-design`), MCPs (Supabase, Vercel), proveedor y plugins está en [`docs/HERRAMIENTAS_IA.md`](docs/HERRAMIENTAS_IA.md).

## Trabajo futuro

- Fase 6: previsión de Open-Meteo y recomendación de riego (`src/clima.js`, aún no existe).
- Fase 7: una de las opciones — asistente IA, mapa con Leaflet o consulta por voz.
- Más adelante: sensores IoT y datos Sentinel, modelos de predicción de plagas, cooperativas y modo sin conexión.

Las reglas para agentes que trabajen en este repositorio están en [`AGENTS.md`](AGENTS.md).
