import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../libs/supabase';

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

export const usePresence = (userId, showOnlineStatus = true) => {
  const intervalRef = useRef(null);

  const updateLastSeen = useCallback(async () => {
    if (!userId || showOnlineStatus === false) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('[usePresence] last_seen_at güncellenemedi:', error);
    }
  }, [userId, showOnlineStatus]);

  useEffect(() => {
    if (!userId || showOnlineStatus === false) return undefined;

    updateLastSeen();

    intervalRef.current = setInterval(updateLastSeen, HEARTBEAT_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        updateLastSeen();
      }
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription.remove();
    };
  }, [userId, showOnlineStatus, updateLastSeen]);
};
