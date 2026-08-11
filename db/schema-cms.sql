-- Skema CMS Jayati Epoxy (migrasi 002)
-- Dijalankan dengan: npm run db:migrate

/* ============================================================
   1. PENGATURAN SITUS — key/value JSONB
   Menyimpan profil perusahaan, kontak, sosial, jam operasional,
   dan pengaturan global lain. Satu baris per grup.
   ============================================================ */
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* ============================================================
   2. PENGATURAN HALAMAN — SEO & konten hero per URL
   ============================================================ */
CREATE TABLE IF NOT EXISTS pages (
  id               BIGSERIAL PRIMARY KEY,
  path             TEXT NOT NULL UNIQUE,      -- '/', '/harga-epoxy-lantai'
  label            TEXT NOT NULL,             -- nama untuk admin
  title            TEXT,                      -- <title>
  description      TEXT,                      -- meta description
  h1               TEXT,
  intro            TEXT,                      -- paragraf pembuka / answer-box
  og_image         TEXT,
  noindex          BOOLEAN NOT NULL DEFAULT FALSE,
  in_sitemap       BOOLEAN NOT NULL DEFAULT TRUE,
  sitemap_priority NUMERIC(2,1) NOT NULL DEFAULT 0.7,
  updated_by       BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pages_path_idx ON pages (path);

/* ============================================================
   3. BLOG — brief, draft, revisi, publikasi
   ============================================================ */

-- Brief konten (langkah 1-2 alur MCP, PRD §9)
CREATE TABLE IF NOT EXISTS content_briefs (
  id              BIGSERIAL PRIMARY KEY,
  topic           TEXT NOT NULL,
  intent          TEXT NOT NULL DEFAULT 'informational'
                  CHECK (intent IN ('informational','commercial','transactional','navigational')),
  primary_keyword TEXT NOT NULL,
  keyword_cluster TEXT[] NOT NULL DEFAULT '{}',
  entities        TEXT[] NOT NULL DEFAULT '{}',
  questions       TEXT[] NOT NULL DEFAULT '{}',
  internal_links  TEXT[] NOT NULL DEFAULT '{}',
  sources         TEXT[] NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'backlog'
                  CHECK (status IN ('backlog','drafting','drafted','done')),
  created_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS briefs_status_idx ON content_briefs (status, created_at DESC);

-- Artikel blog
CREATE TABLE IF NOT EXISTS posts (
  id             BIGSERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL DEFAULT 'Umum',
  author         TEXT NOT NULL DEFAULT '',
  reviewer       TEXT NOT NULL DEFAULT '',
  intro          TEXT NOT NULL DEFAULT '',
  -- body: [{h2, body:[...], list:[...]}]
  sections       JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs           JSONB NOT NULL DEFAULT '[]'::jsonb,
  read_minutes   INTEGER NOT NULL DEFAULT 5,
  cover_image    TEXT,
  -- Hard gate publikasi (PRD §9): hanya 'published' yang tampil publik
  status         TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','pending_review','approved','published','rejected','archived')),
  source         TEXT NOT NULL DEFAULT 'manual'
                 CHECK (source IN ('manual','mcp')),
  brief_id       BIGINT REFERENCES content_briefs(id) ON DELETE SET NULL,
  -- Hasil validator; publish ditolak bila ada error
  validation     JSONB NOT NULL DEFAULT '{}'::jsonb,
  review_notes   TEXT,
  reviewed_by    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,
  published_at   TIMESTAMPTZ,
  scheduled_for  TIMESTAMPTZ,
  noindex        BOOLEAN NOT NULL DEFAULT FALSE,
  created_by     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_status_idx    ON posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS posts_slug_idx      ON posts (slug);
CREATE INDEX IF NOT EXISTS posts_scheduled_idx ON posts (scheduled_for)
  WHERE scheduled_for IS NOT NULL;

-- Riwayat revisi: setiap simpan menyimpan snapshot lama
CREATE TABLE IF NOT EXISTS post_revisions (
  id         BIGSERIAL PRIMARY KEY,
  post_id    BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  snapshot   JSONB NOT NULL,
  note       TEXT,
  user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revisions_post_idx ON post_revisions (post_id, created_at DESC);

/* ============================================================
   4. MCP — token, idempotency, audit
   ============================================================ */
CREATE TABLE IF NOT EXISTS mcp_tokens (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  token_hash   TEXT NOT NULL UNIQUE,     -- SHA-256, token asli hanya tampil sekali
  token_prefix TEXT NOT NULL,            -- 8 karakter awal untuk identifikasi
  scopes       TEXT[] NOT NULL DEFAULT '{read}',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_by   BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotency + audit setiap pemanggilan tool MCP (PRD §9)
CREATE TABLE IF NOT EXISTS mcp_requests (
  id           BIGSERIAL PRIMARY KEY,
  request_id   TEXT NOT NULL UNIQUE,
  tool         TEXT NOT NULL,
  params       JSONB NOT NULL DEFAULT '{}'::jsonb,
  result       JSONB,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','success','error')),
  error        TEXT,
  token_id     BIGINT REFERENCES mcp_tokens(id) ON DELETE SET NULL,
  duration_ms  INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mcp_req_tool_idx ON mcp_requests (tool, created_at DESC);
CREATE INDEX IF NOT EXISTS mcp_req_rid_idx  ON mcp_requests (request_id);

/* ============================================================
   5. AUDIT LOG UMUM (CMS)
   ============================================================ */
CREATE TABLE IF NOT EXISTS cms_events (
  id          BIGSERIAL PRIMARY KEY,
  entity      TEXT NOT NULL,          -- 'post','page','settings','mcp_token'
  entity_id   TEXT,
  action      TEXT NOT NULL,          -- 'create','update','publish','approve','reject','delete'
  detail      JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor       TEXT NOT NULL DEFAULT 'admin',  -- 'admin' | 'mcp'
  user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_events_entity_idx ON cms_events (entity, created_at DESC);

/* ============================================================
   6. TRIGGER updated_at
   ============================================================ */
DROP TRIGGER IF EXISTS settings_touch ON settings;
CREATE TRIGGER settings_touch BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS pages_touch ON pages;
CREATE TRIGGER pages_touch BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS posts_touch ON posts;
CREATE TRIGGER posts_touch BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS briefs_touch ON content_briefs;
CREATE TRIGGER briefs_touch BEFORE UPDATE ON content_briefs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
