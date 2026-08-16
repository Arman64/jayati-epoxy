-- Migration v2: Tambah kolom yang mungkin belum ada di database production
-- Aman dijalankan berulang kali — semua pakai ADD COLUMN IF NOT EXISTS
-- Jalankan dengan: npm run db:migrate
-- atau: DATABASE_URL=<url_production> npm run db:migrate

-- ============================================================
-- Tabel leads: kolom CRM yang ditambahkan setelah schema awal
-- ============================================================
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS assigned_to     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS estimated_value NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS follow_up_at    DATE,
  ADD COLUMN IF NOT EXISTS utm             JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ============================================================
-- Tabel users: last_login_at yang mungkin belum ada
-- ============================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- ============================================================
-- Index tambahan (IF NOT EXISTS didukung sejak Postgres 9.5)
-- ============================================================
CREATE INDEX IF NOT EXISTS leads_followup_idx
  ON leads (follow_up_at)
  WHERE follow_up_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS leads_assigned_idx
  ON leads (assigned_to);

-- ============================================================
-- Constraint CHECK pada status (re-apply kalau belum ada)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'leads' AND constraint_name = 'leads_status_check'
  ) THEN
    ALTER TABLE leads
      ADD CONSTRAINT leads_status_check
      CHECK (status IN ('baru','dihubungi','survei','penawaran','menang','kalah'));
  END IF;
END $$;
