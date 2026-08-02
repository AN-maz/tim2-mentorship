# Use Case Scenario: Login

### Use Case Name: Login

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-01 |
| **Importance Level** | High |
| **Primary Actor** | Users (Learner/Creator), Admin |
| **Secondary Actor** | Google Auth (Sistem Eksternal) |
| **Use Case Type** | Main Case |
| **Brief Description** | Pengguna atau admin melakukan autentikasi untuk mengakses sistem LMS dengan menggunakan kredensial manual atau Google Auth |
| **Stakeholder and Interest** | - **Users/Admin**: Ingin mengakses fitur sistem sesuai role mereka<br>- **Sistem**: Memastikan hanya pengguna terautentikasi yang dapat mengakses |
| **Trigger** | Pengguna/Admin membuka halaman login dan memasukkan kredensial atau memilih login via Google |
| **Trigger Type** | External |
| **Preconditions** | - Pengguna/Admin sudah memiliki akun terdaftar di sistem<br>- Sistem dalam kondisi aktif dan database dapat diakses<br>- Untuk Google Auth: layanan Google Auth tersedia |
| **Successful End Condition** | - Sistem menghasilkan token JWT<br>- Pengguna/Admin berhasil diarahkan ke halaman Home<br>- Sesi login aktif |
| **Failed End Condition** | - Login gagal dan pengguna tetap di halaman login<br>- Pesan error ditampilkan (kredensial salah, akun suspended, atau error sistem) |

#### 🔗 Relationship
- **Association:** Users, Admin (sebagai primary actor), Google Auth (sebagai secondary actor)
- **Include:** -
- **Extend:** Login via Google Auth (extend dari alur login manual)
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Pengguna/Admin membuka halaman login
2. Pengguna/Admin memilih metode login manual (email & password)
3. Pengguna/Admin memasukkan email dan password
4. Sistem menerima input kredensial
5. Sistem menjalankan validasi data dengan native query PostgreSQL (SELECT dari tabel Akun)
6. Sistem memverifikasi password hash
7. Sistem menghasilkan token JWT dan membuat sesi
8. Sistem mengarahkan pengguna ke halaman Home sesuai role (User/Admin)

**Alternate Flows:**
- **2A. Login via Google Auth:**
  - 2A.1. Pengguna/Admin mengklik tombol "Login via Google"
  - 2A.2. Sistem mengarahkan ke halaman autentikasi Google
  - 2A.3. Google Auth memproses otentikasi akun Google
  - 2A.4. Google Auth mengembalikan token ke sistem
  - 2A.5. Sistem menerima dan memverifikasi token JWT dari Google
  - 2A.6. Sistem mencari akun berdasarkan email dari Google di database
  - 2A.7. Jika ditemukan, lanjut ke langkah 7 (generate JWT dan redirect)
  - 2A.8. Jika tidak ditemukan, tampilkan pesan "Akun belum terdaftar, silakan register terlebih dahulu"

- **3A. Pengguna membatalkan login:**
  - 3A.1. Pengguna mengklik tombol "Batal" atau menutup halaman
  - 3A.2. Sistem tidak melakukan proses apapun
  - 3A.3. Use case berakhir

**Exceptional Flows:**
- **5E. Kredensial tidak valid:**
  - 5E.1. Sistem tidak menemukan email di database atau password tidak cocok
  - 5E.2. Sistem menampilkan pesan error "Email atau password salah"
  - 5E.3. Pengguna kembali ke halaman login (kembali ke langkah 1)

- **5E-2. Akun tidak aktif/suspended:**
  - 5E-2.1. Sistem menemukan akun tetapi statusAktif = false
  - 5E-2.2. Sistem menampilkan pesan "Akun Anda telah dinonaktifkan. Hubungi admin"
  - 5E-2.3. Proses login dibatalkan

- **6E. Koneksi database error:**
  - 6E.1. Sistem gagal mengeksekusi query ke database
  - 6E.2. Sistem menampilkan pesan error "Terjadi kesalahan sistem. Coba lagi nanti"
  - 6E.3. Pengguna kembali ke halaman login

- **2A.3E. Google Auth gagal:**
  - 2A.3E.1. Layanan Google Auth tidak tersedia atau pengguna membatalkan autentikasi
  - 2A.3E.2. Sistem menampilkan pesan "Login Google gagal. Coba lagi atau gunakan login manual"
  - 2A.3E.3. Pengguna kembali ke halaman login (kembali ke langkah 1)
