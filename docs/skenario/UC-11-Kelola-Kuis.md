# Use Case Scenario: Kelola Kuis (User)

### Use Case Name: Kelola Kuis (Buat/Edit/Hapus)

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-11 |
| **Importance Level** | High |
| **Primary Actor** | Users (Creator) |
| **Secondary Actor** | - |
| **Use Case Type** | Main Case |
| **Brief Description** | Pengguna dengan role Creator membuat, mengedit, atau menghapus kuis dengan soal dan jawaban dalam format Markdown, mengatur waktu dan bobot poin |
| **Stakeholder and Interest** | - **Users (Creator)**: Ingin membuat kuis untuk materi dan mendapat XP Creator<br>- **Users (Learner)**: Ingin ada kuis berkualitas untuk menguji pemahaman<br>- **Sistem**: Memastikan kuis valid dan dapat dievaluasi dengan benar |
| **Trigger** | Pengguna mengakses menu "Kelola Kuis" dan memilih aksi Tambah/Edit/Hapus |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna sudah login sebagai Creator<br>- Sistem dapat menyimpan data kuis ke database<br>- Untuk Edit/Hapus: kuis sudah ada dan dimiliki oleh pengguna ini |
| **Successful End Condition** | - Kuis berhasil dibuat/diubah/dihapus di database<br>- Soal dan kunci jawaban tersimpan dengan benar<br>- XP Creator pengguna diupdate (untuk buat/edit)<br>- Notifikasi sukses ditampilkan |
| **Failed End Condition** | - Operasi gagal<br>- Data tidak berubah<br>- Pesan error ditampilkan |

#### 🔗 Relationship
- **Association:** Users (Creator)
- **Include:** -
- **Extend:** -
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events (Buat Kuis):**
1. Pengguna mengakses menu "Kelola Kuis"
2. Sistem menampilkan daftar kuis yang pernah dibuat pengguna
3. Pengguna mengklik tombol "Buat Kuis Baru"
4. Sistem menampilkan form dengan field: Judul Kuis, Materi Terkait (opsional), Aturan Kuis (Markdown), Batas Waktu, Bobot Poin
5. Pengguna mengisi judul kuis
6. Pengguna memilih materi terkait dari dropdown (opsional)
7. Pengguna menulis aturan/instruksi kuis dalam Markdown
8. Pengguna mengatur batas waktu (misal: 30 menit)
9. Pengguna mengatur bobot poin default per soal (misal: 10 poin)
10. Pengguna mengklik "Lanjut ke Soal"
11. Sistem menampilkan editor soal
12. Pengguna menyusun soal pertama dalam format Markdown
13. Pengguna menambahkan pilihan jawaban (A, B, C, D)
14. Pengguna menandai jawaban yang benar
15. Pengguna dapat menambah soal lagi (ulangi langkah 12-14) atau klik "Selesai"
16. Sistem menerima payload data kuis lengkap
17. Sistem melakukan validasi format Markdown dan kelengkapan data (minimal 1 soal, semua soal punya jawaban benar)
18. Sistem mengeksekusi native query INSERT ke tabel Kuis (judulKuis, idMateriTerkait, aturanMarkdown, batasWaktuMenit, poinXPDefault)
19. Sistem menyimpan soal-soal ke tabel Soal dengan relasi ke idKuis
20. Sistem menyimpan kunci jawaban ke tabel KunciJawaban
21. Sistem menghitung XP Creator (misal: 30 XP untuk buat kuis + 5 XP per soal)
22. Sistem mengeksekusi UPDATE untuk menambah xpCreator dan totalXP pengguna
23. Sistem menampilkan notifikasi "Kuis berhasil dibuat! +50 XP Creator"
24. Sistem mengarahkan ke daftar kuis atau preview kuis baru

**Alternate Flows:**
- **3A. Edit Kuis:**
  - 3A.1. Pengguna memilih kuis dari daftar dan klik "Edit"
  - 3A.2. Sistem memeriksa kepemilikan kuis (creator == idPengguna)
  - 3A.3. Sistem menampilkan form editor dengan data kuis dan soal yang sudah ada
  - 3A.4. Pengguna mengubah judul, aturan, waktu, atau soal
  - 3A.5. Pengguna dapat menambah/edit/hapus soal
  - 3A.6. Pengguna klik "Simpan Perubahan"
  - 3A.7. Sistem mengeksekusi UPDATE ke tabel Kuis, Soal, dan KunciJawaban
  - 3A.8. Sistem memberi XP Creator lebih sedikit (misal: +10 XP untuk edit)
  - 3A.9. Notifikasi "Kuis berhasil diupdate"

- **3B. Hapus Kuis:**
  - 3B.1. Pengguna memilih kuis dan klik "Hapus"
  - 3B.2. Sistem memeriksa kepemilikan kuis
  - 3B.3. Sistem menampilkan konfirmasi "Yakin hapus kuis '[Judul]'? Semua soal dan hasil akan terhapus"
  - 3B.4. Pengguna klik "Ya, Hapus"
  - 3B.5. Sistem mengeksekusi DELETE dari tabel Kuis (cascade delete ke Soal dan KunciJawaban)
  - 3B.6. Sistem menghapus riwayat pengerjaan terkait atau set status deleted
  - 3B.7. Sistem mengurangi xpCreator pengguna (opsional)
  - 3B.8. Notifikasi "Kuis berhasil dihapus"
  - 3B.9. Daftar kuis diupdate

- **15A. Preview kuis sebelum publish:**
  - 15A.1. Pengguna klik "Preview Kuis"
  - 15A.2. Sistem menampilkan simulasi kuis seperti yang dilihat learner
  - 15A.3. Pengguna dapat mencoba mengerjakan untuk test
  - 15A.4. Pengguna kembali ke editor jika ada yang perlu diperbaiki

- **6A. Tidak ada materi terkait:**
  - 6A.1. Pengguna tidak memilih materi terkait (kuis standalone)
  - 6A.2. Field idMateriTerkait = NULL
  - 6A.3. Lanjut ke langkah berikutnya

**Exceptional Flows:**
- **17E. Validasi gagal:**
  - 17E.1. Sistem mendeteksi kuis tidak valid (tidak ada soal, ada soal tanpa jawaban benar, format markdown error)
  - 17E.2. Sistem menampilkan pesan "Kuis tidak valid: [deskripsi error]"
  - 17E.3. Kuis tidak disimpan, pengguna kembali ke editor

- **18E. Database INSERT gagal:**
  - 18E.1. Query INSERT ke tabel Kuis gagal
  - 18E.2. Sistem menampilkan pesan "Gagal menyimpan kuis. Coba lagi nanti"
  - 18E.3. Tidak ada data yang tersimpan (transaction rollback)

- **19E. Error saat menyimpan soal:**
  - 19E.1. Kuis tersimpan tetapi gagal menyimpan soal
  - 19E.2. Sistem rollback semua perubahan (hapus kuis yang baru dibuat)
  - 19E.3. Sistem menampilkan pesan "Gagal menyimpan soal. Coba lagi"

- **3A.2E. Pengguna bukan pembuat kuis:**
  - 3A.2E.1. Creator kuis bukan pengguna yang login
  - 3A.2E.2. Sistem menampilkan pesan "Anda tidak memiliki akses untuk mengedit kuis ini"
  - 3A.2E.3. Operasi edit dibatalkan

- **8E. Batas waktu tidak valid:**
  - 8E.1. Pengguna input waktu <= 0 atau > 180 menit
  - 8E.2. Sistem menampilkan pesan "Batas waktu harus antara 1-180 menit"
  - 8E.3. Pengguna harus memperbaiki input

- **14E. Tidak ada jawaban benar yang dipilih:**
  - 14E.1. Pengguna lupa menandai jawaban benar untuk suatu soal
  - 14E.2. Sistem menampilkan warning "Soal #X belum memiliki jawaban benar"
  - 14E.3. Pengguna kembali ke soal tersebut untuk perbaikan
