-- ===========================================================================
-- FIX: Trigger & Constraint Issues for Supabase Auth Integration
-- Run this in Supabase SQL Editor
-- ===========================================================================

-- 1. Drop the problematic CHECK constraint
-- Supabase Auth handles password hashing in auth.users, not in our akun table
ALTER TABLE akun DROP CONSTRAINT IF EXISTS akun_check;

-- 2. Update the trigger to work with Supabase Auth
-- Supabase Auth creates the user in auth.users with password hash automatically
-- Our trigger just needs to create the profile records (akun + pengguna)
-- Handle multiple metadata key variations: namaLengkap (frontend), full_name (standard), name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO akun (id_akun, nama_lengkap, email, role, status_aktif, tanggal_daftar)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'namaLengkap',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'Pengguna Baru'
    ),
    NEW.email,
    'user',
    TRUE,
    NOW()
  );

  INSERT INTO pengguna (id_akun, xp_learner, xp_creator, total_xp, rank_peringkat, current_season_xp)
  VALUES (NEW.id, 0, 0, 0, 'Unranked', 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Ensure increment_view function exists
CREATE OR REPLACE FUNCTION increment_view(materi_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE materi SET total_dilihat = total_dilihat + 1 WHERE id_materi = materi_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;