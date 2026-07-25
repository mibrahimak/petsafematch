import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../libs/supabase';

export const useListingOwner = (ownerId) => {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOwner = useCallback(async () => {
    if (!ownerId) {
      setOwner(null);
      return;
    }

    setLoading(true);
    try {
      const [profileResult, listingsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url, phone, city, updated_at')
          .eq('id', ownerId)
          .single(),
        supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('userId', ownerId)
          .eq('is_active', true),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (listingsResult.error) throw listingsResult.error;

      const profile = profileResult.data;
      const joinedYear = profile?.updated_at
        ? new Date(profile.updated_at).getFullYear()
        : null;

      setOwner({
        ...profile,
        listingsCount: listingsResult.count ?? 0,
        joinedYear,
      });
    } catch (error) {
      console.error('[useListingOwner] Sahip bilgisi alınamadı:', error);
      setOwner(null);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchOwner();
  }, [fetchOwner]);

  return { owner, loading, refetch: fetchOwner };
};
