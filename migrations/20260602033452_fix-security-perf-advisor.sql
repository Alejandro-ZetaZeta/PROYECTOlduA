-- Issue 1: handle_new_user - lock search_path + revoke public execute
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_id, role) VALUES (NEW.id, NEW.id, 'viewer');
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;

-- Issue 3: get_equipos_aprobados - lock search_path (keep SECURITY DEFINER for anon access)
CREATE OR REPLACE FUNCTION public.get_equipos_aprobados()
RETURNS TABLE (nombre_equipo text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT nombre_equipo
  FROM public.inscripciones_torneo
  WHERE aprobado = true
  ORDER BY created_at;
$$;

-- Issue 4: profiles own_profile_select - wrap auth.uid() in subquery (evaluates once, not per-row)
DROP POLICY IF EXISTS "own_profile_select" ON public.profiles;
CREATE POLICY "own_profile_select" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = auth_id);

-- Issue 5+6: index on profiles.auth_id (used by admin RLS policies on inscripciones_torneo)
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON public.profiles(auth_id);

-- Issues 7+8: admin policies on inscripciones_torneo - wrap auth.uid() in subquery
DROP POLICY IF EXISTS "admin_select" ON public.inscripciones_torneo;
DROP POLICY IF EXISTS "admin_update" ON public.inscripciones_torneo;

CREATE POLICY "admin_select" ON public.inscripciones_torneo
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE auth_id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "admin_update" ON public.inscripciones_torneo
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE auth_id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE auth_id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Issue 9: profiles INSERT policy so authenticated users can create their own profile row
CREATE POLICY "allow_own_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = auth_id);
