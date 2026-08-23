# Setup Supabase — Langkah Demi Langkah

> Ikuti urutan ini untuk setup project Supabase dari nol.

---

## 1. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com/) → Sign up / Login
2. Klik **"New project"**
3. Isi:
   - **Name**: `lms-gamifikasi` (atau bebas)
   - **Organization**: pilih / buat baru
   - **Password**: password kuat untuk database (simpan baik-baik)
   - **Region**: `Southeast Asia (Singapore)` 🇸🇬 — paling dekat ke Indonesia
   - **Pricing plan**: **Free (Sizing: Free)** — Hobby tier

4. Tunggu ~2-5 menit sampai project siap (status: Active)

---

## 2. Upload Schema Database

Setelah project aktif:

1. Buka dashboard project → **SQL Editor**
2. Klik **"New query"**
3. Copy-paste isi `legacy/schema.sql` ke editor
4. Klik **"Run"** (play button)

✅ Ini akan otomatis membuat:
- 16 tabel (akun, pengguna, admin, materi, kuis, soal, kunci_jawaban, riwayat_belajar, rating, komentar, system_config, season, season_winners, moderation_log, audit_log, config_change_log)
- 2 PostgreSQL trigger functions (`fn_update_rating_materi`, `fn_update_total_xp`)
- Seed data (1 admin, 2 user test, system config, season)

> **Catatan:** Jika error "column `password_hash` does not exist" di bagian seed user (line 504+), berarti seed data user pakai skema lama. Boleh skip bagian user seed — kita akan pakai Supabase Auth untuk user management. Atau fix manual di SQL editor.

---

## 3. Setup Authentication

### 3a. Aktifkan Email/Password Auth
1. Dashboard → **Authentication** → **Providers**
2. Aktifkan **"Email"** → ganti ON semua toggle:
   - ✅ Enable sign ups
   - ✅ Enable unruly users (opsional, untuk testing)
   - ✅ Enable confirmations (opsional — biar email harus konfirmasi)
3. Klik **"Save"**

### 3b. Aktifkan Google OAuth
1. Dashboard → **Authentication** → **Providers**
2. Klik **"Google"** → aktifkan ON
3. Klik **"Click here"** untuk buat Google Client ID di Google Cloud Console
4. Ikuti wizard → dapatkan Client ID & Secret
5. Pilih **Authorized redirect URIs**: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
6. Copy Client ID & Secret ke Supabase
7. **Save**

---

## 4. Dapatkan Koneksi String & API Keys

1. Dashboard → **Project Settings** (icon roda gigi di bawah sidebar)
2. Buka tab **"API"**

Catat 3 nilai penting:
| Field | Nama di .env | Lokasi |
|---|---|---|
| `SUPABASE_URL` | Project URL | `https://[project_ref].supabase.co` |
| `SUPABASE_ANON_KEY` | anon public | `anon` key di tabel API keys |
| `SUPABASE_SERVICE_ROLE_KEY` | (hanya frontend pakai anon key) | JANGAN expose di frontend |

---

## 5. Setup Frontend (integrasi ke kode)

### Install di frontend:
```bash
cd frontend
npm install @supabase/supabase-js
```

### Buat `.env.local` (atau `.env`) di frontend/:
```env
# Supabase - ganti [project_ref] dengan project kamu
VITE_SUPABASE_URL=https://[project_ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)
```

> ⚠️ Gunakan **anon key**, BUKAN service_role key (bisa diekspose di frontend aman karena dikontrol RLS).

### Deploy ke Netlify (agar team bisa akses):
1. Commit `.env` (hanya anon key — aman)
2. Di Netlify dashboard → Site settings → Environment variables → tambahkan 2 env di atas

---

## 6. (Opsional) Setup Supabase CLI untuk Dev Lokal

Untuk develop lokal sempurna:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Inisialisasi project lokal (bisa sync ke project cloud)
supabase init

# Jalankan emulator lokal
supabase start
```

Ini membantu tim develop & test offline sebelum deploy.

---

## 7. Verifikasi Akhir

Setelah setup, pastikan:

```
[ ] Bisa login via email/password di Supabase Auth
[ ] Bisa login via Google
[ ] Schema (16 tabel + triggers) ada di SQL Editor
[ ] Seed data ada di tabel (admin, system_config, season)
[ ] Frontend dapat koneksi: bisa query ke Supabase
[ ] Trigger jalan: insert rating → ratingRataRata otomatis update
```

---

## 8. Troubleshooting Umum

| Issue | Solusi |
|---|---|
| "Invalid API key" di frontend | Pastikan pakai `anon` key, bukan `service_role` |
| Login gagal "Email not confirmed" | Di Auth settings, matikan "Enable confirmations" untuk testing |
| Trigger tidak fire | Pastikan trigger sudah dibuat via schema.sql (cek di SQL Editor → Table Editor → Triggers) |
| RLS error (permission denied) | Pastikan sudah setup RLS policies (lihat doc `04-security-rules.md`) |
| Google OAuth redirect error | Pastikan redirect URI di Google Cloud Console tepat: `https://[ref].supabase.co/auth/v1/callback` |
