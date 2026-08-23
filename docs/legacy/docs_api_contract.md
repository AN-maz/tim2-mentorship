# AI Documentation & API Contract Guide

> **Version:** 1.0
> **Purpose:** Standard operating procedure for AI Agents working on system design, API Contract, API Documentation, frontend, and backend.

---

# 1. Purpose

Dokumen ini merupakan pedoman bagi AI Agent dalam membaca, membuat, memperbarui, dan memvalidasi dokumentasi sistem.

Dokumentasi sistem digunakan sebagai **single source of truth pada tahap perancangan**, sedangkan API Contract digunakan sebagai **kontrak komunikasi antara frontend dan backend**.

AI Agent wajib menjaga konsistensi hubungan antara:

```text
Requirement
    ↓
Use Case
    ↓
Use Case Scenario
    ↓
Activity Diagram
    ↓
Sequence Diagram
    ↓
Class Diagram
    ↓
API Contract
    ↓
Frontend & Backend Implementation
    ↓
API Documentation
```

Setiap perubahan pada suatu tahap harus mempertimbangkan dampaknya terhadap tahap berikutnya.

---

# 2. Scope

Guidebook ini mengatur AI Agent dalam:

* Membaca dokumentasi UML.
* Memahami Use Case.
* Memahami Use Case Scenario.
* Memahami Activity Diagram.
* Memahami Sequence Diagram.
* Memahami Class Diagram.
* Menentukan kebutuhan API.
* Membuat API Contract.
* Membuat API Documentation.
* Menjaga traceability antar dokumentasi.
* Menentukan perubahan yang bersifat breaking change.
* Memvalidasi implementasi terhadap API Contract.
* Menjaga sinkronisasi frontend dan backend.

---

# 3. Documentation Hierarchy

AI Agent harus memahami bahwa setiap dokumen memiliki level dan fungsi yang berbeda.

```text
LEVEL 1
plan
    │
    ▼
LEVEL 2
Use Case
    │
    ▼
LEVEL 3
Use Case Scenario
    │
    ▼
LEVEL 4
Activity Diagram
    │
    ▼
LEVEL 5
Sequence Diagram
    │
    ▼
LEVEL 6
Class Diagram
    │
    ▼
LEVEL 7
API Contract
    │
    ├───────────────┐
    ▼               ▼
Backend          Frontend
Implementation  Implementation
    │               │
    └───────┬───────┘
            ▼
     API Documentation
```

AI Agent tidak boleh melewati tahap secara sembarangan.

Contoh:

```text
JANGAN:

Requirement
    ↓
AI membuat endpoint berdasarkan asumsi
```

Gunakan:

```text
plan
    ↓
Use Case
    ↓
Scenario
    ↓
Sequence
    ↓
API Contract
```

---

# 4. Source of Truth

Gunakan hierarchy berikut ketika terjadi konflik informasi:

```text
1. Explicit Requirement
2. Approved Use Case
3. Approved Use Case Scenario
4. Approved Activity Diagram
5. Approved Sequence Diagram
6. Approved Class Diagram
7. API Contract
8. Implementation
9. API Documentation
```

Dokumen dengan level lebih rendah tidak boleh secara otomatis mengubah dokumen dengan level lebih tinggi.

Contoh:

Jika backend memiliki:

```http
POST /api/product
```

tetapi API Contract mendefinisikan:

```http
POST /api/products
```

maka AI Agent **tidak boleh langsung mengubah Contract**.

Agent harus melaporkan:

```text
Implementation mismatch detected.

Contract:
POST /api/products

Implementation:
POST /api/product
```

Kemudian tentukan apakah implementasi atau desain yang harus diperbaiki berdasarkan requirement.

---

# 5. Prinsip Anti-Assumption

AI Agent dilarang membuat keputusan berdasarkan asumsi apabila informasi tersebut tidak tersedia.

Contoh yang dilarang:

```text
Tidak ada endpoint DELETE pada Sequence Diagram.

AI:
"Sepertinya CRUD membutuhkan DELETE, jadi saya tambahkan."
```

Hal tersebut tidak diperbolehkan.

Jika informasi tidak tersedia:

```text
UNKNOWN
```

atau:

```text
NEEDS CLARIFICATION
```

Gunakan informasi yang benar-benar tersedia pada dokumentasi.

---

# 6. Recommended Documentation Structure

Gunakan struktur:

```text
docs/api
│
├── 01-requirements/
│   └── requirements.md
│
├── 02-use-case/
│   ├── use-case-diagram.png
│   └── use-case.md
│
├── 03-scenario/
│   ├── SC-001-login.md
│   ├── SC-002-create-product.md
│   └── ...
│
├── 04-activity/
│   ├── ACT-001-login.md
│   ├── ACT-002-create-product.md
│   └── ...
│
├── 05-sequence/
│   ├── SEQ-001-login.md
│   ├── SEQ-002-create-product.md
│   └── ...
│
├── 06-class/
│   ├── class-diagram.png
│   └── class.md
│
├── 07-api/
│   ├── contract/
│   │   ├── API-001-auth.md
│   │   ├── API-002-product.md
│   │   └── ...
│   │
│   └── documentation/
│       ├── auth.md
│       ├── products.md
│       └── ...
│
└── AI_DOCUMENTATION_GUIDE.md
```

Jika project masih kecil, struktur dapat disederhanakan.

---

# 7. Document ID

Setiap dokumentasi harus memiliki ID yang unik.

Gunakan prefix:

| Document     | Prefix | Example |
| ------------ | ------ | ------- |
| Requirement  | REQ    | REQ-001 |
| Use Case     | UC     | UC-001  |
| Scenario     | SC     | SC-001  |
| Activity     | ACT    | ACT-001 |
| Sequence     | SEQ    | SEQ-001 |
| Class        | CLS    | CLS-001 |
| API Contract | API    | API-001 |

Contoh hubungan:

```text
UC-003
  ↓
SC-003
  ↓
ACT-003
  ↓
SEQ-003
  ↓
API-003
```

ID harus dipertahankan selama dokumentasi masih merepresentasikan fitur yang sama.

---

# 8. Traceability

Setiap API Contract harus memiliki hubungan dengan desain sistem.

Contoh:

```md
# API-003 — Create Product

## Traceability

Requirement:
REQ-005

Use Case:
UC-003 — Manage Product

Scenario:
SC-003 — Create Product

Activity:
ACT-003 — Create Product

Sequence:
SEQ-003 — Create Product

Class:
CLS-002 — Product
```

Tujuannya agar developer dapat mengetahui:

> "Endpoint ini berasal dari fitur apa?"

dan:

> "Kalau fitur ini berubah, API apa yang terdampak?"

---

# 9. From Use Case to API

Tidak semua Use Case harus menghasilkan satu endpoint.

Satu Use Case dapat menghasilkan:

```text
UC-001 Login
    ↓
POST /auth/login
```

Tetapi Use Case lain dapat menghasilkan beberapa endpoint:

```text
UC-002 Manage Product
    ├── GET /products
    ├── GET /products/:id
    ├── POST /products
    ├── PUT /products/:id
    └── DELETE /products/:id
```

AI Agent harus menentukan kebutuhan endpoint berdasarkan alur pada Scenario dan Sequence Diagram.

Jangan menggunakan asumsi CRUD secara otomatis.

---

# 10. Sequence Diagram sebagai Referensi API

Sequence Diagram merupakan referensi utama untuk menentukan komunikasi antara:

```text
Actor
Client
Controller
Service
Database
External Service
```

Contoh:

```text
Frontend
    │
    │ POST /products
    ▼
Product Controller
    │
    ▼
Product Service
    │
    ▼
Database
```

Maka API Contract harus menjelaskan komunikasi:

```text
Frontend
    ↓
POST /products
```

AI Agent harus memastikan request dan response sesuai dengan alur Sequence Diagram.

---

# 11. Class Diagram sebagai Referensi Data

Class Diagram digunakan untuk membantu menentukan:

* Entity
* Attribute
* Relationship
* Data type
* Identifier

Contoh:

```text
Product
----------------
id: Integer
name: String
price: Number
stock: Integer
```

API Contract dapat menggunakan informasi tersebut sebagai referensi:

```json
{
  "id": 1,
  "name": "Kaos Hitam",
  "price": 75000,
  "stock": 20
}
```

Namun Class Diagram **tidak otomatis berarti seluruh attribute harus dikirim melalui API**.

API hanya menggunakan attribute yang memang dibutuhkan oleh Use Case dan Sequence Diagram.

---

# 12. API Contract

API Contract merupakan kesepakatan komunikasi antara frontend dan backend.

Contract minimal harus mendefinisikan:

```text
HTTP Method
Endpoint
Purpose
Authentication
Path Parameter
Query Parameter
Request Header
Request Body
Response
HTTP Status Code
Error Response
Data Type
Required / Optional
```

---

# 13. API Contract Format

Gunakan format berikut:

````md
# API-003 — Create Product

## Traceability

Requirement:
REQ-005

Use Case:
UC-003

Scenario:
SC-003

Activity:
ACT-003

Sequence:
SEQ-003

Class:
CLS-002

---

## Endpoint

POST /api/products

## Purpose

Membuat produk baru.

## Authentication

Required.

## Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|

## Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|

## Request Headers

| Header | Type | Required | Description |
|---|---|---|---|

## Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Nama produk |
| price | number | Yes | Harga produk |
| stock | integer | Yes | Jumlah stok |

## Request Example

```json
{
  "name": "Kaos Hitam",
  "price": 75000,
  "stock": 20
}
````

## Success Response

### 201 Created

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Kaos Hitam",
    "price": 75000,
    "stock": 20
  }
}
```

## Error Response

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid request"
}
```

````

---

# 14. Request Schema

AI Agent harus menentukan setiap field:

```text
Name
Type
Required
Description
Validation
````

Contoh:

| Field | Type    | Required | Validation           |
| ----- | ------- | -------- | -------------------- |
| name  | string  | Yes      | Minimum 3 characters |
| price | number  | Yes      | >= 0                 |
| stock | integer | Yes      | >= 0                 |

Jika validation belum ditentukan dalam desain:

```text
Validation: UNKNOWN
```

Jangan membuat aturan sendiri.

---

# 15. Response Schema

Response harus mendefinisikan:

```text
Status Code
Response Structure
Field
Type
Description
```

Contoh:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Kaos Hitam"
  }
}
```

Schema:

```text
success → boolean
data → object
data.id → integer
data.name → string
```

---

# 16. Error Handling

API Contract harus mendokumentasikan error yang diketahui dari desain.

Contoh:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

Jangan menambahkan status code hanya karena status tersebut umum digunakan.

---

# 17. Authentication

Authentication harus dijelaskan secara eksplisit.

Contoh:

```text
Authentication:
Bearer Token
```

Request:

```http
Authorization: Bearer <TOKEN>
```

Jika authentication belum ditentukan:

```text
Authentication: UNKNOWN
```

---

# 18. API Documentation

API Documentation dibuat berdasarkan API Contract.

Contract menjawab:

> Apa kesepakatannya?

Documentation menjawab:

> Bagaimana developer menggunakan API tersebut?

Dokumentasi ditujukan kepada:

* Frontend Developer
* Backend Developer
* AI Coding Agent
* Developer baru yang bergabung ke project

---

# 19. API Documentation Format

Gunakan struktur:

````md
# Create Product

`POST /api/products`

## Description

Membuat produk baru.

## Authentication

Required.

## Request

```http
POST /api/products
Content-Type: application/json
Authorization: Bearer <TOKEN>
````

## Request Body

```json
{
  "name": "Kaos Hitam",
  "price": 75000,
  "stock": 20
}
```

## Success Response

### 201 Created

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Kaos Hitam",
    "price": 75000,
    "stock": 20
  }
}
```

## Error

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid request"
}
```

````

---

# 20. Contract vs Documentation

Jangan mencampurkan fungsi keduanya.

| API Contract | API Documentation |
|---|---|
| Kesepakatan | Panduan penggunaan |
| Fokus struktur | Fokus pemahaman |
| Lebih formal | Lebih readable |
| Acuan frontend/backend | Referensi developer |
| Harus stabil | Dapat memiliki contoh tambahan |
| Source untuk implementation | Source untuk penggunaan |

Alur:

```text
Design
  ↓
API Contract
  ↓
Implementation
  ↓
API Documentation
````

---

# 21. AI Agent Workflow

Ketika diminta membuat API Contract, AI Agent wajib mengikuti:

### Step 1 — Read Requirements

Baca requirement yang relevan.

### Step 2 — Find Use Case

Cari Use Case terkait.

### Step 3 — Read Scenario

Pahami langkah normal dan alternatif.

### Step 4 — Read Activity Diagram

Identifikasi:

* Input
* Decision
* Process
* Output
* Validation

### Step 5 — Read Sequence Diagram

Identifikasi:

* Client
* Request
* Controller
* Service
* Database
* Response

### Step 6 — Read Class Diagram

Identifikasi entity dan data yang relevan.

### Step 7 — Determine API

Tentukan endpoint berdasarkan komunikasi yang dibutuhkan.

### Step 8 — Create Contract

Dokumentasikan request dan response.

### Step 9 — Validate

Pastikan contract konsisten dengan seluruh desain.

### Step 10 — Generate Documentation

Buat API Documentation berdasarkan contract.

---

# 22. Validation Matrix

Sebelum API Contract dianggap selesai, AI Agent wajib melakukan pengecekan:

| Item                  | Status |
| --------------------- | ------ |
| Requirement sesuai    | ☐      |
| Use Case sesuai       | ☐      |
| Scenario sesuai       | ☐      |
| Activity sesuai       | ☐      |
| Sequence sesuai       | ☐      |
| Class sesuai          | ☐      |
| Endpoint sesuai       | ☐      |
| HTTP Method sesuai    | ☐      |
| Request sesuai        | ☐      |
| Response sesuai       | ☐      |
| Authentication sesuai | ☐      |
| Error sesuai          | ☐      |
| Tidak ada asumsi      | ☐      |
| Traceability tersedia | ☐      |

---

# 23. Conflict Resolution

Jika ditemukan konflik:

```text
Requirement ≠ UML
```

Jangan langsung mengubah UML.

Laporkan:

```text
DESIGN CONFLICT

Requirement:
...

Use Case:
...

Conflict:
...

Affected Documents:
...

Recommended Action:
NEEDS CLARIFICATION
```

Jika:

```text
API Contract ≠ Backend
```

laporkan:

```text
IMPLEMENTATION MISMATCH

Contract:
POST /api/products

Backend:
POST /api/product

Action:
Review implementation against API Contract.
```

---

# 24. Breaking Change

Perubahan berikut dianggap breaking change:

```text
Menghapus endpoint
Mengubah HTTP Method
Mengubah URL
Menghapus required field
Mengubah nama field
Mengubah data type
Mengubah response structure
Mengubah authentication
Mengubah status code yang digunakan client
```

AI Agent wajib memberikan warning:

```text
⚠️ BREAKING CHANGE DETECTED

Affected API:
API-003

Change:
`price` changed from `number` to `string`.

Affected Components:
- Frontend
- Backend
- API Documentation

Action Required:
Review dependent implementation.
```

---

# 25. Updating Documentation

Jika requirement berubah:

```text
Requirement
    ↓
Review Use Case
    ↓
Review Scenario
    ↓
Review Activity
    ↓
Review Sequence
    ↓
Review Class
    ↓
Update API Contract
    ↓
Update Frontend/Backend
    ↓
Update API Documentation
```

Jangan hanya mengubah API Documentation.

---

# 26. API Change Impact Analysis

Setiap perubahan API harus dianalisis.

Contoh:

```text
API-003
POST /products
```

Jika request berubah:

```json
{
  "name": "...",
  "price": "...",
  "stock": "..."
}
```

AI Agent harus mencari:

```text
API Contract
Sequence Diagram
Frontend Form
Axios / Fetch Request
Backend Controller
Backend Validator
Service
API Documentation
Test
```

Tujuannya memastikan tidak ada implementasi yang masih menggunakan contract lama.

---

# 27. AI Agent Rules

AI Agent wajib:

```text
1. Read before write.
2. Follow traceability.
3. Never guess missing information.
4. Preserve existing design decisions.
5. Report conflicts instead of silently fixing them.
6. Keep API Contract and implementation synchronized.
7. Keep API Documentation synchronized with API Contract.
8. Detect breaking changes.
9. Explain affected components.
10. Validate changes before finishing.
```

---

# 28. AI Agent Must Not

AI Agent dilarang:

```text
❌ Membuat endpoint hanya karena "CRUD biasanya membutuhkan endpoint tersebut".

❌ Mengubah nama field tanpa alasan dari requirement.

❌ Mengubah API Contract hanya agar cocok dengan backend yang salah.

❌ Menambahkan response field yang tidak ada pada desain.

❌ Menghapus dokumentasi yang masih relevan.

❌ Menganggap Class Diagram sebagai API Schema secara otomatis.

❌ Menganggap semua Use Case harus memiliki satu endpoint.

❌ Mengarang HTTP status code.

❌ Mengarang authentication mechanism.

❌ Menganggap UNKNOWN sebagai izin untuk menebak.
```

---

# 29. Recommended Output

Ketika AI Agent selesai membuat API Contract, hasil akhirnya harus memiliki:

```text
API Contract
├── API ID
├── Traceability
├── Endpoint
├── Purpose
├── Authentication
├── Parameters
├── Request Schema
├── Request Example
├── Response Schema
├── Response Example
├── HTTP Status
└── Error Response
```

Ketika selesai membuat API Documentation:

```text
API Documentation
├── Endpoint
├── Description
├── Authentication
├── Request
├── Example
├── Response
├── Error
└── Usage Notes
```

---

# 30. Final Validation

Sebelum menyatakan pekerjaan selesai, AI Agent harus menjawab:

```text
[ ] Apakah API berasal dari requirement dan UML?
[ ] Apakah setiap API memiliki traceability?
[ ] Apakah request sudah didefinisikan?
[ ] Apakah response sudah didefinisikan?
[ ] Apakah authentication sudah jelas?
[ ] Apakah error sudah didefinisikan?
[ ] Apakah ada informasi yang diasumsikan?
[ ] Apakah API Contract konsisten dengan Sequence Diagram?
[ ] Apakah data konsisten dengan Class Diagram?
[ ] Apakah API Documentation berasal dari Contract?
[ ] Apakah ada breaking change?
[ ] Apakah ada conflict yang belum diselesaikan?

Jika salah satu item penting belum terpenuhi, jangan menyatakan dokumentasi sebagai COMPLETE.
```

---

# 31. Completion Status

Gunakan status berikut:

### DRAFT

Dokumentasi sedang dibuat dan masih dapat berubah.

### REVIEW

Dokumentasi telah dibuat tetapi masih perlu pemeriksaan.

### APPROVED

Dokumentasi telah disetujui dan dapat digunakan sebagai acuan implementation.

### DEPRECATED

Dokumentasi tidak lagi digunakan tetapi tetap disimpan untuk historical reference.

---

# 32. Definition of Done

API Contract dianggap **DONE** apabila:

```text
Requirement
    ↓
Use Case
    ↓
Scenario
    ↓
Activity
    ↓
Sequence
    ↓
Class
    ↓
API Contract
```

telah konsisten dan tidak terdapat informasi penting yang masih UNKNOWN.

API Documentation dianggap **DONE** apabila:

```text
API Contract
      ↓
API Documentation
```

telah sinkron dan dapat digunakan oleh frontend dan backend developer tanpa perlu menebak struktur request maupun response.

---

# 33. Core Principle

> **Design first. Contract second. Implementation third. Documentation follows the contract.**

Atau dalam konteks project:

```text
Jangan:
Code → Dokumentasi

Gunakan:
Design → Contract → Code → Documentation
```

API Contract adalah **jembatan antara desain sistem dan implementasi**.

API Documentation adalah **panduan penggunaan contract tersebut**.

Keduanya harus selalu memiliki traceability terhadap desain sistem.
