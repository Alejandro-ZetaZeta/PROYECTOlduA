-- Neon schema for the LDU-A site (replaces the InsForge schema).
-- Auth users live in neon_auth."user" (Managed Better Auth); the Data API
-- runs requests as `authenticated` (signed-in) or `anonymous` (guest).

begin;

grant usage on schema public to anonymous, authenticated;

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user. Roles are assigned with SQL by an operator.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id   uuid primary key references neon_auth."user"(id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer', 'admin'))
);

alter table public.profiles enable row level security;

create policy own_profile_select on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

grant select on public.profiles to authenticated;

-- Admin check helper: SECURITY DEFINER so it can read profiles without
-- recursing through the profiles RLS policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anonymous, authenticated;

-- ---------------------------------------------------------------------------
-- Torneo relámpago
-- ---------------------------------------------------------------------------
create table public.inscripciones_torneo (
  id            uuid        primary key default gen_random_uuid(),
  cedula        text        not null unique,
  email         text        not null,
  whatsapp      text        not null,
  carrera       text        not null,
  nivel         text        not null,
  nombre_equipo text        not null,
  created_at    timestamptz default now(),
  aprobado      boolean     not null default false,
  genero        text        not null default 'masculino'
                            check (genero in ('masculino', 'femenino'))
);

alter table public.inscripciones_torneo enable row level security;

-- Public registration: anonymous visitors may insert, but never self-approve.
create policy public_insert on public.inscripciones_torneo
  for insert to anonymous, authenticated
  with check (aprobado is not true);

create policy admin_select on public.inscripciones_torneo
  for select to authenticated
  using ((select public.is_admin()));

create policy admin_update on public.inscripciones_torneo
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy admin_delete on public.inscripciones_torneo
  for delete to authenticated
  using ((select public.is_admin()));

grant insert on public.inscripciones_torneo to anonymous;
grant select, insert, update, delete on public.inscripciones_torneo to authenticated;

create table public.partidos_torneo (
  id               uuid        primary key default gen_random_uuid(),
  equipo_local     text        not null,
  equipo_visitante text        not null,
  goles_local      integer     not null default 0 check (goles_local >= 0),
  goles_visitante  integer     not null default 0 check (goles_visitante >= 0),
  genero           text        not null check (genero in ('masculino', 'femenino')),
  created_at       timestamptz not null default now(),
  ronda            integer     not null default 1,
  estado           text        not null default 'pendiente'
                               check (estado in ('pendiente', 'finalizado')),
  penales_local    integer     check (penales_local is null or penales_local >= 0),
  penales_visitante integer    check (penales_visitante is null or penales_visitante >= 0),
  horario          text
);

alter table public.partidos_torneo enable row level security;

create policy partidos_public_read on public.partidos_torneo
  for select to anonymous, authenticated
  using (true);

create policy admin_write_partidos on public.partidos_torneo
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.partidos_torneo to anonymous;
grant select, insert, update, delete on public.partidos_torneo to authenticated;

create table public.torneo_config (
  id         text        primary key default 'default',
  finalizado boolean     not null default false,
  updated_at timestamptz not null default now()
);

insert into public.torneo_config (id, finalizado) values ('default', false);

alter table public.torneo_config enable row level security;

create policy torneo_config_public_read on public.torneo_config
  for select to anonymous, authenticated
  using (true);

create policy torneo_config_admin_update on public.torneo_config
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.torneo_config to anonymous;
grant select, update on public.torneo_config to authenticated;

-- Public RPC: only team names + gender of approved teams (no personal data).
create or replace function public.get_equipos_aprobados()
returns table(nombre_equipo text, genero text)
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select nombre_equipo, genero
  from public.inscripciones_torneo
  where aprobado = true
  order by created_at;
$$;

grant execute on function public.get_equipos_aprobados() to anonymous, authenticated;

-- ---------------------------------------------------------------------------
-- Olimpiadas 2026
-- ---------------------------------------------------------------------------
create table public.inscripciones_futbol (
  id            uuid        primary key default gen_random_uuid(),
  representante text        not null,
  numero        text        not null,
  cedula        text        not null unique,
  nombre_equipo text        not null,
  categoria     text        not null,
  carrera       text        not null,
  created_at    timestamptz default now()
);

create table public.inscripciones_basket (
  id                uuid        primary key default gen_random_uuid(),
  representante     text        not null,
  numero            text        not null,
  cedula            text        not null unique,
  nombre_equipo     text        not null,
  categoria         text        not null,
  area_conocimiento text        not null,
  created_at        timestamptz default now()
);

create table public.inscripciones_ecuavoley (
  id                uuid        primary key default gen_random_uuid(),
  representante     text        not null,
  numero            text        not null,
  cedula            text        not null unique,
  nombre_equipo     text        not null,
  categoria         text        not null,
  area_conocimiento text        not null,
  created_at        timestamptz default now()
);

create table public.inscripciones_ajedrez (
  id         uuid        primary key default gen_random_uuid(),
  nombres    text        not null,
  numero     text        not null,
  cedula     text        not null unique,
  carrera    text        not null,
  nivel      text        not null,
  created_at timestamptz default now()
);

create table public.inscripciones_pingpong (
  id         uuid        primary key default gen_random_uuid(),
  nombres    text        not null,
  numero     text        not null,
  cedula     text        not null unique,
  carrera    text        not null,
  nivel      text        not null,
  created_at timestamptz default now()
);

-- One block of policies/grants for the five olympic registration tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'inscripciones_futbol',
    'inscripciones_basket',
    'inscripciones_ecuavoley',
    'inscripciones_ajedrez',
    'inscripciones_pingpong'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy public_insert on public.%I for insert to anonymous, authenticated with check (true)', t);
    execute format('create policy admin_select on public.%I for select to authenticated using ((select public.is_admin()))', t);
    execute format('create policy admin_delete on public.%I for delete to authenticated using ((select public.is_admin()))', t);
    execute format('grant insert on public.%I to anonymous', t);
    execute format('grant select, insert, delete on public.%I to authenticated', t);
  end loop;
end $$;

create table public.partidos_olimpiadas (
  id                  uuid        primary key default gen_random_uuid(),
  equipo_local        text        not null,
  equipo_visitante    text        not null,
  goles_local         integer     not null default 0 check (goles_local >= 0),
  goles_visitante     integer     not null default 0 check (goles_visitante >= 0),
  amarillas_local     integer     not null default 0 check (amarillas_local >= 0),
  amarillas_visitante integer     not null default 0 check (amarillas_visitante >= 0),
  rojas_local         integer     not null default 0 check (rojas_local >= 0),
  rojas_visitante     integer     not null default 0 check (rojas_visitante >= 0),
  duracion_tiempo     integer     not null default 900 check (duracion_tiempo > 0),
  segundos_restantes  integer     not null default 900 check (segundos_restantes >= 0),
  en_curso            boolean     not null default false,
  estado              text        not null default 'pendiente'
                                  check (estado in ('pendiente', 'en_curso', 'finalizado')),
  historial           jsonb       not null default '[]'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  num_tiempos         integer     not null default 2 check (num_tiempos > 0),
  tiempo_actual       integer     not null default 1 check (tiempo_actual >= 1),
  penales_local       integer     check (penales_local >= 0),
  penales_visitante   integer     check (penales_visitante >= 0),
  disciplina          text        not null default 'futbol',
  categoria           text,
  grupo               text,
  fecha               integer     check (fecha is null or fecha between 1 and 8)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger partidos_olimpiadas_set_updated_at
  before update on public.partidos_olimpiadas
  for each row execute function public.set_updated_at();

-- Trigger-only helper: no client should call it through the Data API.
revoke execute on function public.set_updated_at() from public;

alter table public.partidos_olimpiadas enable row level security;

create policy public_select on public.partidos_olimpiadas
  for select to anonymous, authenticated
  using (true);

create policy admin_insert on public.partidos_olimpiadas
  for insert to authenticated
  with check ((select public.is_admin()));

create policy admin_update on public.partidos_olimpiadas
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy admin_delete on public.partidos_olimpiadas
  for delete to authenticated
  using ((select public.is_admin()));

grant select on public.partidos_olimpiadas to anonymous;
grant select, insert, update, delete on public.partidos_olimpiadas to authenticated;

create table public.olimpiadas_grupos (
  id         uuid        primary key default gen_random_uuid(),
  disciplina text        not null default 'futbol',
  categoria  text        not null check (categoria in ('Masculino', 'Femenino')),
  grupo      text        not null,
  equipo     text        not null,
  posicion   integer     not null check (posicion between 1 and 8),
  created_at timestamptz not null default now(),
  unique (disciplina, categoria, equipo),
  unique (disciplina, categoria, grupo, posicion)
);

alter table public.olimpiadas_grupos enable row level security;

create policy grupos_public_read on public.olimpiadas_grupos
  for select to anonymous, authenticated
  using (true);

create policy grupos_admin_insert on public.olimpiadas_grupos
  for insert to authenticated
  with check ((select public.is_admin()));

create policy grupos_admin_update on public.olimpiadas_grupos
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy grupos_admin_delete on public.olimpiadas_grupos
  for delete to authenticated
  using ((select public.is_admin()));

grant select on public.olimpiadas_grupos to anonymous;
grant select, insert, update, delete on public.olimpiadas_grupos to authenticated;

create table public.olimpiadas_schedule (
  id         uuid        primary key default gen_random_uuid(),
  partido_id uuid        not null references public.partidos_olimpiadas(id) on delete cascade,
  posicion   integer     not null default 1,
  created_at timestamptz default now()
);

alter table public.olimpiadas_schedule enable row level security;

create policy public_read_schedule on public.olimpiadas_schedule
  for select to anonymous, authenticated
  using (true);

create policy admin_manage_schedule on public.olimpiadas_schedule
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.olimpiadas_schedule to anonymous;
grant select, insert, update, delete on public.olimpiadas_schedule to authenticated;

-- Lookup indexes used by the fixture/standings filters.
create index idx_partidos_olimpiadas_grupo
  on public.partidos_olimpiadas (disciplina, categoria, grupo);

create index idx_olimpiadas_grupos_lookup
  on public.olimpiadas_grupos (disciplina, categoria, grupo);

commit;
