-- Olimpiadas 2026: allow admins to delete registered teams/players.
-- Admin panel needs to remove a registration. Uses the canonical admin
-- helper public.is_admin() and restricts deletes to authenticated admins.

CREATE POLICY admin_delete ON public.inscripciones_futbol
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY admin_delete ON public.inscripciones_basket
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY admin_delete ON public.inscripciones_ecuavoley
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY admin_delete ON public.inscripciones_ajedrez
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY admin_delete ON public.inscripciones_pingpong
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

GRANT DELETE ON public.inscripciones_futbol    TO authenticated;
GRANT DELETE ON public.inscripciones_basket    TO authenticated;
GRANT DELETE ON public.inscripciones_ecuavoley TO authenticated;
GRANT DELETE ON public.inscripciones_ajedrez   TO authenticated;
GRANT DELETE ON public.inscripciones_pingpong  TO authenticated;