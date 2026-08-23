# 📋 Rencana Migrasi ke Firebase

> **Branch:** `feature/firebase-migration`
> **Status:** Draft
> **Metodologi:** Migrasi bertahap (incremental), frontend dapat dikembangkan paralel dengan dokumen ini.

---

## 1. Tujuan

Ganti stack backend dari **Express.js + PostgreSQL** menjadi **Firebase (serverless)** untuk:
- Menghilangkan kebutuhan mengelola server VM / container
- Memanfaatkan Firebase Authentication (login, Google Auth, password hashing)
- Menggunakan Firestore (NoSQL) sebagai database
- Menyimpan file di Firebase Storage (pengganti AWS S3)
- Deploy frontend via Firebase Hosting
- Biaya berbasis pemakaian (pay-as-you-go), sangat cocok untuk MVP/prototype

---

## 2. Roadmap Migrasi (Fase Demi Fase)

### Fase 1: Setup & Auth (Backend MVP)
**Target:** Auth full fungsional, database terhubung, hosting bisa di-deploy.

- [ ] Buat project Firebase di [Firebase Console](https://console.firebase.google.com/)
- [ ] Setup `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`
- [ ] Buat folder `functions/` — inisialisasi Firebase Functions
- [ ] Pindahkan schema awal ke Firestore (koleksi: `akun`, `pengguna`, `materi` dummy)
- [ ] Ganti auth di frontend: hapus `axiosClient` interceptor JWT, pakai Firebase Auth SDK
- [ ] Update `AuthView.jsx` — pakai `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `GoogleAuthProvider`
- [ ] Setup Firestore Security Rules dasar untuk `akun`, `pengguna`
- [ ] Deploy hosting dan uji login + register

### Fase 2: Konten Publik (Materi & Kuis)
**Target:** User bisa melihat, mencari, dan membaca materi; mengikuti kuis.

- [ ] Migrasi koleksi `materi`, `kuis`, `soal`, `kunci_jawaban` ke Firestore
- [ ] Update `materiService.js` + `kuisService.js` → Firestore SDK calls
- [ ] Deploy halaman: `MateriListPage`, `MateriDetailPage`, `KuisTakePage`
- [ ] Buat Firestore Security Rules untuk public read, authenticated write
- [ ] Implementasikan pencarian sederhana (query `judulMateri` dengan `array-contains` atau commence-with)

### Fase 3: Interaksi & Gamifikasi
**Target:** Rating, komentar, riwayat belajar, XP/Leaderboard.

- [ ] Migrasi koleksi: `rating`, `komentar`, `riwayat_belajar`, `season`, `season_winners`
- [ ] Deploy halaman: `KuisListPage`, `LeaderboardPage`
- [ ] Buat Cloud Function trigger: `onRiwayatBelajarCreate` → auto-update XP user + rekam di `riwayat_belajar`
- [ ] Buat Cloud Function trigger: `onRatingChange` → auto-recalc `ratingRataRata` materi
- [ ] Deploy `KelolaMateriPage`, `KelolaKuisPage` (CRUD via SDK + callable Functions untuk logic aman)

### Fase 4: Admin Panel
**Target:** Fitur admin penuh.

- [ ] Migrasi koleksi: `system_config`, `moderation_log`, `audit_log`, `config_change_log`
- [ ] Deploy halaman admin: Users, Moderasi, XP Config, Season, Logs
- [ ] Implementasikan callable Functions untuk admin-only ops:
  - `resetSeason()` — batch update + archive winners
  - `recalculateXP()` — background job
  - `updateXpConfig()`, `updateRankTiers()` — update `system_config`
- [ ] Deploy `AdminLayout` + role-based Security Rules

### Fase 5: Polish & Scale
**Target:** Production-ready.

- [ ] Tambahkan loading skeletons + toast notifications
- [ ] Error boundary & retry logic
- [ ] Performance: query indexes, caching via Firestore offline persistence
- [ ] (Opsional) Integrasi Algolia untuk full-text search
- [ ] (Opsional) Migrasi pencarian ke Algolia atau gunakan Cloud Functions search

---

## 3. Apa yang Dihapus?

Setelah migrasi penuh, hapus folder `backend/`:
```bash
rm -rf backend/
```
Tidak diperlukan lagi karena:
- Express server → digantikan Firebase Functions (hanya untuk trigger/ops kompleks)
- PostgreSQL → Firestore (client SDK langsung dari frontend)
- Custom JWT auth → Firebase Authentication
- AWS S3 → Firebase Storage

API Contract (`legacy/API_CONTRACT.md`) tetap disimpan sebagai **referensi spesifikasi operasional**, tapi implementasinya berubah dari REST endpoint → Firestore SDK calls.

---

## 4. Prinsip "Serverless-First"

1. **Firestore Rules keamanan pertama, Functions kedua** — selama Firestore SDK + Security Rules cukup aman, jangan pakai Functions.
2. **Admin-only logic via Callable Functions** — operasi yang butuh kepastian server (season reset, XP rekalkulasi, config update) selalu pakai Firebase Callable Functions yang diverifikasi role via token.
3. **Triggers untuk automation** — auto-update XP, rating rata-rata, rank. Gunakan Firestore `onWrite`/`.onCreate` triggers.
4. **Denormalisasi untuk performa** — simpan nama penulis di dokumen materi (bukan reference ke tabel terpisah) untuk menghindari join.

---

## 5. Timeline Perkiraan

| Fase | Durasi | Effort |
|---|---|---|
| Fase 1 (Setup & Auth) | 2-3 hari | ★★☆ |
| Fase 2 (Materi & Kuis) | 3-4 hari | ★★★ |
| Fase 3 (Interaksi & Gamifikasi) | 4-5 hari | ★★★ |
| Fase 4 (Admin Panel) | 3-4 hari | ★★★ |
| Fase 5 (Polish) | 2-3 hari | ★★ |
| **Total** | **14-19 hari kerja** | |

> ⚠️ Timeline bersifat perkiraan. Effort meningkat jika tim belum familiar dengan Firestore Security Rules dan Cloud Functions.
