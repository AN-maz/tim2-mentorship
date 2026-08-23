# Firestore Schema Design

> **Sumber:** `docs/legacy/classDiagram.plantumuml`, `docs/legacy/schema.sql`
> **Tujuan:** Desain koleksi & dokumen Firestore yang menggantikan skema PostgreSQL 16 tabel.

---

## 1. Paradigma Berubah: Relational → Document

PostgreSQL (relasional): data normalisasi, 16 tabel dengan FK, trigger, join.
Firestore (NoSQL dokumen): **denormalisasi**, sub-koleksi, trigger → Cloud Functions.

### Prinsip desain:
1. **Denormalisasi**: simpan data yang sering dibaca bersama dalam satu dokumen.
2. **Sub-koleksi**: untuk data yang bisa rakak (komentar, rating, riwayat belajar).
3. **Trigger → Cloud Functions**: auto-update `ratingRataRata`, `totalXP`, `rankPeringkat`.

---

## 2. Peta Koleksi Firestore

| Koleksi Firestore | Dokumen | Keterangan | Ganti dari tabel SQL |
|---|---|---|---|
| `akun` | `{id}` | User/admin account (email, nama, role, photoURL) | `akun` |
| `pengguna` | `{idAkun}` | XP, rank, profil lengkap | `pengguna`, `admin` |
| `materi` | `{id}` | Judul, konten markdown, penulis denormalisasi | `materi` |
| `kuis` | `{id}` | Judul, aturan, batas waktu | `kuis` |
| `soal` (sub-koleksi) | `kuis/{kuisId}/soal/{soalId}` | Soal + opsi + kunci jawaban | `soal` + `kunci_jawaban` |
| `rating` (sub-koleksi) | `materi/{materiId}/rating/{userId}` | Nilai rating per user | `rating` |
| `komentar` (sub-koleksi) | `materi/{materiId}/komentar/{komentarId}` | Teks komentar | `komentar` |
| `riwayat_belajar` | `{id}` | Aktivitas belajar + XP | `riwayat_belajar` |
| `season` | `{id}` (1 dokumen aktif) | Nama season, status, date range | `season` |
| `season_winners` | `{seasonId}/winners/{userId}` | Arsip pemenang | `season_winners` |
| `system_config` | `xp_settings`, `rank_thresholds` | Konfigurasi XP & rank | `system_config` |
| `audit_log` | `{id}` | Log aksi admin | `audit_log` |
| `moderation_log` | `{id}` | Log moderasi konten | `moderation_log` |

---

## 3. Detail Struktur Dokimen

### `akun` (dokumen utama)
> Diganti oleh Firebase Authentication. Dokumen ini menyimpan data profil tambahan.

```js
// akun/{firebaseUid}
{
  email: "budi@example.com",
  namaLengkap: "Budi Santoso",
  photoURL: "https://...",         // dari Google Auth
  role: "user",                    // "user" | "admin"
  statusAktif: true,
  alasanSuspend: null,             // nullable
  tanggalDaftar: firebase.firestore.Timestamp,
  provider: "password",             // atau "google.com"
  googleId: null,                  // nullable, untuk Google Auth
}
```

### `pengguna` (sub-dokumen dari akun, atau dokumen terpisah)
```js
// pengguna/{firebaseUid}
{
  idAkun: "firebaseUid",            // FK ke akun
  xpLearner: 0,
  xpCreator: 0,
  totalXP: 0,                       // = xpLearner + xpCreator (auto-update trigger)
  rankPeringkat: "Unranked",        // auto-update: Bronze/Silver/Gold/Platinum/Diamond
  currentSeasonXP: 0,               // XP di season aktif (reset saat season reset)
  badge: [],                        // lencana yang diraih
  lastActive: firebase.firestore.Timestamp,
}
```

### `materi` (dokumen utama)
```js
// materi/{materiId}
{
  judulMateri: "Pengenalan JavaScript",
  kontenMarkdown: "# Pengenalan JavaScript\n\n...",
  idPenulis: "firebaseUid",
  namaPenulis: "Budi Santoso",       // denormalisasi untuk read cepat
  tanggalUnggah: firebase.firestore.Timestamp,
  tanggalEdit: null,
  totalDilihat: 0,
  ratingRataRata: 0.0,              // auto-update trigger
  ratingCount: 0,                   // jumlah rating (untuk hitung rata-rata)
  status_publik: true,
  alasan_moderate: null,            // diisi jika disembunyikan
  moderated_by: null,               // firebaseUid admin
  moderated_at: null,
  fileUrls: [],                     // array URL Firebase Storage
  tags: ["javascript", "dasar"],    // untuk pencarian/filter
  idKuisTerkait: [],                // array ID kuis yang terkait (opsional)
}
```

#### Sub-koleksi `materi/{materiId}/rating/{firebaseUid}`
```js
// rating per user, 1 dokumen per user per materi
{
  idMateri: "materiId",
  idPengguna: "firebaseUid",
  nilaiRating: 4,                   // 1-5
  tanggal: firebase.firestore.Timestamp,
}
```

#### Sub-koleksi `materi/{materiId}/komentar/{komentarId}`
```js
{
  idMateri: "materiId",
  idPengguna: "firebaseUid",
  namaPengguna: "Budi Santoso",       // denormalisasi
  teksKomentar: "Materi ini sangat membantu!",
  tanggal: firebase.firestore.Timestamp,
  tanggalEdit: null,
}
```

### `kuis` (dokumen + sub-koleksi)
```js
// kuis/{kuisId}
{
  judulKuis: "Kuis JavaScript Dasar",
  idMateriTerkait: "materiId",      // nullable, kuis bisa standalone
  idCreator: "firebaseUid",
  namaCreator: "Siti Aminah",
  aturanMarkdown: "# Aturan\n- Jawab jujur",
  batasWaktuMenit: 5,
  poinXPDefault: 10,
  tanggalBuat: firebase.firestore.Timestamp,
  status_publik: true,
  alasan_moderate: null,
  moderated_by: null,
  moderated_at: null,
  jumlahSoal: 3,                   // denormalisasi untuk read cepat
}
```

#### Sub-koleksi `kuis/{kuisId}/soal/{soalId}`
```js
{
  idKuis: "kuisId",
  pertanyaanMarkdown: "Apa tipe data bilangan bulat di JavaScript?",
  opsiA: "int",
  opsiB: "number",
  opsiC: "float",
  opsiD: "integer",
  urutan: 1,
  jawabanBenar: "B",               // dihapus dari respon ke learner (security)
}
```

### `riwayat_belajar` (dokumen)
```js
// riwayat_belajar/{riwayatId}
{
  idPengguna: "firebaseUid",
  idKonten: "materiId" atau "kuisId",
  tipeKonten: "materi" | "kuis",
  tanggalSelesai: firebase.firestore.Timestamp,
  xpDidapat: 10,
  skor: null,                       // hanya untuk kuis
  // untuk kuis tambahan:
  idKuis: "kuisId",
  jawaban: [{ idSoal: 1, jawabanDipilih: "B", benar: true }],
}
```

Unique constraint (ganti `UNIQUE INDEX uq_riwayat`) → **Cloud Function validasi** sebelum insert (cek dokumen serupa sudah ada di koleksi).

---

## 4. Koleksi Sistem / Config

### `system_config` (2 dokumen)
```js
// system_config/xp_settings
{
  baca_materi: 10,
  kuis_benar_bonus: 5,
  upload_materi: 20,
  edit_materi: 5,
  buat_kuis: 30,
  buat_kuis_per_soal: 5,
  edit_kuis: 10,
}

// system_config/rank_thresholds
{
  bronze: 100,
  silver: 500,
  gold: 1500,
  platinum: 5000,
  diamond: 10000,                  // opsional, belum di schema lama
}
```

### `season` (dokumen tunggal)
```js
// season/active (atau {seasonId})
{
  season_name: "Season 1 - August 2026",
  start_date: firebase.firestore.Timestamp,
  end_date: null,
  status: "active",                // "active" | "ended"
  topWinnersSnapshot: 10,         // berapa banyak pemenang diarsipkan
}
```

### Log koleksi
```js
// audit_log/{logId}
{
  adminId: "firebaseUid",
  action: "edit_role" | "suspend" | "unsuspend" | "delete_user",
  targetUserId: "firebaseUid",
  details: "Role changed from user to admin",
  timestamp: firebase.firestore.Timestamp,
}

// moderation_log/{logId}
{
  adminId: "firebaseUid",
  contentId: "materiId" | "kuisId",
  contentType: "materi" | "kuis",
  action: "hide" | "delete" | "approve",
  reason: "Konten tidak pantas",
  timestamp: firebase.firestore.Timestamp,
}

// config_change_log/{logId}
{
  adminId: "firebaseUid",
  parameterChanged: "baca_materi",
  oldValue: "10",
  newValue: "15",
  timestamp: firebase.firestore.Timestamp,
}
```

---

## 5. Firestore Indexes yang Diperlukan

Firestore butuh composite indexes untuk query berikut:

| Koleksi | Query | Index |
|---|---|---|
| `materi` | `where status_publik == true, orderBy tanggalUnggah desc` | ✅ composite |
| `materi` | `where status_publik == true, orderBy ratingRataRata desc` | ✅ composite |
| `kuis` | `where status_publik == true, orderBy tanggalBuat desc` | ✅ composite |
| `riwayat_belajar` | `where idPengguna == X, orderBy tanggalSelesai desc` | ✅ composite |
| `pengguna` | `orderBy totalXP desc, limit 100` | ✅ composite (untuk leaderboard) |
| `rating` (sub) | `orderBy nilaiRating` | — (rata-rata dihitung di materi) |

→ Simpan index definisi di `firestore.indexes.json` di root proyek.

---

## 6. Migration Checklist (SQL → Firestore)

- [x] `akun` → koleksi `akun` + Firebase Auth (tabel dipindah ke Auth + Firestore doc)
- [x] `pengguna` → koleksi `pengguna` (dokumen `{firebaseUid}`)
- [x] `admin` → gabung ke `akun` (field `role: "admin"`) + `pengguna`
- [x] `materi` → koleksi `materi` (denormalisasi nama penulis)
- [x] `kuis` + `soal` + `kunci_jawaban` → koleksi `kuis` + sub-koleksi `soal`
- [x] `riwayat_belajar` → koleksi `riwayat_belajar`
- [x] `rating` → sub-koleksi `materi/{id}/rating`
- [x] `komentar` → sub-koleksi `materi/{id}/komentar`
- [x] `system_config` → koleksi `system_config` (2 dokumen)
- [x] `season` + `season_winners` → koleksi `season`, sub-koleksi `winners`
- [x] `moderation_log` → koleksi `moderation_log`
- [x] `audit_log` → koleksi `audit_log`
- [x] `config_change_log` → koleksi `config_change_log`

> **Trigger SQL → Cloud Functions:**
> - `fn_update_rating_materi()` → `functions/index.js`: `onRatingWrite` trigger
> - `fn_update_total_xp()` → `functions/index.js`: `onRiwayatWrite` trigger
