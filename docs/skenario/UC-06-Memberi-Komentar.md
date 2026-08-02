# Use Case Scenario: Memberi Komentar

### Use Case Name: Memberi Komentar

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-06 |
| **Importance Level** | Medium |
| **Primary Actor** | Users (Learner) |
| **Secondary Actor** | - |
| **Use Case Type** | Extension |
| **Brief Description** | Pengguna menulis dan mengirimkan komentar pada materi yang telah dibaca sebagai bentuk feedback atau diskusi |
| **Stakeholder and Interest** | - **Users**: Ingin memberikan feedback, bertanya, atau berdiskusi tentang materi<br>- **Creator**: Ingin mendapat feedback dan interaksi dari pembaca<br>- **Sistem**: Memfasilitasi interaksi dan engagement antar pengguna |
| **Trigger** | Pengguna mengklik tombol "Tulis Komentar" pada halaman detail materi |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna sudah login<br>- Pengguna sedang melihat detail materi (UC-03)<br>- Sistem dapat menyimpan komentar ke database |
| **Successful End Condition** | - Komentar berhasil disimpan ke database<br>- Komentar ditampilkan di halaman materi<br>- Notifikasi sukses muncul |
| **Failed End Condition** | - Komentar gagal disimpan<br>- Pesan error ditampilkan |

#### 🔗 Relationship
- **Association:** Users (sebagai primary actor)
- **Include:** -
- **Extend:** Extend dari Melihat Materi (UC-03)
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Pengguna sedang berada di halaman detail materi (dari UC-03)
2. Pengguna scroll ke bagian komentar
3. Pengguna mengklik tombol "Tulis Komentar"
4. Sistem menampilkan textbox komentar
5. Pengguna menulis teks komentar
6. Pengguna mengklik tombol "Kirim"
7. Sistem menerima data komentar (idMateri, idPengguna, teksKomentar, tanggal)
8. Sistem melakukan validasi (teks tidak kosong, tidak lebih dari 1000 karakter)
9. Sistem menyimpan komentar dengan native query INSERT ke tabel Komentar
10. Sistem menampilkan notifikasi "Komentar berhasil ditambahkan"
11. Sistem merender komentar baru di bagian daftar komentar
12. Pengguna melihat komentarnya muncul di halaman

**Alternate Flows:**
- **6A. Pengguna membatalkan komentar:**
  - 6A.1. Pengguna mengklik tombol "Batal" atau menutup textbox
  - 6A.2. Sistem menghapus draft komentar (jika ada)
  - 6A.3. Textbox komentar ditutup
  - 6A.4. Use case berakhir

- **5A. Preview komentar:**
  - 5A.1. Pengguna mengklik tombol "Preview"
  - 5A.2. Sistem menampilkan preview komentar dengan format markdown (jika didukung)
  - 5A.3. Pengguna dapat kembali ke mode edit atau langsung kirim

- **12A. Pengguna mengedit komentar sendiri:**
  - 12A.1. Pengguna mengklik tombol "Edit" pada komentarnya sendiri
  - 12A.2. Sistem menampilkan textbox dengan teks komentar yang sudah ada
  - 12A.3. Pengguna mengubah teks komentar
  - 12A.4. Pengguna mengklik "Simpan Perubahan"
  - 12A.5. Sistem mengupdate komentar (UPDATE tabel Komentar)
  - 12A.6. Komentar yang diupdate ditampilkan

- **12B. Pengguna menghapus komentar sendiri:**
  - 12B.1. Pengguna mengklik tombol "Hapus" pada komentarnya sendiri
  - 12B.2. Sistem menampilkan konfirmasi "Yakin hapus komentar?"
  - 12B.3. Pengguna mengklik "Ya"
  - 12B.4. Sistem menghapus komentar (DELETE dari tabel Komentar)
  - 12B.5. Komentar hilang dari halaman

**Exceptional Flows:**
- **8E. Komentar kosong:**
  - 8E.1. Sistem mendeteksi textbox komentar kosong atau hanya whitespace
  - 8E.2. Sistem menampilkan pesan error "Komentar tidak boleh kosong"
  - 8E.3. Komentar tidak disimpan, pengguna kembali ke langkah 5

- **8E-2. Komentar terlalu panjang:**
  - 8E-2.1. Sistem mendeteksi komentar lebih dari 1000 karakter
  - 8E-2.2. Sistem menampilkan pesan error "Komentar maksimal 1000 karakter"
  - 8E-2.3. Komentar tidak disimpan, pengguna kembali ke langkah 5

- **9E. Database error:**
  - 9E.1. Sistem gagal menyimpan komentar ke database (query INSERT gagal)
  - 9E.2. Sistem menampilkan pesan error "Gagal mengirim komentar. Coba lagi nanti"
  - 9E.3. Komentar tidak tersimpan, pengguna tetap di halaman detail materi

- **8E-3. Komentar mengandung konten tidak pantas:**
  - 8E-3.1. Sistem mendeteksi kata-kata kasar atau spam (jika ada filter)
  - 8E-3.2. Sistem menampilkan pesan "Komentar mengandung konten yang tidak pantas"
  - 8E-3.3. Komentar tidak disimpan atau disimpan dengan status pending moderasi
