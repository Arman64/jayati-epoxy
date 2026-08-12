# Daftar Periksa Sebelum Website Dipakai Sungguhan

Website sudah lengkap dan lulus semua pengujian. Berkas ini mencatat hal-hal
yang **wajib dikerjakan manusia** sebelum website dipublikasikan — tidak bisa
diselesaikan dari sisi pemrograman.

Urutkan dari atas. Tiga yang pertama bersifat wajib.

---

## 1. ⚠️ Ganti kata sandi demo — WAJIB

Saat ini website memakai kata sandi contoh yang **tertulis terbuka di
dokumentasi**. Siapa pun yang membaca berkas ini bisa masuk ke panel admin.

Dasbor admin sudah menampilkan peringatan merah selama kata sandi ini masih
dipakai. Peringatan itu hilang sendiri setelah diganti.

```bash
npm run db:seed -- owner@jayatiepoxy.id "Nama Pemilik" "KataSandiBaruYangKuat" owner
npm run db:seed -- staff@jayatiepoxy.id "Nama Staf" "KataSandiStafBaru" staff
```

Gunakan minimal 12 karakter, campur huruf besar-kecil, angka, dan simbol.
Jangan pakai nama perusahaan atau tanggal lahir.

---

## 2. ⚠️ Bersihkan data uji coba — WAJIB

Selama pembangunan, pengujian otomatis membuat prospek dan akun palsu. Semuanya
harus dihapus supaya laporan penjualan tidak tercampur data karangan.

```bash
npm run db:purge-test
```

Perintah ini menghapus prospek uji, akun bernama `tes…@jayatiepoxy.id`, sesi
kedaluwarsa, serta teks dan gambar sisa pengujian. Akun asli tidak tersentuh.

Setelah dijalankan, pastikan hasilnya nol:

```bash
npm run db:status
```

**Catatan penting:** setiap kali pengujian otomatis dijalankan lagi, data uji
akan muncul kembali. Jalankan perintah ini **paling akhir**, setelah semua
pengujian selesai dan sebelum website dibuka untuk umum.

---

## 3. ⚠️ Isi variabel lingkungan produksi — WAJIB

Berkas `.env.local` tidak ikut tersimpan di git (memang disengaja, karena
berisi rahasia). Di server produksi, isi minimal:

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Alamat koneksi Postgres produksi |
| `SITE_URL` | Alamat asli website, contoh `https://jayatiepoxy.co.id` |
| `SESSION_SECRET` | Teks acak panjang untuk mengamankan sesi login |

`SITE_URL` memengaruhi canonical, sitemap, dan tautan Open Graph. Bila salah,
Google bisa mengindeks alamat yang keliru.

---

## 4. Verifikasi Google Search Console

Setelah domain aktif:

1. Daftarkan domain di Google Search Console.
2. Kirim `https://domain-anda.co.id/sitemap.xml`.
3. Minta pengindeksan untuk halaman utama dan halaman layanan.

Ini juga syarat agar fitur laporan performa di menu Otomasi bisa terhubung.
Sebelum terhubung, fitur itu menjawab "belum tersambung" — bukan galat.

---

## 5. Periksa ulang isi yang bersifat klaim

Sudah memakai data asli dari company profile, tapi mohon dibaca ulang oleh
pihak perusahaan:

- **Harga** di tab Dipakai bersama → Sistem & Harga Epoxy. Terakhir ditinjau
  11 Agustus 2026. Perbarui bila sudah berubah.
- **Nomor WhatsApp dan email** di menu Pengaturan.
- **Daftar proyek dan jumlah klien** di halaman Portofolio.
- **Sertifikasi ISO 9001** — di website ditulis berlaku untuk *material*, bukan
  perusahaan. Jangan diubah menjadi klaim sertifikasi perusahaan kecuali
  memang ada dokumennya.

Website sengaja **tidak** memuat klaim garansi berdurasi maupun statistik yang
tidak bersumber. Validator blog akan menolak tulisan yang memuat klaim semacam
itu — ini disengaja, jangan dilonggarkan.

---

## 6. Uji coba terakhir sebelum diumumkan

- [ ] Kirim satu penawaran lewat formulir di `/kontak`, pastikan masuk ke menu Prospek.
- [ ] Klik tombol WhatsApp dan telepon dari ponsel sungguhan.
- [ ] Buka website di ponsel, periksa tampilan halaman Harga.
- [ ] Masuk ke admin memakai kata sandi baru, pastikan peringatan merah hilang.
- [ ] Hapus prospek hasil uji coba di atas.

---

## Menjalankan ulang pengujian

```bash
npm run audit          # SEO & kualitas, 769 pemeriksaan
node ~/admincheck.mjs  # panel admin & keamanan
node ~/copycheck.mjs   # CMS teks & foto per halaman
node ~/pagecheck.mjs   # penyusun halaman
node ~/ctacheck.mjs    # tombol ajakan & pelacakan
node ~/contentcheck.mjs
node ~/uibuilder.mjs
node ~/perf.mjs        # kecepatan halaman
```

Pengujian peramban butuh Chromium:

```bash
cd ~ && npm install playwright-core --no-save && npx playwright install chromium
export PW_CHROME=$HOME/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome
```

Jangan lupa `npm run db:purge-test` setelah selesai.
