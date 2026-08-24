-- ===========================================================================
--  Supabase Production Setup: RLS, Auth Hook, RPC Functions
--  File ini bisa langsung di-copy-paste ke Supabase SQL Editor
--  dan di-run sebagai satu kali setup.
--
--  Urutan jalankan:
--  1. Upload legacy/schema.sql (16 tabel + triggers)
--  2. Upload file ini (RLS + policies + hooks + RPC)
-- ===========================================================================

-- ===========================================================================
--  1. HELPER FUNCTION: Cek apakah user adalah admin
-- ===========================================================================
CREATE OR REPLACE FUNCTION role_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM akun
    WHERE id_akun = auth.uid()::text
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ===========================================================================
--  2. AUTH HOOK: Auto-create akun + pengguna ketika user signUp
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO akun (id_akun, nama_lengkap, email, role, status_aktif, tanggal_daftar)
  VALUES (
    NEW.id,                              -- firebase UID sebagai id_akun
    NEW.raw_user_meta_data->>'full_name',
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===========================================================================
--  3. RPC FUNCTION: increment_view (ganti update view count di backend lama)
-- ===========================================================================
CREATE OR REPLACE FUNCTION increment_view(materi_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE materi
  SET total_dilihat = total_dilihat + 1
  WHERE id_materi = materi_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================================
--  4. ENABLE ROW LEVEL SECURITY (RLS) semua tabel
-- ===========================================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename::text FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('akun','pengguna','materi','kuis','soal','kunci_jawaban',
                      'riwayat_belajar','rating','komentar','season',
                      'season_winners','system_config','moderation_log',
                      'audit_log','config_change_log')
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

-- ===========================================================================
--  5. RLS POLICIES PER TABEL
-- ===========================================================================

-- 5a. akun
CREATE POLICY "akun: readable by authenticated" ON akun
  FOR SELECT USING (auth.uid()::text IS NOT NULL);

CREATE POLICY "akun: insertable by self" ON akun
  FOR INSERT
  WITH CHECK (auth.uid()::text = id_akun);

CREATE POLICY "akun: updatable by self or admin" ON akun
  FOR UPDATE USING (auth.uid()::text = id_akun OR role_is_admin());

CREATE POLICY "akun: deletable by admin" ON akun
  FOR DELETE USING (role_is_admin());

-- 5b. pengguna
CREATE POLICY "pengguna: readable (leaderboard)" ON pengguna
  FOR SELECT USING (true);

CREATE POLICY "pengguna: insertable by self" ON pengguna
  FOR INSERT
  WITH CHECK (auth.uid()::text = id_akun);

CREATE POLICY "pengguna: updatable by self or admin" ON pengguna
  FOR UPDATE USING (auth.uid()::text = id_akun OR role_is_admin());

-- 5c. materi
CREATE POLICY "materi: public readable" ON materi
  FOR SELECT USING (status_publik = true);

CREATE POLICY "materi: creator readable" ON materi
  FOR SELECT USING (id_penulis::text = auth.uid()::text);
  -- gabungan select: status_publik=true OR id_penulis=auth.uid()

CREATE POLICY "materi: insertable by creator" ON materi
  FOR INSERT
  WITH CHECK (auth.uid()::text = id_penulis::text);

CREATE POLICY "materi: updatable by creator" ON materi
  FOR UPDATE
  USING (id_penulis::text = auth.uid()::text);

CREATE POLICY "materi: admin policy (update status/moderate)" ON materi
  FOR UPDATE
  USING (role_is_admin());

CREATE POLICY "materi: deletable by creator" ON materi
  FOR DELETE
  USING (id_penulis::text = auth.uid()::text);

-- 5d. kuis
CREATE POLICY "kuis: public readable" ON kuis
  FOR SELECT USING (status_publik = true);

CREATE POLICY "kuis: creator readable" ON kuis
  FOR SELECT USING (id_creator::text = auth.uid()::text);

CREATE POLICY "kuis: insertable by creator" ON kuis
  FOR INSERT
  WITH CHECK (auth.uid()::text = id_creator::text);

CREATE POLICY "kuis: updatable by creator" ON kuis
  FOR UPDATE
  USING (id_creator::text = auth.uid()::text);

CREATE POLICY "kuis: admin policy" ON kuis
  FOR UPDATE USING (role_is_admin());

CREATE POLICY "kuis: deletable by creator" ON kuis
  FOR DELETE
  USING (id_creator::text = auth.uid()::text);

-- 5e. soal
CREATE POLICY "soal: readable by authenticated" ON soal
  FOR SELECT USING (auth.uid()::text IS NOT NULL);

CREATE POLICY "soal: insertable by kuis creator" ON soal
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM kuis
      WHERE kuis.id_kuis = soal.id_kuis
      AND kuis.id_creator::text = auth.uid()::text
    )
  );

CREATE POLICY "soal: updatable/deletable by kuis creator" ON soal
  FOR UPDATE, DELETE USING (
    EXISTS (
      SELECT 1 FROM kuis
      WHERE kuis.id_kuis = soal.id_kuis
      AND kuis.id_creator::text = auth.uid()::text
    )
  );

-- 5f. kunci_jawaban
CREATE POLICY "kunci_jawaban: readable by authenticated" ON kunci_jawaban
  FOR SELECT USING (auth.uid()::text IS NOT NULL);

CREATE POLICY "kunci_jawaban: admin only for modifications" ON kunci_jawaban
  FOR INSERT, UPDATE, DELETE WITH CHECK (role_is_admin());

-- 5g. rating (sub-koleksi style tapi di tabel biasa)
CREATE POLICY "rating: readable by all" ON rating
  FOR SELECT USING (true);

CREATE POLICY "rating: insertable by self" ON rating
  FOR INSERT WITH CHECK (auth.uid()::text = id_pengguna::text);

CREATE POLICY "rating: updatable by self" ON rating
  FOR UPDATE USING (auth.uid()::text = id_pengguna::text);

CREATE POLICY "rating: deletable by self" ON rating
  FOR DELETE USING (auth.uid()::text = id_pengguna::text);

-- 5h. komentar
CREATE POLICY "komentar: readable by all" ON komentar
  FOR SELECT USING (true);

CREATE POLICY "komentar: insertable by self" ON komentar
  FOR INSERT WITH CHECK (auth.uid()::text = id_pengguna::text);

CREATE POLICY "komentar: updatable by self" ON komentar
  FOR UPDATE USING (auth.uid()::text = id_pengguna::text);

CREATE POLICY "komentar: deletable by self or admin" ON komentar
  FOR DELETE USING (auth.uid()::text = id_pengguna::text OR role_is_admin());

-- 5i. riwayat_belajar
CREATE POLICY "riwayat_belajar: readable by self or admin" ON riwayat_belajar
  FOR SELECT USING (auth.uid()::text = id_pengguna::text OR role_is_admin());

CREATE POLICY "riwayat_belajar: insertable by self" ON riwayat_belajar
  FOR INSERT WITH CHECK (auth.uid()::text = id_pengguna::text);

CREATE POLICY "riwayat_belajar: no update (read-only via trigger)" ON riwayat_belajar
  FOR UPDATE USING (false);

CREATE POLICY "riwayat_belajar: deletable by admin only" ON riwayat_belajar
  FOR DELETE USING (role_is_admin());

-- 5j. system_config (admin only)
CREATE POLICY "system_config: readable by authenticated" ON system_config
  FOR SELECT USING (auth.uid()::text IS NOT NULL);

CREATE POLICY "system_config: admin only CRU" ON system_config
  FOR INSERT, UPDATE, DELETE
  USING (role_is_admin())
  WITH CHECK (role_is_admin());

-- 5k. season
CREATE POLICY "season: readable by all" ON season
  FOR SELECT USING (true);

CREATE POLICY "season: admin only CRU" ON season
  FOR INSERT, UPDATE, DELETE
  USING (role_is_admin())
  WITH CHECK (role_is_admin());

-- 5l. season_winners
CREATE POLICY "season_winners: readable by all" ON season_winners
  FOR SELECT USING (true);

CREATE POLICY "season_winners: admin only CRU" ON season_winners
  FOR INSERT, UPDATE, DELETE
  USING (role_is_admin())
  WITH CHECK (role_is_admin());

-- 5m. Log tables (admin only, write via trigger/function)
CREATE POLICY "moderation_log: admin readable" ON moderation_log
  FOR SELECT USING (role_is_admin());

CREATE POLICY "moderation_log: no direct write" ON moderation_log
  FOR INSERT, UPDATE, DELETE USING (false);

CREATE POLICY "audit_log: admin readable" ON audit_log
  FOR SELECT USING (role_is_admin());

CREATE POLICY "audit_log: no direct write" ON audit_log
  FOR INSERT, UPDATE, DELETE USING (false);

CREATE POLICY "config_change_log: admin readable" ON config_change_log
  FOR SELECT USING (role_is_admin());

CREATE POLICY "config_change_log: no direct write" ON config_change_log
  FOR INSERT, UPDATE, DELETE USING (false);

-- ===========================================================================
-- 6. INDEXES untuk performa (materi, kuis, leaderboard)
-- ===========================================================================
CREATE INDEX IF NOT EXISTS idx_materi_status_tanggal
  ON materi (status_publik, tanggal_ungghap DESC);

CREATE INDEX IF NOT EXISTS idx_materi_rating
  ON materi (rating_rata2 DESC, status_publik)
  WHERE status_publik = true;

CREATE INDEX IF NOT EXISTS idx_kuis_status_tanggal
  ON kuis (status_publik, tanggal_buat DESC);

CREATE INDEX IF NOT EXISTS idx_riwayat_pengguna_tanggal
  ON riwayat_belajar (id_pengguna, tanggal_selesai DESC);

CREATE INDEX IF NOT EXISTS idx_rating_materi
  ON rating (id_materi);

CREATE INDEX IF NOT EXISTS idx_komentar_materi
  ON komentar (id_materi);

-- ===========================================================================
--  SETUP COMPLETE
-- ===========================================================================
