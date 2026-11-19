# AgriMind AI · Plan de migración a Vercel + Supabase

> Objetivo: pasar el proyecto actual (Express + PostgreSQL + Docker, sin login) a una **aplicación web en la nube**, con **inicio de sesión** y funcionalidades útiles para el negocio, **sin pasarela de pago** y sin complejidad innecesaria. Pensado para desarrollarse con **agentes gratuitos en OpenCode**.

---

## 1. Alcance

**Dentro del alcance (versión 1.0)**
- Registro, login y logout con Supabase Auth.
- Cada usuario ve y gestiona **solo sus datos** (Row Level Security).
- Gestión de parcelas, lecturas de humedad y alertas.
- Semáforo de estado **calculado automáticamente por reglas** (no a mano).
- Previsión meteorológica gratuita y recomendación de riego.
- Despliegue en Vercel con URL pública.

**Fuera del alcance (queda como trabajo futuro, tal como recoge el informe técnico)**
- Pasarela de pago y planes de suscripción.
- Sensores IoT reales (MQTT), imágenes Sentinel, CNN, aprendizaje por refuerzo.
- Cooperativas con varios usuarios por organización.
- App móvil nativa y modo sin conexión.

---

## 2. Qué cambia

| Antes | Después | Motivo |
|---|---|---|
| Node + Express (`server.js`) | **Se elimina.** El frontend habla con Supabase directamente | Menos código y nada que mantener |
| PostgreSQL en Docker | **Supabase (PostgreSQL gestionado)** | Base de datos en la nube gratuita |
| Sin autenticación | **Supabase Auth** (email + contraseña) | Requisito de proyecto funcional |
| Docker / Docker Compose | **Vercel** (despliegue automático desde GitHub) | Hosting gratuito con URL pública |
| Estado de alerta manual | **Estado calculado por reglas** | Acerca la app al valor del informe |
| HTML/CSS/JS en `public/` | **Vite + JavaScript sin framework** en `src/` | Variables de entorno y build sencillo en Vercel |

---

## 3. Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | HTML + CSS + JavaScript (módulos ES) con **Vite** | Se reutiliza casi todo el código actual |
| Auth + BD | **Supabase** (`@supabase/supabase-js` v2) | Auth, PostgreSQL y RLS |
| Hosting | **Vercel** (plan Hobby) | Despliegue desde GitHub |
| Clima | **Open-Meteo API** | Gratuita y sin API key |
| Gráficas | **Chart.js** | Historial de humedad |
| Función serverless (opcional) | `api/asistente.js` en Vercel | Asistente IA sin exponer la API key |
| Control de versiones | GitHub | Entregable obligatorio |

---

## 4. Funcionalidades

| ID | Funcionalidad | Prioridad | Fase |
|---|---|---|---|
| F1 | Registro, login, logout y sesión persistente | **MVP** | 3 |
| F2 | CRUD de parcelas (nombre, cultivo, superficie, ubicación, notas) | **MVP** | 2 |
| F3 | Datos aislados por usuario (RLS) | **MVP** | 1 |
| F4 | Registrar lecturas de humedad (y pH opcional) por parcela | **MVP** | 5 |
| F5 | Semáforo automático (verde/amarillo/rojo) con **explicación** de la causa | **MVP** | 5 |
| F6 | Panel resumen: nº de parcelas por estado y alertas activas | **MVP** | 5 |
| F7 | Alertas: crear automáticamente, marcar como *resuelta* o *descartada* | **MVP** | 5 |
| F8 | Gráfica del historial de humedad por parcela | Recomendada | 5 |
| F9 | Previsión de 3 días (Open-Meteo) y recomendación de riego | Recomendada | 6 |
| F10 | Exportar datos a CSV (los datos son del agricultor) | Recomendada | 5 |
| F11 | Botón «Cargar parcelas de ejemplo» para demos | Recomendada | 2 |
| F12 | Asistente IA que responde sobre *tus* parcelas | Opcional | 7 |
| F13 | Mapa de parcelas (Leaflet + OpenStreetMap) | Opcional | 7 |
| F14 | Consulta por voz (Web Speech API del navegador) | Opcional | 7 |

---

## 5. Modelo de datos

Ejecutar en el **SQL Editor de Supabase** (o con el MCP de Supabase) y guardar en `supabase/schema.sql`.

```sql
-- Perfil del usuario (se crea solo al registrarse)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  created_at timestamptz not null default now()
);

create table public.parcelas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nombre text not null,
  cultivo text not null,
  superficie_ha numeric(8,2) not null check (superficie_ha > 0),
  latitud numeric(9,6),
  longitud numeric(9,6),
  humedad_suelo numeric(5,2) check (humedad_suelo between 0 and 100), -- última lectura
  estado text not null default 'verde' check (estado in ('verde','amarillo','rojo')),
  notas text,
  created_at timestamptz not null default now()
);

create table public.lecturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  parcela_id uuid not null references public.parcelas(id) on delete cascade,
  humedad_suelo numeric(5,2) not null check (humedad_suelo between 0 and 100),
  ph numeric(3,1) check (ph between 0 and 14),
  medido_en timestamptz not null default now()
);

create table public.alertas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  parcela_id uuid not null references public.parcelas(id) on delete cascade,
  nivel text not null check (nivel in ('amarillo','rojo')),
  tipo text not null default 'riego',
  mensaje text not null,
  causa text,
  estado text not null default 'activa' check (estado in ('activa','resuelta','descartada')),
  created_at timestamptz not null default now()
);

create index on public.parcelas (user_id);
create index on public.lecturas (parcela_id, medido_en desc);
create index on public.alertas (user_id, estado);

-- Seguridad: cada usuario solo accede a lo suyo
alter table public.profiles enable row level security;
alter table public.parcelas enable row level security;
alter table public.lecturas enable row level security;
alter table public.alertas  enable row level security;

create policy "perfil propio" on public.profiles for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "parcelas propias" on public.parcelas for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "lecturas propias" on public.lecturas for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "alertas propias" on public.alertas for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Crear el perfil automáticamente al registrarse
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, new.raw_user_meta_data->>'nombre');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## 6. Reglas del semáforo (explicables)

Se implementan en `src/alertas.js` como una función pura `evaluarParcela(humedad, prevision)` que devuelve `{ estado, mensaje, causa }`. Los umbrales son **orientativos**: documentarlos como supuesto del proyecto y ajustables por cultivo.

| Condición (humedad del suelo) | Estado | Mensaje |
|---|---|---|
| < 20 % | 🔴 rojo | Humedad crítica: riega hoy |
| 20–29 % | 🟡 amarillo | Humedad baja: planifica el riego |
| 30–70 % | 🟢 verde | Sin incidencias |
| 71–80 % | 🟡 amarillo | Exceso de agua: evita regar |
| > 80 % | 🔴 rojo | Encharcamiento: revisa el drenaje |

**Ajuste por clima (Fase 6):** si el estado es amarillo por humedad baja y la probabilidad de lluvia en 24 h es ≥ 60 %, el mensaje pasa a «Espera a la lluvia prevista».

Cada alerta guarda la **causa** («Humedad 18 % < umbral 20 %»), de modo que el usuario siempre ve por qué se ha generado, como pide el informe técnico.

**Flujo de alertas:** al guardar una lectura → se recalcula el estado → si pasa a amarillo/rojo y no hay una alerta activa del mismo tipo, se crea → si vuelve a verde, las activas se marcan como *resueltas*. El usuario puede *descartar* una alerta (es la versión simple del «ciclo de mejora» del informe).

---

## 7. Estructura del proyecto

```
agrimind/
├── AGENTS.md              # Reglas para los agentes (ver sección 10)
├── opencode.json          # MCPs y plugins (ver HERRAMIENTAS_IA.md)
├── package.json
├── index.html             # Una sola página: vista login / vista panel
├── .env.example           # Plantilla sin valores reales
├── .gitignore             # Debe incluir .env y node_modules
├── api/
│   └── asistente.js       # (Opcional, Fase 7) función serverless
├── supabase/
│   └── schema.sql         # Esquema + RLS de la sección 5
└── src/
    ├── main.js            # Arranque y cambio de vistas
    ├── supabaseClient.js  # createClient con variables VITE_*
    ├── auth.js            # registro / login / logout
    ├── parcelas.js        # CRUD de parcelas
    ├── lecturas.js        # lecturas, historial, gráfica, CSV
    ├── alertas.js         # reglas del semáforo y gestión de alertas
    ├── clima.js           # Open-Meteo
    └── styles.css
```

Se eliminan: `server.js`, `Dockerfile`, `docker-compose.yml` y la carpeta `db/` (los datos de ejemplo de `init.sql` se reutilizan para el botón F11).

---

## 8. Fases de trabajo

Cada fase es pequeña y termina con algo que se puede probar. **Haz un commit al acabar cada una.**

### Fase 0 · Preparación
- [ ] Crear cuentas: GitHub, Supabase y Vercel.
- [ ] Instalar OpenCode, conectar el provider gratuito y añadir MCPs/skills/plugins (ver `HERRAMIENTAS_IA.md`).
- [ ] Crear el repositorio en GitHub con `.gitignore` (incluye `.env`) y `AGENTS.md`.
- **Hecho cuando:** OpenCode arranca en la carpeta del proyecto y lista los MCPs conectados.

### Fase 1 · Supabase
- [ ] Crear el proyecto en Supabase (región UE).
- [ ] Ejecutar `supabase/schema.sql`.
- [ ] En *Authentication*, activar email/contraseña. Para desarrollo y demo, desactivar «Confirm email» y activarlo de nuevo si se quiere más realismo.
- [ ] Copiar la URL y la clave pública (*anon / publishable*) a `.env` local.
- **Hecho cuando:** las 4 tablas existen con RLS activado y el asesor de seguridad de Supabase no marca tablas sin RLS.

### Fase 2 · Frontend con Vite + CRUD de parcelas
- [ ] Inicializar Vite (JS vanilla), mover el código de `public/` a `src/` y `index.html`.
- [ ] Crear `supabaseClient.js` con `import.meta.env.VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- [ ] Sustituir los `fetch('/api/parcelas')` por llamadas `supabase.from('parcelas')` (select, insert, update, delete).
- [ ] Añadir los campos latitud/longitud y el botón F11 «Cargar parcelas de ejemplo».
- **Hecho cuando:** `npm run dev` permite crear, editar y borrar parcelas guardadas en Supabase.
- *(Para probar antes del login se puede desactivar RLS un momento; reactivarlo en la Fase 3.)*

### Fase 3 · Autenticación
- [ ] Pantalla de registro y login (email + contraseña + nombre).
- [ ] `supabase.auth.onAuthStateChange` para mostrar el panel o la pantalla de login.
- [ ] Botón de cerrar sesión y mostrar el nombre del usuario.
- [ ] Reactivar RLS si se había desactivado.
- **Hecho cuando:** dos usuarios distintos no ven las parcelas del otro.

### Fase 4 · Primer despliegue en Vercel
- [ ] Subir el repositorio a GitHub y **importarlo en Vercel** (detecta Vite solo).
- [ ] Añadir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en *Settings → Environment Variables*.
- [ ] En Supabase → *Authentication → URL Configuration*: poner la URL de Vercel como **Site URL** y añadirla a *Redirect URLs*.
- **Hecho cuando:** la URL pública permite registrarse, iniciar sesión y gestionar parcelas. A partir de aquí, cada `git push` despliega solo.

### Fase 5 · Funcionalidades del negocio
- [ ] `lecturas.js`: formulario para registrar humedad (y pH) y actualizar `parcelas.humedad_suelo`.
- [ ] `alertas.js`: función `evaluarParcela` y flujo de alertas de la sección 6.
- [ ] Panel resumen con contadores por estado y lista de alertas activas (resolver / descartar).
- [ ] Gráfica de historial con Chart.js y botón «Exportar CSV».
- **Hecho cuando:** al registrar una humedad de 15 % la parcela pasa a rojo, aparece una alerta con su causa y, al registrar 45 %, la alerta se resuelve sola.

### Fase 6 · Clima y recomendación de riego
- [ ] `clima.js`: consulta a Open-Meteo con la latitud/longitud de la parcela (temperatura máxima y probabilidad de lluvia a 3 días).
- [ ] Mostrar la previsión en la ficha de la parcela y aplicar el ajuste por lluvia de la sección 6.
- **Hecho cuando:** una parcela con ubicación muestra su previsión y una recomendación de riego coherente.

### Fase 7 · Opcional (solo si hay tiempo)
Elegir **una** de estas tres:
- **Asistente IA (F12):** función `api/asistente.js` que comprueba el token del usuario, lee sus parcelas con RLS, llama al modelo y devuelve la respuesta. La API key del modelo va solo en variables de entorno de Vercel (sin prefijo `VITE_`).
- **Mapa (F13):** Leaflet + OpenStreetMap con un marcador por parcela, coloreado según su estado.
- **Voz (F14):** botón de micrófono con la Web Speech API que rellena la pregunta del asistente.

### Fase 8 · Documentación y entrega
- [ ] Actualizar `README.md` (stack nuevo, cómo ejecutar en local, variables de entorno, enlace de producción).
- [ ] Rellenar la tabla de «IAs utilizadas» con las herramientas realmente usadas.
- [ ] Hacer capturas de cada herramienta en uso (ver checklist de evidencias en `HERRAMIENTAS_IA.md`).
- [ ] Comprobar que no hay claves en el repositorio (`git log -p | grep -i key` y revisar `.env`).
- [ ] Preparar la presentación con los 6 apartados que exige el enunciado.

---

## 9. Variables de entorno y seguridad

| Variable | Dónde | Pública | Notas |
|---|---|---|---|
| `VITE_SUPABASE_URL` | `.env` local y Vercel | Sí | URL del proyecto |
| `VITE_SUPABASE_ANON_KEY` | `.env` local y Vercel | Sí, por diseño | Es segura **solo porque RLS está activado** |
| `LLM_API_KEY` | Solo Vercel (Fase 7) | **No** | Nunca con prefijo `VITE_` |

Reglas:
- **Nunca** usar la clave `service_role` en el frontend ni subirla a GitHub.
- `.env` en `.gitignore`; subir únicamente `.env.example` con nombres sin valores.
- No mostrar claves en capturas de pantalla de la presentación (el enunciado lo prohíbe).
- Vigilar los límites del plan gratuito: Supabase **pausa los proyectos inactivos**, así que conviene reactivar el proyecto antes de la demo.

---

## 10. Cómo trabajar con agentes gratuitos en OpenCode

Los modelos gratuitos tienen menos contexto y menos fiabilidad, así que conviene ayudarles:

1. **Una fase por sesión.** Sesión nueva en cada fase; no encadenar todo el proyecto en una conversación.
2. **Pedir un plan antes de escribir código** y revisarlo; después ejecutar.
3. **Peticiones pequeñas y concretas** (un archivo o una función cada vez), con el criterio de «hecho cuando» de la fase.
4. **Commit al terminar cada fase** para poder volver atrás si el agente rompe algo.
5. **No pegar claves ni datos personales reales en los prompts.** Los modelos gratuitos pueden usar los datos para mejorar el modelo durante el periodo gratuito.
6. La lista de modelos gratuitos **cambia con frecuencia**: comprobar con `/models` cuáles hay disponibles y cambiar de modelo si uno falla o responde mal.

**`AGENTS.md` sugerido** (el agente lo lee al empezar; mantenerlo corto):

```md
# AgriMind AI
App web de agricultura de precisión. Vite + JS vanilla + Supabase + Vercel.

## Reglas
- Sin frameworks de UI. Módulos ES en src/.
- Acceso a datos solo con supabase-js; nunca claves en el código.
- Variables públicas con prefijo VITE_. Nunca usar service_role en el cliente.
- Toda tabla nueva lleva RLS y políticas por user_id.
- Textos de la interfaz en español. Código y nombres de funciones coherentes con los existentes.
- Cambios pequeños: un archivo o función por petición. No reescribir lo que ya funciona.

## Comandos
- npm run dev · npm run build
```

**Prompt tipo por fase:**
> «Lee AGENTS.md y `PLAN_MIGRACION_VERCEL_SUPABASE.md`. Vamos a hacer solo la **Fase N**. Primero propón un plan breve y espera mi confirmación. Después implementa paso a paso y dime cómo probar cada paso.»

---

## 11. Criterios de aceptación (checklist final)

- [ ] Un usuario nuevo puede registrarse, iniciar sesión y cerrar sesión en la URL de Vercel.
- [ ] Dos cuentas distintas **no** ven los datos de la otra (probado con dos navegadores).
- [ ] Se pueden crear, editar y borrar parcelas.
- [ ] Una lectura de humedad cambia el estado de la parcela y genera/resuelve alertas con su causa.
- [ ] El panel resume parcelas por estado y alertas activas.
- [ ] Se muestra la previsión meteorológica de al menos una parcela.
- [ ] Se pueden exportar los datos a CSV.
- [ ] No hay claves ni contraseñas en el repositorio ni en la presentación.
- [ ] El repositorio de GitHub y el enlace público funcionan.
- [ ] Cada skill, MCP, provider y plugin instalado se ha usado de verdad y hay captura que lo demuestra.

---

## 12. Trabajo futuro

Pasarela de pago y planes por superficie y módulos, sensores IoT y datos Sentinel, modelos de IA para predecir plagas y optimizar el riego, cooperativas con varios usuarios, y modo sin conexión.
