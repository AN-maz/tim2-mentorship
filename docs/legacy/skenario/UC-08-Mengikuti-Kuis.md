# Use Case Scenario: Mengikuti Kuis

### Use Case Name: Mengikuti Kuis

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-08 |
| **Importance Level** | High |
| **Primary Actor** | Users (Learner) |
| **Secondary Actor** | - |
| **Use Case Type** | Main Case |
| **Brief Description** | Pengguna mengikuti kuis dengan menjawab soal-soal dalam batas waktu yang ditentukan, kemudian mendapat skor dan XP Learner berdasarkan hasil jawaban |
| **Stakeholder and Interest** | - **Users**: Ingin menguji pemahaman dan mendapatkan XP untuk meningkatkan rank<br>- **Creator**: Ingin materinya dipahami dengan baik oleh learner<br>- **Sistem**: Mengevaluasi jawaban dan memberikan reward XP sesuai performa |
| **Trigger** | Pengguna memilih kuis dari daftar materi dan mengklik tombol "Mulai Kuis" |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna sudah login<br>- Kuis tersedia dan dapat diakses<br>- Sistem dapat menampilkan soal dan mencatat jawaban<br>- Timer dapat berjalan dengan akurat |
| **Successful End Condition** | - Semua jawaban tercatat<br>- Skor dikalkulasi dengan benar<br>- XP Learner bertambah sesuai skor<br>- Riwayat pengerjaan tersimpan di database<br>- Halaman hasil/skor ditampilkan |
| **Failed End Condition** | - Kuis gagal diselesaikan (waktu habis tanpa submit, error sistem)<br>- Jawaban tidak tersimpan<br>- Pesan error ditampilkan |

#### 🔗 Relationship
- **Association:** Users (sebagai primary actor)
- **Include:** -
- **Extend:** -
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Pengguna memilih kuis dari daftar materi atau dari halaman kuis
2. Sistem menampilkan informasi kuis (judul, jumlah soal, batas waktu, poin maksimal)
3. Pengguna mengklik tombol "Mulai Kuis"
4. Sistem menampilkan soal pertama dengan opsi jawaban
5. Sistem memulai timer countdown (misal: 30 menit)
6. Pengguna membaca soal dan memilih salah satu jawaban
7. Pengguna mengklik tombol "Soal Berikutnya"
8. Sistem menyimpan jawaban pengguna (temporary storage atau langsung ke DB)
9. Sistem menampilkan soal berikutnya
10. Loop langkah 6-9 sampai semua soal dijawab
11. Pengguna mengklik tombol "Kumpulkan Jawaban"
12. Sistem menerima semua data jawaban
13. Sistem mencocokkan jawaban dengan kunci jawaban yang tersimpan
14. Sistem menghitung jumlah jawaban benar
15. Sistem mengkalkulasi skor (misal: benar/total × 100)
16. Sistem mengkalkulasi XP Learner yang didapat (berdasarkan skor dan bobot kuis)
17. Sistem menyimpan riwayat dengan native query INSERT ke RiwayatBelajar (tipeKonten='kuis', xpDidapat, skor)
18. Sistem mengupdate xpLearner dan totalXP pengguna (UPDATE Pengguna)
19. Sistem menampilkan halaman hasil dengan: skor, jawaban benar/salah, XP yang didapat
20. Pengguna melihat hasil pengerjaan

**Alternate Flows:**
- **11A. Waktu habis sebelum submit:**
  - 11A.1. Timer mencapai 00:00
  - 11A.2. Sistem otomatis menghentikan kuis
  - 11A.3. Sistem mengumpulkan jawaban yang sudah dijawab
  - 11A.4. Soal yang belum dijawab dianggap salah
  - 11A.5. Lanjut ke langkah 12 (kalkulasi skor)

- **7A. Pengguna melewati soal:**
  - 7A.1. Pengguna tidak memilih jawaban dan langsung klik "Soal Berikutnya"
  - 7A.2. Sistem menyimpan jawaban sebagai "belum dijawab"
  - 7A.3. Lanjut ke soal berikutnya (langkah 9)

- **11B. Pengguna review jawaban sebelum submit:**
  - 11B.1. Pengguna mengklik tombol "Review Jawaban"
  - 11B.2. Sistem menampilkan ringkasan semua soal dengan status (sudah/belum dijawab)
  - 11B.3. Pengguna dapat klik nomor soal untuk kembali ke soal tersebut
  - 11B.4. Pengguna mengubah jawaban jika perlu
  - 11B.5. Pengguna klik "Kumpulkan Jawaban" (lanjut ke langkah 12)

- **3A. Pengguna membatalkan kuis:**
  - 3A.1. Pengguna mengklik tombol "Keluar" atau menutup halaman saat kuis berlangsung
  - 3A.2. Sistem menampilkan konfirmasi "Yakin keluar? Progress akan hilang"
  - 3A.3. Jika pengguna pilih "Ya", kuis dibatalkan dan tidak ada XP yang didapat
  - 3A.4. Use case berakhir

**Exceptional Flows:**
- **13E. Kunci jawaban tidak ditemukan:**
  - 13E.1. Sistem tidak menemukan kunci jawaban untuk kuis ini (data corruption)
  - 13E.2. Sistem menampilkan pesan error "Terjadi kesalahan pada kuis. Hubungi admin"
  - 13E.3. Jawaban pengguna tetap tersimpan untuk review manual admin
  - 13E.4. Tidak ada XP yang diberikan untuk sementara

- **17E. Database error saat menyimpan hasil:**
  - 17E.1. Sistem gagal menyimpan RiwayatBelajar atau update XP
  - 17E.2. Sistem menampilkan pesan error "Gagal menyimpan hasil. Coba lagi atau hubungi admin"
  - 17E.3. Sistem log semua data untuk recovery
  - 17E.4. Admin dapat manual input XP nanti

- **5E. Timer error:**
  - 5E.1. Timer tidak berjalan atau tidak akurat karena error JavaScript
  - 5E.2. Sistem fallback ke waktu server-side
  - 5E.3. Kuis tetap berjalan dengan validasi waktu di backend
  - 5E.4. Jika waktu sudah habis saat submit, sistem tolak submission

- **12E. Koneksi terputus saat submit:**
  - 12E.1. Request submit gagal karena koneksi internet terputus
  - 12E.2. Sistem menampilkan pesan "Koneksi terputus. Mencoba kirim ulang..."
  - 12E.3. Sistem retry beberapa kali
  - 12E.4. Jika tetap gagal, jawaban disimpan di local storage untuk submit nanti
