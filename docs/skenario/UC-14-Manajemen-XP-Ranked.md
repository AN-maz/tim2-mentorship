# Use Case Scenario: Manajemen XP dan Ranked (Admin)

### Use Case Name: Manajemen XP dan Ranked (Admin)

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-14 |
| **Importance Level** | High |
| **Primary Actor** | Admin |
| **Secondary Actor** | - |
| **Use Case Type** | Main Case |
| **Brief Description** | Admin mengelola sistem gamifikasi dengan mengubah parameter bobot XP, mengatur threshold rank, dan melakukan reset peringkat musiman (season) |
| **Stakeholder and Interest** | - **Admin**: Ingin mengatur balance sistem reward dan kompetisi<br>- **Users**: Mengharapkan sistem XP yang fair dan kompetitif<br>- **Sistem**: Memastikan kalkulasi XP dan rank konsisten |
| **Trigger** | Admin mengakses menu "Manajemen XP & Ranked" dan memilih aksi konfigurasi atau reset |
| **Trigger Type** | External |
| **Preconditions** | - Admin sudah login dengan akses penuh<br>- Sistem dapat mengakses dan memodifikasi database<br>- Untuk reset season: sudah melewati periode season yang ditentukan |
| **Successful End Condition** | - Konfigurasi parameter XP tersimpan dan berlaku untuk aktivitas berikutnya<br>- Reset season berhasil dilakukan dengan data pemenang terarsip<br>- Semua pengguna mendapat XP fresh start<br>- Notifikasi sistem terkirim ke semua pengguna<br>- Log perubahan tercatat |
| **Failed End Condition** | - Operasi gagal<br>- Konfigurasi atau data tidak berubah<br>- Pesan error ditampilkan |

#### 🔗 Relationship
- **Association:** Admin (primary actor)
- **Include:** -
- **Extend:** -
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events (Ubah Bobot XP):**
1. Admin mengakses menu "Manajemen XP & Ranked"
2. Sistem menampilkan dashboard dengan konfigurasi XP saat ini dan statistik leaderboard
3. Sistem menampilkan form konfigurasi dengan parameter:
   - XP per baca materi
   - XP per selesai kuis (base + bonus berdasarkan skor)
   - XP per upload materi
   - XP per buat kuis
   - Multiplier untuk aktivitas tertentu
4. Admin memilih aksi "Ubah Bobot XP"
5. Admin menyesuaikan nilai parameter (misal: XP baca materi dari 10 menjadi 15)
6. Admin mengklik "Preview Impact" untuk melihat simulasi dampak perubahan
7. Sistem menampilkan estimasi dampak terhadap leaderboard
8. Admin puas dengan preview, mengklik "Simpan Konfigurasi"
9. Sistem menerima konfigurasi baru
10. Sistem menyimpan parameter ke tabel SystemConfig dengan timestamp
11. Sistem mencatat perubahan ke tabel ConfigChangeLog (admin_id, parameter_changed, old_value, new_value, timestamp)
12. Sistem menampilkan notifikasi "Konfigurasi XP berhasil diperbarui. Berlaku untuk aktivitas berikutnya"
13. Admin melihat konfirmasi perubahan

**Alternate Flows:**
- **4A. Reset Peringkat Season:**
  - 4A.1. Admin memilih aksi "Reset Peringkat (Season Baru)"
  - 4A.2. Sistem menampilkan informasi season saat ini (start date, top winners)
  - 4A.3. Sistem menampilkan peringatan "PERHATIAN: Reset season akan mengarsipkan pemenang dan reset semua XP ke 0. Yakin lanjutkan?"
  - 4A.4. Admin mengisi nama season baru (misal: "Season 2 - August 2026")
  - 4A.5. Admin mengklik konfirmasi "Ya, Mulai Season Baru"
  - 4A.6. Sistem mulai transaction untuk memastikan data consistency
  - 4A.7. Sistem mengeksekusi native query untuk arsipkan pemenang (INSERT INTO SeasonWinners SELECT idPengguna, namaLengkap, totalXP, xpLearner, xpCreator, rankPeringkat, season_name, end_date FROM Pengguna WHERE totalXP > 0)
  - 4A.8. Sistem mengeksekusi native query untuk reset XP semua pengguna (UPDATE Pengguna SET totalXP = 0, xpLearner = 0, xpCreator = 0, rankPeringkat = 'Unranked')
  - 4A.9. Sistem menyimpan metadata season baru ke tabel Season (season_name, start_date, status='active')
  - 4A.10. Sistem commit transaction
  - 4A.11. Sistem mengirim notifikasi broadcast ke semua pengguna "Season baru dimulai! XP telah direset. Mulai kompetisi!"
  - 4A.12. Sistem menampilkan notifikasi "Season berhasil direset. Semua pengguna mulai dari 0 XP"

- **4B. Rekalkulasi XP Manual:**
  - 4B.1. Admin memilih aksi "Rekalkulasi XP Semua Pengguna"
  - 4B.2. Sistem menampilkan warning "Proses ini akan menghitung ulang XP berdasarkan RiwayatBelajar. Dapat memakan waktu lama"
  - 4B.3. Admin klik "Mulai Rekalkulasi"
  - 4B.4. Sistem menjalankan background job untuk iterate semua pengguna
  - 4B.5. Untuk setiap pengguna, sistem hitung ulang: SUM(xpDidapat WHERE tipeKonten='materi') as xpLearner, SUM(xpDidapat WHERE tipeKonten IN ('materi_created','kuis_created')) as xpCreator
  - 4B.6. Sistem UPDATE Pengguna dengan hasil kalkulasi
  - 4B.7. Sistem menampilkan progress bar
  - 4B.8. Setelah selesai, notifikasi "Rekalkulasi selesai. X pengguna diupdate"

- **4C. Atur threshold rank:**
  - 4C.1. Admin memilih aksi "Kelola Rank Tiers"
  - 4C.2. Sistem menampilkan daftar rank tier saat ini (Unranked, Bronze, Silver, Gold, Platinum, Diamond dengan threshold XP masing-masing)
  - 4C.3. Admin mengubah threshold (misal: Bronze dari 100 XP menjadi 150 XP)
  - 4C.4. Admin klik "Simpan Threshold"
  - 4C.5. Sistem menyimpan konfigurasi baru
  - 4C.6. Sistem trigger rekalkulasi rank untuk semua pengguna berdasarkan threshold baru
  - 4C.7. Notifikasi "Rank threshold berhasil diupdate"

- **6A. Membatalkan preview:**
  - 6A.1. Admin melihat preview dan tidak puas dengan dampaknya
  - 6A.2. Admin klik "Batal"
  - 6A.3. Admin kembali ke form untuk menyesuaikan parameter lagi (kembali ke langkah 5)

**Exceptional Flows:**
- **10E. Database error saat simpan config:**
  - 10E.1. Sistem gagal menyimpan konfigurasi ke SystemConfig
  - 10E.2. Sistem menampilkan pesan error "Gagal menyimpan konfigurasi. Coba lagi"
  - 10E.3. Konfigurasi lama tetap berlaku

- **4A.10E. Transaction rollback saat reset season:**
  - 4A.10E.1. Salah satu query gagal dieksekusi (misal: arsip gagal atau update gagal)
  - 4A.10E.2. Sistem rollback semua perubahan
  - 4A.10E.3. Sistem menampilkan pesan error "Gagal reset season. Data tetap aman, tidak ada perubahan"
  - 4A.10E.4. Admin dapat mencoba lagi setelah cek log error

- **4A.11E. Gagal kirim notifikasi broadcast:**
  - 4A.11E.1. Reset berhasil tetapi notifikasi gagal terkirim
  - 4A.11E.2. Sistem log failed notification
  - 4A.11E.3. Admin dapat manual kirim announcement atau retry broadcast

- **4B.5E. Rekalkulasi menemukan inkonsistensi data:**
  - 4B.5E.1. Sistem menemukan pengguna dengan XP tidak sesuai dengan riwayat
  - 4B.5E.2. Sistem log semua inkonsistensi ke report
  - 4B.5E.3. Sistem tetap update dengan nilai yang benar berdasarkan riwayat
  - 4B.5E.4. Admin mendapat laporan inkonsistensi untuk investigasi

- **5E. Parameter XP tidak valid:**
  - 5E.1. Admin input nilai XP negatif atau terlalu besar (> 1000)
  - 5E.2. Sistem menampilkan validasi error "Nilai XP harus antara 0-1000"
  - 5E.3. Admin harus perbaiki input sebelum bisa simpan

- **4A.8E. Beberapa pengguna sedang online saat reset:**
  - 4A.8E.1. Ada pengguna yang sedang mengerjakan kuis atau membaca materi saat reset
  - 4A.8E.2. Sistem simpan progress mereka sebelum reset
  - 4A.8E.3. XP dari aktivitas ongoing akan dikreditkan ke season baru
  - 4A.8E.4. Sistem handle gracefully tanpa data loss
