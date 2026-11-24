CREATE POLICY "admin_delete" ON inscripciones_torneo
  FOR DELETE USING (auth.role() = 'authenticated');
