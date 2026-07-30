ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'listings'
      AND column_name = 'location'
  ) THEN
    UPDATE listings
    SET city = TRIM(location),
        district = NULL
    WHERE location IS NOT NULL AND city IS NULL;

    ALTER TABLE listings DROP COLUMN location;
  END IF;
END $$;
