/*
  # Colony OS 1.0 — Fleet Database Schema

  1. Extensions
    - `vector` (pgvector) — Semantic memory for Kink Intelligence

  2. New Tables
    - `pods` — Pod registry for the fleet (Cyberhawk, Zyeuté, Q-MÉTIER, etc.)
    - `kink_intelligence` — pgvector semantic store for cross-fleet findings
    - `pod_telemetry` — Time-series telemetry ingested via /api/v1/ingest
    - `fleet_events` — Audit log for hub-level events

  3. Security
    - RLS enabled on all tables
    - Service role bypass for telemetry ingest
    - Authenticated users can read fleet data
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Pod Registry
CREATE TABLE IF NOT EXISTS pods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text DEFAULT 'zap',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  version text DEFAULT '1.0.0',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE pods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pods"
  ON pods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Pod owners can update their pods"
  ON pods FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can insert pods"
  ON pods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Kink Intelligence (pgvector semantic store)
CREATE TABLE IF NOT EXISTS kink_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_slug text NOT NULL REFERENCES pods(slug) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb NOT NULL DEFAULT '{}',
  severity text NOT NULL DEFAULT 'Low' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  url text,
  language text DEFAULT 'en',
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE kink_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view kink intelligence"
  ON kink_intelligence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert kink intelligence"
  ON kink_intelligence FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- HNSW index for fast approximate nearest-neighbor search
CREATE INDEX IF NOT EXISTS kink_intelligence_embedding_idx
  ON kink_intelligence USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS kink_intelligence_pod_slug_idx ON kink_intelligence(pod_slug);
CREATE INDEX IF NOT EXISTS kink_intelligence_severity_idx ON kink_intelligence(severity);

-- Pod Telemetry (high-throughput ingest)
CREATE TABLE IF NOT EXISTS pod_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_slug text NOT NULL,
  event_type text NOT NULL DEFAULT 'report',
  kinks_found integer DEFAULT 0,
  revenue_earned numeric(12, 2) DEFAULT 0.00,
  metadata jsonb NOT NULL DEFAULT '{}',
  source_ip text,
  api_version text DEFAULT 'v1',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE pod_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view telemetry"
  ON pod_telemetry FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert telemetry"
  ON pod_telemetry FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can insert telemetry"
  ON pod_telemetry FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS pod_telemetry_pod_slug_idx ON pod_telemetry(pod_slug);
CREATE INDEX IF NOT EXISTS pod_telemetry_created_at_idx ON pod_telemetry(created_at DESC);

-- Fleet Events (audit log)
CREATE TABLE IF NOT EXISTS fleet_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  pod_slug text,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE fleet_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view fleet events"
  ON fleet_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert fleet events"
  ON fleet_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS fleet_events_created_at_idx ON fleet_events(created_at DESC);
CREATE INDEX IF NOT EXISTS fleet_events_event_type_idx ON fleet_events(event_type);

-- Update trigger for pods
DROP TRIGGER IF EXISTS update_pods_updated_at ON pods;
CREATE TRIGGER update_pods_updated_at
  BEFORE UPDATE ON pods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default pods
INSERT INTO pods (slug, name, description, icon, status) VALUES
  ('cyberhawk', 'Cyberhawk', 'Predator scanning engine — site auditing and threat detection', 'crosshair', 'active'),
  ('zyeute', 'Zyeuté', 'Conversion velocity optimizer — CTA and UX kink eliminator', 'zap', 'active'),
  ('q-metier', 'Q-MÉTIER', 'Technical SEO and structured data command module', 'layers', 'active'),
  ('conversion-catalyst', 'Conversion Catalyst', 'AI-driven revenue leak auditor', 'trending-up', 'active')
ON CONFLICT (slug) DO NOTHING;
