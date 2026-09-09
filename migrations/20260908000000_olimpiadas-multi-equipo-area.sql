-- Olimpiadas 2026: permitir más de un equipo por área de conocimiento en
-- basket y ecuavoley (p. ej. 3 equipos de Salud).
-- Se eliminan el UNIQUE (area_conocimiento, categoria) y el trigger EQ001
-- que lo forzaban. Fútbol, ajedrez y pingpong sin cambios.

-- Basket: quitar restricción de un solo equipo por área
ALTER TABLE inscripciones_basket DROP CONSTRAINT IF EXISTS unico_equipo_area_basket;

DROP TRIGGER IF EXISTS trg_check_equipo_unico_basket ON inscripciones_basket;
DROP FUNCTION IF EXISTS public.check_equipo_unico_basket();

-- Ecuavoley: quitar restricción de un solo equipo por área
ALTER TABLE inscripciones_ecuavoley DROP CONSTRAINT IF EXISTS unico_equipo_area_ecuavoley;

DROP TRIGGER IF EXISTS trg_check_equipo_unico_ecuavoley ON inscripciones_ecuavoley;
DROP FUNCTION IF EXISTS public.check_equipo_unico_ecuavoley();
