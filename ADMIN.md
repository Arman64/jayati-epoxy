# Panel Admin & CRM — Jayati Epoxy

Panel internal untuk mengelola prospek yang masuk dari website.
URL: `/admin` · Tidak diindeks mesin pencari (`robots.txt` + header `X-Robots-Tag`).

---

## Akun demo (WAJIB diganti sebelum online)

| Email | Kata sandi | Peran |
|---|---|---|
| `owner@jayatiepoxy.id` | `JayatiDemo2026!` | Pemilik |
| `staff@jayatiepoxy.id` | `StafDemo2026!` | Staf |

Kata sandi ini hanya untuk uji coba di komputer lokal dan **tercatat di dokumen
ini**, jadi anggap sudah bocor. Ganti dengan:

```bash
npm run db:seed -- owner@domainanda.com "Nama Anda" "KataSandiBaruYangPanjang" owner
```

Perintah `db:seed` menimpa akun bila emailnya sudah ada, jadi aman dipakai untuk
mengganti kata sandi.

---

## Perbedaan peran

| Kemampuan | Pemilik | Staf |
|---|:--:|:--:|
| Lihat dasbor & daftar prospek | ✅ | ✅ |
| Ubah status, petugas, nilai, jadwal | ✅ | ✅ |
| Tambah catatan follow-up | ✅ | ✅ |
| Unduh CSV | ✅ | ✅ |
| Tambah / kelola pengguna | ✅ | ❌ |
| Hapus prospek | ✅ | ❌ |

Menu "Pengguna" otomatis disembunyikan dari staf, dan API-nya tetap menolak
dengan 403 walau URL-nya diketik langsung.

---

## Alur kerja prospek

Status berurutan: **Baru → Dihubungi → Survei → Penawaran → Menang / Kalah**

Setiap perubahan status, penugasan, nilai proyek, dan jadwal follow-up dicatat
otomatis di tabel `lead_events` lengkap dengan siapa yang mengubah dan kapan —
tampil di panel "Riwayat perubahan" pada halaman detail.

**Estimasi nilai proyek** diisi manual setelah survei. Angka ini dijumlahkan di
dasbor sebagai total nilai proyek yang dimenangkan.

**Follow-up terlewat** di dasbor menghitung prospek yang tanggal follow-up-nya
sudah lewat tapi statusnya belum Menang/Kalah.

---

## Database

Skema: `db/schema.sql` — 5 tabel.

| Tabel | Isi |
|---|---|
| `users` | akun admin, kata sandi di-hash bcrypt (cost 12) |
| `leads` | data prospek + kolom pipeline CRM |
| `lead_notes` | catatan follow-up |
| `lead_events` | jejak audit perubahan |
| `sessions` | sesi login, bisa dicabut |

### Perintah

```bash
npm run db:migrate      # buat / perbarui tabel (aman diulang)
npm run db:seed -- <email> <nama> <sandi> [owner|staff]
npm run db:status       # ringkasan isi database
npm run db:import       # impor lead lama dari .data/leads.jsonl
npm run db:purge-test   # hapus lead uji coba
```

### Menghubungkan ke Postgres

Isi `DATABASE_URL` di `.env.local`:

```
# Neon
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
# Supabase
DATABASE_URL=postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
```

SSL diaktifkan otomatis bila host mengandung `neon.tech`, `supabase.co`,
`vercel-storage.com`, `render.com`, atau URL memuat `sslmode=require`.

Setelah itu jalankan `npm run db:migrate` lalu `npm run db:seed`.

---

## Keamanan yang sudah diterapkan

- Kata sandi di-hash **bcrypt cost 12**, tidak pernah disimpan polos
- Sesi disimpan di database, **bisa dicabut** — logout langsung mematikan sesi
- Cookie `HttpOnly`, `SameSite=Lax`, `Secure` saat produksi
- Login dibatasi **8 percobaan per 10 menit** per alamat IP
- bcrypt tetap dijalankan untuk email yang tidak terdaftar, supaya penyerang
  tidak bisa menebak email mana yang valid dari selisih waktu respons
- Semua query memakai **parameter terpisah** — bukan gabungan string
- ID di URL divalidasi `^\d+$` sebelum menyentuh database
- Middleware memblokir seluruh `/admin/*`, dan setiap halaman/API **memvalidasi
  ulang sesi ke database** (middleware saja tidak cukup karena berjalan di Edge
  dan hanya bisa melihat ada/tidaknya cookie)
- Ekspor CSV mengawali sel `=`, `+`, `-`, `@` dengan kutip tunggal untuk mencegah
  formula injection saat dibuka di Excel

### Sebelum online

1. Ganti kedua kata sandi demo
2. Pastikan situs berjalan di **HTTPS** (cookie `Secure` baru aktif di produksi)
3. Pertimbangkan membatasi `/admin` per alamat IP kantor bila memungkinkan
4. Backup database berkala — lead adalah aset bisnis

---

## Catatan teknis

`src/lib/leads.ts` memakai `import 'server-only'` sehingga tidak bisa
tidak sengaja terbawa ke bundel browser. Konstanta status yang dibutuhkan
komponen klien dipisah ke `src/lib/leadStatus.ts`.

Form publik di `/kontak` kini menulis langsung ke Postgres. Bila database
sedang bermasalah, API mengembalikan **503** dengan pesan yang mengarahkan
pengunjung ke WhatsApp — lead tidak pernah hilang diam-diam, dan kegagalan
tercatat di log server.
