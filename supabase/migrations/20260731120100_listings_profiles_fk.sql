-- Enable PostgREST join: listings -> profiles via userId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'listings_userId_fkey'
  ) THEN
    ALTER TABLE public.listings
      ADD CONSTRAINT listings_userId_fkey
      FOREIGN KEY ("userId") REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
