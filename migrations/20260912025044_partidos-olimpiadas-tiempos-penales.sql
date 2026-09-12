-- =========================================================================
-- Olimpiadas 2026: match control — periods (tiempos) + penalties.
--
-- Matches are played in N periods (default 2) of M seconds each. The timer
-- resets per period. When regulation ends tied, the admin records a penalty
-- shootout before finalizing.
--
--   tiempo_total  → renamed duracion_tiempo (seconds per period)
--   num_tiempos   → total periods in the match
--   tiempo_actual → 1-based current period
--   penales_local / penales_visitante → penalty shootout result (NULL until recorded)
-- =========================================================================

ALTER TABLE public.partidos_olimpiadas
  RENAME COLUMN tiempo_total TO duracion_tiempo;

ALTER TABLE public.partidos_olimpiadas
  ADD COLUMN num_tiempos integer NOT NULL DEFAULT 2 CHECK (num_tiempos > 0),
  ADD COLUMN tiempo_actual integer NOT NULL DEFAULT 1 CHECK (tiempo_actual >= 1),
  ADD COLUMN penales_local integer CHECK (penales_local >= 0),
  ADD COLUMN penales_visitante integer CHECK (penales_visitante >= 0);