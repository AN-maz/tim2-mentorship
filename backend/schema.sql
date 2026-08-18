-- =========================================================================================
--  DDL Schema: LMS Gamifikasi
--  Based on: docs/classDiagram.plantuml (16 entities)
--  Engine: PostgreSQL 15+ (dengan native query, tanpa ORM)
--  Simpan di: backend/schema.sql
--  Traceability: plan.md → usd.plantuml → skenario/UC-XX → activity/UC-XX → sequence/UC-XX → classDiagram.plantuml
-- =========================================================================================

-- ------------------------------------------------------------------
--  Extension
-- ------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================================
--  1. AKUN (Superclass — generalization ke Pengguna & Admin)
--  Referensi: classDiagram.plantuml → Akun
-- =========================================================================================
CREATE TABLE akun (
    id_akun            UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_lengkap       VARCHAR(100)   NOT NULL,
    email              VARCHAR(255)   NOT NULL UNIQUE,
    kata_sandi_hash    VARCHAR(255)   NULL CHECK (kata_sandi_hash IS NOT NULL OR google_id IS NOT NULL),
    google_id          VARCHAR(255)   NULL,
    tanggal_daftar     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_aktif       BOOLEAN        NOT NULL DEFAULT TRUE,
    alasan_suspend     VARCHAR(500)   NULL,
    role               VARCHAR(20)    NOT NULL CHECK (role IN ('user', 'admin')),
    CONSTRAINT chk_role_valid CHECK (role IN ('user', 'admin'))
);

COMMENT ON TABLE akun IS
    'Superclass untuk Pengguna dan Admin. Mendukung login manual (kata_sandi_hash) dan Google Auth (google_id).';

-- =========================================================================================
--  2. PENGGUNA (Subclass dari Akun)
--  Referensi: classDiagram.plantuml → Pengguna
-- =========================================================================================
CREATE TABLE pengguna (
    id_akun        UUID    PRIMARY KEY REFERENCES akun(id_akun) ON DELETE CASCADE,
    xp_learner     INTEGER NOT NULL DEFAULT 0,
    xp_creator     INTEGER NOT NULL DEFAULT 0,
    total_xp       INTEGER NOT NULL DEFAULT 0,
    rank_peringkat VARCHAR(50) NOT NULL DEFAULT 'Unranked'
);

COMMENT ON TABLE pengguna IS
    'User yang dapat belajar (xp_learner) dan membuat konten (xp_creator).';

-- =========================================================================================
--  3. ADMIN (Subclass dari Akun)
--  Referensi: classDiagram.plantuml → Admin
-- =========================================================================================
CREATE TABLE admin (
    id_akun       UUID    PRIMARY KEY REFERENCES akun(id_akun) ON DELETE CASCADE,
    tingkat_akses VARCHAR(50) NOT NULL DEFAULT 'full',
    kode_pegawai  VARCHAR(50) NOT NULL UNIQUE
);

COMMENT ON TABLE admin IS
    'Admin dengan tingkat akses penuh untuk mengelola sistem.';

-- =========================================================================================
--  4. MATERI
--  Referensi: classDiagram.plantuml → Materi
--  Relasi: id_penulis → Pengguna(id_akun) [Creator], moderated_by → Admin(id_akun)
-- =========================================================================================
CREATE TABLE materi (
    id_materi       SERIAL    PRIMARY KEY,
    judul_materi    VARCHAR(255) NOT NULL,
    konten_markdown TEXT        NOT NULL CHECK (LENGTH(TRIM(konten_markdown)) > 0),
    id_penulis      UUID        NOT NULL REFERENCES pengguna(id_akun) ON DELETE CASCADE,
    tanggal_ungghah TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tanggal_edit    TIMESTAMP   NULL,
    total_dilihat   INTEGER     NOT NULL DEFAULT 0,
    rating_rata2    DECIMAL(3,2) NULL DEFAULT 0,
    status_publik   BOOLEAN     NOT NULL DEFAULT TRUE,
    alasan_moderate VARCHAR(500) NULL,
    moderated_by    UUID        NULL REFERENCES admin(id_akun) ON DELETE SET NULL,
    moderated_at    TIMESTAMP   NULL,
    file_urls       TEXT        NULL,
    CONSTRAINT chk_rating_range CHECK (rating_rata2 >= 0 AND rating_rata2 <= 5)
);

COMMENT ON TABLE materi IS
    'Materi pembelajaran dalam format Markdown. Hanya status_publik = true yang terlihat publik.';

-- Index untuk pencarian & sorting
CREATE INDEX idx_materi_judul        ON materi(judul_materi);
CREATE INDEX idx_materi_tanggal      ON materi(tanggal_ungghah DESC);
CREATE INDEX idx_materi_penulis      ON materi(id_penulis);
CREATE INDEX idx_materi_status_publik ON materi(status_publik);
CREATE INDEX idx_materi_rating       ON materi(rating_rata2 DESC);
CREATE INDEX idx_materi_fulltext     ON materi USING gin(to_tsvector('indonesian', judul_materi || ' ' || konten_markdown));

-- =========================================================================================
--  5. KUIS
--  Referensi: classDiagram.plantuml → Kuis
--  Relasi: id_materi_terkait → Materi(id_materi), id_creator → Pengguna(id_akun), moderated_by → Admin
-- =========================================================================================
CREATE TABLE kuis (
    id_kuis           SERIAL    PRIMARY KEY,
    judul_kuis        VARCHAR(255) NOT NULL,
    id_materi_terkait INTEGER    NULL REFERENCES materi(id_materi) ON DELETE SET NULL,
    id_creator        UUID        NOT NULL REFERENCES pengguna(id_akun) ON DELETE CASCADE,
    aturan_markdown   TEXT        NOT NULL,
    batas_waktu_menit INTEGER    NOT NULL CHECK (batas_waktu_menit BETWEEN 1 AND 180),
    poin_xp_default   INTEGER    NOT NULL DEFAULT 10 CHECK (poin_xp_default >= 0),
    tanggal_buat      TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_publik     BOOLEAN    NOT NULL DEFAULT TRUE,
    alasan_moderate   VARCHAR(500) NULL,
    moderated_by      UUID        NULL REFERENCES admin(id_akun) ON DELETE SET NULL
);

COMMENT ON TABLE kuis IS
    'Kuis dengan soal pilihan ganda. Dapat dikaitkan dengan Materi (opsional) dan memiliki timer.';

CREATE INDEX idx_kuis_creator   ON kuis(id_creator);
CREATE INDEX idx_kuis_tanggal   ON kuis(tanggal_buat DESC);
CREATE INDEX idx_kuis_status    ON kuis(status_publik);
CREATE INDEX idx_kuis_materi    ON kuis(id_materi_terkait);

-- =========================================================================================
--  6. SOAL (Composition — Kuis 1..* Soal)
--  Referensi: classDiagram.plantuml → Soal
--  Relasi: id_kuis → Kuis(id_kuis)
-- =========================================================================================
CREATE TABLE soal (
    id_soal          SERIAL   PRIMARY KEY,
    id_kuis          INTEGER  NOT NULL REFERENCES kuis(id_kuis) ON DELETE CASCADE,
    pertanyaan_markdown TEXT   NOT NULL,
    opsi_a           VARCHAR(500) NOT NULL,
    opsi_b           VARCHAR(500) NOT NULL,
    opsi_c           VARCHAR(500) NOT NULL,
    opsi_d           VARCHAR(500) NOT NULL,
    urutan           INTEGER  NOT NULL,
    CONSTRAINT chk_opsi_not_empty CHECK (
        LENGTH(TRIM(opsi_a)) > 0 AND
        LENGTH(TRIM(opsi_b)) > 0 AND
        LENGTH(TRIM(opsi_c)) > 0 AND
        LENGTH(TRIM(opsi_d)) > 0
    )
);

COMMENT ON TABLE soal IS
    'Soal pilihan ganda (A/B/C/D). Jika kuis dihapus, semua soal ikut terhapus (cascade).';

CREATE INDEX idx_soal_kuis    ON soal(id_kuis);
CREATE INDEX idx_soal_urutan  ON soal(id_kuis, urutan);

-- =========================================================================================
--  7. KUNCI_JAWABAN (1:1 dengan Soal)
--  Referensi: classDiagram.plantuml → KunciJawaban
--  Relasi: id_soal → Soal(id_soal)
-- =========================================================================================
CREATE TABLE kunci_jawaban (
    id_kunci_jawaban SERIAL PRIMARY KEY,
    id_soal          INTEGER NOT NULL UNIQUE REFERENCES soal(id_soal) ON DELETE CASCADE,
    jawaban_benar    CHAR(1)  NOT NULL CHECK (jawaban_benar IN ('A', 'B', 'C', 'D'))
);

COMMENT ON TABLE kunci_jawaban IS
    'Kunci jawaban untuk setiap soal. Setiap soal memiliki tepat 1 kunci jawaban.';

-- =========================================================================================
--  8. RIWAYAT_BELAJAR
--  Referensi: classDiagram.plantuml → RiwayatBelajar
--  Relasi: id_pengguna → Pengguna(id_akun)
-- =========================================================================================
CREATE TABLE riwayat_belajar (
    id_riwayat       SERIAL   PRIMARY KEY,
    id_pengguna      UUID     NOT NULL REFERENCES pengguna(id_akun) ON DELETE CASCADE,
    id_konten        INTEGER  NOT NULL,
    tipe_konten      VARCHAR(20) NOT NULL CHECK (tipe_konten IN ('materi', 'kuis')),
    tanggal_selesai  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    xp_didapat       INTEGER NOT NULL CHECK (xp_didapat >= 0),
    skor             INTEGER  NULL CHECK (skor >= 0 AND skor <= 100)
);

COMMENT ON TABLE riwayat_belajar IS
    'Tracking aktivitas belajar user. tipe_konten: ''materi'' atau ''kuis''. skor hanya untuk kuis.';

CREATE INDEX idx_riwayat_pengguna   ON riwayat_belajar(id_pengguna);
CREATE INDEX idx_riwayat_tanggal    ON riwayat_belajar(tanggal_selesai DESC);
CREATE INDEX idx_riwayat_konten     ON riwayat_belajar(id_konten, tipe_konten);
-- Mencegah duplikat penyelesaian
CREATE UNIQUE INDEX uq_riwayat_user_konten ON riwayat_belajar(id_pengguna, id_konten, tipe_konten);

-- =========================================================================================
--  9. RATING
--  Referensi: classDiagram.plantuml → Rating
--  Relasi: id_materi → Materi(id_materi), id_pengguna → Pengguna(id_akun)
-- =========================================================================================
CREATE TABLE rating (
    id_rating      SERIAL   PRIMARY KEY,
    id_materi      INTEGER  NOT NULL REFERENCES materi(id_materi) ON DELETE CASCADE,
    id_pengguna    UUID     NOT NULL REFERENCES pengguna(id_akun) ON DELETE CASCADE,
    nilai_rating   INTEGER  NOT NULL CHECK (nilai_rating BETWEEN 1 AND 5),
    tanggal        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE rating IS
    'Rating 1-5 bintang dari user pada sebuah materi. Hanya 1 rating per user per materi.';

CREATE INDEX idx_rating_materi   ON rating(id_materi);
CREATE INDEX idx_rating_pengguna ON rating(id_pengguna);
-- Mencegah duplikat rating
CREATE UNIQUE INDEX uq_rating_user_materi ON rating(id_materi, id_pengguna);

-- =========================================================================================
--  10. KOMENTAR
--  Referensi: classDiagram.plantuml → Komentar
--  Relasi: id_materi → Materi(id_materi), id_pengguna → Pengguna(id_akun)
-- =========================================================================================
CREATE TABLE komentar (
    id_komentar    SERIAL   PRIMARY KEY,
    id_materi      INTEGER  NOT NULL REFERENCES materi(id_materi) ON DELETE CASCADE,
    id_pengguna    UUID     NOT NULL REFERENCES pengguna(id_akun) ON DELETE CASCADE,
    teks_komentar  TEXT     NOT NULL CHECK (LENGTH(TRIM(teks_komentar)) > 0 AND LENGTH(teks_komentar) <= 1000),
    tanggal        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tanggal_edit   TIMESTAMP NULL
);

COMMENT ON TABLE komentar IS
    'Komentar user pada materi. Max 1000 karakter. User dapat edit & hapus komentar milik sendiri.';

CREATE INDEX idx_komentar_materi   ON komentar(id_materi);
CREATE INDEX idx_komentar_tanggal  ON komentar(tanggal DESC);

-- =========================================================================================
--  11. SYSTEM_CONFIG
--  Referensi: classDiagram.plantuml → SystemConfig
--  Relasi: updated_by → Admin(id_akun)
-- =========================================================================================
CREATE TABLE system_config (
    id_config        SERIAL   PRIMARY KEY,
    config_type      VARCHAR(100) NOT NULL UNIQUE CHECK (config_type IN ('xp_settings', 'rank_thresholds')),
    config_value     JSONB      NOT NULL DEFAULT '{}',
    updated_at       TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by       UUID       NULL REFERENCES admin(id_akun) ON DELETE SET NULL
);

COMMENT ON TABLE system_config IS
    'Menyimpan konfigurasi sistem: xp_settings (bobot XP tiap aktivitas) & rank_thresholds (batas XP per rank).';

-- =========================================================================================
--  12. SEASON
--  Referensi: classDiagram.plantuml → Season
-- =========================================================================================
CREATE TABLE season (
    id_season    SERIAL    PRIMARY KEY,
    season_name  VARCHAR(100) NOT NULL,
    start_date   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date     TIMESTAMP NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended'))
);

COMMENT ON TABLE season IS
    'Sistem season untuk kompetisi berkala. Reset season archive pemenang & reset XP semua user.';

CREATE INDEX idx_season_status ON season(status);

-- =========================================================================================
--  13. SEASON_WINNERS
--  Referensi: classDiagram.plantuml → SeasonWinners
--  Relasi: id_season → Season(id_season), id_pengguna → Pengguna(id_akun)
-- =========================================================================================
CREATE TABLE season_winners (
    id_winner        SERIAL   PRIMARY KEY,
    id_season        INTEGER  NOT NULL REFERENCES season(id_season) ON DELETE CASCADE,
    id_pengguna      UUID     NOT NULL REFERENCES pengguna(id_akun) ON DELETE CASCADE,
    nama_lengkap     VARCHAR(100) NOT NULL,
    total_xp         INTEGER  NOT NULL,
    xp_learner       INTEGER  NOT NULL,
    xp_creator       INTEGER  NOT NULL,
    rank_peringkat   VARCHAR(50) NOT NULL,
    end_date         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE season_winners IS
    'Arsip pemenang season sebelumnya. Data di-copy saat season reset.';

CREATE INDEX idx_season_winners_season ON season_winners(id_season);
CREATE INDEX idx_season_winners_user   ON season_winners(id_pengguna);

-- =========================================================================================
--  14. MODERATION_LOG
--  Referensi: classDiagram.plantuml → ModerationLog
--  Relasi: admin_id → Admin(id_akun)
-- =========================================================================================
CREATE TABLE moderation_log (
    id_log         SERIAL   PRIMARY KEY,
    admin_id       UUID     NOT NULL REFERENCES admin(id_akun) ON DELETE CASCADE,
    content_id     INTEGER  NOT NULL,
    content_type   VARCHAR(20) NOT NULL CHECK (content_type IN ('materi', 'kuis')),
    action         VARCHAR(20) NOT NULL CHECK (action IN ('hide', 'delete', 'approve')),
    reason         TEXT     NULL,
    timestamp      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE moderation_log IS
    'Audit trail untuk semua aksi moderasi konten (hide/delete/approve).';

CREATE INDEX idx_moderation_admin    ON moderation_log(admin_id);
CREATE INDEX idx_moderation_content  ON moderation_log(content_id, content_type);

-- =========================================================================================
--  15. AUDIT_LOG
--  Referensi: classDiagram.plantuml → AuditLog
--  Relasi: admin_id → Admin(id_akun), target_user_id → Pengguna(id_akan)
-- =========================================================================================
CREATE TABLE audit_log (
    id_log           SERIAL   PRIMARY KEY,
    admin_id         UUID     NOT NULL REFERENCES admin(id_akun) ON DELETE CASCADE,
    action           VARCHAR(50) NOT NULL,
    target_user_id   UUID     NULL REFERENCES pengguna(id_akun) ON DELETE SET NULL,
    details          TEXT     NULL,
    timestamp        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_log IS
    'Audit trail untuk aksi admin pada user management (edit_role, suspend, unsuspend, delete).';

CREATE INDEX idx_audit_admin   ON audit_log(admin_id);
CREATE INDEX idx_audit_target  ON audit_log(target_user_id);
CREATE INDEX idx_audit_action  ON audit_log(action);

-- =========================================================================================
--  16. CONFIG_CHANGE_LOG
--  Referensi: classDiagram.plantuml → ConfigChangeLog
--  Relasi: admin_id → Admin(id_akun)
-- =========================================================================================
CREATE TABLE config_change_log (
    id_log              SERIAL   PRIMARY KEY,
    admin_id            UUID     NOT NULL REFERENCES admin(id_akun) ON DELETE CASCADE,
    parameter_changed   VARCHAR(100) NOT NULL,
    old_value           VARCHAR(500) NOT NULL,
    new_value           VARCHAR(500) NOT NULL,
    timestamp           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE config_change_log IS
    'Tracking perubahan konfigurasi XP dan rank threshold oleh admin.';

CREATE INDEX idx_config_change_admin ON config_change_log(admin_id);

-- =========================================================================================
--  TRIGGER: Update rating_rata2 Materi otomatis (PostgreSQL trigger)
--  Referensi: API-008 & API-009 (UC-05 Memberi Rating)
--  Otomatis menghitung ulang rating_rata2 saat rating ditambah/ubah/dihapus.
-- =========================================================================================
CREATE OR REPLACE FUNCTION fn_update_rating_materi()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE materi
        SET rating_rata2 = subquery.avg_rating
        FROM (
            SELECT AVG(nilai_rating) AS avg_rating
            FROM rating
            WHERE id_materi = NEW.id_materi
        ) AS subquery
        WHERE materi.id_materi = NEW.id_materi;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE materi
        SET rating_rata2 = subquery.avg_rating
        FROM (
            SELECT AVG(nilai_rating) AS avg_rating
            FROM rating
            WHERE id_materi = OLD.id_materi
        ) AS subquery
        WHERE materi.id_materi = OLD.id_materi;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating_materi
AFTER INSERT OR UPDATE OR DELETE ON rating
FOR EACH ROW EXECUTE FUNCTION fn_update_rating_materi();

-- =========================================================================================
--  TRIGGER: Recalculate totalXP & rankPeringkat otomatis pada Pengguna
--  Referensi: UC-07, UC-08, UC-10, UC-11, UC-14
--  - total_xp = xp_learner + xp_creator
--  - rank_peringkat dihitung dari system_config rank_thresholds (fallback default)
-- =========================================================================================
CREATE OR REPLACE FUNCTION fn_update_total_xp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_xp := COALESCE(NEW.xp_learner, 0) + COALESCE(NEW.xp_creator, 0);

    DECLARE
        bronze_threshold    INTEGER := 100;
        silver_threshold    INTEGER := 500;
        gold_threshold      INTEGER := 1500;
        platinum_threshold  INTEGER := 5000;
    BEGIN
        SELECT
            (config_value->>'bronze')::INTEGER,
            (config_value->>'silver')::INTEGER,
            (config_value->>'gold')::INTEGER,
            (config_value->>'platinum')::INTEGER
        INTO bronze_threshold, silver_threshold, gold_threshold, platinum_threshold
        FROM system_config
        WHERE config_type = 'rank_thresholds'
        LIMIT 1;

        IF NEW.total_xp >= platinum_threshold THEN
            NEW.rank_peringkat := 'Platinum';
        ELSIF NEW.total_xp >= gold_threshold THEN
            NEW.rank_peringkat := 'Gold';
        ELSIF NEW.total_xp >= silver_threshold THEN
            NEW.rank_peringkat := 'Silver';
        ELSIF NEW.total_xp >= bronze_threshold THEN
            NEW.rank_peringkat := 'Bronze';
        ELSE
            NEW.rank_peringkat := 'Unranked';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            -- Jika config belum ada, gunakan default threshold
            IF NEW.total_xp >= 5000 THEN
                NEW.rank_peringkat := 'Platinum';
            ELSIF NEW.total_xp >= 1500 THEN
                NEW.rank_peringkat := 'Gold';
            ELSIF NEW.total_xp >= 500 THEN
                NEW.rank_peringkat := 'Silver';
            ELSIF NEW.total_xp >= 100 THEN
                NEW.rank_peringkat := 'Bronze';
            ELSE
                NEW.rank_peringkat := 'Unranked';
            END IF;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_total_xp
BEFORE INSERT OR UPDATE ON pengguna
FOR EACH ROW EXECUTE FUNCTION fn_update_total_xp();

-- =========================================================================================
--  SEED DATA
--  Referensi: plan.md, API_CONTRACT.md, LAPORAN-CLASS-DIAGRAM.md
-- =========================================================================================

-- 1. Akun Admin Super (untuk inisialisasi system_config & season)
--    Password hash: bcrypt hash dari "admin123"
INSERT INTO akun (id_akun, nama_lengkap, email, kata_sandi_hash, role, status_aktif, alasan_suspend)
VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Super Admin', 'admin@tim2-lms.com',
     '$2b$10$E5BLlBX2e41ToXlRxbtmb.SSd8KpW0NDdvtv2cNJACCegDpyWatJi', 'admin', TRUE, NULL);

INSERT INTO admin (id_akun, tingkat_akses, kode_pegawai)
VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'full', 'ADM-001');

-- 2. SystemConfig — XP Settings
--    Nilai default berdasarkan skenario UC-07, UC-08, UC-10, UC-11, dan API_CONTRACT.md:
--    - baca_materi:      10 XP  (API-013)
--    - upload_materi:    20 XP  (API-020)
--    - edit_materi:       5 XP  (API-021)
--    - buat_kuis:        30 XP  (API-025, base)
--    - buat_kuis_per_soal: 5 XP  (API-025, per soal)
--    - edit_kuis:        10 XP  (API-026)
INSERT INTO system_config (config_type, config_value, updated_at, updated_by)
VALUES
    ('xp_settings',
     jsonb_build_object(
        'baca_materi',         10,
        'kuis_benar_bonus',    5,
        'upload_materi',      20,
        'edit_materi',         5,
        'buat_kuis',          30,
        'buat_kuis_per_soal',  5,
        'edit_kuis',          10
     )::jsonb,
     NOW(),
     'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
    ('rank_thresholds',
     jsonb_build_object(
        'bronze',   100,
        'silver',   500,
        'gold',    1500,
        'platinum', 5000
     )::jsonb,
     NOW(),
     'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- 3. Seed Season aktif (UC-14 — sistem season dimulai)
INSERT INTO season (season_name, start_date, status)
VALUES
    ('Season 1 - August 2026', NOW(), 'active');

COMMIT;
