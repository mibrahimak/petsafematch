import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../libs/supabase';
import { usePetStore } from '../src/store/usePetStore';
import {
  FILTER_TABS,
  getListingStatus,
  LISTING_STATUS,
} from '../constants/myListingsOptions';

const buildFavoriteCountMap = (rows = []) => {
  const map = {};
  rows.forEach((row) => {
    const id = row.listing_id;
    map[id] = (map[id] || 0) + 1;
  });
  return map;
};

export const useMyListings = (userId) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const removePetFromStore = usePetStore((state) => state.removePetFromStore);

  const fetchMyListings = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const listingRows = data || [];
      const ids = listingRows.map((item) => item.id);

      let favoriteCountMap = {};
      if (ids.length > 0) {
        const { data: favoriteRows, error: favoriteError } = await supabase
          .from('favorites')
          .select('listing_id')
          .in('listing_id', ids);

        if (favoriteError) throw favoriteError;
        favoriteCountMap = buildFavoriteCountMap(favoriteRows);
      }

      const enriched = listingRows.map((listing) => ({
        ...listing,
        favoriteCount: favoriteCountMap[listing.id] || 0,
        status: getListingStatus(listing),
      }));

      setListings(enriched);
    } catch (error) {
      console.error('[useMyListings] İlanlar yüklenirken hata:', error);
      Alert.alert('Hata', 'İlanlarınız yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const counts = useMemo(() => {
    const all = listings.length;
    const active = listings.filter(
      (item) => item.status === LISTING_STATUS.ACTIVE
    ).length;
    const pending = listings.filter(
      (item) => item.status === LISTING_STATUS.PENDING
    ).length;
    const passive = listings.filter(
      (item) => item.status === LISTING_STATUS.PASSIVE
    ).length;

    return { all, active, pending, passive };
  }, [listings]);

  const filteredListings = useMemo(() => {
    if (activeFilter === 'all') return listings;
    return listings.filter((item) => item.status === activeFilter);
  }, [listings, activeFilter]);

  const handleDeleteListing = useCallback(
    (id) => {
      Alert.alert(
        'İlanı Sil',
        'Bu ilanı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              try {
                const { error } = await supabase
                  .from('listings')
                  .delete()
                  .eq('id', id);

                if (error) throw error;

                setListings((prev) => prev.filter((item) => item.id !== id));
                removePetFromStore(id);
                Alert.alert('Başarılı', 'İlan başarıyla kaldırıldı.');
              } catch (error) {
                console.error('[useMyListings] İlan silinirken hata:', error);
                Alert.alert('Hata', 'İlan silinirken bir hata oluştu.');
              }
            },
          },
        ]
      );
    },
    [removePetFromStore]
  );

  return {
    listings,
    filteredListings,
    loading,
    activeFilter,
    setActiveFilter,
    counts,
    fetchMyListings,
    handleDeleteListing,
    filterTabs: FILTER_TABS,
  };
};
