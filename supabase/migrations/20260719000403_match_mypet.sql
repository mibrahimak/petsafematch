CREATE TABLE public.match_mypet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pet_id)
);

ALTER TABLE public.match_mypet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aktif eşleştirme kayıtları okunabilir"
ON public.match_mypet
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Kullanıcı kendi kayıtlarını görebilir"
ON public.match_mypet
FOR SELECT
TO authenticated
USING (auth.uid() = "userId");

CREATE POLICY "Kullanıcı eşleştirmeye katılabilir"
ON public.match_mypet
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Kullanıcı kendi kaydını silebilir"
ON public.match_mypet
FOR DELETE
TO authenticated
USING (auth.uid() = "userId");

CREATE POLICY "Eşleştirmeye katılan hayvanlar görünür"
ON public.user_pets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.match_mypet m
    WHERE m.pet_id = user_pets.id
      AND m.is_active = true
  )
);
