-- Swipe records for match_mypet pet-to-pet flow
CREATE TABLE public.match_pet_swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swiper_pet_id uuid NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
  target_pet_id uuid NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('like', 'pass')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (swiper_pet_id, target_pet_id)
);

ALTER TABLE public.match_pet_swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own swipes"
ON public.match_pet_swipes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = swiper_user_id);

CREATE POLICY "Users can read own swipes"
ON public.match_pet_swipes
FOR SELECT
TO authenticated
USING (auth.uid() = swiper_user_id);

-- Confirmed mutual matches between pets
CREATE TABLE public.pet_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_a_id uuid NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
  pet_b_id uuid NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pet_a_id, pet_b_id)
);

ALTER TABLE public.pet_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own matches"
ON public.pet_matches
FOR SELECT
TO authenticated
USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Trigger function: like notifications + mutual match handling
CREATE OR REPLACE FUNCTION public.notify_on_match_pet_swipe()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  swiper_pet_name text;
  target_pet_name text;
  is_mutual boolean;
  swiper_profile_name text;
  target_profile_name text;
  new_match_id uuid;
  existing_match_id uuid;
BEGIN
  IF NEW.direction <> 'like' THEN
    RETURN NEW;
  END IF;

  IF NEW.target_user_id = NEW.swiper_user_id THEN
    RETURN NEW;
  END IF;

  SELECT name INTO swiper_pet_name
  FROM public.user_pets
  WHERE id = NEW.swiper_pet_id;

  SELECT name INTO target_pet_name
  FROM public.user_pets
  WHERE id = NEW.target_pet_id;

  SELECT full_name INTO swiper_profile_name
  FROM public.profiles
  WHERE id = NEW.swiper_user_id;

  SELECT full_name INTO target_profile_name
  FROM public.profiles
  WHERE id = NEW.target_user_id;

  -- Karşılıklı eşleşme kontrolü
  SELECT EXISTS (
    SELECT 1
    FROM public.match_pet_swipes mps
    WHERE mps.swiper_pet_id = NEW.target_pet_id
      AND mps.target_pet_id = NEW.swiper_pet_id
      AND mps.direction = 'like'
  ) INTO is_mutual;

  IF NOT is_mutual THEN
    -- Sadece beğeni bildirimi
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      NEW.target_user_id,
      'match',
      'Yeni beğeni',
      COALESCE(swiper_pet_name, 'Bir dost') || ' dostunuzu beğendi!',
      jsonb_build_object(
        'swiper_user_id', NEW.swiper_user_id,
        'swiper_pet_id', NEW.swiper_pet_id,
        'target_pet_id', NEW.target_pet_id,
        'swipe_id', NEW.id
      )
    );
    RETURN NEW;
  END IF;

  -- Mevcut eşleşme kontrolü
  SELECT id INTO existing_match_id
  FROM public.pet_matches
  WHERE pet_a_id = NEW.swiper_pet_id AND pet_b_id = NEW.target_pet_id
     OR pet_a_id = NEW.target_pet_id AND pet_b_id = NEW.swiper_pet_id
  LIMIT 1;

  IF existing_match_id IS NOT NULL THEN
    new_match_id := existing_match_id;
  ELSE
    INSERT INTO public.pet_matches (user_a_id, user_b_id, pet_a_id, pet_b_id)
    VALUES (
      NEW.swiper_user_id,
      NEW.target_user_id,
      NEW.swiper_pet_id,
      NEW.target_pet_id
    )
    RETURNING id INTO new_match_id;
  END IF;

  -- Swiper'a eşleşme bildirimi
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.swiper_user_id,
    'match',
    'Eşleşme!',
    'Siz ve ' || COALESCE(target_profile_name, 'karşı taraf') || ' birbirinizi beğendiniz!',
    jsonb_build_object(
      'matched_user_id', NEW.target_user_id,
      'my_pet_id', NEW.swiper_pet_id,
      'matched_pet_id', NEW.target_pet_id,
      'match_id', new_match_id,
      'is_mutual', true
    )
  );

  -- Karşı tarafa eşleşme bildirimi
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.target_user_id,
    'match',
    'Eşleşme!',
    'Siz ve ' || COALESCE(swiper_profile_name, 'karşı taraf') || ' birbirinizi beğendiniz!',
    jsonb_build_object(
      'matched_user_id', NEW.swiper_user_id,
      'my_pet_id', NEW.target_pet_id,
      'matched_pet_id', NEW.swiper_pet_id,
      'match_id', new_match_id,
      'is_mutual', true
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_match_pet_swipe_insert_notify
AFTER INSERT ON public.match_pet_swipes
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_match_pet_swipe();

-- Realtime for pet_matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.pet_matches;
