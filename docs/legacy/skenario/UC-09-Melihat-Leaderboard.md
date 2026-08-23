# Use Case Scenario: Melihat Leaderboard

### Use Case Name: Melihat Leaderboard (Ranked)

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-09 |
| **Importance Level** | Medium |
| **Primary Actor** | Users (Learner/Creator) |
| **Secondary Actor** | - |
| **Use Case Type** | Main Case |
| **Brief Description** | Pengguna melihat peringkat semua pengguna berdasarkan total XP, dengan kategori Learner Terbaik dan Creator Terbaik |
| **Stakeholder and Interest** | - **Users**: Ingin melihat posisi rank mereka dibanding pengguna lain dan termotivasi untuk naik peringkat<br>- **Sistem**: Menampilkan data leaderboard secara akurat dan real-time |
| **Trigger** | Pengguna mengklik menu "Leaderboard" atau "Ranked" di navigasi |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna sudah login<br>- Sistem dapat mengakses database untuk query ranking<br>- Minimal ada beberapa pengguna dengan XP > 0 |
| **Successful End Condition** | - Leaderboard ditampilkan dengan data peringkat yang akurat<br>- Pengguna dapat melihat posisi diri sendiri dan pengguna lain<br>- Data diurutkan berdasarkan XP tertinggi ke terendah |
| **Failed End Condition** | - Leaderboard gagal dimuat<br>- Pesan error ditampilkan |

#### 🔗 Relationship
- **Association:** Users (sebagai primary actor)
- **Include:** -
- **Extend:** -
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Pengguna mengklik menu "Leaderboard / Ranked" di navigasi
2. Sistem menerima request untuk halaman leaderboard
3. Sistem mengeksekusi native query untuk mengambil data ranking (SELECT idAkun, namaLengkap, totalXP, xpLearner, xpCreator, rankPeringkat FROM Pengguna ORDER BY totalXP DESC LIMIT 100)
4. Sistem mengelompokkan dan mengurutkan data berdasarkan kategori:
   - Leaderboard Total XP (gabungan Learner + Creator)
   - Learner Terbaik (sort by xpLearner DESC)
   - Creator Terbaik (sort by xpCreator DESC)
5. Sistem menentukan peringkat (rank) setiap pengguna berdasarkan urutan
6. Sistem mencari dan highlight posisi pengguna yang sedang login
7. Sistem merender tampilan leaderboard dengan tab/kategori
8. Sistem menampilkan informasi setiap entry: peringkat, nama, XP, rank badge
9. Pengguna melihat peringkat diri sendiri dan pengguna lain
10. Pengguna dapat switch antara tab "Total XP", "Learner", dan "Creator"
11. Pengguna dapat scroll untuk melihat lebih banyak peringkat

**Alternate Flows:**
- **3A. Belum ada data ranking:**
  - 3A.1. Query mengembalikan hasil kosong atau semua XP = 0
  - 3A.2. Sistem menampilkan pesan "Belum ada data leaderboard. Mulai belajar atau buat materi untuk masuk peringkat!"
  - 3A.3. Use case berakhir

- **10A. Filter berdasarkan periode waktu:**
  - 10A.1. Pengguna memilih filter "Minggu Ini", "Bulan Ini", atau "All Time"
  - 10A.2. Sistem melakukan query ulang dengan filter tanggal dari RiwayatBelajar
  - 10A.3. Leaderboard ditampilkan sesuai periode yang dipilih

- **11A. Load more pagination:**
  - 11A.1. Pengguna scroll sampai akhir daftar (top 100)
  - 11A.2. Pengguna mengklik "Lihat Lebih Banyak"
  - 11A.3. Sistem load 100 entry berikutnya
  - 11A.4. Data ditampilkan di bawah data sebelumnya

- **9A. Melihat profil pengguna lain:**
  - 9A.1. Pengguna mengklik nama pengguna di leaderboard
  - 9A.2. Sistem menampilkan profil publik pengguna tersebut (statistik, materi yang dibuat, dll)
  - 9A.3. Use case extend ke "Melihat Profil Pengguna"

**Exceptional Flows:**
- **3E. Database query error:**
  - 3E.1. Sistem gagal mengeksekusi query ke database
  - 3E.2. Sistem menampilkan pesan error "Gagal memuat leaderboard. Coba lagi nanti"
  - 3E.3. Use case berakhir

- **6E. Pengguna tidak ditemukan di leaderboard:**
  - 6E.1. Pengguna yang login memiliki totalXP = 0 atau belum masuk top list
  - 6E.2. Sistem menampilkan pesan di bagian bawah "Anda belum masuk peringkat. Kumpulkan XP untuk masuk leaderboard!"
  - 6E.3. Leaderboard pengguna lain tetap ditampilkan

- **5E. Data XP tidak konsisten:**
  - 5E.1. Sistem mendeteksi totalXP tidak sama dengan xpLearner + xpCreator
  - 5E.2. Sistem log warning untuk admin
  - 5E.3. Sistem tetap menampilkan data berdasarkan totalXP yang ada
  - 5E.4. Background job akan melakukan rekalkulasi XP

- **8E. Render error:**
  - 8E.1. Sistem gagal merender tampilan UI (terlalu banyak data atau error frontend)
  - 8E.2. Sistem menampilkan versi simplified leaderboard (text only)
  - 8E.3. Sistem log error untuk developer
