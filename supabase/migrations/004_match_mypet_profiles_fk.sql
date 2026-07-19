ALTER TABLE public.match_mypet
  DROP CONSTRAINT "match_mypet_userId_fkey";

ALTER TABLE public.match_mypet
  ADD CONSTRAINT "match_mypet_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES public.profiles(id) ON DELETE CASCADE;
