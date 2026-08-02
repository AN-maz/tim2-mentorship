# Use Case Scenario: Memberi Rating

### Use Case Name: Memberi Rating

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-05 |
| **Importance Level** | Medium |
| **Primary Actor** | Users (Learner) |
| **Secondary Actor** | - |
| **Use Case Type** | Extension |
| **Brief Description** | Pengguna memberikan penilaian berupa rating bintang (1-5) terhadap materi yang telah dibaca |
| **Stakeholder and Interest** | - **Users**: Ingin memberikan feedback kualitas materi<br>- **Creator**: Ingin mengetahui seberapa bagus materi yang dibuat<br>- **Sistem**: Mengkalkulasi rating rata-rata untuk rekomendasi |
| **Trigger** | Pengguna mengklik icon rating bintang pada halaman detail materi |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna sudah login<br>- Pengguna sedang melihat detail materi (UC-03)<br>- Sistem dapat menyimpan data rating ke database |
| **Successful End Condition** | - Rating berhasil disimpan ke database<br>- ratingRataRata pada materi diupdate<br>- UI menampilkan rating terbaru |
| **Failed End Condition** | - Rating gagal disimpan<br>- Pesan error ditampilkan |

#### 🔗 Relationship
- **Association:** Users (sebagai primary actor)
- **Include:** -
- **Extend:** Extend dari Melihat Materi (UC-03)
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Pengguna sedang berada di halaman detail materi (dari UC-03)
2. Pengguna melihat komponen rating bintang (1-5 bintang)
3. Pengguna mengklik salah satu bintang untuk memberi rating (misal: 4 bintang)
4. Sistem menerima input rating dari pengguna
5. Sistem memeriksa apakah pengguna sudah pernah memberi rating untuk materi ini
6. Jika belum pernah, sistem menyimpan rating baru (INSERT ke tabel Rating)
7. Sistem mengkalkulasi ulang ratingRataRata untuk materi tersebut (AVG dari semua rating)
8. Sistem mengupdate field ratingRataRata di tabel Materi (UPDATE Materi SET ratingRataRata = ...)
9. Sistem menampilkan notifikasi "Rating berhasil diberikan. Terima kasih!"
10. UI menampilkan rating bintang yang sudah dipilih dengan warna terisi
11. Pengguna melanjutkan membaca atau menutup halaman

**Alternate Flows:**
- **6A. Pengguna sudah pernah memberi rating:**
  - 6A.1. Sistem menemukan record rating dari pengguna untuk materi ini
  - 6A.2. Sistem menampilkan konfirmasi "Anda sudah memberi rating [X] bintang. Ubah rating?"
  - 6A.3a. Jika pengguna pilih "Ya", sistem mengupdate rating lama (UPDATE tabel Rating)
  - 6A.3b. Jika pengguna pilih "Batal", tidak ada perubahan
  - 6A.4. Lanjut ke langkah 7 (kalkulasi ulang rata-rata)

- **3A. Pengguna membatalkan rating:**
  - 3A.1. Pengguna mengklik bintang lalu mengklik tombol "Batal" atau menutup modal rating
  - 3A.2. Sistem tidak menyimpan data apapun
  - 3A.3. Use case berakhir

**Exceptional Flows:**
- **4E. Rating tidak valid:**
  - 4E.1. Sistem menerima nilai rating di luar range 1-5
  - 4E.2. Sistem menampilkan pesan error "Rating harus antara 1-5 bintang"
  - 4E.3. Rating tidak disimpan, pengguna kembali ke langkah 3

- **6E. Database error saat menyimpan rating:**
  - 6E.1. Sistem gagal menyimpan atau mengupdate rating (query INSERT/UPDATE gagal)
  - 6E.2. Sistem menampilkan pesan error "Gagal menyimpan rating. Coba lagi nanti"
  - 6E.3. Rating tidak tersimpan, pengguna tetap di halaman detail materi

- **7E. Error kalkulasi rating rata-rata:**
  - 7E.1. Sistem gagal menghitung atau mengupdate ratingRataRata
  - 7E.2. Rating individual tersimpan tetapi rata-rata tidak terupdate
  - 7E.3. Sistem log error untuk admin, tetap menampilkan notifikasi sukses ke pengguna
  - 7E.4. Background job akan mengkalkulasi ulang rating rata-rata nanti
