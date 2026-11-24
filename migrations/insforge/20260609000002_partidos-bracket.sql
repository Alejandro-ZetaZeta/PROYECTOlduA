ALTER TABLE public.partidos_torneo
  ADD COLUMN ronda integer NOT NULL DEFAULT 1;

ALTER TABLE public.partidos_torneo
  ADD COLUMN estado text NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'finalizado'));

-- All existing rows are already played results
UPDATE public.partidos_torneo SET estado = 'finalizado';
