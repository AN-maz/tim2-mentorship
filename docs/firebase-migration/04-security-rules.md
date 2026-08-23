# Firestore Security Rules

> **Seksini** mendefinisikan aturan keamanan Firestore yang menggantikan middleware Express auth (`backend/src/middlewares/auth.js`).

---

## 1. Prinsip

- **Guest** (tidak login): bisa baca materi publik, bisa daftar/masuk.
- **User** (login biasa): bisa baca semua konten publik, ikut kuis, beri rating/komentar, kelola kuis/materi sendiri.
- **Admin** (role = "admin"): bisa semua, plus kelola user, moderasi, atur XP/rank, reset season.

Role diambil dari dokumen `akun/{firebaseUid}` field `role`.

---

## 2. Rule Definition (firestore.rules)

```firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ===== Helper: cek apakah user adalah admin =====
    function isAdmin() {
      return request.auth != null
        && get(/databases/$(database)/documents/akun/$(request.auth.uid)).data.role == 'admin';
    }

    // ===== Helper: cek apakah user adalah pemilik dokumen =====
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // ==========================================================
    // AKUN
    // ==========================================================
    match /akun/{uid} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.keys().hasOnly([
          'email', 'namaLengkap', 'role', 'statusAktif', 'tanggalDaftar'
        ]);
      allow update: if isOwner(uid) || isAdmin();
    }

    // ==========================================================
    // PENGGUNA (termasuk admin)
    // ==========================================================
    match /pengguna/{uid} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == uid;
      allow update: if isOwner(uid) || isAdmin();
      // Admin bisa update XP/rank untuk semua user
      allow update: if isAdmin()
        && request.resource.data.keys().hasOnly([
          'xpLearner', 'xpCreator', 'totalXP', 'rankPeringkat',
          'currentSeasonXP', 'badge'
        ]);
    }

    // ==========================================================
    // MATERI
    // ==========================================================
    match /materi/{materiId} {
      // Semua orang bisa baca materi publik
      allow read: if resource.data.status_publik == true;

      // User login bisa baca materi publik + materi milik sendiri (termasuk non-publik)
      allow read: if request.auth != null
        && (resource.data.status_publik == true
            || resource.data.idPenulis == request.auth.uid);

      // Hanya pemilik yang bisa create/update/delete materi
      allow create: if request.auth != null
        && request.resource.data.idPenulis == request.auth.uid
        && request.resource.data.keys().hasOnly([
          'judulMateri', 'kontenMarkdown', 'idPenulis', 'namaPenulis',
          'tanggalUnggah', 'totalDilihat', 'ratingRataRata', 'ratingCount',
          'status_publik', 'fileUrls', 'tags'
        ]);

      allow update: if resource.data.idPenulis == request.auth.uid
        && request.resource.data.keys().hasOnly([
          'judulMateri', 'kontenMarkdown', 'tanggalEdit', 'fileUrls', 'tags'
        ]);

      allow delete: if resource.data.idPenulis == request.auth.uid
        && resource.data.status_publik == true;

      // Admin bisa update status_publik, alasan_moderate, moderated_by, dst
      allow update: if isAdmin()
        && request.resource.data.keys().hasOnly([
          'status_publik', 'alasan_moderate', 'moderated_by', 'moderated_at'
        ]);

      // --- SUB-KOLEKSI: rating ---
      match /rating/{userId} {
        // Rating hanya bisa dibuat/updated oleh diri sendiri
        allow create: if request.auth != null
          && request.auth.uid == userId
          && request.resource.data.nilaiRating >= 1
          && request.resource.data.nilaiRating <= 5;

        allow update: if request.auth.uid == userId;
        allow read: if request.auth != null;
        // User hanya bisa hapus rating sendiri
        allow delete: if request.auth.uid == userId;
      }

      // --- SUB-KOLEKSI: komentar ---
      match /komentar/{komentarId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null
          && request.resource.data.idPengguna == request.auth.uid
          && request.resource.data.teksKomentar.size() <= 1000
          && request.resource.data.teksKomentar.size() > 0;
        allow update: if resource.data.idPengguna == request.auth.uid;
        allow delete: if resource.data.idPengguna == request.auth.uid || isAdmin();
      }
    }

    // ==========================================================
    // KUIS
    // ==========================================================
    match /kuis/{kuisId} {
      allow read: if resource.data.status_publik == true;
      allow read: if request.auth != null && resource.data.idCreator == request.auth.uid;

      allow create: if request.auth != null
        && request.resource.data.idCreator == request.auth.uid;

      allow update: if resource.data.idCreator == request.auth.uid;
      allow update: if isAdmin()
        && request.resource.data.keys().hasOnly([
          'status_publik', 'alasan_moderate', 'moderated_by', 'moderated_at'
        ]);

      allow delete: if resource.data.idCreator == request.auth.uid;

      // --- SUB-KOLEKSI: soal ---
      match /soal/{soalId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null
          && get(/databases/$(database)/documents/kuis/$(kuisId)).data.idCreator == request.auth.uid;
        allow update, delete: if
          get(/databases/$(database)/documents/kuis/$(kuisId)).data.idCreator == request.auth.uid;
      }
    }

    // ==========================================================
    // RIWAYAT BELAJAR
    // ==========================================================
    match /riwayat_belajar/{riwayatId} {
      // Bisa baca milik sendiri, admin bisa lihat semua
      allow read: if request.auth != null
        && (resource.data.idPengguna == request.auth.uid || isAdmin());

      // User bisa create riwayat untuk diri sendiri
      allow create: if request.auth != null
        && request.resource.data.idPengguna == request.auth.uid;

      // Read-only setelah dibuat (trigger Cloud Function yang update XP)
      allow update: if false;
      allow delete: if isAdmin();
    }

    // ==========================================================
    // SISTEM CONFIG (admin only)
    // ==========================================================
    match /system_config/{configId} {
      allow read: if request.auth != null;
      allow create, update, delete: if isAdmin();
    }

    // ==========================================================
    // SEASON & SEASON_WINNERS
    // ==========================================================
    match /season/{seasonId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();

      match /winners/{winnerId} {
        allow read: if true;
        allow create, update, delete: if isAdmin();
      }
    }

    // ==========================================================
    // LOG KOLEKSI (read admin only, write via Functions)
    // ==========================================================
    match /moderation_log/{logId} {
      allow read: if isAdmin();
      allow create: if false;  // hanya via Cloud Function
      allow update, delete: if false;
    }
    match /audit_log/{logId} {
      allow read: if isAdmin();
      allow create: if false;
      allow update, delete: if false;
    }
    match /config_change_log/{logId} {
      allow read: if isAdmin();
      allow create: if false;
      allow update, delete: if false;
    }
  }
}
