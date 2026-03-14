/*
  # Create strikes table

  ## Summary
  Central ledger for the Sovereign Loop. Each row represents one audited target
  that has been surfaced by the Scout engine, risk-audited by Cyberhawk logic,
  and is eligible for a STRIKE email delivery.

  ## New Tables
  - `strikes`
    - `id` (uuid, pk)
    - `company_name` (text) — scraped business name
    - `website` (text) — target URL
    - `contact_email` (text, nullable) — scraped public contact
    - `sector` (text) — industry / category e.g. "Construction", "Software"
    - `city` (text) — e.g. "Montreal"
    - `tech_stack` (jsonb) — array of detected technologies
    - `loi25_gaps` (jsonb) — array of missing compliance headers
    - `severity` (text) — HIGH | MEDIUM | LOW
    - `revenue_value` (integer) — computed bounty value in CAD cents
    - `status` (text) — DETECTED | AUDITED | STAGED | SENT | BOUNTY_PAID
    - `audit_data` (jsonb) — full Cyberhawk audit result
    - `email_draft` (text, nullable) — staged email body
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled — authenticated users can read/write their own strikes
  - Public insert allowed via service role (edge functions)
*/

CREATE TABLE IF NOT EXISTS strikes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name   text NOT NULL DEFAULT '',
  website        text NOT NULL DEFAULT '',
  contact_email  text,
  sector         text NOT NULL DEFAULT 'General',
  city           text NOT NULL DEFAULT 'Montreal',
  tech_stack     jsonb NOT NULL DEFAULT '[]',
  loi25_gaps     jsonb NOT NULL DEFAULT '[]',
  severity       text NOT NULL DEFAULT 'MEDIUM',
  revenue_value  integer NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'DETECTED',
  audit_data     jsonb NOT NULL DEFAULT '{}',
  email_draft    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE strikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read strikes"
  ON strikes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert strikes"
  ON strikes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update strikes"
  ON strikes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_strikes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS strikes_updated_at ON strikes;
CREATE TRIGGER strikes_updated_at
  BEFORE UPDATE ON strikes
  FOR EACH ROW EXECUTE FUNCTION update_strikes_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE strikes;
