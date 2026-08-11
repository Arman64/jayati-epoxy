# Jayati Epoxy — Website & Landing Page

Implementasi PRD v1.0 (Phase 2 Public MVP + Phase 4 Landing Page & Tracking).
Website lead-generation SEO-first untuk jasa epoxy lantai, di bawah brand
**Semesta Bumi Jayati**.

---

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produksi
npm start        # jalankan hasil build
npm run typecheck
```

---

## Warna Brand

Di-sample langsung dari file logo yang dikirim (`uploads/image.png`):

| Token | Hex | Asal di logo |
|---|---|---|
| `navy-900` | `#011E46` | Busur bumi / langit malam |
| `navy-500` | `#17418D` | Highlight orbit biru |
| `forest-700` | `#165326` | Daun & wordmark "SEMESTA BUMI" |
| `leaf-500` | `#6A9929` | Daun muda & aksen "JAYATI" |
| `cream-200` | `#F1F1EB` | Latar logo |

Didefinisikan sebagai skala penuh 50–900 di `tailwind.config.ts`.

---

## Struktur

```
src/
  app/
    layout.tsx              root: font, Organization schema, skip-link
    (site)/                 chrome situs publik (Header/Footer/StickyCta)
      page.tsx              / — homepage
      jasa-epoxy-lantai/    Tier A: jasa, kontraktor, aplikator
      harga-epoxy-lantai/   Tier A: harga + kalkulator estimasi
      epoxy-lantai-rumah/   Tier A: rumah, garasi, kamar mandi, keramik
      epoxy-lantai-industri/Tier A: pabrik, gudang, heavy duty, food grade
      epoxy-floor-coating/  Tier A: floor coating
      portofolio/[slug]     studi kasus proyek
      area-layanan/[kota]   6 kota, konten unik per kota
      blog/[slug]           4 artikel + author/reviewer/tanggal
      tentang-kami, kontak, privacy-policy, terms, terima-kasih
    lp/                     layout minimal, navigasi keluar dibatasi
      jasa-epoxy-lantai/    LP-01
      harga-epoxy-lantai/   LP-02 (+ kalkulator)
      epoxy-lantai-rumah/   LP-03
      epoxy-lantai-industri/LP-04
    api/leads/              POST lead: validasi, honeypot, rate limit
    sitemap.ts, robots.ts
  components/               Header, Footer, form, kalkulator, blok LP
  lib/
    site.ts                 SUMBER TUNGGAL fakta bisnis & NAP
    seo.ts                  metadata + JSON-LD helper
    content.ts              sistem epoxy, harga, proyek, FAQ, blog
    cityContent.ts          konten unik per kota
    analytics.ts            event tracking → dataLayer
    leads.ts                penyimpanan lead (swap ke Postgres di produksi)
```

---

## Kepatuhan PRD

### SEO (§12)
- Canonical absolut HTTPS, unik per URL
- Title & meta description unik (diverifikasi otomatis, tanpa duplikat)
- Satu H1 bermakna per halaman
- JSON-LD: `LocalBusiness`, `Service`, `BreadcrumbList`, `FAQPage`, `Article`
- `FAQPage` hanya dipasang bila FAQ benar-benar tampil di halaman
- Sitemap hanya memuat 27 URL canonical yang 200 & indexable
- LP iklan dan `/terima-kasih` di-`noindex` dan dikeluarkan dari sitemap
- Jawaban langsung (answer-first) di awal setiap halaman penting
- Tabel harga & spesifikasi memakai HTML semantik (`<table>`, `<caption>`, `<th scope>`)

### Performa (§11)
Diukur pada build produksi, viewport mobile 390px:

| Metrik | Target PRD | Hasil |
|---|---|---|
| LCP | ≤2.500 ms | **171 ms** |
| CLS | ≤0,1 | **0** |
| Console error | 0 | **0** |
| First Load JS | — | 96–104 kB |

Semua halaman prerendered (SSG). Font tunggal, subset latin, `display: swap`.

### Konversi (§7, §13)
- Form: nama, WA, kota, jenis bangunan, luas m², kondisi lantai, kebutuhan, pesan, foto
- Anti-spam: honeypot, rate limit, validasi server, cek MIME + ekstensi + ukuran
- Event `dataLayer`: `whatsapp_click`, `phone_click`, `quotation_form_start`,
  `quotation_form_submit`, `file_upload_success`, `schedule_survey_click`,
  `cta_click`, `scroll_50`, `scroll_90`, `lp_view`, `calculator_use`
- Parameter: `page_path`, `page_type`, `campaign`, `keyword_cluster`, `city`,
  `cta_position`, `gclid`, UTM

### Keamanan (§14)
HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy,
X-Frame-Options, `x-powered-by` dimatikan, `noindex` pada `/api/*`.

### Integritas Konten (§19)
Tidak ada klaim tanpa sumber. Seluruh fakta bisnis berasal dari
**Company Profile CV Semesta Bumi Jayati** (diterima 11 Agustus 2026):

| Data | Sumber |
|---|---|
| NAP, email, alamat Kediri | hal. 5 & 13 |
| Daftar layanan | hal. 2, 8, 9, 10 |
| Klaim SNI / ISO 9001 / garansi | hal. 4 & 6 |
| Pricelist 7 ketebalan + curving | hal. 11 |
| 78 nama klien | hal. 12 |
| Visi, misi, value | hal. 3 |
| 23 foto proyek | dokumentasi asli Owner |

`IS_PLACEHOLDER_DATA` di `src/lib/site.ts` sudah **`false`**. Angka yang tidak
ada di dokumen (luas area, durasi, lama garansi, jumlah tahun pengalaman)
sengaja **tidak ditampilkan**. Sisa item untuk Owner ada di
**KONTEN-YANG-HARUS-DIISI.md**.

---

## Audit Otomatis

```bash
npm run build && npm start          # port 3000
BASE=http://localhost:3000 node ../audit.mjs
```

Menjalankan **767 pengecekan**: status HTTP, H1 tunggal, title/description unik,
canonical, OG, alt gambar, JSON-LD valid, breadcrumb, noindex, sitemap,
robots.txt, redirect tanpa loop, 404, header keamanan, dan perilaku API lead
(validasi, honeypot, rate limit, penolakan file berbahaya, 405 pada GET).

Daftar slug portofolio/kota/artikel dibaca langsung dari file sumber, sehingga
audit ikut menyesuaikan saat konten berubah.

Hasil terakhir: **767 lulus, 0 gagal, 0 peringatan.**
Core Web Vitals (12 halaman, viewport 390×844): LCP terburuk **200 ms**,
CLS **0**, error konsol **0**.

---

## Belum Termasuk (fase berikutnya)

Phase 3 (CMS/CRM admin, RBAC, approval, audit log) dan Phase 5 (MCP content
workflow) belum dibangun. `src/lib/leads.ts` sengaja diisolasi sebagai satu titik
ganti menuju PostgreSQL + Prisma/Drizzle.
