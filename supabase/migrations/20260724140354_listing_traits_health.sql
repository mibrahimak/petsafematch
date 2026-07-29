ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS traits text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS health_status jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weight text,
  ADD COLUMN IF NOT EXISTS color text;
