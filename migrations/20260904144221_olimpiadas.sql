CREATE TABLE inscripciones_futbol (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  representante text        NOT NULL,
  numero        text        NOT NULL,
  cedula        text        NOT NULL,
  nombre_equipo text        NOT NULL,
  categoria     text        NOT NULL,
  carrera       text        NOT NULL,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (cedula)
);

CREATE TABLE inscripciones_basket (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  representante      text        NOT NULL,
  numero             text        NOT NULL,
  cedula             text        NOT NULL,
  nombre_equipo      text        NOT NULL,
  categoria          text        NOT NULL,
  area_conocimiento  text        NOT NULL,
  created_at         timestamptz DEFAULT now(),
  UNIQUE (cedula)
);

CREATE TABLE inscripciones_ecuavoley (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  representante      text        NOT NULL,
  numero             text        NOT NULL,
  cedula             text        NOT NULL,
  nombre_equipo      text        NOT NULL,
  categoria          text        NOT NULL,
  area_conocimiento  text        NOT NULL,
  created_at         timestamptz DEFAULT now(),
  UNIQUE (cedula)
);

CREATE TABLE inscripciones_ajedrez (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombres    text        NOT NULL,
  numero     text        NOT NULL,
  cedula     text        NOT NULL,
  carrera    text        NOT NULL,
  nivel      text        NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (cedula)
);

CREATE TABLE inscripciones_pingpong (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombres    text        NOT NULL,
  numero     text        NOT NULL,
  cedula     text        NOT NULL,
  carrera    text        NOT NULL,
  nivel      text        NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (cedula)
);

ALTER TABLE inscripciones_futbol    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones_basket    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones_ecuavoley ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones_ajedrez   ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones_pingpong  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert" ON inscripciones_futbol    FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert" ON inscripciones_basket    FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert" ON inscripciones_ecuavoley FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert" ON inscripciones_ajedrez   FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert" ON inscripciones_pingpong  FOR INSERT WITH CHECK (true);