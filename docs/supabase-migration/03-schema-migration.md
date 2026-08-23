# Schema Migration: PostgreSQL (backend) → Supabase

> Schema PostgreSQL di `backend/schema.sql` **langsung dipakai di Supabase tanpa perubahan signifikan**. Berikut apa yang perlu dicek.

---

## 1. Upload Schema

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) → **Database** → **SQL Editor**
2. Buka tab **New query**
3. Copy isi `legacy/schema.sql`
4. Klik **Run** (play button)

✅ Otomatis membuat 16 tabel + 2 trigger + seed data.

---

## 2. Issue Yang Perlu Diperbaiki di Schema

### Issue 1: Seed data user pakai kolom lama (line 504-525)
Bagian ini di `schema.sql` (line 500-525) memakai kolom yang **tidak konsisten** dengan skema tabelnya:

```sql
-- seed user Budi (line 504-511)
INSERT INTO akun (email, password_hash, provider, is_admin, status)
VALUES ('budi@example.com', ...);

INSERT INTO pengguna (id_akun, nama_lengkap, username, bio, total_xp, current_season_xp, rank_tier)
VALUES (...);
```

**Masalah:** kolom `password_hash`, `provider`, `is_admin`, `username`, `bio`, `current_season_xp`, `rank_tier` **tidak ada di tabel schema**. Ini seed data versi lama.

**Solusi:** Hapus / skip bagian seed user ini. Login/register user dilakukan lewat **Supabase Auth**, bukan insert langsung ke tabel `akun`. Tabel `akun` yang dibuat via signUp trigger otomatis (atau manual via Functions).

Seed data penting yang **tetap dipakai**:
- Admin super (line 451-458) — **OK**, konsisten
- System config (line 468-490) — **OK**
- Season (line 449-458) — **OK**

### Issue 2: UUID Extension
Schema sudah ada `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` — di Supabase ini **langsung jalan** (extension sudah built-in).

---

## 3. Trigger — Tetap Jalan di Supabase ✅

PostgreSQL trigger di schema:

| Trigger | Fungsi | Status |
|---|---|---|
| `fn_update_rating_materi()` | Auto-hitung rata-rata rating | ✅ Jalan otomatis |
| `fn_update_total_xp()` | Auto-calc totalXP + rank | ✅ Jalan otomatis |
| `trg_update_rating_materi` | AFTER INSERT/UPDATE/DELETE ON rating | ✅ |
| `trg_update_total_xp` | BEFORE INSERT/UPDATE ON pengguna | ✅ |

Tidak perlu ditulis ulang — langsung gunakan.

---

## 4. Tambahan yang Perlu Ditambah di Supabase

### Tambahan Trigger: increment view materi
Schema asli pakai native query `UPDATE Materi SET totalDilihat = totalDilihat + 1` di backend. Di Supabase, buat **stored procedure** untuk dipanggil dari frontend:

```sql
CREATE OR REPLACE FUNCTION increment_view(materi_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE materi SET total_dilihat = total_dilihat + 1 WHERE id_materi = materi_id;
END;
$$ LANGUAGE plpgsql;

-- Di frontend, panggil:
-- await supabase.rpc('increment_view', { materi_id: 1 })
```

### Tambahan: Trigger otomatis buat dokumen `pengguna` saat user signUp
Saat user registrasi via Supabase Auth, otomatis buat dokumen di `pengguna`:

```sql
-- Atau gunakan Supabase "Database Webhooks" (UI sederhana)
-- SQL untuk webhook:
INSERT INTO pengguna (id_akun, xp_learner, xp_creator, total_xp, rank_peringkat)
VALUES (auth.uid()::text, 0, 0, 0, 'Unranked');
```

Atau pakai **Supabase Auth Hook** di dashboard: Authentication → Hooks → "Create user" → eksekusi SQL ke tabel `pengguna`.

---

## 5. RLS Policies (Security) — Tambah Setelah Upload Schema

Schema SQL tidak include RLS policies (karena aslinya pakai middleware Express). Di Supabase, semua tabel butuh policy:

```sql
-- Aktifkan RLS semua tabel
ALTER TABLE akun ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE kuis ENABLE ROW LEVEL SECURITY;
ALTER TABLE soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE kunci_jawaban ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE komentar ENABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat_belajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE season ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_change_log ENABLE ROW LEVEL SECURITY;

-- Lihat policy lengkap di: 04-security-rules.md
```

---

## 6. Seed Admin — Perlu Fix karena Auth

Seed admin di schema (line 451-458) insert langsung ke tabel akun dengan password hash. Tapi di Supabase, admin biasanya dibuat via dashboard, bukan SQL langsung.

**Opsi A:** Insert langsung ke tabel `akun` (bisa, tapi tidak bisa login via Auth UI):
```sql
-- Sudah ada di schema, biarkan — buat dokumen referensi.
-- Untuk login ke dashboard Supabase, buat user di Auth UI.
```

**Opsi B:** Buat admin lewat Supabase Auth UI (lebih recommended):
1. Dashboard → Authentication → Users
2. Tambah user → isi email + password
3. Manual update field `role = 'admin'` di tabel `akun` via SQL editor:
   ```sql
   UPDATE akun SET role = 'admin', status_aktif = true
   WHERE email = 'admin@kamu.com';
   ```

---

## 7. Ringkasan: Yang Perlu Dilakukan Setelah Upload Schema

| Langkah | Detail |
|---|---|
| [ ] Upload `schema.sql` via SQL Editor | 16 tabel + trigger |
| [ ] Fix seed user (hapus line 504-525) | Pakai Supabase Auth untuk user |
| [ ] Tambahkan RPC `increment_view()` | Untuk update view count materi |
| [ ] Setup Auth Hook / trigger | Otomatis insert ke `pengguna` saat signUp |
| [ ] Aktifkan RLS semua tabel | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| [ ] Deploy RLS policies | Lihat `04-security-rules.md` |
| [ ] Verifikasi trigger jalan | Test insert rating → lihat rata-rata update |
