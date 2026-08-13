# API Contract — LMS Gamifikasi

> **Version:** 1.0
> **Status:** DRAFT
> **Tanggal:** 2026-08-08
> **Guide:** `docs/docs_api_contract.md` (v1.0) — semua aturan traceability, anti-assumption, format, dan ID mengikuti guide ini.
>
> Kontrak ini adalah **satu-satunya acuan komunikasi antara Frontend (React) dan Backend (Express + PostgreSQL native query)**.
> Disusun dari desain yang sudah disetujui: `plan.md` → Use Case → Scenario (`skenario/`) → Activity (`activity/`) → Sequence (`sequence/`) → Class Diagram (`classDiagram.plantuml`).
>
> **Prinsip (Bagian 5 guide):** tidak ada endpoint yang ditambahkan tanpa dasar pada Sequence Diagram / Scenario. Informasi yang belum tersedia ditulis `UNKNOWN` atau `NEEDS CLARIFICATION` (Bagian 7 dokumen ini).

---

## 1. Konvensi Umum

| Poin | Ketetapan |
|---|---|
| **Base URL** | `http://localhost:2026` (nilai `PORT` pada `backend/.env`) |
| **Prefix** | `/api` |
| **Format data** | `application/json` |
| **Envelope sukses** | `{ "success": true, "message"?, "data"? }` |
| **Envelope error** | `{ "success": false, "message"?: "...", "error"?: "..." }` — mengikuti nama field yang ada di sequence per endpoint |
| **ID Dokumen** | `API-<n>` mengikuti urutan Use Case (Bagian 7 & 13 guide) |
| **Penamaan field** | Mengikuti Class Diagram (`classDiagram.plantuml`), mis. `judulMateri`, `status_publik`, `kontenMarkdown` |

### Peta Nama File Traceability

Path relatif terhadap `docs/`.

| Tahap | Dokumen |
|---|---|
| Requirement | `plan.md` |
| Use Case Diagram | `usd.plantuml` |
| Scenario | `skenario/UC-XX-*.md` |
| Activity | `activity/UC-XX-*.plantuml` |
| Sequence | `sequence/UC-XX-*.plantuml` |
| Class | `classDiagram.plantuml` |

---

## 2. Autentikasi

Sistem menggunakan **JWT** dengan role-based access (`Akun.role`: `user` / `admin`) — lihat `plan.md` → Tech Stack → Autentikasi.

| Level | Ketentuan |
|---|---|
| **Public** | Tanpa header `Authorization` (hanya endpoint auth: login/register). |
| **Required** | Wajib `Authorization: Bearer <TOKEN>` (token dari `POST /api/auth/login`, `google-login`, atau `google-register`). |
| **Role Admin** | JWT dengan `role = "admin"`. |

Request header standar:

```http
Content-Type: application/json
Authorization: Bearer <TOKEN>
```

---

## 3. Ringkasan Endpoint

| API ID | UC | Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|---|---|
| API-001 | UC-01 | POST | `/api/auth/login` | Public | Login manual (email + password) |
| API-002 | UC-01 | POST | `/api/auth/google-login` | Public | Login via Google Auth |
| API-003 | UC-02 | POST | `/api/auth/register` | Public | Registrasi manual |
| API-004 | UC-02 | POST | `/api/auth/google-register` | Public | Registrasi via Google Auth |
| API-005 | UC-03 | GET | `/api/materi` | JWT | Daftar materi publik |
| API-006 | UC-03 | GET | `/api/materi/:id` | JWT | Detail materi + increment view |
| API-007 | UC-04 | GET | `/api/materi/search` | JWT | Pencarian materi |
| API-008 | UC-05 | POST | `/api/rating` | JWT | Beri rating (konfirmasi bila sudah ada) |
| API-009 | UC-05 | POST | `/api/rating/update` | JWT | Konfirmasi ubah rating lama |
| API-010 | UC-06 | POST | `/api/komentar` | JWT | Tambah komentar |
| API-011 | UC-06 | PUT | `/api/komentar/:id` | JWT | Edit komentar sendiri |
| API-012 | UC-06 | DELETE | `/api/komentar/:id` | JWT | Hapus komentar sendiri |
| API-013 | UC-07 | POST | `/api/riwayat-belajar/complete` | JWT | Tandai materi selesai (+XP Learner) |
| API-014 | UC-08 | GET | `/api/kuis/:id` | JWT | Informasi kuis |
| API-015 | UC-08 | GET | `/api/kuis/:id/soal` | JWT | Daftar soal (tanpa kunci) |
| API-016 | UC-08 | POST | `/api/kuis/:id/submit` | JWT | Submit jawaban kuis |
| API-017 | UC-09 | GET | `/api/leaderboard` | JWT | Ranking & posisi pengguna |
| API-018 | UC-10 | GET | `/api/materi/my-materi` | JWT (Creator) | Materi milik user |
| API-019 | UC-10 | GET | `/api/materi/:id/edit` | JWT (Creator) | Data materi untuk editor |
| API-020 | UC-10 | POST | `/api/materi` | JWT (Creator) | Tambah materi (+XP Creator) |
| API-021 | UC-10 | PUT | `/api/materi/:id` | JWT (Creator) | Edit materi (+XP lebih kecil) |
| API-022 | UC-10 | DELETE | `/api/materi/:id` | JWT (Creator) | Hapus materi |
| API-023 | UC-11 | GET | `/api/kuis/my-kuis` | JWT (Creator) | Kuis milik user |
| API-024 | UC-11 | GET | `/api/kuis/:id/edit` | JWT (Creator) | Kuis untuk editor (+soal) |
| API-025 | UC-11 | POST | `/api/kuis` | JWT (Creator) | Buat kuis (+XP Creator) |
| API-026 | UC-11 | PUT | `/api/kuis/:id` | JWT (Creator) | Ubah kuis (+XP lebih kecil) |
| API-027 | UC-11 | DELETE | `/api/kuis/:id` | JWT (Creator) | Hapus kuis |
| API-028 | UC-12 | GET | `/api/admin/users` | Admin | Daftar semua pengguna |
| API-029 | UC-12 | PUT | `/api/admin/users/:id/role` | Admin | Ubah role pengguna |
| API-030 | UC-12 | PUT | `/api/admin/users/:id/suspend` | Admin | Nonaktifkan (suspend) akun |
| API-031 | UC-12 | PUT | `/api/admin/users/:id/unsuspend` | Admin | Aktifkan kembali akun |
| API-032 | UC-12 | DELETE | `/api/admin/users/:id` | Admin | Hapus permanen akun (+cascade) |
| API-033 | UC-13 | GET | `/api/admin/content` | Admin | Daftar semua konten (materi + kuis) |
| API-034 | UC-13 | GET | `/api/admin/content/:id` | Admin | Detail konten + creator |
| API-035 | UC-13 | PUT | `/api/admin/content/:id/moderate` | Admin | Sembunyikan konten |
| API-036 | UC-13 | PUT | `/api/admin/content/:id/approve` | Admin | Pulihkan / approve konten |
| API-037 | UC-13 | DELETE | `/api/admin/content/:id` | Admin | Hapus permanen konten |
| API-038 | UC-13 | GET | `/api/admin/content/:id/history` | Admin | Riwayat moderasi konten |
| API-039 | UC-14 | GET | `/api/admin/xp-config` | Admin | Konfigurasi XP + statistik leaderboard |
| API-040 | UC-14 | PUT | `/api/admin/xp-config` | Admin | Ubah bobot XP |
| API-041 | UC-14 | GET | `/api/admin/season/current` | Admin | Season aktif + top winners |
| API-042 | UC-14 | POST | `/api/admin/season/reset` | Admin | Reset season (arsip + reset XP) |
| API-043 | UC-14 | POST | `/api/admin/xp/recalculate` | Admin | Mulai job rekalkulasi XP |
| API-044 | UC-14 | GET | `/api/admin/xp/recalculate/status` | Admin | Status job rekalkulasi |
| API-045 | UC-14 | GET | `/api/admin/rank-tiers` | Admin | Threshold rank saat ini |
| API-046 | UC-14 | PUT | `/api/admin/rank-tiers` | Admin | Ubah threshold rank |

**Total: 46 endpoint** — seluruhnya diturunkan dari Sequence Diagram dan Scenario.

---

## 4. Detail Kontrak

## Bagian A — Autentikasi (UC-01, UC-02)

Sumber: `skenario/UC-01-Login.md`, `skenario/UC-02-Register.md`, `sequence/UC-01-Login.plantuml`, `sequence/UC-02-Register.plantuml`. Model: `Akun`, `Pengguna`.

---

### API-001 — Login Manual

#### Traceability

| Dokumen | Referensi |
|---|---|
| Requirement | `plan.md` — Autentikasi JWT & Google Auth |
| Use Case | UC-01 (`usd.plantuml`) |
| Scenario | `skenario/UC-01-Login.md` |
| Activity | `activity/UC-01-Login.plantuml` |
| Sequence | `sequence/UC-01-Login.plantuml` |
| Class | `Akun` |

#### Endpoint

`POST /api/auth/login`

#### Purpose

Login pengguna/admin dengan kredensial manual (email & password) dan menghasilkan token JWT.

#### Authentication

Public (tanpa token).

#### Request Headers

| Header | Type | Required | Description |
|---|---|---|---|
| Content-Type | string | Yes | `application/json` |

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| email | string | Yes | Format email valid | Email akun terdaftar |
| password | string | Yes | UNKNOWN | Password akun |

#### Request Example

```json
{
  "email": "user@gmail.com",
  "password": "password"
}
```

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "token": "<JWT>",
  "user": {
    "id": "uuid",
    "namaLengkap": "Budi Santoso",
    "email": "budi@gmail.com",
    "role": "user",
    "statusAktif": true
  }
}
```

#### Error Response

##### 401 Unauthorized — kredensial salah

```json
{ "success": false, "error": "Email atau password salah" }
```

##### 403 Forbidden — akun `statusAktif = false`

```json
{ "success": false, "error": "Akun tidak aktif" }
```

##### 500 Internal Server Error

```json
{ "success": false, "error": "Terjadi kesalahan sistem. Coba lagi nanti" }
```

---

### API-002 — Google Login

#### Traceability

| Dokumen | Referensi |
|---|---|
| Requirement | `plan.md` — Google Auth |
| Use Case | UC-01 |
| Scenario | `skenario/UC-01-Login.md` (Alternate Flow 2A) |
| Activity | `activity/UC-01-Login.plantuml` |
| Sequence | `sequence/UC-01-Login.plantuml` |
| Class | `Akun` (`googleId`) |

#### Endpoint

`POST /api/auth/google-login`

#### Purpose

Login via Google Auth; token Google diverifikasi lalu email dicari di tabel `Akun`.

#### Authentication

Public (tanpa token).

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| token | string | Yes | Token valid dari Google | Token yang dikembalikan Google Auth |

#### Request Example

```json
{ "token": "<Google token>" }
```

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "token": "<JWT>",
  "user": {
    "id": "uuid",
    "namaLengkap": "Budi Santoso",
    "email": "budi@gmail.com",
    "role": "user"
  }
}
```

#### Error Response

##### 404 Not Found — akun belum terdaftar

```json
{ "success": false, "error": "Akun belum terdaftar" }
```

##### 500 Internal Server Error

```json
{ "success": false, "error": "Terjadi kesalahan sistem" }
```

---

### API-003 — Register

#### Traceability

| Dokumen | Referensi |
|---|---|
| Requirement | `plan.md` — akun baru, email unik |
| Use Case | UC-02 |
| Scenario | `skenario/UC-02-Register.md` |
| Activity | `activity/UC-02-Register.plantuml` |
| Sequence | `sequence/UC-02-Register.plantuml` |
| Class | `Pengguna`, `Akun` |

#### Endpoint

`POST /api/auth/register`

#### Purpose

Membuat akun pengguna baru. Password di-hash (bcrypt), XP awal 0, `statusAktif = true`.

#### Authentication

Public.

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| namaLengkap | string | Yes | UNKNOWN | Nama lengkap pengguna |
| email | string | Yes | Format email valid | Email unik dalam sistem |
| password | string | Yes | Minimal 8 karakter | Password akun (di-hash) |

#### Request Example

```json
{
  "namaLengkap": "Citra Dewi",
  "email": "citra@gmail.com",
  "password": "password123"
}
```

#### Success Response

##### 201 Created

```json
{ "success": true }
```

#### Error Response

##### 400 Bad Request — format tidak valid

```json
{ "success": false, "error": "Format tidak valid" }
```

##### 409 Conflict — email sudah terdaftar

```json
{ "success": false, "error": "Email sudah digunakan" }
```

##### 500 Internal Server Error

```json
{ "success": false, "error": "Terjadi kesalahan sistem. Coba lagi nanti" }
```

---

### API-004 — Registrasi via Google

#### Traceability

| Dokumen | Referensi |
|---|---|
| Requirement | `plan.md` — Google Auth |
| Use Case | UC-02 |
| Scenario | `skenario/UC-02-Register.md` (Alternate Flow 2A) |
| Activity | `activity/UC-02-Register.plantuml` |
| Sequence | `sequence/UC-02-Register.plantuml` |
| Class | `Pengguna`, `Akun` (`googleId`) |

#### Endpoint

`POST /api/auth/google-register`

#### Purpose

Registrasi memakai profil Google (nama, email, `googleId`) tanpa password, lalu langsung menghasilkan token.

#### Authentication

Public.

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| token | string | Yes | Token valid Google | Token berisi profil (nama, email) |

#### Request Example

```json
{ "token": "<Google token>" }
```

#### Success Response

##### 201 Created

```json
{
  "success": true,
  "token": "<JWT>",
  "user": {
    "id": "uuid",
    "namaLengkap": "Citra Dewi",
    "email": "citra@gmail.com",
    "role": "user",
    "xpLearner": 0,
    "xpCreator": 0,
    "totalXP": 0
  }
}
```

#### Error Response

##### 409 Conflict — email sudah terdaftar

```json
{ "success": false, "error": "Email sudah digunakan" }
```

##### 500 Internal Server Error

```json
{ "success": false, "error": "Terjadi kesalahan sistem" }
```

---

## Bagian B — Materi Publik (UC-03, UC-04)

Sumber: `skenario/UC-03-Melihat-Materi.md`, `skenario/UC-04-Mencari-Materi.md`, `sequence/UC-03-Melihat-Materi.plantuml`, `sequence/UC-04-Mencari-Materi.plantuml`. Model: `Materi`.

Aturan: hanya konten dengan `status_publik = true` yang dikembalikan.

---

### API-005 — Daftar Materi Publik

#### Traceability

| Dokumen | Referensi |
|---|---|
| Requirement | `plan.md` — solusi digital berbagi & mempelajari ilmu |
| Use Case | UC-03 |
| Scenario | `skenario/UC-03-Melihat-Materi.md` |
| Activity | `activity/UC-03-Melihat-Materi.plantuml` |
| Sequence | `sequence/UC-03-Melihat-Materi.plantuml` |
| Class | `Materi` |

#### Endpoint

`GET /api/materi`

#### Purpose

Mengambil daftar materi publik, diurutkan `tanggalUnggah` menurun.

#### Authentication

Required (JWT).

#### Query Parameters

Tidak ada parameter pada sequence diagram.

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": [
    {
      "idMateri": 1,
      "judulMateri": "Pengenalan JavaScript",
      "idPenulis": 2,
      "penulis": "Budi Santoso",
      "ratingRataRata": 4.5,
      "totalDilihat": 152,
      "tanggalUnggah": "2026-07-05T00:00:00.000Z",
      "status_publik": true
    }
  ]
}
```

Jika kosong:

```json
{ "success": true, "data": [] }
```

#### Error Response

##### 401 Unauthorized

##### 500 Internal Server Error

```json
{ "success": false, "error": "Terjadi kesalahan sistem. Coba lagi nanti" }
```

---

### API-006 — Detail Materi

#### Traceability

| Dokumen | Referensi |
|---|---|
| Requirement | `plan.md` |
| Use Case | UC-03 |
| Scenario | `skenario/UC-03-Melihat-Materi.md` |
| Activity | `activity/UC-03-Melihat-Materi.plantuml` |
| Sequence | `sequence/UC-03-Melihat-Materi.plantuml` |
| Class | `Materi` |

#### Endpoint

`GET /api/materi/:id`

#### Purpose

Mengambil detail materi lengkap (termasuk `kontenMarkdown`) dan menaikkan `totalDilihat` + 1. Hanya `status_publik = true`.

#### Authentication

Required (JWT).

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | `idMateri` |

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": {
    "idMateri": 1,
    "judulMateri": "Pengenalan JavaScript",
    "kontenMarkdown": "# ...",
    "idPenulis": 2,
    "penulis": "Budi Santoso",
    "tanggalUnggah": "2026-07-05T00:00:00.000Z",
    "tanggalEdit": null,
    "totalDilihat": 152,
    "ratingRataRata": 4.5,
    "fileUrls": ["https://s3.../gambar1.png"]
  }
}
```

#### Error Response

##### 404 Not Found

```json
{ "success": false, "error": "Materi tidak ditemukan" }
```

##### 500 Internal Server Error

---

### API-007 — Cari Materi

#### Traceability

| Dokumen | Referensi |
|---|---|
| Requirement | `plan.md` |
| Use Case | UC-04 |
| Scenario | `skenario/UC-04-Mencari-Materi.md` |
| Activity | `activity/UC-04-Mencari-Materi.plantuml` |
| Sequence | `sequence/UC-04-Mencari-Materi.plantuml` |
| Class | `Materi` |

#### Endpoint

`GET /api/materi/search`

#### Purpose

Mencari materi pada `judulMateri` atau `kontenMarkdown` (hanya `status_publik = true`), diurutkan `tanggalUnggah` menurun.

#### Authentication

Required (JWT).

#### Query Parameters

| Parameter | Type | Required | Validation | Description |
|---|---|---|---|---|
| keyword | string | Yes | Minimal 3 karakter | Kata kunci pencarian |

#### Success Response

##### 200 OK — ada hasil

```json
{
  "success": true,
  "data": [
    {
      "idMateri": 2,
      "judulMateri": "SQL & PostgreSQL",
      "penulis": "Citra Dewi",
      "ratingRataRata": 4,
      "totalDilihat": 98,
      "tanggalUnggah": "2026-07-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

##### 200 OK — tidak ada hasil

```json
{ "success": true, "data": [], "message": "Tidak ada hasil" }
```

#### Error Response

##### 400 Bad Request — kata kunci < 3 karakter (validasi client-side pada sequence)

##### 500 Internal Server Error

```json
{ "success": false, "error": "Pencarian gagal. Coba lagi nanti" }
```

---

## Bagian C — Interaksi Materi (UC-05, UC-06, UC-07)

Sumber: `skenario/UC-05-Memberi-Rating.md`, `skenario/UC-06-Memberi-Komentar.md`, `skenario/UC-07-Belajar-Materi.md`, `sequence/UC-05-Memberi-Rating.plantuml`, `sequence/UC-06-Memberi-Komentar.plantuml`, `sequence/UC-07-Belajar-Materi.plantuml`. Model: `Rating`, `Komentar`, `RiwayatBelajar`, `Pengguna`.

---

### API-008 — Tambah Rating

#### Traceability

| Dokumen | Referensi |
|---|---|
| Requirement | `plan.md` — feedback kualitas materi |
| Use Case | UC-05 |
| Scenario | `skenario/UC-05-Memberi-Rating.md` |
| Activity | `activity/UC-05-Memberi-Rating.plantuml` |
| Sequence | `sequence/UC-05-Memberi-Rating.plantuml` |
| Class | `Rating`, `Materi` |

#### Endpoint

`POST /api/rating`

#### Purpose

Memberi rating (1–5) pada materi. Jika user sudah pernah rating, sistem menandai `confirm: true` agar client menampilkan dialog konfirmasi (lanjut ke API-009).

#### Authentication

Required (JWT).

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| idMateri | integer | Yes | UNKNOWN | Materi yang dirating |
| idPengguna | uuid | Yes | UNKNOWN | User pemberi rating |
| nilaiRating | integer | Yes | 1 – 5 | Bintang rating |

#### Request Example

```json
{ "idMateri": 1, "idPengguna": "uuid", "nilaiRating": 4 }
```

#### Success Response

##### 201 Created — rating baru

```json
{
  "success": true,
  "message": "Rating berhasil",
  "newAverage": 4.5
}
```

##### 200 OK — sudah pernah rating (perlu konfirmasi)

```json
{
  "success": false,
  "message": "Sudah rating",
  "currentRating": 4,
  "confirm": true
}
```

#### Error Response

##### 400 Bad Request — nilai di luar 1–5

```json
{ "success": false, "error": "Rating harus 1-5" }
```

##### 500 Internal Server Error

---

### API-009 — Ubah Rating (Konfirmasi)

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-05 |
| Scenario | `skenario/UC-05-Memberi-Rating.md` (Alternate 6A) |
| Sequence | `sequence/UC-05-Memberi-Rating.plantuml` |
| Class | `Rating`, `Materi` |

#### Endpoint

`POST /api/rating/update`

#### Purpose

Meng-update rating lama pengguna pada materi yang sama, dipanggil setelah user memilih "Ya, Ubah".

#### Authentication

Required (JWT).

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| forceUpdate | boolean | Yes | `true` | Wajib setelah konfirmasi user |
| nilaiRating | integer | Yes | 1 – 5 | Rating baru |

#### Request Example

```json
{ "forceUpdate": true, "nilaiRating": 4 }
```

#### Success Response

##### 200 OK

```json
{ "success": true }
```

Catatan: setelah update, sistem mengkalkulasi ulang `ratingRataRata` materi.

#### Error Response

##### 400 Bad Request

```json
{ "success": false, "error": "Rating harus 1-5" }
```

---

### API-010 — Tambah Komentar

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-06 |
| Scenario | `skenario/UC-06-Memberi-Komentar.md` |
| Activity | `activity/UC-06-Memberi-Komentar.plantuml` |
| Sequence | `sequence/UC-06-Memberi-Komentar.plantuml` |
| Class | `Komentar` |

#### Endpoint

`POST /api/komentar`

#### Purpose

Menambahkan komentar pada materi. Validasi: tidak kosong, maks 1000 karakter, sanitasi konten.

#### Authentication

Required (JWT).

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| idMateri | integer | Yes | UNKNOWN | Materi target |
| idPengguna | uuid | Yes | UNKNOWN | Penulis komentar |
| teksKomentar | text | Yes | Tidak kosong; maks 1000 karakter | Isi komentar |
| tanggal | datetime | Yes | UNKNOWN | Waktu kirim |

#### Request Example

```json
{
  "idMateri": 1,
  "idPengguna": "uuid",
  "teksKomentar": "Materi yang sangat membantu!",
  "tanggal": "2026-07-08T14:30:00.000Z"
}
```

#### Success Response

##### 201 Created

```json
{
  "success": true,
  "data": {
    "idKomentar": 4,
    "idMateri": 1,
    "idPengguna": "uuid",
    "teksKomentar": "Materi yang sangat membantu!",
    "tanggal": "2026-07-08T14:30:00.000Z",
    "tanggalEdit": null
  }
}
```

#### Error Response

##### 400 Bad Request — komentar tidak valid / konten tidak pantas

```json
{ "success": false, "error": "Komentar tidak valid" }
{ "success": false, "error": "Konten tidak pantas" }
```

##### 500 Internal Server Error

```json
{ "success": false, "error": "Gagal mengirim komentar. Coba lagi nanti" }
```

---

### API-011 — Ubah Komentar

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-06 |
| Scenario | `skenario/UC-06-Memberi-Komentar.md` (Alternate 12A) |
| Sequence | `sequence/UC-06-Memberi-Komentar.plantuml` |
| Class | `Komentar` |

#### Endpoint

`PUT /api/komentar/:id`

#### Purpose

Meng-update teks komentar miliknya sendiri (`WHERE idKomentar = id AND idPengguna = userId`).

#### Authentication

Required (JWT).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Request Body

| Field | Type | Required | Validation |
|---|---|---|---|
| teksKomentar | text | Yes | Tidak kosong; maks 1000 karakter |

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 403 Forbidden — bukan pemilik

##### 400 Bad Request — tidak valid

---

### API-012 — Hapus Komentar

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-06 |
| Scenario | `skenario/UC-06-Memberi-Komentar.md` (Alternate 12B) |
| Sequence | `sequence/UC-06-Memberi-Komentar.plantuml` |
| Class | `Komentar` |

#### Endpoint

`DELETE /api/komentar/:id`

#### Purpose

Menghapus komentar sendiri (`WHERE idKomentar = id AND idPengguna = userId`).

#### Authentication

Required (JWT).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 403 Forbidden — bukan pemilik

---

### API-013 — Tandai Materi Selesai

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-07 |
| Scenario | `skenario/UC-07-Belajar-Materi.md` |
| Activity | `activity/UC-07-Belajar-Materi.plantuml` |
| Sequence | `sequence/UC-07-Belajar-Materi.plantuml` |
| Class | `RiwayatBelajar`, `Pengguna` |

#### Endpoint

`POST /api/riwayat-belajar/complete`

#### Purpose

Mencatat materi selesai dibaca, memberikan XP Learner (base 10 XP), update `xpLearner` & `totalXP`, dan mengecek kenaikan rank. Hanya dapat sekali per materi.

#### Authentication

Required (JWT).

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| idPengguna | uuid | Yes | UNKNOWN | User yang menyelesaikan |
| idKonten | integer | Yes | `idMateri` | Materi yang diselesaikan |
| tipeKonten | string | Yes | `materi` | Jenis konten |

#### Request Example

```json
{ "idPengguna": "uuid", "idKonten": 1, "tipeKonten": "materi" }
```

#### Success Response

##### 200 OK — berhasil (dengan/selain rank naik)

```json
{ "success": true, "xpGained": 10, "rankUp": true, "newRank": "Bronze" }
```

```json
{ "success": true, "xpGained": 10, "rankUp": false }
```

##### 200 OK — sudah pernah diselesaikan

```json
{ "success": false, "message": "Sudah diselesaikan", "alreadyCompleted": true }
```

#### Error Response

##### 500 Internal Server Error

```json
{ "success": false, "error": "Gagal menyimpan progress. Coba lagi" }
```

---

## Bagian D — Mengikuti Kuis (UC-08)

Sumber: `skenario/UC-08-Mengikuti-Kuis.md`, `sequence/UC-08-Mengikuti-Kuis.plantuml`. Model: `Kuis`, `Soal`, `KunciJawaban`, `RiwayatBelajar`, `Pengguna`.

---

### API-014 — Info Kuis

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-08 |
| Scenario | `skenario/UC-08-Mengikuti-Kuis.md` |
| Activity | `activity/UC-08-Mengikuti-Kuis.plantuml` |
| Sequence | `sequence/UC-08-Mengikuti-Kuis.plantuml` |
| Class | `Kuis` |

#### Endpoint

`GET /api/kuis/:id`

#### Purpose

Mengambil informasi kuis: judul, jumlah soal, batas waktu, poin (tanpa daftar soal).

#### Authentication

Required (JWT).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": {
    "idKuis": 1,
    "judulKuis": "Kuis JavaScript Dasar",
    "idMateriTerkait": 1,
    "aturanMarkdown": "# Aturan...",
    "batasWaktuMenit": 5,
    "poinXPDefault": 10,
    "jumlahSoal": 3
  }
}
```

#### Error Response

##### 404 Not Found

##### 500 Internal Server Error

---

### API-015 — Soal Kuis

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-08 |
| Scenario | `skenario/UC-08-Mengikuti-Kuis.md` |
| Sequence | `sequence/UC-08-Mengikuti-Kuis.plantuml` |
| Class | `Soal` |

#### Endpoint

`GET /api/kuis/:id/soal`

#### Purpose

Mengambil daftar soal kuis diurutkan oleh `urutan`, **tanpa kunci jawaban** (untuk dikerjakan learner).

#### Authentication

Required (JWT).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": [
    {
      "idSoal": 10,
      "idKuis": 1,
      "pertanyaanMarkdown": "Apa tipe data bilangan bulat di JavaScript?",
      "opsiA": "int",
      "opsiB": "number",
      "opsiC": "float",
      "opsiD": "integer",
      "urutan": 1
    }
  ]
}
```

#### Error Response

##### 404 Not Found

##### 500 Internal Server Error

---

### API-016 — Submit Jawaban Kuis

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-08 |
| Scenario | `skenario/UC-08-Mengikuti-Kuis.md` |
| Activity | `activity/UC-08-Mengikuti-Kuis.plantuml` |
| Sequence | `sequence/UC-08-Mengikuti-Kuis.plantuml` |
| Class | `Soal`, `KunciJawaban`, `RiwayatBelajar`, `Pengguna` |

#### Endpoint

`POST /api/kuis/:id/submit`

#### Purpose

Menyerahkan jawaban untuk dievaluasi. Skor = benar/total × 100; XP Learner dihitung dari skor; simpan `RiwayatBelajar` (termasuk `skor`) dan update XP pengguna.

#### Authentication

Required (JWT).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| idPengguna | uuid | Yes | UNKNOWN | User pengerja |
| idKuis | integer | Yes | sama dengan id path | Kuis yang dikerjakan |
| jawaban | array | Yes | Minimal 1 item | Daftar jawaban |
| jawaban[].idSoal | integer | Yes | UNKNOWN | ID soal |
| jawaban[].jawabanDipilih | string | Yes | A/B/C/D | Opsi yang dipilih |
| waktuPengerjaan | number | Yes | UNKNOWN | Durasi pengerjaan |

#### Request Example

```json
{
  "idPengguna": "uuid",
  "idKuis": 1,
  "jawaban": [
    { "idSoal": 10, "jawabanDipilih": "B" },
    { "idSoal": 11, "jawabanDipilih": "A" }
  ],
  "waktuPengerjaan": 120
}
```

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "skor": 80,
  "benar": 2,
  "total": 4,
  "xpGained": 40,
  "detailJawaban": [
    { "idSoal": 10, "benar": true },
    { "idSoal": 11, "benar": false }
  ]
}
```

#### Error Response

##### 500 Internal Server Error — kunci jawaban tidak ditemukan

```json
{ "success": false, "error": "Kunci jawaban tidak ditemukan" }
```

---

## Bagian E — Leaderboard (UC-09)

Sumber: `skenario/UC-09-Melihat-Leaderboard.md`, `sequence/UC-09-Melihat-Leaderboard.plantuml`. Model: `Pengguna`, `RiwayatBelajar`.

---

### API-017 — Leaderboard

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-09 |
| Scenario | `skenario/UC-09-Melihat-Leaderboard.md` |
| Activity | `activity/UC-09-Melihat-Leaderboard.plantuml` |
| Sequence | `sequence/UC-09-Melihat-Leaderboard.plantuml` |
| Class | `Pengguna`, `RiwayatBelajar` |

#### Endpoint

`GET /api/leaderboard`

#### Purpose

Menampilkan ranking pengguna berdasarkan kategori dan periode, dengan pagination (top 100 per request).

#### Authentication

Required (JWT).

#### Query Parameters

| Parameter | Type | Required | Values | Description |
|---|---|---|---|---|
| category | string | Yes | `total`, `learner`, `creator` | Statistik acuan ranking |
| period | string | Yes | `all`, `week`, `month` | Periode waktu |
| offset | integer | No | >= 0 | Offset pagination |
| limit | integer | No | default 100 | Jumlah per halaman |

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "idAkun": "uuid",
      "namaLengkap": "Andi Pratama",
      "totalXP": 220,
      "xpLearner": 180,
      "xpCreator": 40,
      "rankPeringkat": "Bronze"
    }
  ],
  "userPosition": 12,
  "userRank": "Bronze"
}
```

Data kosong:

```json
{ "success": true, "data": [], "message": "Belum ada data" }
```

#### Error Response

##### 500 Internal Server Error

```json
{ "success": false, "error": "Gagal memuat leaderboard. Coba lagi nanti" }
```

---

## Bagian F — Kelola Materi (UC-10)

Sumber: `skenario/UC-10-Kelola-Materi.md`, `sequence/UC-10-Kelola-Materi.plantuml`. Model: `Materi`, `Pengguna`. Storage: AWS S3 (`fileUrls`).

---

### API-018 — Daftar Materi Saya

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-10 |
| Scenario | `skenario/UC-10-Kelola-Materi.md` |
| Sequence | `sequence/UC-10-Kelola-Materi.plantuml` |
| Class | `Materi` |

#### Endpoint

`GET /api/materi/my-materi`

#### Purpose

Mengambil materi milik user (creator) yang sedang login, diurutkan `tanggalUnggah` menurun.

#### Authentication

Required (JWT, Creator).

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": [
    {
      "idMateri": 1,
      "judulMateri": "Pengenalan JavaScript",
      "tanggalUnggah": "2026-07-05T00:00:00.000Z",
      "status_publik": true,
      "totalDilihat": 152
    }
  ]
}
```

---

### API-019 — Ambil Materi untuk Edit

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-10 |
| Scenario | `skenario/UC-10-Kelola-Materi.md` (Alternate 3A) |
| Sequence | `sequence/UC-10-Kelola-Materi.plantuml` |
| Class | `Materi` |

#### Endpoint

`GET /api/materi/:id/edit`

#### Purpose

Menampilkan editor dengan data existing; memeriksa kepemilikan (`idPenulis == userId`).

#### Authentication

Required (JWT, Creator).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": {
    "idMateri": 1,
    "judulMateri": "Pengenalan JavaScript",
    "kontenMarkdown": "# ...",
    "fileUrls": ["https://s3.../gambar1.png"]
  }
}
```

#### Error Response

##### 403 Forbidden — bukan pemilik

```json
{ "success": false, "error": "Unauthorized" }
```

---

### API-020 — Tambah Materi

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-10 |
| Scenario | `skenario/UC-10-Kelola-Materi.md` |
| Activity | `activity/UC-10-Kelola-Materi.plantuml` |
| Sequence | `sequence/UC-10-Kelola-Materi.plantuml` |
| Class | `Materi`, `Pengguna` |

#### Endpoint

`POST /api/materi`

#### Purpose

Menyimpan materi baru (Markdown), upload file ke AWS S3 (opsional), lalu memberi XP Creator (20 XP default).

#### Authentication

Required (JWT, Creator).

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| judulMateri | string | Yes | UNKNOWN | Judul materi |
| kontenMarkdown | text | Yes | Validasi struktur Markdown + sanitasi | Konten materi |
| idPenulis | uuid | Yes | UNKNOWN | Penulis materi |
| fileUrls | array | No | UNKNOWN | URL file dari S3 |

#### Request Example

```json
{
  "judulMateri": "Pengenalan JavaScript",
  "kontenMarkdown": "# Pengenalan JavaScript\n\n**JavaScript** adalah...",
  "idPenulis": "uuid",
  "fileUrls": ["https://s3.../gambar1.png"]
}
```

#### Success Response

##### 201 Created

```json
{
  "success": true,
  "materiId": 6,
  "xpGained": 20
}
```

#### Error Response

##### 400 Bad Request — markdown tidak valid

```json
{ "success": false, "error": "Format Markdown tidak valid" }
```

##### 500 Internal Server Error — gagal simpan / upload S3

---

### API-021 — Edit Materi

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-10 |
| Scenario | `skenario/UC-10-Kelola-Materi.md` (Alternate 3A) |
| Sequence | `sequence/UC-10-Kelola-Materi.plantuml` |
| Class | `Materi`, `Pengguna` |

#### Endpoint

`PUT /api/materi/:id`

#### Purpose

Memperbarui judul/konten/file materi miliknya sendiri; memberi XP Creator lebih kecil (5 XP default).

#### Authentication

Required (JWT, Creator).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Request Body

| Field | Type | Required | Validation |
|---|---|---|---|
| judulMateri | string | Yes | UNKNOWN |
| kontenMarkdown | text | Yes | Validasi Markdown + sanitasi |
| fileUrls | array | No | UNKNOWN |

#### Success Response

##### 200 OK

```json
{ "success": true, "xpGained": 5 }
```

#### Error Response

##### 403 Forbidden — bukan pemilik

```json
{ "success": false, "error": "Unauthorized" }
```

##### 400 Bad Request

---

### API-022 — Hapus Materi

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-10 |
| Scenario | `skenario/UC-10-Kelola-Materi.md` (Alternate 3B) |
| Sequence | `sequence/UC-10-Kelola-Materi.plantuml` |
| Class | `Materi` |

#### Endpoint

`DELETE /api/materi/:id`

#### Purpose

Menghapus materi miliknya sendiri, termasuk file terkait dari AWS S3.

#### Authentication

Required (JWT, Creator).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 403 Forbidden — bukan pemilik

##### 500 Internal Server Error

---

## Bagian G — Kelola Kuis (UC-11)

Sumber: `skenario/UC-11-Kelola-Kuis.md`, `sequence/UC-11-Kelola-Kuis.plantuml`. Model: `Kuis`, `Soal`, `KunciJawaban`, `Pengguna`.

---

### API-023 — Daftar Kuis Saya

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-11 |
| Scenario | `skenario/UC-11-Kelola-Kuis.md` |
| Sequence | `sequence/UC-11-Kelola-Kuis.plantuml` |
| Class | `Kuis` |

#### Endpoint

`GET /api/kuis/my-kuis`

#### Purpose

Mengambil kuis milik user (creator) yang sedang login, diurutkan `tanggalBuat` menurun.

#### Authentication

Required (JWT, Creator).

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": [
    {
      "idKuis": 1,
      "judulKuis": "Kuis JavaScript Dasar",
      "idMateriTerkait": 1,
      "batasWaktuMenit": 5,
      "poinXPDefault": 10,
      "tanggalBuat": "2026-07-06T00:00:00.000Z",
      "status_publik": true
    }
  ]
}
```

---

### API-024 — Ambil Kuis untuk Edit

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-11 |
| Scenario | `skenario/UC-11-Kelola-Kuis.md` (Alternate 3A) |
| Sequence | `sequence/UC-11-Kelola-Kuis.plantuml` |
| Class | `Kuis`, `Soal`, `KunciJawaban` |

#### Endpoint

`GET /api/kuis/:id/edit`

#### Purpose

Menampilkan editor dengan data kuis, soal, dan kunci jawaban existing; memeriksa kepemilikan (`idCreator == userId`).

#### Authentication

Required (JWT, Creator).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": {
    "idKuis": 1,
    "judulKuis": "Kuis JavaScript Dasar",
    "idMateriTerkait": 1,
    "aturanMarkdown": "# Aturan...",
    "batasWaktuMenit": 5,
    "poinXPDefault": 10,
    "soal": [
      {
        "idSoal": 10,
        "pertanyaanMarkdown": "Apa tipe data bilangan bulat di JavaScript?",
        "opsiA": "int",
        "opsiB": "number",
        "opsiC": "float",
        "opsiD": "integer",
        "urutan": 1,
        "jawabanBenar": "B"
      }
    ]
  }
}
```

#### Error Response

##### 403 Forbidden — bukan pembuat

```json
{ "success": false, "error": "Unauthorized" }
```

---

### API-025 — Buat Kuis

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-11 |
| Scenario | `skenario/UC-11-Kelola-Kuis.md` |
| Activity | `activity/UC-11-Kelola-Kuis.plantuml` |
| Sequence | `sequence/UC-11-Kelola-Kuis.plantuml` |
| Class | `Kuis`, `Soal`, `KunciJawaban`, `Pengguna` |

#### Endpoint

`POST /api/kuis`

#### Purpose

Membuat kuis baru beserta soal dan kunci jawaban, lalu memberi XP Creator (30 XP + 5 XP per soal).

#### Authentication

Required (JWT, Creator).

#### Request Body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| judulKuis | string | Yes | UNKNOWN | Judul kuis |
| idMateriTerkait | integer | No | null = kuis standalone | Materi terkait (opsional) |
| aturanMarkdown | text | Yes | Validasi Markdown | Aturan/instruksi |
| batasWaktuMenit | integer | Yes | 1 – 180 menit | Batas waktu |
| poinXPDefault | integer | Yes | UNKNOWN | Bobot poin per soal |
| soal | array | Yes | Minimal 1 soal; semua punya jawaban benar | Daftar soal |
| soal[].pertanyaanMarkdown | text | Yes | UNKNOWN | Isi soal |
| soal[].opsiA | string | Yes | UNKNOWN | Opsi A |
| soal[].opsiB | string | Yes | UNKNOWN | Opsi B |
| soal[].opsiC | string | Yes | UNKNOWN | Opsi C |
| soal[].opsiD | string | Yes | UNKNOWN | Opsi D |
| soal[].jawabanBenar | string | Yes | A/B/C/D | Kunci jawaban |

#### Request Example

```json
{
  "judulKuis": "Kuis JavaScript Dasar",
  "idMateriTerkait": 1,
  "aturanMarkdown": "# Aturan\n- Jawablah dengan jujur.",
  "batasWaktuMenit": 5,
  "poinXPDefault": 10,
  "soal": [
    {
      "pertanyaanMarkdown": "Apa tipe data bilangan bulat di JavaScript?",
      "opsiA": "int",
      "opsiB": "number",
      "opsiC": "float",
      "opsiD": "integer",
      "jawabanBenar": "B"
    }
  ]
}
```

#### Success Response

##### 201 Created

```json
{ "success": true, "kuisId": 4, "xpGained": 80 }
```

#### Error Response

##### 400 Bad Request — kuis tidak valid

```json
{ "success": false, "error": "Kuis tidak valid" }
```

##### 500 Internal Server Error

---

### API-026 — Ubah Kuis

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-11 |
| Scenario | `skenario/UC-11-Kelola-Kuis.md` (Alternate 3A) |
| Sequence | `sequence/UC-11-Kelola-Kuis.plantuml` |
| Class | `Kuis`, `Soal`, `KunciJawaban`, `Pengguna` |

#### Endpoint

`PUT /api/kuis/:id`

#### Purpose

Memperbarui kuis beserta soal & kunci jawaban (hapus soal lama, insert ulang); memberi XP Creator lebih kecil (10 XP default).

#### Authentication

Required (JWT, Creator).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Request Body

Sama dengan Request Body API-025.

#### Success Response

##### 200 OK

```json
{ "success": true, "xpGained": 10 }
```

#### Error Response

##### 403 Forbidden — bukan pembuat

```json
{ "success": false, "error": "Unauthorized" }
```

##### 400 Bad Request

---

### API-027 — Hapus Kuis

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-11 |
| Scenario | `skenario/UC-11-Kelola-Kuis.md` (Alternate 3B) |
| Sequence | `sequence/UC-11-Kelola-Kuis.plantuml` |
| Class | `Kuis`, `Soal`, `KunciJawaban` |

#### Endpoint

`DELETE /api/kuis/:id`

#### Purpose

Menghapus kuis miliknya sendiri dengan cascade ke soal dan kunci jawaban.

#### Authentication

Required (JWT, Creator).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 403 Forbidden — bukan pembuat

##### 500 Internal Server Error

---

## Bagian H — Admin: Kelola Users (UC-12)

Sumber: `skenario/UC-12-Mengelola-Users.md`, `sequence/UC-12-Mengelola-Users.plantuml`. Model: `Akun`, `Pengguna`, `AuditLog`.

Semua endpoint bagian ini: **Authentication: Required (JWT, role Admin)**.

---

### API-028 — Daftar Semua Users

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-12 |
| Scenario | `skenario/UC-12-Mengelola-Users.md` |
| Sequence | `sequence/UC-12-Mengelola-Users.plantuml` |
| Class | `Akun`, `Pengguna` |

#### Endpoint

`GET /api/admin/users`

#### Purpose

Mengambil daftar semua akun, diurutkan `tanggalDaftar` menurun.

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": [
    {
      "idAkun": "uuid",
      "namaLengkap": "Andi Pratama",
      "email": "andi@gmail.com",
      "role": "user",
      "statusAktif": true,
      "alasanSuspend": null,
      "tanggalDaftar": "2026-01-15T00:00:00.000Z",
      "totalXP": 220,
      "xpLearner": 180,
      "xpCreator": 40
    }
  ]
}
```

#### Error Response

##### 500 Internal Server Error

```json
{ "success": false, "error": "Gagal memuat data pengguna. Coba lagi nanti" }
```

---

### API-029 — Ubah Role User

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-12 |
| Scenario | `skenario/UC-12-Mengelola-Users.md` |
| Sequence | `sequence/UC-12-Mengelola-Users.plantuml` |
| Class | `Akun`, `AuditLog` |

#### Endpoint

`PUT /api/admin/users/:id/role`

#### Purpose

Mengubah role akun (`user` / `admin`) dan mencatat `AuditLog` (`action = 'edit_role'`).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | uuid | Yes |

#### Request Body

| Field | Type | Required | Validation |
|---|---|---|---|
| newRole | string | Yes | `user` atau `admin` |

#### Request Example

```json
{ "newRole": "admin" }
```

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 400 Bad Request — role tidak valid

```json
{ "success": false, "error": "Role tidak valid" }
```

##### 500 Internal Server Error

---

### API-030 — Suspend Akun

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-12 |
| Scenario | `skenario/UC-12-Mengelola-Users.md` (Alternate 7A) |
| Sequence | `sequence/UC-12-Mengelola-Users.plantuml` |
| Class | `Akun`, `AuditLog` |

#### Endpoint

`PUT /api/admin/users/:id/suspend`

#### Purpose

Menonaktifkan akun (`statusAktif = false`, simpan `alasanSuspend`) dan mencatat `AuditLog` (`action = 'suspend'`).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | uuid | Yes |

#### Request Body

| Field | Type | Required | Validation |
|---|---|---|---|
| alasanSuspend | string | Yes | UNKNOWN |

#### Request Example

```json
{ "alasanSuspend": "Spam berulang" }
```

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 403 Forbidden — mencoba suspend admin lain yang setara/lebih tinggi

##### 500 Internal Server Error

---

### API-031 — Unsuspend Akun

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-12 |
| Scenario | `skenario/UC-12-Mengelola-Users.md` (Alternate 7C) |
| Sequence | `sequence/UC-12-Mengelola-Users.plantuml` |
| Class | `Akun`, `AuditLog` |

#### Endpoint

`PUT /api/admin/users/:id/unsuspend`

#### Purpose

Mengaktifkan kembali akun (`statusAktif = true`, `alasanSuspend = NULL`) dan mencatat `AuditLog` (`action = 'unsuspend'`).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | uuid | Yes |

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 500 Internal Server Error

---

### API-032 — Hapus Akun (Permanen)

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-12 |
| Scenario | `skenario/UC-12-Mengelola-Users.md` (Alternate 7B) |
| Sequence | `sequence/UC-12-Mengelola-Users.plantuml` |
| Class | `Akun`, `Materi`, `Kuis`, `RiwayatBelajar`, `Komentar`, `Rating`, `AuditLog` |

#### Endpoint

`DELETE /api/admin/users/:id`

#### Purpose

Menghapus akun secara permanen (cascade ke materi, kuis, riwayat, komentar, rating), menghapus file S3 terkait (background task), dan mencatat `AuditLog` (`action = 'delete_user'`).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | uuid | Yes |

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 500 Internal Server Error — gagal cascade delete

```json
{ "success": false, "error": "Gagal menghapus akun. Hubungi developer" }
```

---

## Bagian I — Admin: Moderasi Konten (UC-13)

Sumber: `skenario/UC-13-Moderasi-Konten.md`, `sequence/UC-13-Moderasi-Konten.plantuml`. Model: `Materi`, `Kuis`, `ModerationLog`, `Pengguna`.

Semua endpoint bagian ini: **Authentication: Required (JWT, role Admin)**.

---

### API-033 — Daftar Semua Konten

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-13 |
| Scenario | `skenario/UC-13-Moderasi-Konten.md` |
| Sequence | `sequence/UC-13-Moderasi-Konten.plantuml` |
| Class | `Materi`, `Kuis` |

#### Endpoint

`GET /api/admin/content`

#### Purpose

Mengambil daftar gabungan materi + kuis dengan info judul, creator, tanggal, status, jumlah view/pengerjaan.

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": [
    {
      "contentType": "materi",
      "id": 1,
      "judul": "Pengenalan JavaScript",
      "idPenulis": 2,
      "penulis": "Budi Santoso",
      "tanggal": "2026-07-05T00:00:00.000Z",
      "status_publik": true,
      "jumlahView": 152
    },
    {
      "contentType": "kuis",
      "id": 1,
      "judul": "Kuis JavaScript Dasar",
      "idPenulis": 2,
      "penulis": "Budi Santoso",
      "tanggal": "2026-07-06T00:00:00.000Z",
      "status_publik": true
    }
  ]
}
```

Catatan: field gabungan (materi vs kuis) merupakan hasil normalisasi UNION dari sequence; struktur pasti `NEEDS CLARIFICATION` — lihat Bagian 7.

#### Error Response

##### 500 Internal Server Error

---

### API-034 — Detail Konten

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-13 |
| Scenario | `skenario/UC-13-Moderasi-Konten.md` |
| Sequence | `sequence/UC-13-Moderasi-Konten.plantuml` |
| Class | `Materi`, `Kuis`, `Pengguna` |

#### Endpoint

`GET /api/admin/content/:id`

#### Purpose

Mengambil konten lengkap dengan detail creator (JOIN `Pengguna`).

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": {
    "contentType": "materi",
    "id": 1,
    "judul": "Pengenalan JavaScript",
    "kontenMarkdown": "# ...",
    "status_publik": true,
    "alasan_moderate": null,
    "creator": { "idAkun": "uuid", "namaLengkap": "Budi Santoso", "email": "budi@gmail.com" }
  }
}
```

#### Error Response

##### 404 Not Found

##### 500 Internal Server Error

---

### API-035 — Sembunyikan Konten

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-13 |
| Scenario | `skenario/UC-13-Moderasi-Konten.md` |
| Sequence | `sequence/UC-13-Moderasi-Konten.plantuml` |
| Class | `Materi`, `Kuis`, `ModerationLog` |

#### Endpoint

`PUT /api/admin/content/:id/moderate`

#### Purpose

Menyembunyikan konten (`status_publik = false`, simpan `alasan_moderate`, `moderated_by`, `moderated_at`), mencatat `ModerationLog` (`action = 'hide'`), dan mengirim notifikasi ke creator.

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Request Body

| Field | Type | Required | Validation |
|---|---|---|---|
| action | string | Yes | `hide` |
| reason | text | Yes | Harus diisi (validasi UC-13) |

#### Request Example

```json
{ "action": "hide", "reason": "Konten mengandung spam" }
```

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 400 Bad Request — alasan kosong

##### 500 Internal Server Error

---

### API-036 — Approve / Pulihkan Konten

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-13 |
| Scenario | `skenario/UC-13-Moderasi-Konten.md` (Alternate 8B) |
| Sequence | `sequence/UC-13-Moderasi-Konten.plantuml` |
| Class | `Materi`, `Kuis`, `ModerationLog` |

#### Endpoint

`PUT /api/admin/content/:id/approve`

#### Purpose

Memulihkan konten (`status_publik = true`, `alasan_moderate = NULL`), mencatat `ModerationLog` (`action = 'approve'`), notifikasi ke creator.

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 500 Internal Server Error

---

### API-037 — Hapus Permanen Konten

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-13 |
| Scenario | `skenario/UC-13-Moderasi-Konten.md` (Alternate 8A) |
| Sequence | `sequence/UC-13-Moderasi-Konten.plantuml` |
| Class | `Materi`, `Kuis`, `ModerationLog` |

#### Endpoint

`DELETE /api/admin/content/:id`

#### Purpose

Menghapus konten permanen (cascade ke riwayat, komentar, rating, soal), menghapus file dari S3, mencatat `ModerationLog` (`action = 'delete'`), notifikasi ke creator.

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Request Body

| Field | Type | Required | Validation |
|---|---|---|---|
| reason | text | Yes | Harus diisi |

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 500 Internal Server Error

---

### API-038 — Riwayat Moderasi Konten

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-13 |
| Scenario | `skenario/UC-13-Moderasi-Konten.md` (Alternate 6A) |
| Sequence | `sequence/UC-13-Moderasi-Konten.plantuml` |
| Class | `ModerationLog` |

#### Endpoint

`GET /api/admin/content/:id/history`

#### Purpose

Mengambil history moderasi konten (siapa moderate, kapan, alasan), diurutkan `timestamp` menurun.

#### Path Parameters

| Parameter | Type | Required |
|---|---|---|
| id | integer | Yes |

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": [
    {
      "idLog": 1,
      "admin_id": "uuid",
      "content_id": 1,
      "content_type": "materi",
      "action": "hide",
      "reason": "Konten mengandung spam",
      "timestamp": "2026-06-20T15:11:00.000Z"
    }
  ]
}
```

#### Error Response

##### 500 Internal Server Error

---

## Bagian J — Admin: Manajemen XP & Ranked (UC-14)

Sumber: `skenario/UC-14-Manajemen-XP-Ranked.md`, `sequence/UC-14-Manajemen-XP-Ranked.plantuml`. Model: `SystemConfig`, `ConfigChangeLog`, `Pengguna`, `RiwayatBelajar`, `Season`, `SeasonWinners`.

Semua endpoint bagian ini: **Authentication: Required (JWT, role Admin)**.

---

### API-039 — Ambil Konfigurasi XP

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-14 |
| Scenario | `skenario/UC-14-Manajemen-XP-Ranked.md` |
| Sequence | `sequence/UC-14-Manajemen-XP-Ranked.plantuml` |
| Class | `SystemConfig` |

#### Endpoint

`GET /api/admin/xp-config`

#### Purpose

Mengambil konfigurasi XP saat ini (`config_type = 'xp_settings'`) dan statistik leaderboard (count, avg, max totalXP).

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "config": {
    "xp_read_materi": 10,
    "xp_complete_quiz": 50,
    "xp_upload_materi": 20,
    "xp_create_quiz": 30
  },
  "stats": { "userCount": 7, "avgTotalXP": 100, "maxTotalXP": 220 }
}
```

Catatan: nama parameter pada `config` mengikuti contoh sequence UC-14; daftar lengkap parameter `NEEDS CLARIFICATION` (lihat Bagian 7).

#### Error Response

##### 500 Internal Server Error

---

### API-040 — Ubah Bobot XP

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-14 |
| Scenario | `skenario/UC-14-Manajemen-XP-Ranked.md` |
| Sequence | `sequence/UC-14-Manajemen-XP-Ranked.plantuml` |
| Class | `SystemConfig`, `ConfigChangeLog` |

#### Endpoint

`PUT /api/admin/xp-config`

#### Purpose

Memperbarui bobot XP, mencatat `ConfigChangeLog` untuk setiap parameter yang berubah.

#### Request Body

| Field | Type | Required | Validation |
|---|---|---|---|
| xp_read_materi | integer | Yes | 0 – 1000 |
| xp_complete_quiz | integer | Yes | 0 – 1000 |
| xp_upload_materi | integer | Yes | 0 – 1000 |
| xp_create_quiz | integer | Yes | 0 – 1000 |

#### Request Example

```json
{
  "xp_read_materi": 15,
  "xp_complete_quiz": 50,
  "xp_upload_materi": 20,
  "xp_create_quiz": 30
}
```

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 400 Bad Request — nilai di luar 0–1000

```json
{ "success": false, "error": "Nilai XP harus antara 0-1000" }
```

##### 500 Internal Server Error

---

### API-041 — Season Aktif

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-14 |
| Scenario | `skenario/UC-14-Manajemen-XP-Ranked.md` (Alternate 4A) |
| Sequence | `sequence/UC-14-Manajemen-XP-Ranked.plantuml` |
| Class | `Season`, `Pengguna` |

#### Endpoint

`GET /api/admin/season/current`

#### Purpose

Mengambil season aktif beserta top 10 winners saat ini.

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "season": {
    "idSeason": 1,
    "season_name": "Season 1 - Juli 2026",
    "start_date": "2026-07-01T00:00:00.000Z",
    "end_date": null,
    "status": "active"
  },
  "topWinners": [
    { "idAkun": "uuid", "namaLengkap": "Andi Pratama", "totalXP": 220, "rankPeringkat": "Bronze" }
  ]
}
```

#### Error Response

##### 500 Internal Server Error

---

### API-042 — Reset Season

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-14 |
| Scenario | `skenario/UC-14-Manajemen-XP-Ranked.md` (Alternate 4A) |
| Sequence | `sequence/UC-14-Manajemen-XP-Ranked.plantuml` |
| Class | `Season`, `SeasonWinners`, `Pengguna`, `SystemConfig` |

#### Endpoint

`POST /api/admin/season/reset`

#### Purpose

Menutup season aktif, mengarsipkan semua pengguna ber-XP ke `SeasonWinners`, reset XP semua pengguna ke 0 (`Unranked`), membuat season baru, dan mengirim broadcast notifikasi. Dilakukan dalam satu transaksi.

#### Request Body

| Field | Type | Required | Validation |
|---|---|---|---|
| newSeasonName | string | Yes | UNKNOWN |

#### Request Example

```json
{ "newSeasonName": "Season 2 - August 2026" }
```

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 500 Internal Server Error — transaction rollback

```json
{ "success": false, "error": "Gagal reset season. Data tetap aman, tidak ada perubahan" }
```

---

### API-043 — Mulai Rekalkulasi XP

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-14 |
| Scenario | `skenario/UC-14-Manajemen-XP-Ranked.md` (Alternate 4B) |
| Sequence | `sequence/UC-14-Manajemen-XP-Ranked.plantuml` |
| Class | `Pengguna`, `RiwayatBelajar`, `ConfigChangeLog` |

#### Endpoint

`POST /api/admin/xp/recalculate`

#### Purpose

Menjalankan background job untuk menghitung ulang XP semua pengguna berdasarkan `RiwayatBelajar`.

#### Success Response

##### 202 Accepted

```json
{
  "success": true,
  "message": "Rekalkulasi dimulai",
  "jobId": "..."
}
```

#### Error Response

##### 500 Internal Server Error

---

### API-044 — Status Rekalkulasi XP

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-14 |
| Scenario | `skenario/UC-14-Manajemen-XP-Ranked.md` (Alternate 4B) |
| Sequence | `sequence/UC-14-Manajemen-XP-Ranked.plantuml` |
| Class | `Pengguna`, `RiwayatBelajar` |

#### Endpoint

`GET /api/admin/xp/recalculate/status`

#### Purpose

Dipanggil client (polling tiap 2 detik) untuk memantau progress job rekalkulasi.

#### Success Response

##### 200 OK

```json
{ "status": "completed", "updated": 7 }
```

#### Error Response

##### 500 Internal Server Error

---

### API-045 — Ambil Rank Tiers

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-14 |
| Scenario | `skenario/UC-14-Manajemen-XP-Ranked.md` (Alternate 4C) |
| Sequence | `sequence/UC-14-Manajemen-XP-Ranked.plantuml` |
| Class | `SystemConfig` |

#### Endpoint

`GET /api/admin/rank-tiers`

#### Purpose

Mengambil konfigurasi threshold rank (`config_type = 'rank_thresholds'`).

#### Success Response

##### 200 OK

```json
{
  "success": true,
  "data": {
    "Unranked": 0,
    "Bronze": 100,
    "Silver": 250,
    "Gold": 500,
    "Platinum": 1000,
    "Diamond": 2000
  }
}
```

Catatan: daftar rank mengikuti `RANK_TIERS` pada prototype; nilai pastinya `NEEDS CLARIFICATION` (lihat Bagian 7).

#### Error Response

##### 500 Internal Server Error

---

### API-046 — Ubah Rank Tiers

#### Traceability

| Dokumen | Referensi |
|---|---|
| Use Case | UC-14 |
| Scenario | `skenario/UC-14-Manajemen-XP-Ranked.md` (Alternate 4C) |
| Sequence | `sequence/UC-14-Manajemen-XP-Ranked.plantuml` |
| Class | `SystemConfig`, `Pengguna` |

#### Endpoint

`PUT /api/admin/rank-tiers`

#### Purpose

Memperbarui threshold rank, lalu memicu background job rekalkulasi rank semua pengguna.

#### Request Body

| Field | Type | Required | Validation |
|---|---|---|---|
| Bronze | integer | Yes | 0 – 1000 |
| Silver | integer | Yes | 0 – 1000 |
| Gold | integer | Yes | 0 – 1000 |
| Platinum | integer | Yes | 0 – 1000 |
| Diamond | integer | Yes | 0 – 1000 |

#### Request Example

```json
{ "Bronze": 150, "Silver": 250, "Gold": 500, "Platinum": 1000, "Diamond": 2000 }
```

#### Success Response

##### 200 OK

```json
{ "success": true }
```

#### Error Response

##### 500 Internal Server Error

---

## 5. Open Items / Needs Clarification

Berdasarkan prinsip Anti-Assumption (Bagian 5 guide), informasi berikut tidak tersedia pada desain dan **tidak boleh dianggap ada** tanpa klarifikasi:

| No | Item | Detail | Status |
|---|---|---|---|
| 1 | Daftar komentar suatu materi | Sequence UC-03 hanya mengembalikan `data.materi`; tidak ada `GET /api/komentar`. Perlu konfirmasi: apakah daftar komentar digabung ke `GET /api/materi/:id` atau endpoint terpisah. | NEEDS CLARIFICATION |
| 2 | Daftar kuis publik (halaman "Kuis") | Sequence UC-08 tidak memuat `GET /api/kuis` (daftar). Prototype menampilkan halaman daftar kuis. Perlu konfirmasi sumber data daftar kuis. | NEEDS CLARIFICATION |
| 3 | Struktur gabungan `GET /api/admin/content` | Sequence memakai `SELECT ... UNION`, format field gabungan materi vs kuis belum didefinisikan. | NEEDS CLARIFICATION |
| 4 | Nama parameter konfigurasi XP | `xp_settings` JSON mengikuti contoh sequence (`xp_read_materi`, `xp_complete_quiz`, `xp_upload_materi`, `xp_create_quiz`). Daftar lengkap parameter belum didefinisikan. | NEEDS CLARIFICATION |
| 5 | Nilai threshold rank default | Daftar `RANK_TIERS` diambil dari prototype; belum disetujui sebagai desain resmi. | NEEDS CLARIFICATION |
| 6 | Pola notifikasi (email/in-app) | Sequence menyebut `NotificationService` sebagai actor pendukung; mekanisme (email vs in-app) belum ditentukan. | NEEDS CLARIFICATION |
| 7 | Google Auth detail | Flow verifikasi token (OAuth2 access token vs id_token, alur redirect) belum dirinci pada dokumentasi. | UNKNOWN |

---

## 6. Validation Checklist

Berdasarkan Bagian 22 guide (Validation Matrix):

| Item | Status |
|---|---|
| Requirement sesuai (`plan.md`) | ✅ |
| Use Case sesuai (UC-01 s.d. UC-14) | ✅ |
| Scenario sesuai (14 file `skenario/`) | ✅ |
| Activity sesuai (14 file `activity/`) | ✅ |
| Sequence sesuai (14 file `sequence/`) | ✅ |
| Class sesuai (`classDiagram.plantuml`) | ✅ |
| Endpoint sesuai | ✅ (46 endpoint, semua bersumber dari sequence) |
| HTTP Method sesuai | ✅ |
| Request sesuai | ✅ |
| Response sesuai | ✅ |
| Authentication sesuai | ✅ (JWT per `plan.md`) |
| Error sesuai | ✅ (status code mengikuti sequence) |
| Tidak ada asumsi | ⚠️ 7 item `NEEDS CLARIFICATION` di Bagian 5 |
| Traceability tersedia | ✅ (setiap API memiliki tabel Traceability) |

---

## 7. Completion Status

**Status: DRAFT**

Berdasarkan Bagian 31 & 32 guide, dokumen ini **belum** dapat dinyatakan APPROVED karena masih ada 7 item yang belum diklarifikasi (Bagian 5). Setelah klarifikasi diterima, status diubah menjadi REVIEW → APPROVED.
