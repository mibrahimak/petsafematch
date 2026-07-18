import { Alert } from 'react-native';
import { create } from 'zustand';
import { supabase } from '../../libs/supabase';

export const useFavoriteStore = create((set, get) => ({
  favorites: [],
  loading: false,

  fetchFavorites: async (userId) => {
    if (!userId) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', userId);

      if (error) throw error;

      set({ favorites: (data || []).map((row) => row.listing_id) });
    } catch (error) {
      console.error('[fetchFavorites] Favoriler yüklenirken hata:', error);
    } finally {
      set({ loading: false });
    }
  },

  toggleFavorite: async (petId, userId) => {
    if (!userId) {
      Alert.alert(
        'Giriş gerekli',
        'Favorilere eklemek için giriş yapmalısınız.'
      );
      return false;
    }

    const { favorites } = get();
    const isExist = favorites.includes(petId);

    if (isExist) {
      set({ favorites: favorites.filter((id) => id !== petId) });
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', petId);

        if (error) throw error;
      } catch (error) {
        console.error('[toggleFavorite] Favori kaldırılırken hata:', error);
        set({ favorites: [...get().favorites, petId] });
        Alert.alert('Hata', 'Favori kaldırılamadı. Lütfen tekrar deneyin.');
        return false;
      }
    } else {
      set({ favorites: [...favorites, petId] });
      try {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: userId, listing_id: petId });

        if (error) throw error;
      } catch (error) {
        console.error('[toggleFavorite] Favori eklenirken hata:', error);
        set({ favorites: get().favorites.filter((id) => id !== petId) });
        Alert.alert('Hata', 'Favori eklenemedi. Lütfen tekrar deneyin.');
        return false;
      }
    }

    return true;
  },

  clearFavorites: () => set({ favorites: [] }),
}));
