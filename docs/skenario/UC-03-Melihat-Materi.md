# Use Case Scenario: Melihat Materi

### Use Case Name: Melihat Materi

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-03 |
| **Importance Level** | High |
| **Primary Actor** | Users (Learner) |
| **Secondary Actor** | - |
| **Use Case Type** | Main Case |
| **Brief Description** | Pengguna melihat daftar materi yang tersedia dan membuka detail materi untuk membaca kontennya |
| **Stakeholder and Interest** | - **Users**: Ingin menemukan dan membaca materi pembelajaran yang tersedia<br>- **Creator**: Ingin materinya dilihat dan mendapat feedback<br>- **Sistem**: Mencatat statistik view untuk analitik |
| **Trigger** | Pengguna mengakses halaman daftar materi atau mengklik judul materi tertentu |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna sudah login ke sistem<br>- Minimal ada satu materi yang berstatus publik di database<br>- Sistem dapat mengakses database dan file markdown |
| **Successful End Condition** | - Materi ditampilkan dengan format yang benar (markdown ter-render)<br>- Counter totalDilihat bertambah 1<br>- Pengguna dapat membaca konten materi secara lengkap |
| **Failed End Condition** | - Materi tidak dapat ditampilkan<br>- Pesan error muncul (materi tidak ditemukan atau error sistem) |

#### 🔗 Relationship
- **Association:** Users (sebagai primary actor)
- **Include:** -
- **Extend:** Mencari Materi (UC-04), Memberi Rating (UC-05), Memberi Komentar (UC-06)
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Pengguna mengakses halaman daftar materi
2. Sistem mengeksekusi native query (SELECT * FROM Materi WHERE status_publik = true ORDER BY tanggalUnggah DESC)
3. Sistem menampilkan daftar materi dengan informasi: judul, penulis, rating, jumlah view
4. Pengguna memilih dan mengklik judul materi yang ingin dilihat
5. Sistem menerima request untuk membuka detail materi
6. Sistem mengambil data materi dari database berdasarkan idMateri
7. Sistem increment counter totalDilihat (UPDATE Materi SET totalDilihat = totalDilihat + 1)
8. Sistem me-render konten markdown ke format HTML
9. Sistem menampilkan halaman detail materi dengan konten lengkap
10. Pengguna membaca materi
11. Pengguna menutup halaman detail atau kembali ke daftar materi

**Alternate Flows:**
- **1A. Tidak ada materi tersedia:**
  - 1A.1. Sistem mengeksekusi query dan hasilnya kosong
  - 1A.2. Sistem menampilkan pesan "Belum ada materi tersedia. Jadilah creator pertama!"
  - 1A.3. Use case berakhir

- **10A. Pengguna memberi rating (extend ke UC-05):**
  - 10A.1. Setelah membaca, pengguna mengklik icon rating (1-5 bintang)
  - 10A.2. Sistem menyimpan rating dan menghitung ulang ratingRataRata
  - 10A.3. Sistem menampilkan rating terbaru
  - 10A.4. Pengguna melanjutkan membaca atau menutup halaman

- **10B. Pengguna menulis komentar (extend ke UC-06):**
  - 10B.1. Setelah membaca, pengguna mengklik tombol "Tulis Komentar"
  - 10B.2. Pengguna menulis komentar di textbox
  - 10B.3. Pengguna mengklik "Kirim"
  - 10B.4. Sistem menyimpan komentar dengan native query INSERT
  - 10B.5. Sistem menampilkan komentar baru di halaman
  - 10B.6. Pengguna melanjutkan membaca atau menutup halaman

**Exceptional Flows:**
- **6E. Materi tidak ditemukan:**
  - 6E.1. Sistem tidak menemukan materi dengan idMateri yang diminta (materi sudah dihapus)
  - 6E.2. Sistem menampilkan pesan error "Materi tidak ditemukan atau sudah dihapus"
  - 6E.3. Sistem mengarahkan pengguna kembali ke daftar materi

- **8E. Error rendering markdown:**
  - 8E.1. Sistem gagal me-render konten markdown (format rusak atau invalid)
  - 8E.2. Sistem menampilkan konten raw atau pesan "Konten materi mengalami masalah format"
  - 8E.3. Pengguna tetap bisa membaca tetapi formatnya tidak sempurna

- **2E. Database error:**
  - 2E.1. Sistem gagal mengeksekusi query ke database
  - 2E.2. Sistem menampilkan pesan error "Terjadi kesalahan sistem. Coba lagi nanti"
  - 2E.3. Use case berakhir
