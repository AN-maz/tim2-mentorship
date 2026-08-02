# Use Case Scenario: Belajar Materi

### Use Case Name: Belajar Materi

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-07 |
| **Importance Level** | High |
| **Primary Actor** | Users (Learner) |
| **Secondary Actor** | - |
| **Use Case Type** | Main Case |
| **Brief Description** | Pengguna membaca dan mempelajari konten materi secara lengkap, kemudian menandai materi sebagai selesai untuk mendapatkan XP Learner |
| **Stakeholder and Interest** | - **Users**: Ingin belajar materi dan mendapatkan XP untuk meningkatkan rank<br>- **Sistem**: Mencatat progress belajar pengguna dan memberikan reward XP |
| **Trigger** | Pengguna mengakses mode belajar pada materi dan mengklik tombol "Tandai Selesai" |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna sudah login<br>- Pengguna berada di halaman detail materi<br>- Materi belum pernah diselesaikan oleh pengguna ini (atau sistem allow repeat)<br>- Sistem dapat menyimpan riwayat belajar |
| **Successful End Condition** | - Riwayat belajar tercatat di database<br>- XP Learner pengguna bertambah<br>- Total XP pengguna terupdate<br>- Notifikasi XP diterima ditampilkan<br>- Rank pengguna dapat berubah jika XP mencapai threshold |
| **Failed End Condition** | - Penandaan selesai gagal<br>- XP tidak bertambah<br>- Pesan error ditampilkan |

#### 🔗 Relationship
- **Association:** Users (sebagai primary actor)
- **Include:** -
- **Extend:** -
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Pengguna mengakses halaman detail materi dan masuk ke mode belajar
2. Pengguna membaca dan mempelajari konten materi secara lengkap
3. Pengguna scroll sampai akhir materi
4. Pengguna mengklik tombol "Tandai Selesai"
5. Sistem menerima konfirmasi penyelesaian dari pengguna
6. Sistem memeriksa apakah pengguna sudah pernah menyelesaikan materi ini
7. Sistem menghitung XP yang akan diberikan (misal: 10 XP base untuk materi)
8. Sistem mengeksekusi native query INSERT ke tabel RiwayatBelajar (idPengguna, idKonten, tipeKonten='materi', xpDidapat, tanggalSelesai)
9. Sistem mengeksekusi native query UPDATE untuk menambah xpLearner dan totalXP pengguna
10. Sistem memeriksa apakah pengguna naik rank berdasarkan totalXP baru
11. Sistem menampilkan notifikasi "Selamat! Anda mendapat +10 XP Learner"
12. Jika naik rank, sistem menampilkan notifikasi tambahan "Rank naik! Anda sekarang [Nama Rank]"
13. Tombol "Tandai Selesai" berubah menjadi "Sudah Diselesaikan" (disabled)
14. Pengguna selesai belajar materi

**Alternate Flows:**
- **6A. Pengguna sudah pernah menyelesaikan materi ini:**
  - 6A.1. Sistem menemukan record di RiwayatBelajar untuk idPengguna dan idMateri ini
  - 6A.2. Sistem menampilkan pesan "Anda sudah menyelesaikan materi ini sebelumnya"
  - 6A.3. Sistem tidak menambah XP lagi
  - 6A.4. Tombol tetap menampilkan "Sudah Diselesaikan"
  - 6A.5. Use case berakhir

- **4A. Pengguna membatalkan penandaan:**
  - 4A.1. Pengguna melihat tombol "Tandai Selesai" tetapi tidak mengkliknya
  - 4A.2. Pengguna menutup halaman atau pindah ke materi lain
  - 4A.3. Tidak ada perubahan pada XP atau riwayat belajar
  - 4A.4. Use case berakhir

- **10A. XP mencapai threshold rank baru:**
  - 10A.1. totalXP pengguna mencapai atau melewati batas rank berikutnya
  - 10A.2. Sistem mengupdate field rankPeringkat pengguna (UPDATE Pengguna SET rankPeringkat = 'Bronze')
  - 10A.3. Sistem menampilkan animasi/modal naik rank
  - 10A.4. Lanjut ke langkah 12

**Exceptional Flows:**
- **8E. Database error saat menyimpan riwayat:**
  - 8E.1. Sistem gagal mengeksekusi INSERT ke RiwayatBelajar
  - 8E.2. Sistem menampilkan pesan error "Gagal menyimpan progress. Coba lagi"
  - 8E.3. XP tidak bertambah, pengguna dapat mencoba lagi

- **9E. Database error saat update XP:**
  - 9E.1. Riwayat tersimpan tetapi UPDATE XP gagal
  - 9E.2. Sistem log error untuk admin
  - 9E.3. Background job akan sinkronisasi XP nanti berdasarkan RiwayatBelajar
  - 9E.4. Sistem menampilkan pesan "Progress tersimpan, XP akan diupdate segera"

- **7E. Kalkulasi XP error:**
  - 7E.1. Sistem gagal menghitung XP yang seharusnya diberikan
  - 7E.2. Sistem menggunakan nilai default (10 XP)
  - 7E.3. Sistem log warning untuk admin review
  - 7E.4. Proses dilanjutkan dengan XP default
