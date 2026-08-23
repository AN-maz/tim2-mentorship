# Use Case Scenario: Kelola Materi (User)

### Use Case Name: Kelola Materi (Upload/Edit/Hapus)

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-10 |
| **Importance Level** | High |
| **Primary Actor** | Users (Creator) |
| **Secondary Actor** | AWS S3 (untuk penyimpanan file) |
| **Use Case Type** | Main Case |
| **Brief Description** | Pengguna dengan role Creator mengunggah, mengedit, atau menghapus materi pembelajaran yang dibuat dalam format Markdown dengan file pendukung |
| **Stakeholder and Interest** | - **Users (Creator)**: Ingin berbagi pengetahuan dan mendapat XP Creator<br>- **Users (Learner)**: Ingin tersedia materi berkualitas untuk dipelajari<br>- **Sistem**: Memastikan konten valid dan tersimpan dengan baik |
| **Trigger** | Pengguna mengakses menu "Kelola Materi" dan memilih aksi Tambah/Edit/Hapus |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna sudah login sebagai Creator<br>- Sistem dapat mengakses database dan AWS S3<br>- Untuk Edit/Hapus: materi sudah ada dan dimiliki oleh pengguna ini |
| **Successful End Condition** | - Materi berhasil ditambah/diubah/dihapus di database<br>- File statis berhasil diupload/dihapus dari AWS S3<br>- XP Creator pengguna diupdate (untuk tambah/edit)<br>- Notifikasi sukses ditampilkan |
| **Failed End Condition** | - Operasi gagal<br>- Data tidak berubah<br>- Pesan error ditampilkan |

#### 🔗 Relationship
- **Association:** Users (Creator), AWS S3 (secondary actor)
- **Include:** -
- **Extend:** -
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events (Tambah Materi):**
1. Pengguna mengakses menu "Kelola Materi"
2. Sistem menampilkan daftar materi yang pernah dibuat pengguna
3. Pengguna mengklik tombol "Tambah Materi Baru"
4. Sistem menampilkan form editor dengan field: Judul, Konten Markdown, Upload File/Gambar
5. Pengguna mengisi judul materi
6. Pengguna menulis konten dalam format Markdown di editor
7. Pengguna menyisipkan file/gambar pendukung (opsional)
8. Pengguna mengklik tombol "Preview" untuk melihat hasil render
9. Pengguna puas dengan preview, mengklik tombol "Simpan"
10. Sistem menerima payload data (judul, konten markdown, files)
11. Sistem melakukan validasi struktur Markdown dan kelengkapan data
12. Sistem mengunggah file/gambar ke AWS S3 secara paralel
13. Sistem mendapat URL file dari S3
14. Sistem mengeksekusi native query INSERT ke tabel Materi (judulMateri, kontenMarkdown, idPenulis, tanggalUnggah, status_publik=true)
15. Sistem menghitung XP Creator yang didapat (misal: 20 XP untuk upload materi)
16. Sistem mengeksekusi UPDATE untuk menambah xpCreator dan totalXP pengguna
17. Sistem menampilkan notifikasi "Materi berhasil ditambahkan! +20 XP Creator"
18. Sistem mengarahkan ke daftar materi atau halaman preview materi baru

**Alternate Flows:**
- **3A. Edit Materi:**
  - 3A.1. Pengguna memilih materi dari daftar dan klik "Edit"
  - 3A.2. Sistem memeriksa kepemilikan materi (idPenulis == idPengguna)
  - 3A.3. Sistem menampilkan form editor dengan data materi yang sudah ada
  - 3A.4. Pengguna mengubah judul atau konten atau menambah/hapus file
  - 3A.5. Pengguna klik "Simpan Perubahan"
  - 3A.6. Sistem mengeksekusi UPDATE ke tabel Materi
  - 3A.7. Jika ada file baru, upload ke S3
  - 3A.8. Jika ada file lama yang dihapus, hapus dari S3
  - 3A.9. Sistem memberi XP Creator lebih sedikit (misal: +5 XP untuk edit)
  - 3A.10. Notifikasi "Materi berhasil diupdate"

- **3B. Hapus Materi:**
  - 3B.1. Pengguna memilih materi dan klik "Hapus"
  - 3B.2. Sistem memeriksa kepemilikan materi
  - 3B.3. Sistem menampilkan konfirmasi "Yakin hapus materi '[Judul]'? Data tidak dapat dikembalikan"
  - 3B.4. Pengguna klik "Ya, Hapus"
  - 3B.5. Sistem mengeksekusi DELETE dari tabel Materi
  - 3B.6. Sistem menghapus semua file terkait dari AWS S3
  - 3B.7. Sistem menghapus riwayat belajar terkait atau set status deleted
  - 3B.8. Sistem mengurangi xpCreator pengguna (opsional, tergantung business logic)
  - 3B.9. Notifikasi "Materi berhasil dihapus"
  - 3B.10. Daftar materi diupdate

- **9A. Simpan sebagai draft:**
  - 9A.1. Pengguna klik "Simpan sebagai Draft"
  - 9A.2. Sistem simpan dengan status_publik = false
  - 9A.3. Materi tidak muncul di pencarian publik
  - 9A.4. XP Creator tidak diberikan sampai dipublikasikan

- **7A. Tidak ada file yang diupload:**
  - 7A.1. Pengguna hanya menulis teks tanpa file pendukung
  - 7A.2. Langkah 12-13 (upload S3) dilewati
  - 7A.3. Lanjut ke langkah 14

**Exceptional Flows:**
- **11E. Validasi Markdown gagal:**
  - 11E.1. Sistem mendeteksi struktur Markdown invalid atau ada tag berbahaya
  - 11E.2. Sistem menampilkan pesan "Format Markdown tidak valid. Periksa syntax"
  - 11E.3. Materi tidak disimpan, pengguna kembali ke editor (langkah 6)

- **12E. Upload ke S3 gagal:**
  - 12E.1. Sistem gagal mengunggah file ke AWS S3 (network error, quota exceeded)
  - 12E.2. Sistem menampilkan pesan "Gagal mengupload file. Coba lagi atau gunakan file lebih kecil"
  - 12E.3. Materi tidak disimpan, pengguna kembali ke editor

- **14E. Database INSERT/UPDATE gagal:**
  - 14E.1. Query gagal dieksekusi (constraint violation, connection error)
  - 14E.2. Sistem rollback: hapus file yang sudah diupload ke S3
  - 14E.3. Sistem menampilkan pesan "Gagal menyimpan materi. Coba lagi nanti"

- **3A.2E. Pengguna bukan pemilik materi:**
  - 3A.2E.1. idPenulis tidak sama dengan idPengguna yang login
  - 3A.2E.2. Sistem menampilkan pesan "Anda tidak memiliki akses untuk mengedit materi ini"
  - 3A.2E.3. Operasi edit dibatalkan

- **7E. File terlalu besar:**
  - 7E.1. Ukuran file melebihi batas maksimal (misal: 10MB)
  - 7E.2. Sistem menampilkan pesan "Ukuran file maksimal 10MB"
  - 7E.3. Upload dibatalkan, pengguna harus pilih file lain
