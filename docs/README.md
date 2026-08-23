# Dokumentasi LMS Gamifikasi — Firebase Migration

Proyek ini sedang bermigrasi dari arsitektur **Express.js + PostgreSQL (relasional)** ke **Firebase (serverless / BaaS)**.

## Struktur Dokumentasi

```
docs/
├── README.md                              # (file ini)
├── firebase-migration/                    # 🔄 Dokumen baru untuk migrasi
│   ├── 01-migration-overview.md           # Rencana & roadmap migrasi
│   ├── 02-firestore-schema.md             # Skema koleksi Firestore (pengganti schema.sql)
│   ├── 03-table-to-collection-mapping.md  # Pemetaan SQL table → Firestore collection
│   ├── 04-security-rules.md             # Aturan keamanan Firestore
│   └── 05-cloud-functions.md              # Cloud Functions untuk trigger & logika server
├── legacy/                                # 📦 Dokumen lama (arsip, tidak dimodifikasi)
│   ├── plan.md
│   ├── API_CONTRACT.md
│   ├── classDiagram.plantuml
│   ├── schema.sql
│   ├── usd.plantuml
│   ├── FRONTEND_PLAN.md
│   ├── LAPORAN-CLASS-DIAGRAM.md
│   ├── docs_api_contract.md
│   ├── made-activityDiagram.md
│   ├── made-sequence.md
│   ├── made-skenario.md
│   ├── prototype.html
│   ├── landing.html
│   ├── purwa.html
│   ├── activity/      # Activity diagrams (UC-01 s/d UC-14)
│   ├── skenario/      # Use case scenarios (UC-01 s/d UC-14)
│   └── sequence/      # Sequence diagrams (UC-01 s/d UC-14)
```

## Apa yang Berubah?

| Aspek | Versi Lama (Legacy) | Versi Baru (Firebase) |
|---|---|---|
| **Backend** | Express.js di server | Firebase Cloud Functions (trigger only) |
| **Database** | PostgreSQL (relasional, 16 tabel) | Firestore (NoSQL, koleksi dokumen) |
| **Auth** | Custom JWT + bcrypt | Firebase Authentication |
| **Storage** | AWS S3 + Express middleware | Firebase Storage |
| **Hosting** | Deploy manual server | Firebase Hosting |
| **API** | 46 REST endpoint via Express | Firestore SDK langsung + callable Functions |
| **Triggers** | PostgreSQL stored procedures | Cloud Functions `onWrite` triggers |

## Referensi
- **Use Case & Flow**: Lihat `legacy/skenario/` — skenario bisnis tetap sama, hanya implementasinya berubah.
- **Class Diagram**: Lihat `legacy/classDiagram.plantuml` — struktur entitas data tetap menjadi acuan desain koleksi Firestore (lihat `02-firestore-schema.md`).
- **API Spek**: Lihat `legacy/API_CONTRACT.md` — mendeskripsikan *operasional apa saja* yang diperlukan (bukan cara mengaksesnya).
