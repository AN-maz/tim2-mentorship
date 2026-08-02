# Use Case Scenario: Mengelola Users

### Use Case Name: Mengelola Users (Admin)

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | UC-12 |
| **Importance Level** | High |
| **Primary Actor** | Admin |
| **Secondary Actor** | - |
| **Use Case Type** | Main Case |
| **Brief Description** | Admin mengelola akun pengguna termasuk melihat daftar, mengubah role, menonaktifkan (suspend), atau menghapus akun pengguna |
| **Stakeholder and Interest** | - **Admin**: Ingin mengelola pengguna untuk menjaga keamanan dan kualitas platform<br>- **Users**: Mengharapkan akun mereka aman dan hanya dikelola dengan alasan yang jelas<br>- **Sistem**: Memastikan integritas data pengguna |
| **Trigger** | Admin mengakses menu "Kelola Users" di dashboard admin |
| **Trigger Type** | External |
| **Preconditions** | - Admin sudah login dengan akun admin<br>- Admin memiliki tingkat akses yang cukup<br>- Sistem dapat mengakses dan memodifikasi database Users |
| **Successful End Condition** | - Perubahan data pengguna berhasil tersimpan di database<br>- Status akun pengguna terupdate sesuai aksi admin<br>- Notifikasi sukses ditampilkan<br>- Log audit tercatat |
| **Failed End Condition** | - Operasi gagal<br>- Data pengguna tidak berubah<br>- Pesan error ditampilkan |

#### 🔗 Relationship
- **Association:** Admin (primary actor)
- **Include:** -
- **Extend:** -
- **Generalization/Inheritance:** -

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. Admin mengakses menu "Kelola Users" di dashboard
2. Sistem mengeksekusi native query untuk mengambil semua data pengguna (SELECT * FROM Akun ORDER BY tanggalDaftar DESC)
3. Sistem menampilkan tabel daftar pengguna dengan kolom: ID, Nama, Email, Role, Status Aktif, Tanggal Daftar, Total XP
4. Sistem menyediakan fitur filter (by role, status) dan pencarian (by nama/email)
5. Admin memilih pengguna tertentu dari daftar
6. Sistem menampilkan detail pengguna dan menu aksi: Edit Role, Suspend Akun, Hapus Akun
7. Admin memilih aksi "Edit Role"
8. Sistem menampilkan dialog dengan pilihan role (User, Admin)
9. Admin memilih role baru
10. Admin mengklik "Simpan"
11. Sistem menerima perintah perubahan role
12. Sistem mengeksekusi native query UPDATE tabel Akun (SET role = '[new_role]' WHERE idAkun = '[id]')
13. Sistem mencatat aksi ke tabel AuditLog (admin_id, action='edit_role', target_user_id, timestamp)
14. Sistem menampilkan notifikasi "Role pengguna berhasil diubah"
15. Sistem merefresh daftar pengguna dengan data terbaru
16. Admin melihat perubahan pada daftar

**Alternate Flows:**
- **7A. Suspend Akun:**
  - 7A.1. Admin memilih aksi "Suspend Akun"
  - 7A.2. Sistem menampilkan dialog konfirmasi "Yakin suspend akun [Nama]? Pengguna tidak dapat login"
  - 7A.3. Admin mengisi alasan suspend (opsional tapi recommended)
  - 7A.4. Admin klik "Ya, Suspend"
  - 7A.5. Sistem mengeksekusi UPDATE Akun SET statusAktif = false, alasanSuspend = '[reason]'
  - 7A.6. Sistem mencatat ke AuditLog
  - 7A.7. Sistem mengirim notifikasi email ke pengguna (opsional)
  - 7A.8. Notifikasi "Akun berhasil disuspend"
  - 7A.9. Pengguna tersebut tidak dapat login lagi sampai diaktifkan kembali

- **7B. Hapus Akun:**
  - 7B.1. Admin memilih aksi "Hapus Akun"
  - 7B.2. Sistem menampilkan peringatan "PERHATIAN: Hapus akun bersifat permanen. Semua data pengguna (materi, kuis, riwayat) akan terhapus. Yakin lanjutkan?"
  - 7B.3. Admin mengetik konfirmasi "HAPUS" untuk verifikasi
  - 7B.4. Admin klik "Ya, Hapus Permanen"
  - 7B.5. Sistem mengeksekusi DELETE cascade (hapus Akun, Materi, Kuis, RiwayatBelajar, Komentar terkait)
  - 7B.6. Sistem menghapus file S3 terkait pengguna
  - 7B.7. Sistem mencatat ke AuditLog
  - 7B.8. Notifikasi "Akun berhasil dihapus"
  - 7B.9. Daftar pengguna diupdate

- **7C. Aktifkan Kembali Akun (Unsuspend):**
  - 7C.1. Admin melihat akun dengan statusAktif = false
  - 7C.2. Admin memilih aksi "Aktifkan Kembali"
  - 7C.3. Sistem menampilkan konfirmasi
  - 7C.4. Admin klik "Ya, Aktifkan"
  - 7C.5. Sistem mengeksekusi UPDATE Akun SET statusAktif = true
  - 7C.6. Sistem mencatat ke AuditLog
  - 7C.7. Pengguna dapat login kembali

- **5A. Melihat detail pengguna:**
  - 5A.1. Admin mengklik nama pengguna
  - 5A.2. Sistem menampilkan halaman detail profil pengguna lengkap (statistik XP, materi/kuis yang dibuat, riwayat aktivitas)
  - 5A.3. Admin dapat melakukan aksi dari halaman detail ini juga

- **4A. Filter dan search:**
  - 4A.1. Admin menggunakan filter "Hanya yang Suspended"
  - 4A.2. Sistem menampilkan hanya pengguna dengan statusAktif = false
  - 4A.3. Admin dapat search by email untuk menemukan pengguna spesifik

**Exceptional Flows:**
- **12E. Database UPDATE gagal:**
  - 12E.1. Query UPDATE gagal dieksekusi
  - 12E.2. Sistem menampilkan pesan error "Gagal mengubah data pengguna. Coba lagi"
  - 12E.3. Tidak ada perubahan pada data pengguna

- **7A.5E. Error saat suspend akun admin lain:**
  - 7A.5E.1. Admin mencoba suspend akun admin lain dengan level yang sama atau lebih tinggi
  - 7A.5E.2. Sistem menampilkan pesan "Anda tidak memiliki akses untuk suspend admin ini"
  - 7A.5E.3. Operasi dibatalkan

- **7B.5E. Error cascade delete:**
  - 7B.5E.1. Sistem gagal menghapus data terkait (foreign key constraint)
  - 7B.5E.2. Sistem menampilkan pesan "Gagal menghapus akun. Hubungi developer"
  - 7B.5E.3. Transaction rollback, tidak ada data yang terhapus

- **2E. Database query error:**
  - 2E.1. Sistem gagal mengambil daftar pengguna
  - 2E.2. Sistem menampilkan pesan "Gagal memuat data pengguna. Coba lagi nanti"
  - 2E.3. Halaman kelola users kosong atau menampilkan placeholder error

- **9E. Role tidak valid:**
  - 9E.1. Admin mencoba set role yang tidak ada dalam sistem
  - 9E.2. Sistem menampilkan pesan "Role tidak valid"
  - 9E.3. Perubahan tidak disimpan
