ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;
