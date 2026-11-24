ALTER TABLE inscripciones_torneo
  ADD COLUMN genero text NOT NULL DEFAULT 'masculino'
    CHECK (genero IN ('masculino', 'femenino'));
