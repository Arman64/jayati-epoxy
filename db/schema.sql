-- Skema database Jayati Epoxy CRM
-- Dijalankan dengan: npm run db:migrate

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'staff'
                CHECK (role IN ('owner', 'staff')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id              BIGSERIAL PRIMARY KEY,
  public_id       UUID NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  city            TEXT,
  building_type   TEXT,
  area_sqm        NUMERIC(10, 2),
  floor_condition TEXT,
  need_type       TEXT,
  message         TEXT,
  photo_path      TEXT,
  source          TEXT NOT NULL DEFAULT 'website',
  -- Pipeline CRM
  status          TEXT NOT NULL DEFAULT 'baru'
                  CHECK (status IN ('baru','dihubungi','survei','penawaran','menang','kalah')),
  assigned_to     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  estimated_value NUMERIC(14, 2),
  follow_up_at    DATE,
  -- Jejak teknis
  ip              TEXT,
  user_agent      TEXT,
  utm             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_created_idx   ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx    ON leads (status);
CREATE INDEX IF NOT EXISTS leads_followup_idx  ON leads (follow_up_at)
  WHERE follow_up_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_assigned_idx  ON leads (assigned_to);

-- Catatan follow-up per lead
CREATE TABLE IF NOT EXISTS lead_notes (
  id         BIGSERIAL PRIMARY KEY,
  lead_id    BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_notes_lead_idx ON lead_notes (lead_id, created_at DESC);

-- Jejak audit perubahan status / penugasan (PRD §12 audit log)
CREATE TABLE IF NOT EXISTS lead_events (
  id         BIGSERIAL PRIMARY KEY,
  lead_id    BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  field      TEXT NOT NULL,
  old_value  TEXT,
  new_value  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_events_lead_idx ON lead_events (lead_id, created_at DESC);

-- Sesi login (bisa dicabut, tidak seperti JWT murni)
CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_idx    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

-- updated_at otomatis
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_touch ON leads;
CREATE TRIGGER leads_touch BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
