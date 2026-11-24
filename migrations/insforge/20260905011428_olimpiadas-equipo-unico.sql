-- Olimpiadas 2026: un solo equipo por (categoria + carrera) en futbol y por
-- (categoria + area) en basket/ecuavoley. Mensaje amigable con el representante.
-- ERRCODE 'EQ001' para que el frontend muestre el mensaje completo.

-- Futbol: un equipo por carrera y categoria
ALTER TABLE inscripciones_futbol ADD CONSTRAINT unico_equipo_carrera UNIQUE (carrera, categoria);

CREATE OR REPLACE FUNCTION public.check_equipo_unico_futbol()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_representante text;
  v_numero        text;
BEGIN
  SELECT representante, numero
    INTO v_representante, v_numero
    FROM public.inscripciones_futbol
   WHERE carrera = NEW.carrera AND categoria = NEW.categoria
   LIMIT 1;

  IF v_representante IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = 'EQ001',
      MESSAGE = 'Ya hay un equipo registrado para esta carrera. Contacta con ' ||
                v_representante || ' (' || v_numero || ') para mas informacion.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_equipo_unico_futbol
  BEFORE INSERT ON inscripciones_futbol
  FOR EACH ROW
  EXECUTE FUNCTION public.check_equipo_unico_futbol();

-- Basket: un equipo por area de conocimiento y categoria
ALTER TABLE inscripciones_basket ADD CONSTRAINT unico_equipo_area_basket UNIQUE (area_conocimiento, categoria);

CREATE OR REPLACE FUNCTION public.check_equipo_unico_basket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_representante text;
  v_numero        text;
BEGIN
  SELECT representante, numero
    INTO v_representante, v_numero
    FROM public.inscripciones_basket
   WHERE area_conocimiento = NEW.area_conocimiento AND categoria = NEW.categoria
   LIMIT 1;

  IF v_representante IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = 'EQ001',
      MESSAGE = 'Ya hay un equipo registrado para esta area. Contacta con ' ||
                v_representante || ' (' || v_numero || ') para mas informacion.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_equipo_unico_basket
  BEFORE INSERT ON inscripciones_basket
  FOR EACH ROW
  EXECUTE FUNCTION public.check_equipo_unico_basket();

-- Ecuavoley: un equipo por area de conocimiento y categoria
ALTER TABLE inscripciones_ecuavoley ADD CONSTRAINT unico_equipo_area_ecuavoley UNIQUE (area_conocimiento, categoria);

CREATE OR REPLACE FUNCTION public.check_equipo_unico_ecuavoley()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_representante text;
  v_numero        text;
BEGIN
  SELECT representante, numero
    INTO v_representante, v_numero
    FROM public.inscripciones_ecuavoley
   WHERE area_conocimiento = NEW.area_conocimiento AND categoria = NEW.categoria
   LIMIT 1;

  IF v_representante IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = 'EQ001',
      MESSAGE = 'Ya hay un equipo registrado para esta area. Contacta con ' ||
                v_representante || ' (' || v_numero || ') para mas informacion.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_equipo_unico_ecuavoley
  BEFORE INSERT ON inscripciones_ecuavoley
  FOR EACH ROW
  EXECUTE FUNCTION public.check_equipo_unico_ecuavoley();

-- Ajedrez y PingPong: ya tienen UNIQUE(cedula) — la unica regla es no mas de una
-- cedula registrada por torneo. Sin cambios adicionales.