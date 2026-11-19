-- AgriMind AI · Fase 1 — Esquema, RLS y perfil automático
-- Basado en la sección 5 de docs/PLAN_MIGRACION_VERCEL_SUPABASE.md.
-- Ajustes de seguridad incluidos:
--   · GRANT explícitos (Data API: las tablas nuevas ya no se exponen solas).
--   · REVOKE EXECUTE de handle_new_user() (advisors 0028/0029).
--   · WITH CHECK con EXISTS para que lecturas/alertas no referencien parcelas ajenas.
--   · Sentencias idempotentes para poder reaplicar el archivo sin errores.
-- No incluir datos de ejemplo: F11 los carga desde el cliente.

-- 1. Tablas -----------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  created_at timestamptz not null default now()
);

create table if not exists public.parcelas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nombre text not null,
  cultivo text not null,
  superficie_ha numeric(8,2) not null check (superficie_ha > 0),
  latitud numeric(9,6),
  longitud numeric(9,6),
  humedad_suelo numeric(5,2) check (humedad_suelo between 0 and 100),
  estado text not null default 'verde' check (estado in ('verde','amarillo','rojo')),
  notas text,
  created_at timestamptz not null default now()
);

create table if not exists public.lecturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  parcela_id uuid not null references public.parcelas(id) on delete cascade,
  humedad_suelo numeric(5,2) not null check (humedad_suelo between 0 and 100),
  ph numeric(3,1) check (ph between 0 and 14),
  medido_en timestamptz not null default now()
);

create table if not exists public.alertas (
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

-- 2. Índices ----------------------------------------------------------------

create index if not exists parcelas_user_id_idx
  on public.parcelas (user_id);
create index if not exists lecturas_parcela_medido_idx
  on public.lecturas (parcela_id, medido_en desc);
create index if not exists lecturas_user_id_idx
  on public.lecturas (user_id);
create index if not exists alertas_user_estado_idx
  on public.alertas (user_id, estado);
create index if not exists alertas_parcela_id_idx
  on public.alertas (parcela_id);

-- 3. Permisos de la Data API ------------------------------------------------
-- RLS decide QUÉ filas ve cada usuario; los GRANT deciden SI puede llamar a la API.
-- anon no recibe ningún permiso: hasta la Fase 3 solo entra authenticated.

grant select, insert, update, delete on
  public.profiles, public.parcelas, public.lecturas, public.alertas
  to authenticated;
grant select, insert, update, delete on
  public.profiles, public.parcelas, public.lecturas, public.alertas
  to service_role;

-- 4. Row Level Security -----------------------------------------------------

alter table public.profiles enable row level security;
alter table public.parcelas enable row level security;
alter table public.lecturas enable row level security;
alter table public.alertas  enable row level security;

drop policy if exists "perfil propio" on public.profiles;
create policy "perfil propio" on public.profiles for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "parcelas propias" on public.parcelas;
create policy "parcelas propias" on public.parcelas for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "lecturas propias" on public.lecturas;
create policy "lecturas propias" on public.lecturas for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.parcelas p
      where p.id = parcela_id
        and p.user_id = (select auth.uid())
    )
  );

drop policy if exists "alertas propias" on public.alertas;
create policy "alertas propias" on public.alertas for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.parcelas p
      where p.id = parcela_id
        and p.user_id = (select auth.uid())
    )
  );

-- 5. Perfil automático al registrarse --------------------------------------

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, new.raw_user_meta_data ->> 'nombre')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- La función es SECURITY DEFINER (necesario para escribir en public.profiles
-- desde un trigger de auth.users), pero no debe ser llamable desde la API.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
