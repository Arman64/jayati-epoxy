-- Migrasi 004: teks per bagian pada halaman bawaan + pustaka gambar.
--
-- Halaman bawaan tetap dirender oleh kode (struktur, JSON-LD, kecepatan),
-- tetapi setiap judul bagian, kalimat pengantar, dan gambar di dalamnya
-- dapat ditimpa Owner lewat panel admin.

-- Teks per bagian. `slot` adalah nama bagian di dalam halaman, misalnya
-- 'sistem' atau 'proses'. Kolom yang NULL berarti "pakai teks bawaan kode".
CREATE TABLE IF NOT EXISTS page_copy (
  id          BIGSERIAL PRIMARY KEY,
  page_path   TEXT NOT NULL,
  slot        TEXT NOT NULL,
  eyebrow     TEXT,
  title       TEXT,
  lead        TEXT,
  body        TEXT,
  is_hidden   BOOLEAN NOT NULL DEFAULT false,
  updated_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_path, slot)
);

CREATE INDEX IF NOT EXISTS idx_page_copy_path ON page_copy (page_path);

-- Pustaka gambar: berkas yang diunggah Owner lewat admin.
CREATE TABLE IF NOT EXISTS media (
  id          BIGSERIAL PRIMARY KEY,
  path        TEXT NOT NULL UNIQUE,
  alt         TEXT NOT NULL DEFAULT '',
  caption     TEXT,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  bytes       INTEGER NOT NULL,
  mime        TEXT NOT NULL,
  uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Penempatan gambar pada slot tertentu di sebuah halaman.
-- Bila belum ada baris, halaman memakai foto bawaan dari kode.
CREATE TABLE IF NOT EXISTS page_images (
  id         BIGSERIAL PRIMARY KEY,
  page_path  TEXT NOT NULL,
  slot       TEXT NOT NULL,
  media_id   BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_path, slot)
);

CREATE INDEX IF NOT EXISTS idx_page_images_path ON page_images (page_path);
