CREATE TABLE public.torneo_config (
  id text PRIMARY KEY DEFAULT 'default',
  finalizado boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.torneo_config (id, finalizado) VALUES ('default', false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.torneo_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read tournament state
CREATE POLICY "torneo_config_public_read" ON public.torneo_config
  FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "torneo_config_admin_update" ON public.torneo_config
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE auth_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE auth_id = auth.uid() AND role = 'admin')
  );

GRANT SELECT ON public.torneo_config TO anon;
GRANT SELECT, UPDATE ON public.torneo_config TO authenticated;
