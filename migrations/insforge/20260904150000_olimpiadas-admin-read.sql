-- =========================================================================
-- Olimpiadas 2026: allow admins to read registered teams/players.
--
-- The 5 olympic tables currently only have an INSERT policy (public form).
-- Admin panel on /olimpiadas-2026 needs to list registrations per
-- discipline. Matches the canonical admin pattern used elsewhere:
--   FOR SELECT TO authenticated USING ((SELECT public.is_admin()))
-- reading the SECURITY DEFINER helper public.is_admin().
-- =========================================================================

-- inscripciones_futbol
CREATE POLICY admin_select ON public.inscripciones_futbol
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

-- inscripciones_basket
CREATE POLICY admin_select ON public.inscripciones_basket
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

-- inscripciones_ecuavoley
CREATE POLICY admin_select ON public.inscripciones_ecuavoley
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

-- inscripciones_ajedrez
CREATE POLICY admin_select ON public.inscripciones_ajedrez
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

-- inscripciones_pingpong
CREATE POLICY admin_select ON public.inscripciones_pingpong
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

-- Read-only admin reads: grant SELECT to authenticated (anon stays INSERT-only).
GRANT SELECT ON public.inscripciones_futbol    TO authenticated;
GRANT SELECT ON public.inscripciones_basket    TO authenticated;
GRANT SELECT ON public.inscripciones_ecuavoley TO authenticated;
GRANT SELECT ON public.inscripciones_ajedrez   TO authenticated;
GRANT SELECT ON public.inscripciones_pingpong  TO authenticated;