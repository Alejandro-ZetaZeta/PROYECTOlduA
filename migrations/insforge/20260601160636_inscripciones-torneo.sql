CREATE TABLE inscripciones_torneo (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  cedula        text        NOT NULL,
  email         text        NOT NULL,
  whatsapp      text        NOT NULL,
  carrera       text        NOT NULL,
  nivel         text        NOT NULL,
  nombre_equipo text        NOT NULL,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE inscripciones_torneo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert" ON inscripciones_torneo
  FOR INSERT WITH CHECK (true);