ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text;

UPDATE listings
SET city = TRIM(location),
    district = NULL
WHERE location IS NOT NULL AND city IS NULL;

ALTER TABLE listings DROP COLUMN IF EXISTS location;
