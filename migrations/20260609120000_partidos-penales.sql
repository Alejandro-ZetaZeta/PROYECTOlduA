-- Add nullable penalty score columns to partidos_torneo.
-- NULL means no shootout took place; a value means penalties were played.
ALTER TABLE public.partidos_torneo
  ADD COLUMN penales_local integer DEFAULT NULL CHECK (penales_local IS NULL OR penales_local >= 0),
  ADD COLUMN penales_visitante integer DEFAULT NULL CHECK (penales_visitante IS NULL OR penales_visitante >= 0);
