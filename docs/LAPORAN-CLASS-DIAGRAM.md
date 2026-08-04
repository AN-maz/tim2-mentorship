# Laporan Pembaharuan Class Diagram
**Tanggal:** 2026-08-04  
**File:** `/home/purwa/tim2-mentorship/docs/classDiagram.plantuml`

---

## 📊 Ringkasan Perubahan

| Kategori | Sebelum | Sesudah | Penambahan |
|---|---|---|---|
| **Total Class** | 6 | 16 | +10 class |
| **Total Atribut** | ~35 | ~110 | +75 atribut |
| **Total Relasi** | 5 | 20 | +15 relasi |
| **Dokumentasi** | Minimal | Lengkap dengan notes | ✓ |

---

## ✅ Class yang Sudah Ada (Diperbaharui)

### 1. **Akun** (Superclass)
**Penambahan atribut:**
- `googleId: String [0..1]` - Untuk Google Auth (UC-01, UC-02)
- `alasanSuspend: String [0..1]` - Untuk tracking suspended users (UC-12)
- `role: String [1]` - Untuk membedakan User vs Admin

**Perbaikan:**
- `kataSandiHash` diubah jadi optional karena Google Auth tidak pakai password

### 2. **Pengguna**
**Penambahan atribut:**
- `rankPeringkat: String [1] = 'Unranked'` - Default value ditambahkan

**Penambahan method:**
- `beriRating()` - Untuk UC-05
- `beriKomentar()` - Untuk UC-06

### 3. **Admin**
**Penambahan method:**
- `moderasiKonten()` - Untuk UC-13
- `resetSeason()` - Untuk UC-14
- `updateXPConfig()` - Untuk UC-14

### 4. **Materi**
**Penambahan atribut (dari UC-13):**
- `tanggalEdit: Date [0..1]` - Track kapan diedit
- `status_publik: Boolean [1] = true` - Untuk moderasi
- `alasan_moderate: String [0..1]` - Alasan moderasi
- `moderated_by: UUID [0..1]` - Admin yang moderate
- `moderated_at: Date [0..1]` - Timestamp moderasi
- `fileUrls: Text [0..1]` - URL file S3 (UC-10)

**Penambahan method:**
- `incrementView()` - Untuk tracking views (UC-03)

**Perbaikan tipe data:**
- `kontenMarkdown: String [1]` → `Text [1]` (lebih sesuai untuk konten panjang)

### 5. **Kuis**
**Penambahan atribut:**
- `idCreator: UUID [1]` - Creator kuis (UC-11)
- `tanggalBuat: Date [1]` - Timestamp pembuatan
- `status_publik: Boolean [1] = true` - Untuk moderasi
- `alasan_moderate: String [0..1]` - Alasan moderasi
- `moderated_by: UUID [0..1]` - Admin yang moderate

**Perbaikan tipe data:**
- `aturanMarkdown: String [1]` → `Text [1]`

### 6. **RiwayatBelajar**
**Penambahan atribut:**
- `skor: Integer [0..1]` - Untuk menyimpan skor kuis (UC-08)

---

## ➕ Class Baru yang Ditambahkan

### **Kategori: Komponen Kuis**

#### 7. **Soal** (UC-08, UC-11)
```
- idSoal: Integer [1] <<PK>>
- idKuis: Integer [1] <<FK>>
- pertanyaanMarkdown: Text [1]
- opsiA, opsiB, opsiC, opsiD: String [1]
- urutan: Integer [1]
```
**Relasi:** Kuis 1 *-- 1..* Soal (Composition)

**Alasan:** Setiap kuis terdiri dari multiple soal. Discovered dari UC-11 (Kelola Kuis) dan UC-08 (Mengikuti Kuis).

#### 8. **KunciJawaban** (UC-08, UC-11)
```
- idKunciJawaban: Integer [1] <<PK>>
- idSoal: Integer [1] <<FK>>
- jawabanBenar: Char [1]
```
**Relasi:** Soal 1 -- 1 KunciJawaban

**Alasan:** Setiap soal harus punya kunci jawaban untuk evaluasi otomatis kuis.

---

### **Kategori: Interaksi User**

#### 9. **Rating** (UC-05)
```
- idRating: Integer [1] <<PK>>
- idMateri: Integer [1] <<FK>>
- idPengguna: UUID [1] <<FK>>
- nilaiRating: Integer [1] (1-5)
- tanggal: Date [1]
```
**Relasi:** 
- Pengguna 1 -- 0..* Rating
- Materi 1 -- 0..* Rating

**Alasan:** User dapat memberi rating 1-5 bintang pada materi. Rating rata-rata disimpan di tabel Materi.

#### 10. **Komentar** (UC-06)
```
- idKomentar: Integer [1] <<PK>>
- idMateri: Integer [1] <<FK>>
- idPengguna: UUID [1] <<FK>>
- teksKomentar: Text [1]
- tanggal: Date [1]
- tanggalEdit: Date [0..1]
```
**Relasi:**
- Pengguna 1 -- 0..* Komentar
- Materi 1 -- 0..* Komentar

**Alasan:** User dapat menulis, edit, dan hapus komentar pada materi.

---

### **Kategori: Gamifikasi & Season System**

#### 11. **SystemConfig** (UC-14)
```
- idConfig: Integer [1] <<PK>>
- config_type: String [1]
- config_value: JSON [1]
- updated_at: Date [1]
- updated_by: UUID [1] <<FK>>
```
**Relasi:** Admin 1 -- 0..* SystemConfig

**Alasan:** Menyimpan konfigurasi XP (berapa XP per aktivitas) dan threshold rank (Bronze: 100 XP, Silver: 500 XP, dll). Admin dapat mengubah config ini.

#### 12. **Season** (UC-14)
```
- idSeason: Integer [1] <<PK>>
- season_name: String [1]
- start_date: Date [1]
- end_date: Date [0..1]
- status: String [1] ('active' atau 'ended')
```
**Alasan:** Sistem season untuk kompetisi berkala. Saat reset season, semua XP user direset ke 0 dan pemenang diarsipkan.

#### 13. **SeasonWinners** (UC-14)
```
- idWinner: Integer [1] <<PK>>
- idSeason: Integer [1] <<FK>>
- idPengguna: UUID [1] <<FK>>
- namaLengkap, totalXP, xpLearner, xpCreator, rankPeringkat
- end_date: Date [1]
```
**Relasi:**
- Season 1 -- 0..* SeasonWinners
- Pengguna 1 -- 0..* SeasonWinners

**Alasan:** Mengarsipkan top winners setiap season untuk history leaderboard.

---

### **Kategori: Audit & Logging**

#### 14. **ModerationLog** (UC-13)
```
- idLog: Integer [1] <<PK>>
- admin_id: UUID [1] <<FK>>
- content_id: Integer [1]
- content_type: String [1] ('materi' atau 'kuis')
- action: String [1] ('hide', 'delete', 'approve')
- reason: Text [0..1]
- timestamp: Date [1]
```
**Relasi:** Admin 1 -- 0..* ModerationLog

**Alasan:** Tracking semua aksi moderasi konten oleh admin. Untuk audit trail dan transparency.

#### 15. **AuditLog** (UC-12)
```
- idLog: Integer [1] <<PK>>
- admin_id: UUID [1] <<FK>>
- action: String [1]
- target_user_id: UUID [0..1] <<FK>>
- details: Text [0..1]
- timestamp: Date [1]
```
**Relasi:** Admin 1 -- 0..* AuditLog

**Alasan:** Tracking aksi admin pada user management (edit role, suspend, unsuspend, delete user). Untuk accountability.

#### 16. **ConfigChangeLog** (UC-14)
```
- idLog: Integer [1] <<PK>>
- admin_id: UUID [1] <<FK>>
- parameter_changed: String [1]
- old_value: String [1]
- new_value: String [1]
- timestamp: Date [1]
```
**Relasi:** Admin 1 -- 0..* ConfigChangeLog

**Alasan:** Tracking perubahan konfigurasi XP dan rank threshold oleh admin. Untuk audit perubahan sistem gamifikasi.

---

## 🔗 Relasi Baru yang Ditambahkan

1. **Kuis 1 *-- 1..* Soal** (Composition)
   - Kuis terdiri dari soal-soal. Jika kuis dihapus, semua soal ikut terhapus (cascade delete).

2. **Soal 1 -- 1 KunciJawaban**
   - Setiap soal harus punya tepat 1 kunci jawaban.

3. **Pengguna 1 -- 0..* Rating**
4. **Materi 1 -- 0..* Rating**
   - User dapat memberi rating pada banyak materi.

5. **Pengguna 1 -- 0..* Komentar**
6. **Materi 1 -- 0..* Komentar**
   - User dapat komentar pada banyak materi.

7. **Admin 1 -- 0..* ModerationLog**
8. **Admin 1 -- 0..* AuditLog**
9. **Admin 1 -- 0..* ConfigChangeLog**
   - Tracking semua aksi admin.

10. **Admin 1 -- 0..* SystemConfig**
    - Admin mengelola konfigurasi sistem.

11. **Season 1 -- 0..* SeasonWinners**
12. **Pengguna 1 -- 0..* SeasonWinners**
    - Arsip pemenang per season.

13. **Admin 0..1 -- 0..* Materi** (Moderasi)
14. **Admin 0..1 -- 0..* Kuis** (Moderasi)
    - Admin dapat memoderasi konten (0..1 karena tidak semua konten dimoderasi).

---

## 📝 Dokumentasi Tambahan

Ditambahkan **4 notes** untuk menjelaskan:

1. **Note di Akun**: Penjelasan superclass, login manual vs Google Auth
2. **Note di RiwayatBelajar**: Penjelasan tipeKonten dan skor
3. **Note di SystemConfig**: Format JSON untuk config XP dan rank
4. **Note di Season**: Penjelasan sistem season dan reset periodic

---

## 🎯 Kesimpulan

### **Kelebihan Diagram Baru:**
✅ **Kelengkapan**: Mencakup semua entitas dari 14 use case  
✅ **Konsistensi**: Sesuai dengan sequence diagram dan database schema  
✅ **Traceability**: Setiap class bisa dilacak ke use case asalnya  
✅ **Dokumentasi**: Notes menjelaskan business logic penting  
✅ **Audit Trail**: Lengkap dengan logging untuk compliance  
✅ **Scalability**: Struktur mendukung fitur future (season system, moderation)  

### **Coverage Use Case:**
- ✅ UC-01, UC-02: Login/Register (Akun + googleId)
- ✅ UC-03, UC-04: Melihat/Mencari Materi (Materi + totalDilihat)
- ✅ UC-05: Rating (class Rating baru)
- ✅ UC-06: Komentar (class Komentar baru)
- ✅ UC-07: Belajar Materi (RiwayatBelajar + xpDidapat)
- ✅ UC-08: Mengikuti Kuis (Soal + KunciJawaban + skor)
- ✅ UC-09: Leaderboard (Pengguna.totalXP + rankPeringkat)
- ✅ UC-10: Kelola Materi (Materi + fileUrls S3)
- ✅ UC-11: Kelola Kuis (Kuis + Soal + KunciJawaban)
- ✅ UC-12: Kelola Users (AuditLog)
- ✅ UC-13: Moderasi Konten (ModerationLog + status_publik)
- ✅ UC-14: Manajemen XP (SystemConfig + Season + ConfigChangeLog)

### **Tech Stack Compliance:**
✅ PostgreSQL: Semua FK dan relasi siap untuk native query  
✅ AWS S3: fileUrls di Materi untuk aset statis  
✅ Google Auth: googleId di Akun  
✅ JWT: Role-based access (Akun.role)  

---

## 📊 Statistik Akhir

```
Total Entities: 16 classes
├── Core: 3 (Akun, Pengguna, Admin)
├── Content: 5 (Materi, Kuis, Soal, KunciJawaban, RiwayatBelajar)
├── Interaction: 2 (Rating, Komentar)
├── Gamification: 3 (SystemConfig, Season, SeasonWinners)
└── Audit: 3 (ModerationLog, AuditLog, ConfigChangeLog)

Total Relationships: 20 associations
Total Attributes: ~110 attributes
Coverage: 14/14 use cases (100%)
```

---

**Status:** ✅ **Class Diagram Lengkap dan Siap Implementasi**

Diagram sekarang sudah mencakup seluruh requirement dari dokumentasi project, use case scenarios, dan sequence diagrams yang telah dibuat.
