/*
  # Add unique index on strikes.website for deduplication

  ## Summary
  The scout engine uses ON CONFLICT (website) to deduplicate targets.
  This migration adds the required unique index if it does not already exist.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'strikes' AND indexname = 'strikes_website_unique'
  ) THEN
    CREATE UNIQUE INDEX strikes_website_unique ON strikes (website);
  END IF;
END $$;
