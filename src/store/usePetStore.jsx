import { create } from 'zustand';
import { supabase } from '../../libs/supabase';

export const usePetStore = create((set) => ({
  pets: [],
  loading: false,

  fetchPets: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('listings').select('*');
      if (error) throw error;
      set({ pets: data || [] });
    } catch (error) {
      console.error('Hata:', error.message);
    } finally {
      set({ loading: false });
    }
  },
}));
