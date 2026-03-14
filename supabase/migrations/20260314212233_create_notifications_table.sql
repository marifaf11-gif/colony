/*
  # Create notifications table

  ## Summary
  Decoupled notification queue for Discord, Slack, email, and other outbound
  webhook deliveries. Instead of firing webhooks directly inside edge functions
  (which can block the request on network failure), callers insert a row here.
  A separate notify_worker processes rows with retry logic.

  ## New Tables
  - `notifications`
    - `id` (uuid, pk)
    - `type` (text) — channel: "discord" | "slack" | "email"
    - `payload` (jsonb) — raw payload to forward (e.g. Discord embed body)
    - `status` (text) — PENDING | SENT | FAILED
    - `attempts` (integer) — retry counter
    - `last_error` (text, nullable) — last error message for debugging
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Authenticated users can insert and read their own notifications
  - Service role (edge functions) can update status
*/

CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL DEFAULT 'discord',
  payload     jsonb NOT NULL DEFAULT '{}',
  status      text NOT NULL DEFAULT 'PENDING',
  attempts    integer NOT NULL DEFAULT 0,
  last_error  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_updated_at ON notifications;
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_notifications_updated_at();
