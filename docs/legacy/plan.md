Berikut adalah dokumentasi proyek beserta struktur Use Case Diagram dalam format Markdown:

# Dokumentasi Proyek: LMS Gamifikasi

## Latar Belakang

Memutuskan untuk tidak membatasi target pengguna hanya pada siswa atau mahasiswa. Aplikasi ini ditargetkan untuk siapa saja, dari berbagai latar belakang, yang memiliki niat untuk belajar. Prinsip utamanya adalah: **"Tidak ada kata terlambat untuk belajar"**.

## Deskripsi Web App

Aplikasi ini memberikan solusi digital dalam berbagi dan mempelajari ilmu. Pengguna dapat mengunggah dan mempelajari materi dari pengguna lain dengan tema gamifikasi untuk menghindari kebosanan dan meningkatkan motivasi.

* **Sistem XP:** Terdapat 2 kategori XP, yaitu *XP Learner* dan *XP Creator*.
* **XP Learner:** Diperoleh dengan membaca materi dan mengikuti kuis.
* **XP Creator:** Diperoleh dengan membuat/mengunggah materi dan membuat kuis.


* **Sistem Peringkat (Ranked):** XP yang terkumpul akan dikalkulasikan secara berkala untuk menentukan posisi pengguna dalam sistem *leaderboard* (peringkat).
* **Format Konten:** Pembuatan materi dan kuis wajib menggunakan format Markdown. Sistem akan menyediakan *guidebook* (panduan) untuk menyusun materi/kuis agar sesuai dengan standar rendering aplikasi.
* **Manajemen Peran:** Admin bertugas untuk mengelola pengguna, memoderasi materi, mengatur perhitungan XP, mengawasi sistem *ranked*, dan mengelola kuis.

## Aktor (Actors)

1. **Users:** Terbagi menjadi dua aktivitas utama, yaitu sebagai pembelajar (Learner) dan pembuat konten (Creator).
2. **Admin:** Bertanggung jawab atas pengelolaan keseluruhan sistem (pengguna, kuis, materi, ranking).
3. **Google Auth (Sistem Eksternal):** Layanan pihak ketiga yang diintegrasikan untuk memfasilitasi proses *Login* dan *Register* secara lebih cepat.

## Tech Stack Proyek

| Kategori | Teknologi | Keterangan Tambahan |
| --- | --- | --- |
| **Frontend** | React, Tailwind CSS, React Router | Digunakan untuk membangun antarmuka, tata letak yang responsif, dan navigasi pengguna. |
| **Editor & Viewer** | React Markdown | Digunakan untuk mem-*parsing* dan merender konten berformat Markdown dari database ke tampilan UI. |
| **Backend** | Express.js, Axios/Fetch | Membangun RESTful API dan menangani *request/response* HTTP. |
| **Database** | PostgreSQL | Menggunakan *native query* secara langsung tanpa menggunakan ORM (seperti Prisma) untuk optimasi dan kontrol penuh terhadap kueri yang kompleks. |
| **Autentikasi** | JWT & Google Auth | Implementasi keamanan token untuk otorisasi sesi dan integrasi login eksternal. |
| **Penyimpanan** | AWS S3 (Free Tier) | Penyimpanan *cloud* untuk aset statis (gambar/dokumen pendukung materi). |

---