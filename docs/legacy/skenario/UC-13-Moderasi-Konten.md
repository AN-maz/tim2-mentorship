# Use Case Scenario: Moderasi Materi dan Kuis (Admin)

### Use Case Name: Moderasi Materi dan Kuis (Admin)

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-13 |
| **Importance Level** | High |
| **Primary Actor** | Admin |
| **Secondary Actor** | AWS S3 (untuk hapus file), Creator (penerima notifikasi) |
| **Use Case Type** | Main Case |
| **Brief Description** | Admin melakukan moderasi terhadap materi dan kuis yang dibuat pengguna, dapat menyembunyikan konten yang melanggar atau menghapus secara permanen |
| **Stakeholder and Interest** | - **Admin**: Ingin menjaga kualitas dan keamanan konten platform<br>- **Creator**: Ingin mendapat notifikasi jika kontennya dimoderasi<br>- **Learner**: Ingin konten yang tersedia berkualitas dan aman<br>- **Sistem**: Memastikan konten yang ditampilkan sesuai standar |
| **Trigger** | Admin mengakses menu "Kelola Materi/Kuis" dan memilih konten untuk dimoderasi |
| **Trigger Type** | External |
| **Preconditions** | - Admin sudah login dengan akses moderasi<br>- Ada konten (materi/kuis) yang perlu dimoderasi<br>- Sistem dapat mengakses database dan AWS S3 |
| **Successful End Condition** | - Konten berhasil disembunyikan atau dihapus dari database<br>- File terkait dihapus dari AWS S3 (jika hapus permanen)<br>- Notifikasi otomatis terkirim ke creator<br>- Log moderasi tercatat<br>- Konten tidak muncul di pencarian publik |
| **Failed End Condition** | - Operasi moderasi gagal<br>- Konten masih publik/tidak berubah<br>- Pesan error ditampilkan |

#### 🔗 Relationship
- **Association:** Admin (primary actor), AWS S3, Creator (secondary actor)
- **Include:** -
- **Extend:** -
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Admin mengakses menu "Kelola Materi / Kuis" di dashboard admin
2. Sistem mengeksekusi native query untuk mengambil semua konten (SELECT * FROM Materi UNION SELECT * FROM Kuis ORDER BY tanggalUnggah DESC)
3. Sistem menampilkan daftar konten dengan informasi: judul, creator, tanggal, status, jumlah view/pengerjaan
4. Sistem menyediakan filter (by status, by creator, by tanggal) dan pencarian (by judul/konten)
5. Admin mencari dan memilih konten yang perlu dimoderasi
6. Sistem menampilkan preview konten lengkap dengan detail creator
7. Admin melihat konten dan menentukan tindakan moderasi
8. Admin memilih aksi "Sembunyikan"
9. Sistem menampilkan dialog konfirmasi dengan field "Alasan Moderasi"
10. Admin mengisi alasan moderasi (misal: "Konten mengandung spam", "Melanggar pedoman komunitas")
11. Admin mengklik "Ya, Sembunyikan"
12. Sistem menerima perintah moderasi
13. Sistem mengeksekusi native query UPDATE (UPDATE Materi/Kuis SET status_publik = false, alasan_moderate = '[reason]', moderated_by = '[admin_id]' WHERE id = '[id]')
14. Sistem mencatat aksi ke tabel ModerationLog (admin_id, content_id, content_type, action='hide', reason, timestamp)
15. Sistem mengirim notifikasi otomatis ke creator konten (email atau in-app notification)
16. Sistem menampilkan pemberitahuan sukses "Konten berhasil disembunyikan"
17. Admin kembali ke halaman moderasi dengan daftar konten yang diupdate
18. Konten tidak lagi muncul di pencarian publik

**Alternate Flows:**
- **8A. Hapus Permanen:**
  - 8A.1. Admin memilih aksi "Hapus Paksa"
  - 8A.2. Sistem menampilkan peringatan "PERHATIAN: Hapus konten bersifat permanen. Semua data (riwayat belajar, komentar, rating) terkait konten ini akan terhapus. Yakin lanjutkan?"
  - 8A.3. Admin mengisi alasan dan mengetik "HAPUS" untuk konfirmasi
  - 8A.4. Admin klik "Ya, Hapus Permanen"
  - 8A.5. Sistem mengeksekusi DELETE dari tabel Materi/Kuis (cascade delete)
  - 8A.6. Sistem menghapus semua file aset terkait dari AWS S3
  - 8A.7. Sistem menghapus atau soft-delete riwayat belajar terkait
  - 8A.8. Sistem mencatat ke ModerationLog dengan action='delete'
  - 8A.9. Sistem mengirim notifikasi ke creator
  - 8A.10. Sistem mengurangi XP creator (opsional, tergantung policy)
  - 8A.11. Notifikasi "Konten berhasil dihapus"

- **8B. Approve/Pulihkan konten:**
  - 8B.1. Admin melihat konten yang sebelumnya disembunyikan
  - 8B.2. Admin memilih aksi "Pulihkan / Approve"
  - 8B.3. Sistem menampilkan konfirmasi
  - 8B.4. Admin klik "Ya, Pulihkan"
  - 8B.5. Sistem mengeksekusi UPDATE SET status_publik = true, alasan_moderate = NULL
  - 8B.6. Sistem mencatat ke ModerationLog dengan action='approve'
  - 8B.7. Sistem notifikasi ke creator "Konten Anda telah disetujui"
  - 8B.8. Konten kembali muncul di pencarian publik

- **4A. Filter konten yang dilaporkan:**
  - 4A.1. Admin menggunakan filter "Konten Dilaporkan"
  - 4A.2. Sistem menampilkan konten yang mendapat laporan dari pengguna (jika ada fitur report)
  - 4A.3. Admin prioritas moderasi konten dengan banyak laporan

- **6A. Melihat history moderasi:**
  - 6A.1. Admin melihat konten yang sudah pernah dimoderasi sebelumnya
  - 6A.2. Sistem menampilkan history: siapa yang moderate, kapan, alasan apa
  - 6A.3. Admin dapat melakukan aksi lanjutan berdasarkan history

**Exceptional Flows:**
- **13E. Database UPDATE gagal:**
  - 13E.1. Query UPDATE gagal dieksekusi
  - 13E.2. Sistem menampilkan pesan error "Gagal memoderasi konten. Coba lagi"
  - 13E.3. Status konten tidak berubah

- **8A.6E. Gagal hapus file dari S3:**
  - 8A.6E.1. Konten terhapus dari database tetapi file masih ada di S3
  - 8A.6E.2. Sistem log error untuk cleanup manual
  - 8A.6E.3. Background job akan retry hapus file
  - 8A.6E.4. Admin tetap menerima notifikasi sukses (partial success)

- **15E. Gagal kirim notifikasi:**
  - 15E.1. Sistem gagal mengirim notifikasi ke creator (email service down)
  - 15E.2. Sistem log failed notification untuk retry
  - 15E.3. Moderasi tetap berhasil dilakukan
  - 15E.4. Notifikasi akan dikirim ulang oleh background job

- **2E. Database query error:**
  - 2E.1. Sistem gagal mengambil daftar konten
  - 2E.2. Sistem menampilkan pesan "Gagal memuat data konten. Coba lagi nanti"
  - 2E.3. Halaman moderasi kosong atau error

- **10E. Alasan moderasi kosong:**
  - 10E.1. Admin tidak mengisi alasan moderasi
  - 10E.2. Sistem menampilkan warning "Alasan moderasi harus diisi"
  - 10E.3. Admin harus mengisi alasan sebelum bisa lanjut

- **8A.5E. Konten sedang digunakan:**
  - 8A.5E.1. Ada pengguna yang sedang mengerjakan kuis ini saat admin hapus
  - 8A.5E.2. Sistem menampilkan peringatan "X pengguna sedang mengerjakan. Yakin hapus?"
  - 8A.5E.3. Jika lanjut hapus, sistem handle gracefully (simpan progress pengguna, tampilkan pesan ke pengguna)
