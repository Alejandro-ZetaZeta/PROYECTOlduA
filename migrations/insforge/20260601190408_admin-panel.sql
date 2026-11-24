ALTER TABLE inscripciones_torneo ADD COLUMN aprobado boolean DEFAULT false;

-- Authenticated users (admin) can read and update all registrations
CREATE POLICY "admin_select" ON inscripciones_torneo
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "admin_update" ON inscripciones_torneo
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public RPC: returns only team names of approved teams (no personal data exposed)
CREATE OR REPLACE FUNCTION get_equipos_aprobados()
RETURNS TABLE (nombre_equipo text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nombre_equipo
  FROM inscripciones_torneo
  WHERE aprobado = true
  ORDER BY created_at;
$$;

GRANT EXECUTE ON FUNCTION get_equipos_aprobados() TO anon;
GRANT EXECUTE ON FUNCTION get_equipos_aprobados() TO authenticated;