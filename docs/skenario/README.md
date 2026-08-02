# Use Case Scenarios - LMS Gamifikasi

Dokumentasi ini berisi skenario detail untuk setiap use case dalam sistem LMS Gamifikasi.

## Daftar Use Case Scenarios

### 🔐 Autentikasi
- **[UC-01: Login](./UC-01-Login.md)** - Autentikasi pengguna/admin dengan kredensial manual atau Google Auth
- **[UC-02: Register](./UC-02-Register.md)** - Pendaftaran akun baru pengguna dengan validasi email

### 📚 Fitur Learner (Pembelajaran)
- **[UC-03: Melihat Materi](./UC-03-Melihat-Materi.md)** - Melihat daftar dan detail materi pembelajaran
- **[UC-04: Mencari Materi](./UC-04-Mencari-Materi.md)** - Pencarian materi berdasarkan kata kunci (extend dari UC-03)
- **[UC-05: Memberi Rating](./UC-05-Memberi-Rating.md)** - Memberikan rating bintang pada materi (extend dari UC-03)
- **[UC-06: Memberi Komentar](./UC-06-Memberi-Komentar.md)** - Menulis komentar pada materi (extend dari UC-03)
- **[UC-07: Belajar Materi](./UC-07-Belajar-Materi.md)** - Menyelesaikan materi dan mendapat XP Learner
- **[UC-08: Mengikuti Kuis](./UC-08-Mengikuti-Kuis.md)** - Mengerjakan kuis dalam batas waktu dan mendapat XP Learner
- **[UC-09: Melihat Leaderboard](./UC-09-Melihat-Leaderboard.md)** - Melihat peringkat pengguna berdasarkan XP

### ✍️ Fitur Creator (Pembuat Konten)
- **[UC-10: Kelola Materi](./UC-10-Kelola-Materi.md)** - Upload, edit, hapus materi (mendapat XP Creator)
- **[UC-11: Kelola Kuis](./UC-11-Kelola-Kuis.md)** - Buat, edit, hapus kuis (mendapat XP Creator)

### 👨‍💼 Fitur Admin
- **[UC-12: Mengelola Users](./UC-12-Mengelola-Users.md)** - Kelola akun pengguna (edit role, suspend, hapus)
- **[UC-13: Moderasi Konten](./UC-13-Moderasi-Konten.md)** - Moderasi materi dan kuis (sembunyikan/hapus konten)
- **[UC-14: Manajemen XP & Ranked](./UC-14-Manajemen-XP-Ranked.md)** - Kelola sistem gamifikasi (ubah bobot XP, reset season)

## Struktur Use Case Scenario

Setiap use case scenario mengikuti template standar dengan struktur:

### 1. Identifikasi dan Inisiasi
- **ID**: Identifier unik use case
- **Importance Level**: High / Medium / Low
- **Primary Actor**: Aktor utama yang menginisiasi
- **Secondary Actor**: Sistem eksternal atau aktor pendukung
- **Use Case Type**: Main Case / Extension
- **Brief Description**: Penjelasan singkat use case
- **Stakeholder and Interest**: Kepentingan stakeholder
- **Trigger**: Kejadian pemicu
- **Trigger Type**: External / Internal / Time
- **Preconditions**: Kondisi sebelum use case berjalan
- **Successful End Condition**: Kondisi jika berhasil
- **Failed End Condition**: Kondisi jika gagal

### 2. Relationship
- **Association**: Aktor yang terhubung
- **Include**: Use case yang di-include
- **Extend**: Use case yang meng-extend
- **Generalization/Inheritance**: Pewarisan use case

### 3. Flow of Events
- **Normal Flow of Events**: Alur utama yang sukses
- **Alternate Flows**: Skenario alternatif (tetap berhasil)
- **Exceptional Flows**: Skenario error/gagal

## Mapping dengan Diagram

### Use Case Diagram → Scenarios
Semua use case dari `usd.plantuml` sudah ter-cover dalam 14 scenario files.

### Activity Diagram → Scenarios
Setiap activity diagram memiliki mapping ke use case scenario:
- `login.plantuml` → UC-01
- `register.plantuml` → UC-02
- `melihat-materi.plantuml` → UC-03, UC-04, UC-05, UC-06
- `belajar.plantuml` → UC-07
- `mengikutiKuiz.plantuml` → UC-08
- `melihatLeaderboard.plantuml` → UC-09
- `kelolaMateri.plantuml` → UC-10
- `kelolaKuiz.plantuml` → UC-11
- `mengelolaUsers.plantuml` → UC-12
- `mengelolaMateri.plantuml` → UC-13
- `manajemenRankXP.plantuml` → UC-14

## Catatan Penting

1. **Sistem Gamifikasi**: Dual XP system (Learner + Creator) dengan sistem ranking berkala
2. **Format Konten**: Semua materi dan kuis menggunakan format Markdown
3. **Tech Stack**: PostgreSQL dengan native query (no ORM), AWS S3 untuk file storage
4. **Autentikasi**: JWT + Google Auth integration
5. **Moderasi**: Admin dapat hide/delete konten dengan notifikasi otomatis ke creator
6. **Season System**: Admin dapat reset peringkat secara berkala dengan arsip pemenang

## Statistik

- **Total Use Cases**: 14
- **Autentikasi**: 2 use cases
- **Learner Features**: 7 use cases
- **Creator Features**: 2 use cases
- **Admin Features**: 3 use cases
- **Total Lines**: ~67KB dokumentasi

---

**Dibuat**: 2026-08-02  
**Format**: Markdown dengan template standar System Analyst  
**Status**: Complete ✅
