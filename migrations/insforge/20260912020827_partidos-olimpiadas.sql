-- =========================================================================
-- Olimpiadas 2026: match control (marcador, temporizador, tarjetas).
--
-- Admin-only table. The /olimpiadas-2026 admin panel uses this to run a
-- live match control UI (score, countdown timer, yellow/red cards) with
-- undo support. `historial` holds a small jsonb array of the last actions
-- (gol/amarilla/roja per side) so undo survives reloads.
--
-- RLS mirrors the canonical admin pattern:
--   FOR SELECT/INSERT/UPDATE/DELETE TO authenticated USING (is_admin()).
-- =========================================================================

CREATE TABLE public.partidos_olimpiadas (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_local      text        NOT NULL,
  equipo_visitante  text        NOT NULL,
  goles_local       integer     NOT NULL DEFAULT 0 CHECK (goles_local >= 0),
  goles_visitante   integer     NOT NULL DEFAULT 0 CHECK (goles_visitante >= 0),
  amarillas_local   integer     NOT NULL DEFAULT 0 CHECK (amarillas_local >= 0),
  amarillas_visitante integer   NOT NULL DEFAULT 0 CHECK (amarillas_visitante >= 0),
  rojas_local       integer     NOT NULL DEFAULT 0 CHECK (rojas_local >= 0),
  rojas_visitante   integer     NOT NULL DEFAULT 0 CHECK (rojas_visitante >= 0),
  tiempo_total      integer     NOT NULL DEFAULT 900 CHECK (tiempo_total > 0),
  segundos_restantes integer    NOT NULL DEFAULT 900 CHECK (segundos_restantes >= 0),
  en_curso          boolean     NOT NULL DEFAULT false,
  estado            text        NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_curso', 'finalizado')),
  historial         jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Keep updated_at in sync on every write. The match control recomputes the
-- running countdown from (segundos_restantes - elapsed since updated_at)
-- when the panel reopens, so this timestamp must be accurate.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER partidos_olimpiadas_set_updated_at
  BEFORE UPDATE ON public.partidos_olimpiadas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.partidos_olimpiadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_select ON public.partidos_olimpiadas
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY admin_insert ON public.partidos_olimpiadas
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY admin_update ON public.partidos_olimpiadas
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY admin_delete ON public.partidos_olimpiadas
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Admin-only table: no anon access. Runtime roles have broad default DML on
-- public tables, so RLS gates rows; grants mirror that for consistency.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partidos_olimpiadas TO authenticated;