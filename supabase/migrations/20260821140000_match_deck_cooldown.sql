-- Impressions for cards seen without swipe (24h cooldown)
CREATE TABLE public.match_pet_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swiper_pet_id uuid NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
  target_pet_id uuid NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (swiper_pet_id, target_pet_id)
);

ALTER TABLE public.match_pet_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own impressions"
ON public.match_pet_impressions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = swiper_user_id);

CREATE POLICY "Users can update own impressions"
ON public.match_pet_impressions
FOR UPDATE
TO authenticated
USING (auth.uid() = swiper_user_id)
WITH CHECK (auth.uid() = swiper_user_id);

CREATE POLICY "Users can read own impressions"
ON public.match_pet_impressions
FOR SELECT
TO authenticated
USING (auth.uid() = swiper_user_id);

-- Allow re-swipe after cooldown via upsert
CREATE POLICY "Users can update own swipes"
ON public.match_pet_swipes
FOR UPDATE
TO authenticated
USING (auth.uid() = swiper_user_id)
WITH CHECK (auth.uid() = swiper_user_id);
