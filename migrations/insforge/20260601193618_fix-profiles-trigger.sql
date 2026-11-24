-- Backfill profile rows for auth users created before the trigger existed
-- Both id and auth_id must equal the auth user's id (two FKs to auth.users)
INSERT INTO profiles (id, auth_id, role)
SELECT u.id, u.id, 'viewer'
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM profiles);

-- Fix trigger to populate both id and auth_id
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, auth_id, role) VALUES (NEW.id, NEW.id, 'viewer');
  RETURN NEW;
END;
$$;

-- Fix inscripciones RLS to use auth_id (InsForge's canonical column)
DROP POLICY "admin_select" ON inscripciones_torneo;
DROP POLICY "admin_update" ON inscripciones_torneo;

CREATE POLICY "admin_select" ON inscripciones_torneo
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_update" ON inscripciones_torneo
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE auth_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE auth_id = auth.uid() AND role = 'admin')
  );

-- Fix own_profile_select policy to use auth_id
DROP POLICY "own_profile_select" ON profiles;

CREATE POLICY "own_profile_select" ON profiles
  FOR SELECT USING (auth_id = auth.uid());