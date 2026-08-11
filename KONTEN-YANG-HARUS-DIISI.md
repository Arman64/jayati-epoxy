# Status Data & Sisa Item untuk Owner

> Diperbarui 11 Agustus 2026, setelah **Company Profile CV Semesta Bumi Jayati**
> dan 23 foto proyek asli diterima, serta setelah CMS lengkap terpasang.

> **Sejak CMS terpasang, sebagian besar item di bawah dapat Anda ubah sendiri
> lewat panel admin tanpa menyentuh kode** — lihat kolom "Diubah di mana".

Status: ✅ sudah bersumber dokumen resmi · ⬜ masih perlu keputusan Owner

---

## 1. NAP & Kontak — `src/lib/site.ts` — ✅ SELESAI

Seluruh data diambil dari company profile (hal. 5 & 13).

| Field | Nilai terpasang | Sumber |
|---|---|---|
| `legalName` | CV Semesta Bumi Jayati | hal. 1, 5, 13 |
| `phoneDisplay` / `phoneE164` | 0857-858-22-695 / +6285785822695 | hal. 13 |
| `whatsappE164` | 6285785822695 | hal. 13 |
| `email` | semestabumijayati@gmail.com | hal. 13 |
| `address` | Jalan Tambora, Bandar Lor, Kec. Mojoroto, Kota Kediri, Jawa Timur 64114 | hal. 5, 13 |
| `social.instagram` | @semestabumijayati | seluruh halaman |
| `serviceArea` | Seluruh Indonesia | hal. 12 (sebaran proyek) |

`IS_PLACEHOLDER_DATA` sudah di-set **`false`**.

**Sisa keputusan Owner:**

- ⬜ **Domain final.** Saat ini `https://jayatiepoxy.id`. Bila domain berbeda,
  ubah `site.url` — nilai ini dipakai untuk canonical, sitemap, dan OG URL.
- ⬜ **Jam operasional.** Terpasang Senin–Sabtu 08.00–17.00 WIB (asumsi umum,
  tidak tercantum di company profile). Konfirmasi atau koreksi.
- ⬜ **Link Google Maps.** Company profile menyebut listing
  "CV SEMESTA BUMI JAYATI - KONTRAKTOR EPOXY JAWA TIMUR" tetapi URL-nya berupa
  QR. Kirim URL Maps agar bisa dipasang di halaman kontak.

---

## 2. Harga — `src/lib/content.ts` → `epoxySystems` — ✅ SELESAI

Pricelist resmi (hal. 11) disalin persis, termasuk tiga tier luas area.
Semua entri `unverified: false`.

| Ketebalan | Sistem | < 100 m² | > 100 m² | > 500 m² |
|---|---|---|---|---|
| 1.000 micron | Self Leveling | Rp190.000 | Rp170.000 | Rp150.000 |
| 2.000 micron | Self Leveling | Rp260.000 | Rp240.000 | Rp220.000 |
| 3.000 micron | PU Crete | Rp310.000 | Rp280.000 | Rp250.000 |
| 4.000 micron | PU Crete | Rp370.000 | Rp340.000 | Rp310.000 |
| 6.000 micron | PU Crete | Rp610.000 | Rp580.000 | Rp550.000 |
| 8.000 micron | PU Crete | Rp780.000 | Rp740.000 | Rp700.000 |
| 9.000 micron | PU Crete | Rp930.000 | Rp890.000 | Rp850.000 |
| Curving max 8 cm | — | Rp50.000/m′ | Rp40.000/m′ | Rp30.000/m′ |

Kalkulator di `/harga-epoxy-lantai` menghitung **murni** dari tabel ini
(luas × harga tier + curving × harga tier). Tidak ada faktor pengali karangan.

**Sisa keputusan Owner:**

- ⬜ **PPN.** Situs menyatakan harga "belum termasuk PPN". Konfirmasi benar.
- ⬜ **Masa berlaku.** `priceValidFrom` di-set 2026-01-01 mengikuti judul
  "Cat Epoxy Lantai 2026". Perbarui bila pricelist direvisi.

---

## 3. Garansi — ⬜ PERLU DOKUMEN

Company profile hal. 4 menyatakan produk **"bergaransi resmi"**, dan situs sudah
menampilkan klaim tersebut apa adanya. Namun **masa dan cakupan garansi belum
tertulis di mana pun**.

Agar tidak menjadi klaim menggantung, kirimkan:

1. Masa garansi per sistem (mis. Self-Leveling ... bulan, PU Crete ... bulan).
2. Cakupan (mengelupas? retak? perubahan warna?).
3. Pengecualian (kelembapan beton, kerusakan mekanis, dll).

Setelah tersedia, tambahkan ke `/harga-epoxy-lantai` dan `/terms`.

---

## 4. Portofolio & Foto — ✅ SELESAI (sebagian)

23 foto asli sudah dioptimalkan ke WebP di `public/img/proyek/` dan dipakai di
5 studi kasus:

| Slug | Judul | Jumlah foto |
|---|---|:--:|
| `sppg-sugihwaras-ngluyu` | Dapur SPPG Sugihwaras, Ngluyu — Nganjuk | 4 |
| `sppg-gbranggahan-ngadiluwih` | Dapur SPPG Gbranggahan 2, Ngadiluwih — Kediri | 4 |
| `dapur-sppg-pu-crete` | Dapur Produksi Area Basah | 5 |
| `dapur-komersial-self-leveling` | Ruang Produksi Higienis | 4 |
| `clean-room-cold-storage` | Clean Room & Cold Storage | 6 |

Dua nama proyek terbaca langsung dari tulisan di lantai pada foto, sehingga
lokasinya pasti. Tiga sisanya **belum bisa dipastikan lokasinya** dari foto saja.

**Sisa keputusan Owner:**

- ⬜ **Identifikasi 3 proyek.** Beri tahu nama/lokasi asli untuk
  `dapur-sppg-pu-crete`, `dapur-komersial-self-leveling`, dan
  `clean-room-cold-storage` agar judulnya bisa spesifik seperti dua yang lain.
- ⬜ **Luas area & durasi.** Sengaja **tidak** ditampilkan karena tidak ada di
  dokumen. Kirim bila ingin ditambahkan — angka ini kuat untuk konversi.
- ⬜ **Izin publikasi.** Daftar 80+ klien di `/portofolio` disalin dari company
  profile. Pastikan tidak ada klien yang keberatan namanya tampil publik.

---

## 5. Testimonial — ⬜ BELUM ADA

Company profile tidak memuat kutipan klien, sehingga blok testimonial
**dihapus** dan diganti "Mengapa memilih CV Semesta Bumi Jayati?" (hal. 4).

Bila ingin menampilkan testimonial, kirim per item: nama, jabatan, instansi,
kutipan, dan izin publikasi. Struktur `testimonials` di `content.ts` sudah siap.

---

## 6. Layanan Non-Epoxy — ⬜ OPSIONAL — kini bisa dibuatkan halaman sendiri

Company profile memuat tiga layanan yang belum punya halaman sendiri:

- Clean Room & Sandwich Panel (panel 50/75/100/150 mm)
- HVAC & Ducting (GI, SS, Aluminium + leakage test)
- Konstruksi & Renovasi Industri

Saat ini hanya tampil sebagai kartu di beranda dan mengarah ke
`/jasa-epoxy-lantai`. Bila layanan ini ingin mendatangkan lead sendiri,
masing-masing sebaiknya punya halaman terpisah.

**Kini Anda bisa membuatnya sendiri**: buka `/admin/halaman` → **+ Halaman
baru** → susun seksinya → **Terbitkan**. Contoh yang sudah jadi ada di
`/epoxy-lantai-gudang`. Setelah halamannya terbit, ubah tautan kartu layanan
di `/admin/konten` → **Layanan Utama** → kolom **href** agar mengarah ke sana.

---

## 7. Yang bisa Anda ubah sendiri di panel admin

| Ingin mengubah | Buka menu |
|---|---|
| Harga per m², nama & ketebalan sistem | Konten → Sistem Epoxy |
| Pertanyaan FAQ | Konten → FAQ Umum / FAQ Harga |
| Tahapan pengerjaan, alasan memilih kami | Konten → koleksi terkait |
| Kartu layanan di beranda dan tautannya | Konten → Layanan Utama |
| Daftar kota | Konten → Kota |
| Judul & deskripsi Google tiap halaman | Halaman → pilih halaman |
| Membuat halaman baru | Halaman → + Halaman baru |
| Nomor telepon, alamat, jam buka | Pengaturan → Kontak & Alamat |
| Tombol WhatsApp & telepon mengambang | Pengaturan → Tombol CTA |
| Menulis dan menerbitkan artikel | Blog |

Perubahan harga di menu Konten otomatis merambat ke beranda, halaman harga,
kalkulator, landing page iklan, dan halaman kota sekaligus — tidak perlu
mengedit satu per satu.

---

## 8. Yang Sengaja Tidak Dipasang

Agar tidak ada klaim tanpa sumber:

- Jumlah tahun pengalaman — tidak disebut di company profile.
- Jumlah tim / tenaga ahli — tidak disebut angkanya.
- Sertifikasi ISO milik perusahaan — dokumen hanya menyatakan *material*
  diproduksi dengan standar ISO 9001, bukan perusahaan tersertifikasi.
  Situs sudah menulisnya persis seperti itu.
- Minimum order — tidak ada ketentuannya di dokumen.
