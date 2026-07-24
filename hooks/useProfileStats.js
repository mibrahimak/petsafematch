import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../libs/supabase';
import { useFavoriteStore } from '../src/store/useFavoriteStore';

export const useProfileStats = (userId) => {
  const favorites = useFavoriteStore((state) => state.favorites);
  const [listingsCount, setListingsCount] = useState(0);
  const [petsCount, setPetsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setListingsCount(0);
      setPetsCount(0);
      return;
    }

    setLoading(true);
    try {
      const [listingsResult, petsResult] = await Promise.all([
        supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('userId', userId),
        supabase
          .from('user_pets')
          .select('id', { count: 'exact', head: true })
          .eq('userId', userId),
      ]);

      if (listingsResult.error) throw listingsResult.error;
      if (petsResult.error) throw petsResult.error;

      setListingsCount(listingsResult.count ?? 0);
      setPetsCount(petsResult.count ?? 0);
    } catch (error) {
      console.error('[useProfileStats] İstatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const stats = [
    { key: 'listings', label: 'İlanlarım', value: String(listingsCount) },
    { key: 'favorites', label: 'Favoriler', value: String(favorites.length) },
    { key: 'pets', label: 'Dostlarım', value: String(petsCount) },
  ];

  return { stats, loading, refreshStats: fetchStats };
};
