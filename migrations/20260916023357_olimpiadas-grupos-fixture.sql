-- =========================================================================
-- Olimpiadas 2026: sorteo de grupos + fixture + tabla clasificatoria.
--
-- Adds the persistence the public standings / admin draw need:
--   1. partidos_olimpiadas gains the group-stage metadata
--      (disciplina, categoria, grupo, fecha) so the existing live match
--      control becomes the single source of truth for results.
--   2. olimpiadas_grupos stores the official draw (team -> group/casilla).
--
-- Access model:
--   * groups + matches are public read (the table is the public product;
--     no PII is exposed by either).
--   * writes stay admin-only through the public.is_admin() helper.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Group-stage metadata on the live-control table.
--    Existing rows default to the football discipline with no group/fecha.
-- -------------------------------------------------------------------------
ALTER TABLE public.partidos_olimpiadas
  ADD COLUMN IF NOT EXISTS disciplina text NOT NULL DEFAULT 'futbol',
  ADD COLUMN IF NOT EXISTS categoria  text,
  ADD COLUMN IF NOT EXISTS grupo      text,
  ADD COLUMN IF NOT EXISTS fecha      integer
    CHECK (fecha IS NULL OR fecha BETWEEN 1 AND 8);

-- -------------------------------------------------------------------------
-- 2. Official group draw.
--    Uniqueness guarantees an equipo appears once per categoria and that no
--    two equipos share the same casilla (grupo + posicion).
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.olimpiadas_grupos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  disciplina  text        NOT NULL DEFAULT 'futbol',
  categoria   text        NOT NULL CHECK (categoria IN ('Masculino', 'Femenino')),
  grupo       text        NOT NULL,
  equipo      text        NOT NULL,
  posicion    integer     NOT NULL CHECK (posicion BETWEEN 1 AND 8),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (disciplina, categoria, equipo),
  UNIQUE (disciplina, categoria, grupo, posicion)
);

ALTER TABLE public.olimpiadas_grupos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS grupos_public_read  ON public.olimpiadas_grupos;
DROP POLICY IF EXISTS grupos_admin_insert ON public.olimpiadas_grupos;
DROP POLICY IF EXISTS grupos_admin_update ON public.olimpiadas_grupos;
DROP POLICY IF EXISTS grupos_admin_delete ON public.olimpiadas_grupos;

-- Both the public standings and the admin draw read the groups.
CREATE POLICY grupos_public_read ON public.olimpiadas_grupos
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY grupos_admin_insert ON public.olimpiadas_grupos
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY grupos_admin_update ON public.olimpiadas_grupos
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY grupos_admin_delete ON public.olimpiadas_grupos
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

REVOKE INSERT, UPDATE, DELETE ON public.olimpiadas_grupos FROM anon;
GRANT  SELECT                ON public.olimpiadas_grupos TO anon;
GRANT  SELECT, INSERT, UPDATE, DELETE ON public.olimpiadas_grupos TO authenticated;

-- -------------------------------------------------------------------------
-- 3. Public read of olympic matches so the landing page can compute the
--    standings client-side. Writes remain admin-only (existing policies).
--    The table carries no PII (equipos, marcador, tarjetas, reloj).
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS public_select ON public.partidos_olimpiadas;

CREATE POLICY public_select ON public.partidos_olimpiadas
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.partidos_olimpiadas TO anon;

-- -------------------------------------------------------------------------
-- 4. Lookup indexes for the fixture/standings filters.
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_partidos_olimpiadas_grupo
  ON public.partidos_olimpiadas (disciplina, categoria, grupo);

CREATE INDEX IF NOT EXISTS idx_olimpiadas_grupos_lookup
  ON public.olimpiadas_grupos (disciplina, categoria, grupo);
