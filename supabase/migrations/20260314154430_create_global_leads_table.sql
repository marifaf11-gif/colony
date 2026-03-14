/*
  # Create global_leads table

  1. New Tables
    - `global_leads`
      - `id` (uuid, primary key)
      - `url` (text, not null) - The scanned URL
      - `detected_language` (text) - Auto-detected language of the target URL
      - `total_leak_estimate` (integer) - Estimated annual revenue leak in CAD cents
      - `severity` (text) - 'Low', 'Medium', or 'High' - used for lead prioritization
      - `scores` (jsonb) - vitals, conversion, seo, overall scores
      - `findings` (jsonb) - Array of scan findings
      - `locale` (text) - UI locale when scan was run
      - `user_id` (uuid, nullable) - Linked user if authenticated
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `global_leads` table
    - Authenticated users can insert and read their own leads
    - Anonymous inserts allowed for unauthenticated scans (leads captured before signup)

  3. Notes
    - severity is constrained to Low/Medium/High for reliable filtering
    - findings stored as JSONB for flexible querying
    - total_leak_estimate stored as integer (dollars, not cents)
*/

CREATE TABLE IF NOT EXISTS global_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  detected_language text NOT NULL DEFAULT 'en',
  total_leak_estimate integer NOT NULL DEFAULT 0,
  severity text NOT NULL DEFAULT 'Low' CHECK (severity IN ('Low', 'Medium', 'High')),
  scores jsonb NOT NULL DEFAULT '{}',
  findings jsonb NOT NULL DEFAULT '[]',
  locale text NOT NULL DEFAULT 'en-CA',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE global_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert their own leads
CREATE POLICY "Authenticated users can insert leads"
  ON global_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Allow anonymous/public inserts for unauthenticated scans
CREATE POLICY "Anonymous users can insert leads"
  ON global_leads
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Policy: Authenticated users can view their own leads
CREATE POLICY "Users can view own leads"
  ON global_leads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can update their own leads
CREATE POLICY "Users can update own leads"
  ON global_leads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for efficient lead prioritization and filtering
CREATE INDEX IF NOT EXISTS global_leads_severity_idx ON global_leads(severity);
CREATE INDEX IF NOT EXISTS global_leads_user_id_idx ON global_leads(user_id);
CREATE INDEX IF NOT EXISTS global_leads_created_at_idx ON global_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS global_leads_total_leak_idx ON global_leads(total_leak_estimate DESC);
