-- Reply support on messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL;

-- Blocked users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcı kendi engel listesini görebilir"
  ON public.blocked_users
  FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Kullanıcı engelleyebilir"
  ON public.blocked_users
  FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Kullanıcı engelini kaldırabilir"
  ON public.blocked_users
  FOR DELETE
  USING (auth.uid() = blocker_id);
