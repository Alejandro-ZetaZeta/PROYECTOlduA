CREATE TABLE public.partidos_torneo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_local text NOT NULL,
  equipo_visitante text NOT NULL,
  goles_local integer NOT NULL DEFAULT 0 CHECK (goles_local >= 0),
  goles_visitante integer NOT NULL DEFAULT 0 CHECK (goles_visitante >= 0),
  genero text NOT NULL CHECK (genero IN ('masculino', 'femenino')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partidos_torneo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partidos_public_read" ON public.partidos_torneo
  FOR SELECT USING (true);

CREATE POLICY "partidos_authenticated_write" ON public.partidos_torneo
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON public.partidos_torneo TO anon;
GRANT ALL ON public.partidos_torneo TO authenticated;
