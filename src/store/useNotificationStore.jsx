import { create } from 'zustand';
import { supabase } from '../../libs/supabase';

let notificationChannel = null;

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async (userId) => {
    if (!userId) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ notifications: data || [] });
    } catch (error) {
      console.error('[fetchNotifications] Bildirimler yüklenirken hata:', error);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      set({
        notifications: get().notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
      });
    } catch (error) {
      console.error('[markAsRead] Bildirim okundu işaretlenirken hata:', error);
    }
  },

  markAllAsRead: async (userId) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      set({
        notifications: get().notifications.map((n) => ({ ...n, is_read: true })),
      });
    } catch (error) {
      console.error('[markAllAsRead] Bildirimler okundu işaretlenirken hata:', error);
    }
  },

  subscribeToNotifications: (userId) => {
    if (!userId) return;

    if (notificationChannel) {
      supabase.removeChannel(notificationChannel);
      notificationChannel = null;
    }

    notificationChannel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          set({
            notifications: [payload.new, ...get().notifications],
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          set({
            notifications: get().notifications.map((n) =>
              n.id === payload.new.id ? payload.new : n
            ),
          });
        }
      )
      .subscribe();
  },

  unsubscribeFromNotifications: () => {
    if (notificationChannel) {
      supabase.removeChannel(notificationChannel);
      notificationChannel = null;
    }
    set({ notifications: [] });
  },
}));
