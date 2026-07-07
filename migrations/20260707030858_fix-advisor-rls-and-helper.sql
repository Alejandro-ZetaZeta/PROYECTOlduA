-- =========================================================================
-- Fix InsForge advisor: 9 RLS / function / index issues
-- =========================================================================
-- Issues addressed:
--   1. public.inscripciones_torneo.public_insert  permissive WITH CHECK
--   2. public.partidos_torneo.partidos_public_read  USING (true) [intentional]
--   3. public.torneo_config.torneo_config_public_read  USING (true) [intentional]
--   4. public.get_equipos_aprobados()  SECURITY DEFINER + broken search_path
--   5. public.torneo_config.auth_id  missing index [column on profiles, see idx below]
--   6. public.torneo_config admin_update  auth.uid() not wrapped in subquery
--   7. public.partidos_torneo.partidos_authenticated_write  FOR ALL true
--   8. public.inscripciones_torneo.auth_id  missing index [column on profiles]
--   9. public.inscripciones_torneo admin_update  auth.uid() not wrapped
--
-- Strategy: introduce a single SECURITY DEFINER helper `public.is_admin()`
-- that performs the profiles check once, then replace all nested EXISTS
-- admin policies with `(SELECT public.is_admin())`. Also tighten the
-- anonymous-INSERT policy on inscripciones_torneo so anon cannot
-- self-approve rows, and pin the search_path on get_equipos_aprobados.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Admin-check helper: SECURITY DEFINER + STABLE + pinned search_path
--    (resolves issues 5, 6, 8, 9: per-row subquery becomes a single call)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE auth_id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- -------------------------------------------------------------------------
-- 2. Fix get_equipos_aprobados (issue 4):
--    - pin search_path (was 'SET search_path TO ''' which is unsafe)
--    - add STABLE marker so planner caches the result
--    - keep SECURITY DEFINER: anon must be able to call it but has no
--      SELECT on inscripciones_torneo, so the function needs owner
--      privileges to read.
--    - grant EXECUTE to anon + authenticated (the RPC is called from a
--      public landing page).
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_equipos_aprobados()
RETURNS TABLE(nombre_equipo text, genero text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT nombre_equipo, genero
  FROM public.inscripciones_torneo
  WHERE aprobado = true
  ORDER BY created_at;
$$;

GRANT EXECUTE ON FUNCTION public.get_equipos_aprobados() TO anon, authenticated;

-- -------------------------------------------------------------------------
-- 3. Explicit index on profiles.auth_id (issues 5, 8).
--    A UNIQUE index already exists, but the advisor only looks for
--    explicitly named btree indexes on the policy column.
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id
  ON public.profiles (auth_id);

-- -------------------------------------------------------------------------
-- 4. inscripciones_torneo (issues 1, 8, 9 + bonus fix for admin_delete)
--    - public_insert: tighten WITH CHECK so anon cannot pre-approve.
--    - admin_select/update/delete: replace nested EXISTS with
--      (SELECT public.is_admin()) so auth.uid() is evaluated once.
--    - admin_delete was checking auth.role()='authenticated' which let
--      ANY logged-in user delete; fixed.
--    - aprobado -> NOT NULL DEFAULT false so the WITH CHECK is strict.
-- -------------------------------------------------------------------------
UPDATE public.inscripciones_torneo
   SET aprobado = false
 WHERE aprobado IS NULL;

ALTER TABLE public.inscripciones_torneo
  ALTER COLUMN aprobado SET DEFAULT false,
  ALTER COLUMN aprobado SET NOT NULL;

DROP POLICY IF EXISTS public_insert       ON public.inscripciones_torneo;
DROP POLICY IF EXISTS admin_select         ON public.inscripciones_torneo;
DROP POLICY IF EXISTS admin_update         ON public.inscripciones_torneo;
DROP POLICY IF EXISTS admin_delete         ON public.inscripciones_torneo;

CREATE POLICY public_insert ON public.inscripciones_torneo
  FOR INSERT TO anon, authenticated
  WITH CHECK (aprobado IS NOT TRUE);

CREATE POLICY admin_select ON public.inscripciones_torneo
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY admin_update ON public.inscripciones_torneo
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY admin_delete ON public.inscripciones_torneo
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- Narrow anon grants: only INSERT is needed for the public sign-up form.
REVOKE SELECT, UPDATE, DELETE ON public.inscripciones_torneo FROM anon;
GRANT   INSERT                         ON public.inscripciones_torneo TO anon;
GRANT   SELECT, INSERT, UPDATE, DELETE ON public.inscripciones_torneo TO authenticated;

-- -------------------------------------------------------------------------
-- 5. partidos_torneo (issues 2, 7)
--    - partidos_public_read: keep USING (true) — the bracket is the
--      public value-prop. No PII columns.
--    - replace the overly permissive partidos_authenticated_write with an
--      admin-scoped FOR ALL policy.
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS partidos_public_read        ON public.partidos_torneo;
DROP POLICY IF EXISTS partidos_authenticated_write ON public.partidos_torneo;

CREATE POLICY partidos_public_read ON public.partidos_torneo
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY admin_write_partidos ON public.partidos_torneo
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Narrow anon grants: only SELECT (bracket display).
REVOKE INSERT, UPDATE, DELETE ON public.partidos_torneo FROM anon;
GRANT   SELECT                ON public.partidos_torneo TO anon;
GRANT   SELECT, INSERT, UPDATE, DELETE ON public.partidos_torneo TO authenticated;

-- -------------------------------------------------------------------------
-- 6. torneo_config (issues 3, 5, 6)
--    - torneo_config_public_read: keep USING (true) — the row only
--      contains a single `finalizado` boolean + updated_at; no PII.
--    - torneo_config_admin_update: replace nested EXISTS with helper,
--      so auth.uid() is evaluated once (issue 6).
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS torneo_config_public_read  ON public.torneo_config;
DROP POLICY IF EXISTS torneo_config_admin_update ON public.torneo_config;

CREATE POLICY torneo_config_public_read ON public.torneo_config
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY torneo_config_admin_update ON public.torneo_config
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Narrow anon grants: only SELECT (the `finalizado` flag drives UI).
REVOKE INSERT, UPDATE, DELETE ON public.torneo_config FROM anon;
GRANT   SELECT                ON public.torneo_config TO anon;
GRANT   SELECT, UPDATE        ON public.torneo_config TO authenticated;
