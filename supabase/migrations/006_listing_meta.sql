ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'approved'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;
