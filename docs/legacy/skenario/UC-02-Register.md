# Use Case Scenario: Register

### Use Case Name: Register

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-02 |
| **Importance Level** | High |
| **Primary Actor** | Users (calon Learner/Creator) |
| **Secondary Actor** | Google Auth (Sistem Eksternal) |
| **Use Case Type** | Main Case |
| **Brief Description** | Pengguna baru mendaftarkan diri untuk membuat akun di sistem LMS dengan metode manual atau Google Auth |
| **Stakeholder and Interest** | - **Users**: Ingin membuat akun baru untuk mengakses fitur pembelajaran<br>- **Sistem**: Memastikan data pengguna valid dan email unik |
| **Trigger** | Pengguna membuka halaman registrasi dan mengisi form pendaftaran atau memilih register via Google |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna belum memiliki akun di sistem<br>- Sistem dalam kondisi aktif dan database dapat diakses<br>- Untuk Google Auth: layanan Google Auth tersedia |
| **Successful End Condition** | - Data pengguna baru berhasil disimpan ke database<br>- Akun dibuat dengan status aktif (statusAktif = true)<br>- XP awal diinisialisasi (xpLearner = 0, xpCreator = 0)<br>- Pengguna diarahkan ke halaman login<br>- Notifikasi sukses ditampilkan |
| **Failed End Condition** | - Registrasi gagal dan pengguna tetap di halaman registrasi<br>- Pesan error ditampilkan (email sudah digunakan, format tidak valid, atau error sistem) |

#### 🔗 Relationship
- **Association:** Users (sebagai primary actor), Google Auth (sebagai secondary actor)
- **Include:** -
- **Extend:** Register via Google Auth (extend dari alur register manual)
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Pengguna membuka halaman registrasi
2. Pengguna memilih metode registrasi manual
3. Pengguna mengisi form (Nama Lengkap, Email, Password)
4. Pengguna mengklik tombol "Daftar"
5. Sistem menerima data input dari form
6. Sistem melakukan validasi format input (email valid, password minimal 8 karakter)
7. Sistem melakukan enkripsi password menggunakan hashing (bcrypt)
8. Sistem melakukan pengecekan ketersediaan email di database (SELECT email dari tabel Akun)
9. Email belum terdaftar, sistem melanjutkan proses
10. Sistem menyimpan data pengguna baru dengan native query INSERT ke tabel Pengguna
11. Sistem menginisialisasi nilai default (xpLearner = 0, xpCreator = 0, statusAktif = true)
12. Sistem mengirim notifikasi "Registrasi berhasil! Silakan login"
13. Sistem mengarahkan pengguna ke halaman login

**Alternate Flows:**
- **2A. Register via Google Auth:**
  - 2A.1. Pengguna mengklik tombol "Daftar via Google"
  - 2A.2. Sistem mengarahkan ke halaman autentikasi Google
  - 2A.3. Google Auth memproses otentikasi dan ekstrak data profil (nama, email)
  - 2A.4. Google Auth mengembalikan data profil ke sistem
  - 2A.5. Sistem menerima data profil dari Google
  - 2A.6. Sistem melakukan pengecekan ketersediaan email di database
  - 2A.7. Jika email belum terdaftar, lanjut ke langkah 10 (simpan data tanpa password hash)
  - 2A.8. Jika email sudah terdaftar, lanjut ke exceptional flow 9E

- **4A. Pengguna membatalkan registrasi:**
  - 4A.1. Pengguna mengklik tombol "Batal" atau menutup halaman
  - 4A.2. Sistem tidak melakukan proses apapun
  - 4A.3. Use case berakhir

**Exceptional Flows:**
- **6E. Format input tidak valid:**
  - 6E.1. Sistem mendeteksi format email salah atau password kurang dari 8 karakter
  - 6E.2. Sistem menampilkan pesan error "Format email tidak valid" atau "Password minimal 8 karakter"
  - 6E.3. Pengguna memperbaiki input (kembali ke langkah 3)

- **9E. Email sudah terdaftar:**
  - 9E.1. Sistem menemukan email yang sama di database
  - 9E.2. Sistem menampilkan pesan error "Email sudah digunakan. Gunakan email lain atau login"
  - 9E.3. Pengguna kembali ke form registrasi (kembali ke langkah 3)

- **10E. Database error:**
  - 10E.1. Sistem gagal menyimpan data ke database (query INSERT gagal)
  - 10E.2. Sistem menampilkan pesan error "Terjadi kesalahan sistem. Coba lagi nanti"
  - 10E.3. Pengguna kembali ke halaman registrasi (kembali ke langkah 1)

- **2A.3E. Google Auth gagal:**
  - 2A.3E.1. Layanan Google Auth tidak tersedia atau pengguna membatalkan autentikasi
  - 2A.3E.2. Sistem menampilkan pesan "Registrasi Google gagal. Coba lagi atau gunakan registrasi manual"
  - 2A.3E.3. Pengguna kembali ke halaman registrasi (kembali ke langkah 1)
