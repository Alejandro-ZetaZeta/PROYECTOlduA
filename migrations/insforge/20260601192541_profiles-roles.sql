-- Profiles table: one row per auth user, default role = viewer
CREATE TABLE profiles (
  id   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'admin'))
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile (needed for role check after login)
CREATE POLICY "own_profile_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Auto-create viewer profile on every new auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, role) VALUES (NEW.id, 'viewer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Re-scope inscripciones policies: require admin role in profiles, not just authenticated
DROP POLICY "admin_select" ON inscripciones_torneo;
DROP POLICY "admin_update" ON inscripciones_torneo;

CREATE POLICY "admin_select" ON inscripciones_torneo
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_update" ON inscripciones_torneo
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );