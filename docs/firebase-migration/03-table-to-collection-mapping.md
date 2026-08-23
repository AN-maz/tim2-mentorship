# Pemetaan Table SQL → Koleksi Firestore

> Dokumen ini memetakan setiap tabel PostgreSQL lama ke strukturnya di Firestore.

---

## 1. `akun` → Koleksi `akun` + Firebase Authentication

**Tabel SQL lama:** 16 kolom — `id_akun`, `nama_lengkap`, `email`, `kata_sandi_hash`, `google_id`, `tanggal_daftar`, `status_aktif`, `alasan_suspend`, `role`.

**Firestore:** Auth disimpan di Firebase Authentication (auto-handling password hash, Google ID, token). Data profil disimpan di koleksi dokumen `akun/{firebaseUid}`.

| Kolom SQL | Firestore / Auth | Catatan |
|---|---|---|
| `id_akun` (UUID) | `firebaseUid` (string) | Ganti primary key |
| `nama_lengkap` | `namaLengkap` | Langsung pindah |
| `email` | Firebase Auth | Di-manage Firebase |
| `kata_sandi_hash` | Firebase Auth | Di-hash & dikelola Firebase otomatis |
| `google_id` | `googleId` di Firestore + Firebase Auth provider | Hanya jika pakai Google |
| `tanggal_daftar` | `tanggalDaftar: Timestamp` | |
| `status_aktif` | `statusAktif: boolean` | |
| `alasan_suspend` | `alasanSuspend: string?` | |
| `role` | `role: string` | |

---

## 2. `pengguna` + `admin` → Koleksi `pengguna`

**Tabel SQL lama:** `pengguna` (xp_learner, xp_creator, total_xp, rank_peringkat) & `admin` (tingkat_akses, kode_pegawai).

**Firestore:** Gabungkan ke koleksi `pengguna/{firebaseUid}`. Admin tetap pakai `role = "admin"`.

| Kolom SQL | Firestore | Catatan |
|---|---|---|
| `id_akun` (di dua tabel) | `firebaseUid` | Primary key dokumen |
| `xp_learner` | `xpLearner` | |
| `xp_creator` | `xpCreator` | |
| `total_xp` | `totalXP` | Auto-calc trigger |
| `rank_peringkat` | `rankPeringkat` | Auto-calc trigger |
| (baru) | `currentSeasonXP` | Untuk reset season |
| (baru) | `tingkatAkses`, `kodePegawai` | Hanya terisi untuk admin |

---

## 3. `materi` → Koleksi `materi`

**Tabel SQL lama:** `judul_materi`, `konten_markdown`, `id_penulis` (FK→pengguna), `tanggal_ungghap`, `total_dilihat`, `rating_rata2`, `status_publik`, `alasan_moderate`, `moderated_by`, `file_urls`.

| Kolom SQL | Firestore | Catatan |
|---|---|---|
| `id_materi` (SERIAL) | Auto-ID Firestore | |
| `judul_materi` | `judulMateri` | |
| `konten_markdown` | `kontenMarkdown` | |
| `id_penulis` (FK→UUID) | `idPenulis: string` | firebaseUid |
| (baru) | `namaPenulis` | Denormalisasi agar tidak perlu lookup |
| `tanggal_ungghap` | `tanggalUnggah: Timestamp` | Typo di SQL tetap diperbaiki |
| `total_dilihat` | `totalDilihat: number` | |
| `rating_rata2` | `ratingRataRata: number` | Auto-calc |
| (baru) | `ratingCount: number` | Untuk calc rata-rata |
| `status_publik` | `status_publik: boolean` | |
| `alasan_moderate` | `alasan_moderate: string?` | |
| `moderated_by` | `moderated_by: string?` | |
| `file_urls` | `fileUrls: string[]` | |

---

## 4. `kuis` + `soal` + `kunci_jawaban` → Koleksi `kuis` + Sub-koleksi `soal`

**Tabel SQL lama:**
- `kuis`: `judul_kuis`, `id_materi_terkait`, `id_creator`, `aturan_markdown`, `batas_waktu_menit`, `poin_xp_default`, `tanggal_buat`, `status_publik`
- `soal`: `pertanyaan_markdown`, `opsi_a/b/c/d`, `urutan`
- `kunci_jawaban`: `jawaban_benar` (CHAR A/B/C/D)

**Firestore:**
- `kuis/{kuisId}` — dokumen kuis
- `kuis/{kuisId}/soal/{soalId}` — sub-koleksi soal (gabungkan jawaban benar ke soal)

| Kolom SQL | Firestore | Catatan |
|---|---|---|
| `judul_kuis` | `judulKuis` | |
| `id_materi_terkait` | `idMateriTerkait` | nullable |
| `id_creator` → pengguna | `idCreator: string` | firebaseUid |
| `aturan_markdown` | `aturanMarkdown` | |
| `batas_waktu_menit` | `batasWaktuMenit` | |
| `poin_xp_default` | `poinXPDefault` | |
| `tanggal_buat` | `tanggalBuat: Timestamp` | |
| `status_publik` | `status_publik: boolean` | |
| `jawaban_benar` (di kunci_jawaban) | `jawabanBenar` di `soal` | Digabung ke soal: A, B, C, atau D |

> Note: Di SQL, `soal` dan `kunci_jawaban` dipisah (1:1). Di Firestore, digabung jadi satu dokumen `soal` — efisien karena kuis butuh semua soal + kunci jawaban sekaligus.

---

## 5. `riwayat_belajar` → Koleksi `riwayat_belajar`

**Tabel SQL lama:** `id_pengguna` (FK→UUID), `id_konten` (INTEGER), `tipe_konten`, `tanggal_selesai`, `xp_didapat`, `skor` (nullable, hanya kuis).

| Kolom SQL | Firestore | Catatan |
|---|---|---|
| `id_pengguna` | `idPengguna: string` | firebaseUid |
| `id_konten` | `idKonten: string` | Sekarang string (bukan INTEGER) |
| `tipe_konten` | `tipeKonten: string` | |
| `tanggal_selesai` | `tanggalSelesai: Timestamp` | |
| `xp_didapat` | `xpDidapat: number` | |
| `skor` | `skor: number?` | Hanya kuis |
| UNIQUE constraint | Cloud Function validasi | Cek `idPengguna + idKonten + tipeKonten` sudah ada |

---

## 6. `rating` → Sub-koleksi `materi/{id}/rating`

**Tabel SQL lama:** `id_materi` (FK), `id_pengguna` (FK→UUID), `nilai_rating` (1-5), `tanggal`.

> **Key design choice:** gunakan `{firebaseUid}` sebagai document ID di sub-koleksi `rating`. Ini otomatis mencegah duplikat rating per user per materi (ganti `UNIQUE INDEX uq_rating_user_materi`).

---

## 7. `komentar` → Sub-koleksi `materi/{id}/komentar`

**Tabel SQL lama:** `id_materi` (FK), `id_pengguna` (FK→UUID), `teks_komentar` (max 1000), `tanggal`, `tanggal_edit`.

Validasi max 1000 karakter — cek di client + Firestore Security Rules.

---

## 8. `system_config` → Koleksi `system_config`

**Tabel SQL lama:** 2 baris — `config_type` ("xp_settings" | "rank_thresholds"), `config_value` (JSON), `updated_at`, `updated_by`.

**Firestore:** 2 dokumen — `system_config/xp_settings` & `system_config/rank_thresholds`.

| Kolom SQL | Firestore | Catatan |
|---|---|---|
| `config_type` | Document ID | |
| `config_value` (JSON) | Fields langsung di dokumen | Lebih mudah query |
| `updated_at` | `updatedAt: Timestamp` | |
| `updated_by` | `updatedBy: string` | firebaseUid admin |

---

## 9. `season` + `season_winners` → Koleksi `season`

**Tabel SQL lama:**
- `season`: `season_name`, `start_date`, `end_date?`, `status`
- `season_winners`: `id_season` (FK), `id_pengguna`, `nama_lengkap`, `total_xp`, `xp_learner`, `xp_creator`, `rank_peringkat`

**Firestore:**
- `season/{seasonId}` — dokumen season
- `season/{seasonId}/winners/{firebaseUid}` — sub-koleksi pemenang

---

## 10. Log koleksi → Koleksi Firestore

| Tabel SQL | Koleksi Firestore | Catatan |
|---|---|---|
| `moderation_log` | `moderation_log/{logId}` | `admin_id` → `adminId`, `content_id` → `contentId` |
| `audit_log` | `audit_log/{logId}` | `admin_id` → `adminId`, `target_user_id` → `targetUserId` |
| `config_change_log` | `config_change_log/{logId}` | `parameter_changed` → `parameterChanged` |

---

## 11. Trigger SQL → Cloud Functions

| PostgreSQL Trigger | Cloud Function Pengganti |
|---|---|
| `fn_update_rating_materi()` — auto-calc rating rata-rata | `onRatingWrite` trigger di `functions/index.js` |
| `fn_update_total_xp()` — auto-calc totalXP + rank | `onRiwayatWrite` trigger di `functions/index.js` |
| UNIQUE constraint `uq_riwayat_user_konten` | Validasi di client + Firestore rules + transactional write |
| UNIQUE constraint `uq_rating_user_materi` | Document ID = firebaseUid (auto-prevent duplicate) |

---

## 12. Migration Data Strategy

Untuk migrasi data existing dari PostgreSQL ke Firestore:

1. **Ekspor data** dari PostgreSQL → JSON/CSV
2. **Script migrasi** (Node.js) → baca CSV → tulis ke Firestore batch
3. **Mapping UUID → firebaseUid**: Buat akun user di Firebase Auth dulu, lalu gunakan `firebaseUid` sebagai key. Buat lookup tabel `old_id → new_firebase_uid`.
4. **Rekam trigger logic** → Deploy Cloud Functions setelah data ter-migrasi.
5. **Uji end-to-end**: Login, baca materi, ikut kuis, cek XP/rank terupdate otomatis.
