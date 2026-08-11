-- ============================================================
-- Migrasi 003 — Konten terstruktur + susunan bagian per halaman
--
-- Tujuan: Owner dapat memperbarui DATA yang sering berubah
-- (harga, spesifikasi micron, layanan, tahapan kerja, FAQ)
-- tanpa menyentuh kode, dan mengatur bagian mana yang tampil
-- di tiap halaman beserta urutannya.
-- ============================================================

-- ---------- 1. Koleksi konten terstruktur ----------
-- Satu baris = satu item dalam sebuah koleksi (mis. satu sistem epoxy,
-- satu langkah kerja, satu FAQ). Bentuk datanya disimpan di JSONB agar
-- tiap koleksi bebas punya kolom sendiri, tetapi divalidasi di app layer.
CREATE TABLE IF NOT EXISTS content_items (
  id           BIGSERIAL PRIMARY KEY,
  -- 'epoxy_systems' | 'core_services' | 'other_services' | 'work_steps'
  -- | 'why_choose_us' | 'faqs_general' | 'faqs_price' | 'cities' | 'stats'
  collection   TEXT        NOT NULL,
  -- pengenal stabil dalam satu koleksi; dipakai halaman untuk merujuk item
  slug         TEXT        NOT NULL,
  data         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by   BIGINT      REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (collection, slug)
);

CREATE INDEX IF NOT EXISTS idx_content_items_coll
  ON content_items (collection, sort_order)
  WHERE is_active;

DROP TRIGGER IF EXISTS trg_content_items_updated ON content_items;
CREATE TRIGGER trg_content_items_updated
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ---------- 2. Susunan bagian per halaman ----------
-- Mengatur bagian mana yang tampil di sebuah halaman, urutannya,
-- dan penyetelan per bagian (judul, teks pengantar, batas jumlah item).
CREATE TABLE IF NOT EXISTS page_sections (
  id           BIGSERIAL PRIMARY KEY,
  page_id      BIGINT      NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  -- tipe bagian, mis. 'hero' | 'systems' | 'pricing_table' | 'steps' | 'faq'
  kind         TEXT        NOT NULL,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  is_visible   BOOLEAN     NOT NULL DEFAULT TRUE,
  -- penyetelan bebas per tipe: {"heading": "...", "limit": 6, ...}
  config       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_sections_page
  ON page_sections (page_id, sort_order);

DROP TRIGGER IF EXISTS trg_page_sections_updated ON page_sections;
CREATE TRIGGER trg_page_sections_updated
  BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ---------- 3. Riwayat perubahan konten ----------
-- Menyimpan salinan data sebelum diubah supaya perubahan harga
-- yang keliru dapat dikembalikan.
CREATE TABLE IF NOT EXISTS content_revisions (
  id           BIGSERIAL PRIMARY KEY,
  item_id      BIGINT      REFERENCES content_items(id) ON DELETE CASCADE,
  collection   TEXT        NOT NULL,
  slug         TEXT        NOT NULL,
  data         JSONB       NOT NULL,
  note         TEXT,
  user_id      BIGINT      REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_revisions_item
  ON content_revisions (item_id, created_at DESC);

-- ---------- 4. Halaman buatan sendiri ----------
-- Menandai halaman yang dibuat Owner dari admin (bukan rute berkode).
-- Halaman ini dirender oleh rute tangkap-semua /[...slug].
ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_custom  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS label_custom TEXT;
