# Integrasi Frontend ke Supabase — Langkah Demi Langkah

> Mengganti axios + custom JWT → `@supabase/supabase-js` client langsung.

---

## 1. Apa yang Diganti

| Komponen Lama | Komponen Baru (Supabase) | File yang Diubah |
|---|---|---|
| `axiosClient.js` (axios + JWT interceptor) | `lib/supabase.js` (Supabase client) | `src/lib/supabase.js` |
| `authService.js` (axios calls) | `authService.js` (supabase.auth) | `src/api/authService.js` |
| `materiService.js` (axios calls) | Firestore RPC-style queries | `src/api/materiService.js` |
| `kuisService.js`, `leaderboardService.js` | Supabase queries | `src/api/kuisService.js`, `leaderboardService.js` |
| `AuthProvider.jsx` (JWT storage) | `AuthProvider.jsx` (Supabase session listener) | `src/context/AuthProvider.jsx` |
| Auth middleware Express | Supabase RLS policies | `docs/supabase-migration/04-security-rules.md` |

---

## 2. Setup Akun Supabase

1. Buka [supabase.com](https://supabase.com/) → buat/buka project
2. **Project Settings** → **API** → catat:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon public key — aman dipakai frontend)
3. **Authentication** → **Providers** → aktifkan:
   - ✅ Email (password)
   - ✅ Google (OAuth) — ikuti wizard, copy client ID & secret
4. Upload schema: **SQL Editor** → copy-paste `legacy/schema.sql` → **Run**

---

## 3. Frontend Setup

### Install dependencies:
```bash
cd frontend
npm install @supabase/supabase-js
```

### Buat `.env.local`:
```env
VITE_SUPABASE_URL=https://[project_ref].supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]
VITE_SITE_URL=http://localhost:5173
```

### Inisialisasi client (`src/lib/supabase.js`):
```js
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## 4. Migrasi Kode Per Halaman

### AuthPage (`AuthView.jsx`)
- **Login**: `supabase.auth.signInWithPassword({ email, password })`
- **Register**: `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
- **Google**: `supabase.auth.signInWithOAuth({ provider: 'google' })`

### Dashboard
- Session di-handle otomatis via `supabase.auth.getUser()` di `AuthProvider`
- Data user (XP, rank) di-query dari tabel `pengguna`

### Materi
- List: `supabase.from('materi').select('*').eq('status_publik', true).order(...)`
- Detail: `.single()` + increment view via `supabase.rpc('increment_view', { materi_id })`
- Rating: `.upsert()` atau `.update()` ke tabel `rating`
- Komentar: `.insert()`, `.update()`, `.delete()` ke tabel `komentar`
- Complete: `.insert()` ke `riwayat_belajar` — trigger auto-update XP

### Kuis
- Info: `.select()` dari `kuis`
- Soal: `.select()` dari `soal` (tanpa `jawaban_benar`)
- Submit: ambil kunci jawaban via RPC/edge function, hitung skor, insert riwayat

### Leaderboard
- Ranking: `supabase.from('pengguna').select(...).order('total_xp', { ascending: false }).limit(100)`

---

## 5. RLS Policies Wajib Di-setup

RLS (Row Level Security) mengganti Express middleware auth. Berikut yang penting:

```sql
-- Semua orang boleh baca materi publik
CREATE POLICY "Public materi visible" ON materi
FOR SELECT USING (status_publik = true);

-- Hanya pemilik materi bisa edit
CREATE POLICY "Users can edit own materi" ON materi
FOR UPDATE USING (auth.uid()::text = id_penulis);

-- Riwayat belajar: hanya pemilik bisa lihat & buat
CREATE POLICY "Users can CRUD own riwayat" ON riwayat_belajar
FOR ALL USING (auth.uid()::text = id_pengguna);

-- Komentar: publik boleh baca, pemilik bisa edit/hapus
CREATE POLICY "Comments readable by all" ON komentar
FOR SELECT USING (true);
```

Lihat `04-security-rules.md` untuk detail lengkap.

---

## 6. Debug & Troubleshooting

| Error | Penyebab | Solusi |
|---|---|---|
| `Invalid API key` | Salah key | Pastikan pakai `anon` key, bukan `service_role` |
| `permission denied for table` | RLS belum ON/policy belum ada | Aktifkan RLS: `ALTER TABLE X ENABLE ROW LEVEL SECURITY;` |
| `auth.uid()` returns null | Belum login | Pastikan `supabase.auth.getUser()` ada di depan |
| Google OAuth gagal | Redirect URI salah | Update di Supabase Auth → Providers → Google → URL |

---

## 7. Deploy ke Netlify

1. Commit `.env.local` (hanya anon key — aman)
2. Di Netlify: buat project, pilih repo, deploy
3. Di Netlify dashboard → **Site settings** → **Environment variables** → tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` = https://[nama]-site.netlify.app
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy! Frontend langsung konek ke Supabase.

> Semua data persisten (user, XP, materi) langsung tersinkron realtime via Supabase realtime subscriptions — user lain langsung lihat perubahan!
