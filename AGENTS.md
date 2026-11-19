# AgriMind AI

Simple Node/Express + PostgreSQL app (Docker & Docker Compose) for managing parcels (CRUD).

## Quick commands

- `docker compose up --build` – start app + PostgreSQL (app on port 3000, DB at `localhost:5432`)
- `docker compose down` – stop containers (data kept in the `pgdata` volume)
- `docker compose down -v` – stop **and remove** the Postgres volume (wipes sample data)
- `npm start` – run `node server.js` locally (DB reachable via default env vars)
- `npm run dev` – **not defined**; use `docker compose up --build` instead.

## Environment

Default database credentials (overridable via env):

| Variable | Default |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5432` |
| `DB_USER` | `agrimind` |
| `DB_PASSWORD` | `agrimind_pass` |
| `DB_NAME` | `agrimind` |

## Project layout

```
agrimind/
├── AGENTS.md          # this file — agent rules (see below)
├── opencode.json      # MCPs / plugins (supabase, Vercel)
├── package.json       # name agrimind-parcelas v1.0.0, scripts: start
├── server.js          # Express API (GET/POST/PUT/DELETE `/api/parcelas`) + static files from `public/`
├── db/init.sql        # creates `parcelas` table + inserts three example rows
├── Dockerfile         # FROM node:20-alpine, npm install --omit=dev, COPY, EXPOSE 3000, CMD ["node","server.js"]
├── docker-compose.yml # services: db (postgres:16-alpine) and app (ports 3000:3000)
└── public/
    ├── index.html     # single-page form + list
    ├── styles.css     # CSS variables, table styling, buttons
    └── app.js         # ES module UI: fetch API wrapper, pintar(), cargar(), editar/borrar
```

## Data model (`db/init.sql`)

```sql
CREATE TABLE IF NOT EXISTS parcelas (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  cultivo       VARCHAR(100) NOT NULL,
  superficie_ha NUMERIC(8,2) NOT NULL CHECK (superficie_ha > 0),
  humedad_suelo NUMERIC(5,2) NOT NULL CHECK (humedad_suelo BETWEEN 0 AND 100),
  estado        VARCHAR(10) NOT NULL DEFAULT 'verde' CHECK (estado IN ('verde','amarillo','rojo')),
  notas         TEXT NOT NULL DEFAULT ''
);
INSERT INTO parcelas (nombre, cultivo, superficie_ha, humedad_suelo, estado, notas) VALUES
  ('Parcela 1', 'Olivar',   6.50, 41.0, 'verde',    'Riego programado con normalidad.'),
  ('Parcela 2', 'Girasol', 3.20, 27.5, 'amarillo', 'Humedad en descenso, vigilar esta semana.'),
  ('Parcela 3', 'Trigo',    8.00, 14.0, 'rojo',     'Estrés hídrico: regar cuanto antes.');
```

## Things an agent should **avoid**

- Do **not** add `service_role` or a real `LLM_API_KEY` to the repo or `.env` committed to Git.
- Do **not** modify `Dockerfile` to install dev dependencies (`--omit=dev` is intentional).
- Do **not** assume a test runner or linter is configured; only `npm start` script exists.
- Do **not** edit `public/` CSS/HTML without first confirming `server.js` still serves the folder unchanged.
- Do **not** insert raw SQL that bypasses the `parcelas` schema in `init.sql` without also updating the sample-data INSERT.

## Prompt style for future sessions

> "Lee AGENTS.md y `PLAN_MIGRACION_VERCEL_SUPABASE.md`. Vamos a hacer solo la **Fase N**. Primero propón un plan breve y espera mi confirmación. Después implementa paso a paso y dime cómo probar cada paso."

## Phase workflow (from PLAN_MIGRACION_VERCEL_SUPABASE.md)

1. **Phase 0 – Preparation**: create GitHub/Supabase/Vercel accounts, install OpenCode + free provider MCPs, create repo with `.gitignore` (include `.env`) and `AGENTS.md`.
2. **Phase 1 – Supabase**: create project in Supabase (EU region), run `supabase/schema.sql`, enable email/password auth, copy URL/key into `.env` local.
3. **Phase 2 – Frontend**: init Vite (JS vanilla), move `public/` → `src/`, create `supabaseClient.js` with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, replace `fetch('/api/parcelas')` calls with `supabase.from('parcelas')` select/insert/update/delete, add lat/long fields and F11 "Cargar parcelas de ejemplo".
4. **Phase 3 – Auth**: build login/register page, `supabase.auth.onAuthStateChange`, logout, re-enable RLS if disabled.
5. **Phase 4 – First Vercel deploy**: push to GitHub, import to Vercel (detects Vite), add env vars in Settings → Environment Variables, point Supabase URL in Auth → URL Configuration to Vercel Site URL.
6. **Phase 5 – Business features**: `lecturas.js` (record humidity/pH), `alertas.js` (`evaluarParcela` + alert flow), summary panel, CSV export.
7. **Phase 6 – Climate**: `clima.js` querying Open-Meteo, show forecast + irrigation recommendation.
8. **Phase 7 – Optional**: IA assistant (`api/asistente.js`), Leaflet map, voice button.

## Acceptance checklist

- [ ] New user can register, log in, log out on the Vercel URL.
- [ ] Two distinct users see each other's data? (RLS check)
- [ ] Create / edit / delete parcels work.
- [ ] Recording a humidity reading changes state and generates/resolves alerts with cause.
- [ ] Summary panel shows counts per status and active alerts.
- [ ] At least one parcel shows weather forecast and a watering recommendation.
- [ ] Data export to CSV works.
- [ ] No secrets or real passwords in the repo or slides.
