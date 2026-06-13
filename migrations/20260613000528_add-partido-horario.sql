-- Add nullable schedule column (horario) to partidos_torneo
ALTER TABLE public.partidos_torneo
  ADD COLUMN horario text DEFAULT NULL;
