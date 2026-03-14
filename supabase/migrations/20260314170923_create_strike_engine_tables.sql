/*
  # Strike Engine — Phase 2 Tables

  ## Overview
  Provisions all tables required for the autonomous Strike Engine:
  the Vector Arsenal, vulnerability log, agent budget ledger,
  agent terminal log, and golden ticket reports.

  ## New Tables

  ### arsenal_tools
  Stores the API manifest with OpenAI-compatible embeddings for
  vector-similarity WeaponrySelector queries.
  - id (uuid)
  - name (text) — human name of the API/tool
  - description (text) — what it does
  - category (text) — e.g. "email", "enrichment", "scraping"
  - endpoint (text) — API base URL
  - rating (numeric) — quality rating 0-5
  - tags (text[])
  - embedding (vector(1536)) — for pgvector similarity search
  - created_at

  ### vulnerability_log
  Written to by The Hound when it discovers a "Kink" on a target domain.
  The Hawk monitors this table and fires the Golden Ticket pipeline.
  - id (uuid)
  - target_url (text)
  - kink_type (text) — e.g. "vitals", "conversion", "seo", "security"
  - title (text)
  - description (text)
  - severity (text) — Critical/High/Medium/Low
  - impact_estimate (numeric) — estimated $ value
  - status (text) — pending/hawk_processing/report_sent/invoiced
  - golden_ticket_html (text) — generated report HTML
  - stripe_remediation_link (text)
  - discord_message_id (text)
  - metadata (jsonb)
  - created_at
  - updated_at

  ### agent_budget
  The General tracks API spend and bounty totals per agent per day.
  - id (uuid)
  - agent_name (text) — hound/hawk/general
  - date (date)
  - spend_usd (numeric) — total API spend
  - tokens_used (bigint)
  - requests_made (int)
  - bounties_identified (numeric) — $ revenue opportunities found
  - created_at
  - updated_at

  ### agent_terminal_logs
  Raw cross-agent handoff messages powering the Live Agent Terminal UI.
  - id (uuid)
  - agent (text) — HOUND/HAWK/GENERAL/SYSTEM
  - event_type (text) — e.g. VULN_FOUND, TARGET_ACQUIRED, REPORT_SENT
  - message (text)
  - target_url (text)
  - vulnerability_id (uuid) — optional FK to vulnerability_log
  - metadata (jsonb)
  - created_at

  ### golden_ticket_reports
  Archive of every Golden Ticket generated.
  - id (uuid)
  - vulnerability_id (uuid) FK vulnerability_log
  - target_url (text)
  - html_content (text)
  - stripe_link (text)
  - price_cents (int) — default 29900 ($299)
  - sent_to_discord (boolean)
  - opened (boolean)
  - paid (boolean)
  - created_at

  ## Security
  - RLS enabled on all tables
  - Authenticated users can read/insert their own data
  - Service role bypasses RLS for edge function writes
*/

-- Enable pgvector if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── arsenal_tools ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS arsenal_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  endpoint text NOT NULL DEFAULT '',
  rating numeric(3,2) NOT NULL DEFAULT 0,
  tags text[] NOT NULL DEFAULT '{}',
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE arsenal_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read arsenal tools"
  ON arsenal_tools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert arsenal tools"
  ON arsenal_tools FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS arsenal_tools_embedding_idx
  ON arsenal_tools USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS arsenal_tools_category_idx
  ON arsenal_tools (category);

-- ─── vulnerability_log ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vulnerability_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_url text NOT NULL,
  kink_type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'Medium'
    CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  impact_estimate numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'hawk_processing', 'report_sent', 'invoiced')),
  golden_ticket_html text,
  stripe_remediation_link text,
  discord_message_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vulnerability_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vulnerability log entries"
  ON vulnerability_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert vulnerability log entries"
  ON vulnerability_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own vulnerability log entries"
  ON vulnerability_log FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE INDEX IF NOT EXISTS vulnerability_log_status_idx
  ON vulnerability_log (status);

CREATE INDEX IF NOT EXISTS vulnerability_log_target_url_idx
  ON vulnerability_log (target_url);

CREATE INDEX IF NOT EXISTS vulnerability_log_created_at_idx
  ON vulnerability_log (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_vulnerability_log_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vulnerability_log_updated_at ON vulnerability_log;
CREATE TRIGGER vulnerability_log_updated_at
  BEFORE UPDATE ON vulnerability_log
  FOR EACH ROW EXECUTE FUNCTION update_vulnerability_log_updated_at();

-- ─── agent_budget ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_budget (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL CHECK (agent_name IN ('hound', 'hawk', 'general', 'system')),
  date date NOT NULL DEFAULT CURRENT_DATE,
  spend_usd numeric(10,4) NOT NULL DEFAULT 0,
  tokens_used bigint NOT NULL DEFAULT 0,
  requests_made int NOT NULL DEFAULT 0,
  bounties_identified numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_name, date)
);

ALTER TABLE agent_budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read agent budget"
  ON agent_budget FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert agent budget"
  ON agent_budget FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update agent budget"
  ON agent_budget FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS agent_budget_date_idx
  ON agent_budget (date DESC);

-- ─── agent_terminal_logs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_terminal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent text NOT NULL CHECK (agent IN ('HOUND', 'HAWK', 'GENERAL', 'SYSTEM', 'ARSENAL')),
  event_type text NOT NULL,
  message text NOT NULL,
  target_url text,
  vulnerability_id uuid REFERENCES vulnerability_log(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agent_terminal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read terminal logs"
  ON agent_terminal_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert terminal logs"
  ON agent_terminal_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS agent_terminal_logs_created_at_idx
  ON agent_terminal_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS agent_terminal_logs_agent_idx
  ON agent_terminal_logs (agent);

-- ─── golden_ticket_reports ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS golden_ticket_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vulnerability_id uuid REFERENCES vulnerability_log(id) ON DELETE SET NULL,
  target_url text NOT NULL,
  html_content text NOT NULL DEFAULT '',
  stripe_link text,
  price_cents int NOT NULL DEFAULT 29900,
  sent_to_discord boolean NOT NULL DEFAULT false,
  opened boolean NOT NULL DEFAULT false,
  paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE golden_ticket_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read golden tickets"
  ON golden_ticket_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert golden tickets"
  ON golden_ticket_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update golden tickets"
  ON golden_ticket_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS golden_ticket_reports_created_at_idx
  ON golden_ticket_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS golden_ticket_reports_paid_idx
  ON golden_ticket_reports (paid);
