/*
  # Create GDPR / Loi 25 Audit Log Table

  ## Purpose
  Stores a permanent, tamper-evident record of every data-erasure request made
  through the `DELETE /api/v1/gdpr/delete` endpoint. This is required to
  demonstrate compliance with Québec Loi 25 (and GDPR) during regulatory audits.

  ## New Table: gdpr_audit
  - `id`           — UUID primary key
  - `user_id`      — The Supabase auth UID of the requesting user (kept even after deletion so the log is useful)
  - `requested_at` — When the request was received (server time)
  - `status`       — 'completed' | 'partial' | 'failed'
  - `deleted`      — JSON array of successfully erased record groups
  - `errors`       — JSON array of error messages for any records that could not be erased
  - `ip_address`   — Optional: caller IP for forensic audit trail
  - `created_at`   — Timestamp (same as requested_at, kept for consistency)

  ## Security
  - RLS enabled; only the service role can write (the Next.js API route uses the service role key)
  - No policy allows SELECT from the client — this table is internal / admin-only
*/

CREATE TABLE IF NOT EXISTS gdpr_audit (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL,
  requested_at  timestamptz NOT NULL DEFAULT now(),
  status        text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'partial', 'failed')),
  deleted       jsonb       NOT NULL DEFAULT '[]'::jsonb,
  errors        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  ip_address    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gdpr_audit ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS gdpr_audit_user_id_idx ON gdpr_audit (user_id);
CREATE INDEX IF NOT EXISTS gdpr_audit_requested_at_idx ON gdpr_audit (requested_at DESC);
