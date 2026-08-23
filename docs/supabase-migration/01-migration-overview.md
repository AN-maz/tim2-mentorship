# 📋 Rencana Migrasi ke Supabase

> **Branch:** `feature/firebase-migration`
> **Status:** Draft
> **Metodologi:** Migrasi bertahap (incremental), frontend dapat dikembangkan paralel dengan dokumen ini.

---

## 1. Tujuan

Ganti stack backend dari **Express.js + PostgreSQL** ke **Supabase** (PostgreSQL-as-a-Service + Auth + Storage + Edge Functions) untuk:

- Menghilangkan kebutuhan mengelola server VM/container
- Memanfaatkan Supabase Auth (login, Google Auth, password hashing siap pakai)
- Menggunakan **PostgreSQL yang sama** — schema existing (`legacy/schema.sql`) langsung dipakai
- Menyimpan file di Supabase Storage
- Deploy frontend via Netlify
- **Zero cost** di Hobby tier untuk kebutuhan 1 bulan testing (~100 user/hari)

> **Keputusan:** Firebase membutuhkan Blaze plan (bayar) untuk Firestore + Functions. Karena hanya testing 1 bulan, pakai Supabase Hobby tier (gratis, PostgreSQL). Schema PostgreSQL existing langsung jalan, trigger tetap berfungsi.

---

## 2. Roadmap Migrasi (Fase Demi Fase)

### Fase 1: Setup & Auth (Backend MVP)
**Target:** Project Supabase siap, Auth berfungsi, frontend bisa login.

- [ ] Buat project Supabase di [supabase.com](https://supabase.com/)
- [ ] Upload `legacy/schema.sql` ke Supabase SQL editor
- [ ] Setup Auth: email/password, Google OAuth
- [ ] Install `@supabase/supabase-js` di frontend
- [ ] Buat `frontend/src/lib/supabase.js` (client init)
- [ ] Update `AuthProvider.jsx` — gunakan Supabase Auth
- [ ] Update `AuthView.jsx` — `signInWithPassword`, `signUp`, `signInWithOAuth('google')`
- [ ] Setup `frontend/.env` / Netlify env vars
- [ ] Deploy hosting (Netlify) dan uji login + register

### Fase 2: Konten Publik (Materi & Kuis)
**Target:** User bisa lihat, cari, baca materi; ikut kuis.

- [ ] Migrasi API services di frontend (`materiService.js`, `kuisService.js`) → Supabase client queries
- [ ] Deploy halaman: `MateriListPage`, `MateriDetailPage`, `KuisTakePage`
- [ ] Setup Row Level Security (RLS) policies untuk `materi`, `kuis`, `soal`
- [ ] Implementasikan pencarian (Supabase full-text search)

### Fase 3: Interaksi & Gamifikasi
**Target:** Rating, komentar, riwayat belajar, XP/Leaderboard.

- [ ] Deploy halaman: `KuisListPage`, `LeaderboardPage`
- [ ] Setup RLS untuk `rating`, `komentar`, `riwayat_belajar`
- [ ] **Trigger PostgreSQL tetap jalan** — `fn_update_rating_materi`, `fn_update_total_xp`
- [ ] Deploy `KelolaMateriPage`, `KelolaKuisPage` (CRUD via SDK)

### Fase 4: Admin Panel
**Target:** Fitur admin penuh.

- [ ] Deploy halaman admin: Users, Moderasi, XP Config, Season, Logs
- [ ] Implementasikan RLS role-based (admin hanya boleh akses tertentu)
- [ ] Opsional: buat Edge Function untuk season reset (batch ops)

### Fase 5: Polish & Scale
**Target:** Production-ready.

- [ ] Tambahkan loading skeletons + toast notifications
- [ ] Error boundary & retry logic
- [ ] Optimasi query (indexes), realtime subscriptions (leaderboard)
- [ ] Deploy final di Netlify + Supabase

---

## 3. Apa yang Dihapus?

Setelah migrasi penuh, hapus folder `backend/`:
```bash
rm -rf backend/
```
Tidak diperlukan lagi karena:
- Express server → digantikan Supabase client SDK langsung dari frontend
- PostgreSQL → tetap dipakai (di-host Supabase), hanya pindah host
- Custom JWT auth → Supabase Authentication
- AWS S3 → Supabase Storage
- Custom API → Supabase client query langsung ke PostgreSQL

API Contract (`legacy/API_CONTRACT.md`) & schema (`legacy/schema.sql`) tetap disimpan sebagai **referensi — langsung dapat dipakai**.

---

## 4. Prinsip Migrasi

1. **Schema first** — schema PostgreSQL di `legacy/schema.sql` sudah siap, langsung upload ke Supabase. Semua tabel, trigger, seed data tetap jalan.
2. **RLS (Row Level Security) = Security Rules baru** — ganti semua middleware Express auth dengan RLS policies di PostgreSQL.
3. **Client SDK langsung** — ganti axios calls → Supabase JS client. Sama secure-nya.
4. **Triggers tetap** — `fn_update_rating_materi()` & `fn_update_total_xp()` langsung jalan di PostgreSQL Supabase.
5. **Edge Functions = terbatas** — hanya pakai untuk ops yang butuh server-side (season reset batch, dll). CRUD sederhana pakai SDK.

---

## 5. Timeline Perkiraan

| Fase | Durasi | Effort |
|---|---|---|
| Fase 1 (Setup & Auth) | 1-2 hari | ★★☆ |
| Fase 2 (Materi & Kuis) | 2-3 hari | ★★★ |
| Fase 3 (Interaksi & Gamifikasi) | 2-3 hari | ★★☆ |
| Fase 4 (Admin Panel) | 2-3 hari | ★★☆ |
| Fase 5 (Polish) | 1-2 hari | ★☆☆ |
| **Total** | **8-13 hari kerja** | |

> ⚠️ Effort berkurang drastis vs Firebase karena: schema langsung dipakai, trigger tidak perlu ditulis ulang, tidak perlu belajar Firestore data model.
