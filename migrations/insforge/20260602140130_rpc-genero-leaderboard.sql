DROP FUNCTION IF EXISTS get_equipos_aprobados();

CREATE OR REPLACE FUNCTION get_equipos_aprobados()
RETURNS TABLE (nombre_equipo text, genero text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT nombre_equipo, genero
  FROM public.inscripciones_torneo
  WHERE aprobado = true
  ORDER BY created_at;
$$;

GRANT EXECUTE ON FUNCTION get_equipos_aprobados() TO anon;
GRANT EXECUTE ON FUNCTION get_equipos_aprobados() TO authenticated;
