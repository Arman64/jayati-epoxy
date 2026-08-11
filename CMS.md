# Panduan CMS — Jayati Epoxy

Dokumen ini menjelaskan cara mengelola isi website tanpa menyentuh kode.
Semua menu di bawah ada di panel admin, alamatnya `/admin`.

---

## 1. Pengaturan situs — `/admin/pengaturan`

Hanya **Pemilik** yang bisa membuka menu ini. Ada lima kelompok pengaturan.
Setiap kolom yang dikosongkan otomatis memakai nilai bawaan dari kode, jadi
website tidak akan pernah tampil kosong karena salah hapus.

| Kelompok | Isinya |
|---|---|
| **Profil Perusahaan** | Nama badan usaha, nama merek, tagline, tentang perusahaan, visi, misi, nilai |
| **Kontak & Alamat** | Telepon, WhatsApp, email, alamat lengkap, URL Maps, area layanan, jam operasional, pesan WhatsApp bawaan |
| **Media Sosial** | Instagram, Facebook, TikTok, YouTube, LinkedIn |
| **Tombol CTA** | Tombol mengambang & sticky bar mobile (lihat bagian 4) |
| **SEO & Analytics** | URL situs, template judul, meta description bawaan, gambar OG, GTM, GA4 |

Perubahan langsung tampil di website — tidak perlu build ulang.

**Validasi otomatis.** Sistem menolak email dengan format salah, nomor telepon
yang bukan angka, dan URL situs yang tidak lengkap. Ini mencegah nomor
WhatsApp rusak diam-diam dan tombol berhenti berfungsi.

---

## 2. Konten situs — `/admin/konten`

Hanya **Pemilik**. Di sinilah data yang dipakai berulang di banyak halaman
disimpan satu kali. Mengubahnya di sini akan mengubah **seluruh halaman**
yang memakainya — termasuk beranda, halaman harga, landing page iklan, dan
halaman buatan sendiri.

| Koleksi | Isi | Terpakai di |
|---|---|---|
| Sistem Epoxy | Nama, ketebalan, dan harga tiga tier | Harga, beranda, kalkulator, kartu sistem |
| Layanan Utama | Kartu layanan + tautannya | Beranda, footer |
| Layanan Lain | Layanan pendukung | Tentang kami, jasa |
| Tahapan Kerja | Langkah pengerjaan bernomor | Jasa, halaman kustom |
| Alasan Memilih Kami | Daftar keunggulan | Beranda |
| FAQ Umum | Pertanyaan umum | Beranda, jasa, LP |
| FAQ Harga | Pertanyaan seputar biaya | Halaman harga |
| Angka Kepercayaan | Statistik singkat | Beranda |
| Kota | Daftar kota layanan | Area layanan, footer |

Setiap item bisa diurutkan (**↑ ↓**), dinonaktifkan sementara, atau dihapus.
Item yang dinonaktifkan langsung hilang dari semua halaman publik, dan
penomoran tahapan menyesuaikan sendiri.

**Pengaman harga.** Harga tier besar tidak boleh lebih mahal daripada tier
kecil — sistem menolak simpanan semacam itu dan menjelaskan alasannya. Kolom
wajib yang kosong juga ditolak sebelum tersimpan.

Setiap perubahan disimpan beserta versi sebelumnya, sehingga jejak siapa
mengubah apa tetap ada.

---

## 3. Pengaturan halaman — `/admin/halaman`

Hanya **Pemilik**. Mengatur 13 halaman publik satu per satu:

- **Judul (title tag)** — muncul di tab browser dan hasil Google. Ideal 30–65 karakter.
- **Meta description** — ringkasan di hasil pencarian. Ideal 70–165 karakter.
- **Judul utama (H1)** — judul besar di halaman.
- **Paragraf pembuka** — teks di kotak "Jawaban singkat".
- **Gambar OG** — gambar saat tautan dibagikan ke WhatsApp/Facebook.
- **Jangan indeks** — halaman tetap bisa dibuka, tapi diminta tidak muncul di Google.
- **Sertakan di sitemap** + **prioritas**.

Penghitung karakter berubah kuning bila panjang teks di luar rentang ideal.

Halaman yang di-*noindex* atau dikeluarkan dari sitemap otomatis hilang dari
`sitemap.xml` — tidak ada langkah manual tambahan.

### Membuat halaman baru

Di bagian bawah `/admin/halaman` ada **Halaman buatan sendiri**. Tekan
**+ Halaman baru**, isi nama halaman, lalu alamatnya terisi otomatis (bisa
diubah). Halaman baru selalu lahir sebagai **draf** — belum bisa dibuka
pengunjung dan belum masuk sitemap sampai Anda menekan **Terbitkan**.

Alamat yang sudah dipakai halaman bawaan (`/kontak`, `/blog`, `/admin`, dan
lainnya) akan ditolak, begitu pula alamat berhuruf besar atau berspasi.

### Menyusun isi halaman

Buka halaman buatan Anda untuk masuk ke penyusun seksi. Tersedia 15 jenis seksi:

| Seksi | Isi |
|---|---|
| Hero | Judul H1, paragraf pembuka, dua tombol |
| Jawaban singkat | Kotak jawaban 40–60 kata di awal halaman |
| Teks bebas | Satu judul H2 dan beberapa paragraf |
| Daftar centang | Judul dengan poin bertanda centang |
| Kartu sistem epoxy | Otomatis dari Konten → Sistem Epoxy, lengkap harga |
| Tabel harga | Pricelist per m² menurut tier luas |
| Kalkulator estimasi | Kalkulator biaya interaktif |
| Tahapan pengerjaan | Otomatis dari Konten → Tahapan Kerja |
| Alasan memilih kami | Otomatis dari Konten → Alasan Memilih Kami |
| Kartu layanan | Otomatis dari Konten → Layanan Utama |
| Angka kepercayaan | Otomatis dari Konten → Angka Kepercayaan |
| Galeri proyek | Foto proyek asli perusahaan |
| Daftar FAQ | Dari FAQ Umum atau FAQ Harga + JSON-LD FAQPage |
| Formulir penawaran | Formulir lengkap, prospek masuk ke menu Prospek |
| Ajakan bertindak | Blok ajakan dengan tombol |

Tiap seksi punya tombol **↑ ↓** untuk urutan, **Sembunyikan** untuk
menonaktifkan sementara tanpa menghapus, **Ubah isi** untuk mengedit teks, dan
**Hapus**. Semua perubahan langsung tersimpan.

Seksi yang menarik data dari menu Konten tidak perlu diisi ulang — begitu harga
atau FAQ diubah di sana, halaman ini ikut berubah.

Hero, Jawaban singkat, Kalkulator, dan Formulir hanya boleh satu per halaman.
Bila Anda tidak memasang seksi Hero, sistem tetap membuatkan satu H1 dari nama
halaman agar struktur SEO tidak rusak.

**Halaman bawaan** (Beranda, Harga, Kontak, dan seterusnya) tidak bisa disusun
ulang di sini — tata letaknya dipegang kode agar kecepatan dan SEO-nya terjaga.
Teksnya diubah lewat kolom di atas atau menu Konten.

---

## 4. Blog — `/admin/blog`

Staf boleh menulis dan mengajukan; **hanya Pemilik yang boleh menyetujui dan
menerbitkan.**

### Alur redaksi

```
Draf → Menunggu Review → Disetujui → Terbit
                ↓
           Dikembalikan (dengan catatan)
```

1. **Tulis artikel baru** — membuat draf kosong.
2. Isi metadata, paragraf pembuka, bagian isi (H2), dan FAQ.
3. **Periksa kualitas** — validator memberi daftar masalah.
4. **Ajukan untuk review** — hanya berhasil bila validator lolos.
5. Pemilik menekan **Setujui** atau **Kembalikan** (bisa menyertakan catatan).
6. Pemilik menekan **Terbitkan sekarang**.

Publikasi **tidak mungkin** dilakukan dari status selain "Disetujui" — baik
lewat panel admin maupun lewat otomasi MCP. Ini gerbang mutu utama.

### Yang diperiksa validator

**Wajib diperbaiki (merah):** judul/deskripsi kosong · slug tidak valid atau
sudah dipakai · penulis/peninjau kosong · pembuka kosong · kurang dari 2 bagian
H2 · kurang dari 320 kata · klaim harga tanpa sumber internal · klaim garansi
berdurasi · statistik tanpa sumber · kepadatan kata kunci di atas 3% · FAQ tidak
lengkap.

**Saran (kuning):** judul lebih dari 65 karakter · deskripsi di luar 70–165 ·
bagian tanpa isi · kata kunci tidak muncul · belum ada tautan internal · belum ada FAQ.

Setiap perubahan tersimpan sebagai revisi dan tampil di "Riwayat revisi".

---

## 5. Tombol telepon & WhatsApp

Diatur di **Pengaturan → Tombol CTA**.

**Tombol mengambang** muncul di pojok kanan bawah semua halaman publik setelah
jeda singkat (bawaan 1,2 detik) supaya tidak menutupi tampilan awal. Label
WhatsApp tampil 5 detik lalu mengecil jadi ikon. Pengunjung bisa menutupnya, dan
pilihan itu bertahan sampai tab ditutup.

**Sticky bar mobile** adalah bar Telepon / WhatsApp / Penawaran di bawah layar
ponsel. Bisa dimatikan terpisah.

Semua klik tercatat sebagai `whatsapp_click` dan `phone_click` beserta posisinya,
sehingga bisa dibandingkan mana yang paling menghasilkan.

---

## 6. Otomasi konten MCP — `/admin/mcp`

Hanya **Pemilik**. Memungkinkan asisten AI menyusun brief dan draf artikel
lewat `POST /api/mcp`.

### Membuat token

1. Isi nama token, centang hak akses yang diperlukan.
2. **Salin token saat itu juga** — nilainya tidak bisa dilihat lagi (hanya
   hash SHA-256 yang disimpan).
3. Token bisa dicabut kapan saja; permintaan berikutnya langsung ditolak.

Hak akses: `read` (baca) · `write` (buat brief & draf) · `publish` (terbitkan
artikel yang sudah disetujui).

### Cara memanggil

```
POST /api/mcp
Authorization: Bearer jyt_xxxxxxxx
Content-Type: application/json

{ "tool": "create_content_brief", "request_id": "unik-001", "params": { ... } }
```

`GET /api/mcp` menampilkan daftar tool beserta hak akses token Anda.

### 12 tool tersedia

| Tool | Akses | Fungsi |
|---|---|---|
| `create_content_brief` | write | Membuat brief: topik, intent, kata kunci, pertanyaan |
| `list_content_briefs` | read | Daftar brief |
| `generate_blog_draft` | write | Membuat draf dari brief |
| `validate_content` | read | Menjalankan validator |
| `create_internal_link_suggestions` | read | Usulan tautan internal |
| `submit_for_review` | write | Mengajukan ke review (gagal bila validator gagal) |
| `publish_approved_post` | publish | Menerbitkan — **menolak status selain `approved`** |
| `refresh_sitemap` | write | Menyegarkan sitemap |
| `get_search_console_performance` | read | Data Search Console |
| `list_posts` | read | Daftar artikel |
| `update_draft` | write | Memperbarui draf (menolak artikel terbit) |
| `get_post` | read | Detail satu artikel |

### Pengaman

- **Idempoten.** `request_id` yang sama tidak pernah dieksekusi dua kali —
  panggilan ulang mengembalikan hasil tersimpan dengan `idempotent_replay: true`.
- **Batas waktu 20 detik** per permintaan.
- **Semua permintaan tercatat** di log MCP: tool, status, durasi, pesan galat.
- **Jejak audit CMS** mencatat setiap perubahan konten beserta pelakunya.
- **Tidak ada data fiktif.** `get_search_console_performance` mengembalikan
  `connected: false` bila Search Console belum tersambung, bukan angka karangan.

Kode galat: `401` token salah · `403` hak akses kurang · `404` tool tidak
dikenal · `422` `tool`/`request_id` kosong · `400` galat saat menjalankan.

---

## Ringkasan hak akses

| Menu | Pemilik | Staf |
|---|---|---|
| Dasbor, Prospek | ✅ | ✅ |
| Blog — tulis, edit, ajukan | ✅ | ✅ |
| Blog — setujui, terbitkan, hapus | ✅ | ❌ |
| Konten, Halaman, Pengaturan, Otomasi, Pengguna | ✅ | ❌ |
| Buat/hapus/terbitkan halaman | ✅ | ❌ |
