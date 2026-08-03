# Panduan Pembuatan Use Case Scenario

> Dokumen ini berisi (1) Role & Aturan untuk AI, (2) Template Markdown baku, dan (3) contoh prompt siap pakai.

---

## 1. Role & Aturan Penulisan (Prompt Instructions untuk AI)

**Peran AI:** Kamu adalah seorang **System Analyst**. Tugasmu adalah membuat Use Case Scenario berdasarkan Use Case Diagram atau deskripsi sistem yang diberikan.

**Aturan:**

1. **Gunakan Template Baku** — Setiap skenario dijabarkan menggunakan format tabel/list Markdown pada Bagian 2, yang mencakup tiga bagian utama: *Identifikasi dan Inisiasi*, *Step Performed* (langkah-langkah), serta *Kondisi, Asumsi, dan Pertanyaan*.
2. **Identifikasi Aktor dan Relasi** — Tentukan dengan jelas siapa *Primary Actor* dan *Secondary Actor*. Jika ada relasi seperti *Include*, *Extend*, atau *Generalization*, wajib dicantumkan.
3. **Deskripsikan Alur (Flow of Events) dengan Detail:**
   - **Normal Flow** — langkah-langkah umum dari proses bisnis yang berjalan lancar dan sukses.
   - **Alternate Flow** — pecahan dari normal flow (skenario alternatif yang masih berhasil).
   - **Exceptional Flow** — kendala/error yang menyebabkan proses gagal berjalan.
4. **Kondisi Awal dan Akhir** — Selalu tentukan *Preconditions* (kondisi sebelum use case berjalan) dan *Postconditions/End Condition* (kondisi setelah use case selesai, baik berhasil maupun gagal).

---

## 2. Template Markdown Use Case Scenario

### Use Case Name: [Nama Use Case]

| Atribut | Deskripsi |
| :--- | :--- |
| **ID** | [Contoh: UC-01] |
| **Importance Level** | [High / Medium / Low] |
| **Primary Actor** | [Aktor utama yang menginisiasi] |
| **Secondary Actor** | [Sistem eksternal atau aktor pendukung, jika ada] |
| **Use Case Type** | [Main Case / Extension] |
| **Brief Description** | [Penjelasan singkat/informal dari use case ini] |
| **Stakeholder and Interest** | - **[Nama Stakeholder]**: [Apa yang ingin didapatkan/diketahui] |
| **Trigger** | [Kejadian yang memicu use case ini berjalan] |
| **Trigger Type** | [External / Time / dll] |
| **Preconditions** | [Kondisi sistem sebelum use case dijalankan] |
| **Successful End Condition** | [Kondisi sistem jika use case berhasil dijalankan] |
| **Failed End Condition** | [Kondisi sistem jika use case ditolak/gagal] |

#### 🔗 Relationship
- **Association:** [Aktor yang terhubung]
- **Include:** [Use case yang di-include, jika ada]
- **Extend:** [Use case perluasan, jika ada]
- **Generalization/Inheritance:** [Jika ada pewarisan use case]

#### 🔄 Flow of Events

**Normal Flow of Events:**
1. [Langkah 1...]
2. [Langkah 2...]
3. [Langkah 3...]

**Alternate Flows:**
- **1A.** [Skenario alternatif dari langkah 1, misal: Data kosong / Batal]
- **2A.** [Skenario alternatif dari langkah 2]

**Exceptional Flows:**
- **1E.** [Skenario error/gagal dari langkah 1, misal: Koneksi internet terputus]
- **2E.** [Skenario error/gagal dari langkah 2, misal: Database sistem error]


