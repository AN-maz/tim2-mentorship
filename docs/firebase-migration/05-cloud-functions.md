# Cloud Functions Design

> Cloud Functions menggantikan **trigger PostgreSQL** dan **logic server-side** (Express middleware, controller). Hanya dipakai untuk logika yang butuh keamanan server atau otomatisasi.

---

## 1. Trigger Functions (onWrite / onCreate)

### `fnUpdateRatingMateri` — ganti trigger `fn_update_rating_materi()` SQL

**Trigger:** `functions.firestore.document('materi/{materiId}/rating/{ratingId}')`
**Event:** `.onWrite()` (insert, update, delete)

**Logika:**
1. Hitung rata-rata rating dari semua dokumen di `materi/{materiId}/rating/`
2. Update field `ratingRataRata` dan `ratingCount` di `materi/{materiId}`

```js
exports.fnUpdateRatingMateri = functions.firestore
  .document('materi/{materiId}/rating/{ratingId}')
  .onWrite(async (change, context) => {
    const { materiId } = context.params;
    const ratingSnap = await admin.firestore()
      .collection('materi').doc(materiId)
      .collection('rating').get();

    let total = 0, count = 0;
    ratingSnap.forEach(doc => {
      total += doc.data().nilaiRating;
      count++;
    });

    const avg = count > 0 ? total / count : 0;
    await admin.firestore().collection('materi').doc(materiId)
      .update({ ratingRataRata: avg, ratingCount: count });
  });
```

### `fnUpdateTotalXP` — ganti trigger `fn_update_total_xp()` SQL

**Trigger:** `functions.firestore.document('riwayat_belajar/{riwayatId}')`
**Event:** `.onCreate()`

**Logika:**
1. Ambil dokumen `riwayat_belajar/{riwayatId}`
2. Ambil XP settings dari `system_config/xp_settings`
3. Hitung XP berdasarkan `tipeKonten`:
   - `materi` → +10 (baca materi)
   - `kuis` → skor/100 × poinXPDefault + (benar × kuis_benar_bonus)
4. Update `xpLearner` + `totalXP` di `pengguna/{idPengguna}`
5. Hitung rank otomatis berdasarkan `rank_thresholds`

```js
exports.fnUpdateTotalXP = functions.firestore
  .document('riwayat_belajar/{riwayatId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const userRef = admin.firestore().collection('pengguna').doc(data.idPengguna);
    const userSnap = await userRef.get();
    const user = userSnap.data();

    // Hitung XP berdasarkan tipe konten
    const xpSettings = (await admin.firestore()
      .collection('system_config').doc('xp_settings').get()).data();

    let xpGained = 0;
    if (data.tipeKonten === 'materi') {
      xpGained = xpSettings.baca_materi;
    } else if (data.tipeKonten === 'kuis') {
      // skor/100 × poinXPDefault + (benar × bonus per soal benar)
      xpGained = Math.round((data.skor / 100) * xpSettings.poinXPDefault)
        + (data.benar * xpSettings.kuis_benar_bonus);
    }

    // Update XP
    const totalXP = user.totalXP + xpGained;
    await userRef.update({
      xpLearner: admin.firestore.FieldValue.increment(
        data.tipeKonten === 'materi' ? xpGained : 0),
      xpCreator: admin.firestore.FieldValue.increment(0),
      totalXP: totalXP,
    });

    // Hitung rank otomatis
    const thresholds = (await admin.firestore()
      .collection('system_config').doc('rank_thresholds').get()).data();

    let rank = 'Unranked';
    if (totalXP >= thresholds.platinum) rank = 'Platinum';
    else if (totalXP >= thresholds.gold) rank = 'Gold';
    else if (totalXP >= thresholds.silver) rank = 'Silver';
    else if (totalXP >= thresholds.bronze) rank = 'Bronze';

    await userRef.update({ rankPeringkat: rank });
  });
```

---

## 2. Callable Functions (admin-only)

Callable Functions dipanggil dari frontend via `firebase/functions` SDK. Verifikasi role admin di dalam function.

### `fnResetSeason` — ganti SQL transaction di `schema.sql`

**Trigger:** HTTP callable
**Auth:** Verifikasi `context.auth.token.admin === true`

**Logika:**
1. Archive top 10 pengguna ke `season/{seasonId}/winners/`
2. Reset semua `xpLearner`, `xpCreator`, `totalXP`, `currentSeasonXP` ke 0 di koleksi `pengguna`
3. Update `rankPeringkat` semua user ke "Unranked"
4. Buat dokumen season baru di koleksi `season`

```js
exports.fnResetSeason = functions.https.onCall(async (data, context) => {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const seasonName = data.seasonName;
  const db = admin.firestore();
  const batch = db.batch();

  // 1. Archive winners
  const usersSnap = await db.collection('pengguna')
    .orderBy('totalXP', 'desc').limit(10).get();

  usersSnap.forEach(doc => {
    const user = doc.data();
    const winnerRef = db.collection('season').doc('current')
      .collection('winners').doc(user.idAkun);
    batch.set(winnerRef, {
      idPengguna: user.idAkun,
      namaLengkap: user.namaLengkap || 'Unknown',
      totalXP: user.totalXP,
      xpLearner: user.xpLearner,
      xpCreator: user.xpCreator,
      rankPeringkat: user.rankPeringkat,
      end_date: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  // 2. Reset XP semua user
  const allUsers = await db.collection('pengguna').get();
  allUsers.forEach(doc => {
    batch.update(doc.ref, {
      xpLearner: 0,
      xpCreator: 0,
      totalXP: 0,
      currentSeasonXP: 0,
      rankPeringkat: 'Unranked',
    });
  });

  // 3. Update season metadata
  batch.set(db.collection('season').doc('current'), {
    seasonName,
    startDate: admin.firestore.FieldValue.serverTimestamp(),
    endDate: null,
    status: 'active',
  });

  await batch.commit();
  return { success: true, message: `Season reset. ${allUsers.size} users updated.` };
});
```

### `fnRecalculateXP` — ganti "Rekalkulasi XP Manual" di UC-14

**Trigger:** HTTP callable (admin only)
**Logika:**
1. Iterate semua `riwayat_belajar`
2. Kelompokkan per `idPengguna`
3. Hitung ulang `xpLearner` dan `xpCreator` dari riwayat
4. Update `pengguna/{uid}` via batch

### `fnModerateContent` — ganti moderasi konten (hide/approve/delete)

**Trigger:** HTTP callable (admin only)
**Params:** `{ contentType: 'materi'|'kuis', contentId: string, action: 'hide'|'approve'|'delete', reason?: string }`
**Logika:**
- `hide`: set `status_publik = false`, `alasan_moderate = reason`, log ke `moderation_log`
- `approve`: set `status_publik = true`, hapus `alasan_moderate`, log ke `moderation_log`
- `delete`: hapus dokumen permanen, log ke `moderation_log`

### `fnUpdateXpConfig` / `fnUpdateRankTiers` — ganti update config

**Trigger:** HTTP callable (admin only)
**Logika:** Update dokumen `system_config/xp_settings` atau `system_config/rank_thresholds`, log perubahan ke `config_change_log`.

### `fnUpdateUserRole` — ganti ubah role user (UC-12)

**Trigger:** HTTP callable (admin only)
**Params:** `{ userId: string, newRole: 'user'|'admin' }`
**Logika:** Update field `role` di `akun/{uid}`, log ke `audit_log`.

### `fnSuspendUser` / `fnUnsuspendUser` — ganti suspend/unsuspend (UC-12)

**Trigger:** HTTP callable (admin only)
**Logika:**
- `suspend`: set `statusAktif = false`, isi `alasanSuspend`, log ke `audit_log`
- `unsuspend`: set `statusAktif = true`, hapus `alasanSuspend`, log ke `audit_log`

---

## 3. Pemetaan: Dari SQL Trigger ke Firebase

| Fitur SQL (Lama) | Firebase Functions (Baru) |
|---|---|
| `fn_update_rating_materi()` (AFTER INSERT/UPDATE/DELETE ON rating) | `onWrite` trigger `materi/{id}/rating/{ratingId}` |
| `fn_update_total_xp()` (BEFORE INSERT/UPDATE ON pengguna) | `onCreate` trigger `riwayat_belajar/{id}` → update `pengguna` |
| `UNIQUE INDEX uq_riwayat_user_konten` | Validasi di client + Firestore rules + transactional check |
| `UNIQUE INDEX uq_rating_user_materi` | Document ID = firebaseUid (auto preve
