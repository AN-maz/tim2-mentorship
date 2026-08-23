# Use Case Scenario: Mencari Materi

### Use Case Name: Mencari Materi

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-04 |
| **Importance Level** | Medium |
| **Primary Actor** | Users (Learner) |
| **Secondary Actor** | - |
| **Use Case Type** | Extension |
| **Brief Description** | Pengguna menggunakan fitur pencarian untuk menemukan materi berdasarkan kata kunci tertentu |
| **Stakeholder and Interest** | - **Users**: Ingin menemukan materi spesifik dengan cepat tanpa scroll manual<br>- **Sistem**: Menyediakan hasil pencarian yang relevan |
| **Trigger** | Pengguna memasukkan kata kunci di kolom pencarian pada halaman daftar materi |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna sudah berada di halaman daftar materi (UC-03)<br>- Sistem dapat mengakses database untuk pencarian<br>- Minimal ada satu materi di database |
| **Successful End Condition** | - Sistem menampilkan hasil pencarian yang relevan dengan kata kunci<br>- Pengguna dapat memilih materi dari hasil pencarian |
| **Failed End Condition** | - Tidak ada hasil yang ditemukan atau pencarian gagal<br>- Pesan ditampilkan sesuai kondisi |

#### 🔗 Relationship
- **Association:** Users (sebagai primary actor)
- **Include:** -
- **Extend:** Extend dari Melihat Materi (UC-03)
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Pengguna berada di halaman daftar materi
2. Pengguna mengklik kolom pencarian
3. Pengguna mengetikkan kata kunci pencarian (misal: "database", "javascript")
4. Pengguna menekan tombol "Cari" atau tekan Enter
5. Sistem menerima input kata kunci
6. Sistem mengeksekusi native query pencarian teks (SELECT * FROM Materi WHERE judulMateri ILIKE '%keyword%' OR kontenMarkdown ILIKE '%keyword%' AND status_publik = true)
7. Sistem menemukan materi yang cocok dengan kata kunci
8. Sistem menampilkan hasil pencarian dengan highlight pada kata kunci
9. Sistem menampilkan jumlah hasil yang ditemukan (misal: "Ditemukan 5 materi")
10. Pengguna melihat hasil pencarian
11. Pengguna dapat memilih materi dari hasil pencarian untuk melihat detailnya (lanjut ke UC-03 langkah 5)

**Alternate Flows:**
- **7A. Tidak ada hasil ditemukan:**
  - 7A.1. Query tidak mengembalikan hasil apapun
  - 7A.2. Sistem menampilkan pesan "Tidak ada materi yang cocok dengan kata kunci '[keyword]'"
  - 7A.3. Sistem menampilkan saran "Coba kata kunci lain atau telusuri semua materi"
  - 7A.4. Pengguna dapat mengubah kata kunci (kembali ke langkah 3) atau kembali ke daftar semua materi

- **4A. Pengguna menghapus kata kunci:**
  - 4A.1. Pengguna menghapus semua teks di kolom pencarian
  - 4A.2. Sistem menampilkan kembali semua daftar materi (kembali ke UC-03 langkah 2)
  - 4A.3. Use case berakhir

- **4B. Real-time search:**
  - 4B.1. Sistem melakukan pencarian otomatis setiap kali pengguna mengetik (debounced)
  - 4B.2. Hasil pencarian ditampilkan secara dinamis tanpa perlu klik tombol "Cari"
  - 4B.3. Lanjut ke langkah 6

**Exceptional Flows:**
- **6E. Query pencarian error:**
  - 6E.1. Sistem gagal mengeksekusi query pencarian (database error)
  - 6E.2. Sistem menampilkan pesan error "Pencarian gagal. Coba lagi nanti"
  - 6E.3. Sistem menampilkan kembali daftar materi sebelum pencarian

- **5E. Kata kunci terlalu pendek:**
  - 5E.1. Pengguna memasukkan kata kunci kurang dari 3 karakter
  - 5E.2. Sistem menampilkan pesan "Masukkan minimal 3 karakter untuk pencarian"
  - 5E.3. Pencarian tidak dijalankan, pengguna kembali ke langkah 3
