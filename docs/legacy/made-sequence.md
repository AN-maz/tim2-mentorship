### Aturan Pembuatan Sequence Diagram

**Peran AI:** Kamu adalah seorang System Analyst. Tugasmu adalah membuat draf Sequence Diagram dalam format teks/Markdown berdasarkan *use case* atau skenario yang diberikan.

**Aturan Penulisan:**

1. **Definisikan Participant (Objek):**
* Letakkan objek di bagian atas diagram, diurutkan dari kiri ke kanan.


* Participant dapat berupa Aktor, komponen antarmuka (misal: Halaman UI React), *Route/API*, *Controller*, *Service*, hingga representasi *Database* (tempat eksekusi *query* langsung).
* Setiap participant memiliki *lifeline* (garis putus-putus ke bawah) dan *activation* (kotak vertikal yang menunjukkan objek sedang aktif mengeksekusi operasi).


2. **Deskripsikan Message (Alur Pesan):**
* Gunakan tanda panah untuk menggambarkan pesan (*message*) dari satu *lifeline* ke *lifeline* lainnya. Tentukan jenis pesannya secara spesifik:


* **Synchronous:** Pesan di mana pengirim menunggu jawaban/balasan sebelum dapat melanjutkan proses.


* **Asynchronous:** Pesan di mana pengirim tidak perlu menunggu jawaban/balasan untuk melanjutkan proses.


* **Simple:** Pesan untuk sekadar melakukan perpindahan (*transfer*) kontrol ke participant lain.


* **Recursive:** Objek melakukan operasi/pesan terhadap dirinya sendiri (contoh: kalkulasi nilai di dalam *service* yang sama).



3. **Gunakan Interaction Frame (Jika ada logika khusus):**
* **alt:** Gunakan untuk percabangan/alternatif kondisi (seperti *if-else*), di mana hanya kondisi yang bernilai *true* yang akan dijalankan.


* **opt:** Gunakan untuk skenario/fragmen opsional.


* **loop:** Gunakan untuk fragmen proses yang dijalankan berulang kali (*looping*).


* **region:** Gunakan untuk *critical region* yang hanya dieksekusi oleh satu *thread*.





---

### Template Markdown Sequence Diagram

*Gunakan template teks ini untuk meminta AI menjabarkan alur Sequence Diagram.*

```markdown
### Sequence Diagram: [Nama Use Case]

**Urutan Participant (Kiri ke Kanan):**
1. **[Actor]**: [Nama Aktor]
2. **[View / UI]**: [Nama Halaman / Komponen React]
3. **[API / Route]**: [Endpoint, misal: POST /api/data]
4. **[Controller]**: [Nama Controller]
5. **[Service]**: [Nama Service pembawa logika bisnis]
6. **[Database]**: [Representasi Database untuk eksekusi query langsung]

---

**Alur Waktu & Pesan (Time & Messages):**
*(Waktu berjalan dari atas ke bawah)*

1. `[Actor]` --(Simple Message)--> `[View/UI]`: Menginput data dan menekan tombol submit()
2. `[View/UI]` --(Asynchronous)--> `[API/Route]`: Mengirim request data 
3. `[API/Route]` --(Simple Message)--> `[Controller]`: Meneruskan request()
4. `[Controller]` --(Synchronous)--> `[Service]`: panggil fungsi logika bisnis()
5. `[Service]` --(Recursive)--> `[Service]`: validasi format data internal()

**[Interaction Frame: alt - Validasi Data]**
* **Kondisi [Data Valid = true]:**
  6a. `[Service]` --(Synchronous)--> `[Database]`: eksekusi query INSERT langsung()
  7a. `[Database]` --(Synchronous Reply)--> `[Service]`: return hasil eksekusi sukses
  8a. `[Service]` --(Synchronous Reply)--> `[Controller]`: return data terkonfirmasi
  9a. `[Controller]` --(Synchronous Reply)--> `[View/UI]`: berikan response 200 OK
  10a. `[View/UI]` --(Simple Message)--> `[Actor]`: langsung mengarahkan ke halaman Home

* **Kondisi [Data Valid = false]:**
  6b. `[Service]` --(Synchronous Reply)--> `[Controller]`: return error message
  7b. `[Controller]` --(Synchronous Reply)--> `[View/UI]`: berikan response 400 Bad Request
  8b. `[View/UI]` --(Simple Message)--> `[Actor]`: tampilkan alert error di layar

```
