import { create } from 'zustand';

export const useFavoriteStore = create((set) => ({
  // Global State: Favori İlanların ID'lerini tutan array
  favorites: [],

  // Action: Favori ekleme/çıkarma
  toggleFavorite: (petId) =>
    set((state) => {
      const isExist = state.favorites.includes(petId);

      if (isExist) {
        return { favorites: state.favorites.filter((id) => id !== petId) };
      } else {
        return { favorites: [...state.favorites, petId] };
      }
    }),

  // İlerisi için favorileri temizleme fonksiyonu
  clearFavorites: () => set({ favorites: [] }),
}));
