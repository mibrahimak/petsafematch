ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS share_distance boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hide_exact_location boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_online_status boolean NOT NULL DEFAULT true;
