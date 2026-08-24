# Dokumentasi LMS Gamifikasi

## Arsitektur: Express.js + PostgreSQL → Supabase (BaaS Serverless)

Proyek ini migrasi dari arsitektur **Express.js + PostgreSQL** ke **Supabase** (PostgreSQL-as-a-Service + Auth + Storage + Edge Functions).

> **Keputusan:** Firebase membutuhkan Blaze plan (bayar) untuk Firestore + Functions. Karena hanya testing 1 bulan dengan 100 user, pakai **Supabase Hobby tier (gratis)** — schema PostgreSQL existing langsung dipakai, trigger tetap jalan, zero cost.

## Struktur Dokumentasi

```
docs/
├── README.md                              # (file ini)
├── supabase-migration/                    # 🔄 Dokumen baru untuk migrasi ke Supabase
│   ├── 01-migration-overview.md           # Roadmap & fase migrasi
│   ├── 02-supabase-setup.md               # Setup project Supabase + upload schema
│   ├── 03-schema-migration.md             # SQL schema → Supabase (apa yang perlu dirubah)
│   ├── 04-auth-setup.md                   # Supabase Auth (login Google, email/password)
│   └── 05-frontend-integration.md         # Integrasi frontend pakai @supabase/supabase-js
├── legacy/                                # 📦 Dokumen lama (arsip, referensi)
│   ├── plan.md
│   ├── API_CONTRACT.md
│   ├── classDiagram.plantuml
│   ├── schema.sql                         # Schema PostgreSQL — langsung pakai di Supabase
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

| Aspek | Versi Lama (Legacy) | Versi Baru (Supabase) |
|---|---|---|
| **Backend** | Express.js di server | Supabase Edge Functions (hanya untuk ops kompleks) |
| **Database** | PostgreSQL langsung | Supabase PostgreSQL (hosted, managed) |
| **Auth** | Custom JWT + bcrypt | Supabase Auth (siap pakai) |
| **Storage** | AWS S3 + Express middleware | Supabase Storage |
| **Hosting** | Deploy manual server | Netlify |
| **API** | 46 REST endpoint via Express | Supabase JS SDK langsung (query PostgreSQL) |
| **Triggers** | PostgreSQL stored procedures | Tetap pakai PostgreSQL triggers (langsung jalan) |

## Referensi
- **Use Case & Flow**: Lihat `legacy/skenario/` — skenario bisnis tetap sama.
- **Schema Database**: Lihat `legacy/schema.sql` — langsung dapat dipakai di Supabase.
- **API Spek**: Lihat `legacy/API_CONTRACT.md` — mendeskripsikan operasional apa yang diperlukan.
- **Setup Guide**: Lihat `supabase-migration/` — langkah demi langkah migrasi & integrasi.
