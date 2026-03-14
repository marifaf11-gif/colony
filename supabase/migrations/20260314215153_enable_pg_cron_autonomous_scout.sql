-- Enable autonomous Scout Engine scanning via pg_cron + pg_net
-- Fires every 4 hours: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove old job if it exists (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'scout-engine-auto') THEN
    PERFORM cron.unschedule('scout-engine-auto');
  END IF;
END $$;

-- Schedule autonomous scan every 4 hours
SELECT cron.schedule(
  'scout-engine-auto',
  '0 */4 * * *',
  $job$
    SELECT net.http_post(
      url     := 'https://hrvshrvrizcjxuahvgpq.supabase.co/functions/v1/scout-engine?action=scan&sector=all',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydnNocnZyaXpjanh1YWh2Z3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTkxMjUsImV4cCI6MjA4OTA3NTEyNX0.mBHlEqFjM4U9vpfvjWJEaZpxsnOOABiv5NgtmdIclAQ"}'::jsonb,
      body    := '{}'::jsonb
    );
  $job$
);