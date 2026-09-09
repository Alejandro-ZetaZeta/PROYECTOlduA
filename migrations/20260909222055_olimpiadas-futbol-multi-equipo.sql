-- Olimpiadas 2026: se permiten multiples equipos por carrera/categoria en futbol
-- (masculino y femenino pueden inscribir mas de un equipo por carrera).
-- Se elimina la restriccion unica y el trigger que la imponia.
-- Basket y ecuavoley conservan su restriccion de un equipo por area.

ALTER TABLE inscripciones_futbol DROP CONSTRAINT IF EXISTS unico_equipo_carrera;

DROP TRIGGER IF EXISTS trg_check_equipo_unico_futbol ON inscripciones_futbol;

DROP FUNCTION IF EXISTS public.check_equipo_unico_futbol();