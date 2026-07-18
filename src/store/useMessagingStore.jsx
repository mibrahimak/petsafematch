import { create } from 'zustand';
import { supabase } from '../../libs/supabase';

let messagingChannel = null;

export const useMessagingStore = create((set) => ({
  unreadCount: 0,

  fetchUnreadCount: async (userId) => {
    if (!userId) return;

    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      set({ unreadCount: count || 0 });
    } catch (error) {
      console.error('[fetchUnreadCount] Okunmamış mesaj sayısı alınırken hata:', error);
    }
  },

  subscribeToMessages: (userId) => {
    if (!userId) return;

    if (messagingChannel) {
      supabase.removeChannel(messagingChannel);
      messagingChannel = null;
    }

    messagingChannel = supabase
      .channel(`messages-unread-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          useMessagingStore.getState().fetchUnreadCount(userId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          useMessagingStore.getState().fetchUnreadCount(userId);
        }
      )
      .subscribe();
  },

  unsubscribeFromMessages: () => {
    if (messagingChannel) {
      supabase.removeChannel(messagingChannel);
      messagingChannel = null;
    }
    set({ unreadCount: 0 });
  },
}));
