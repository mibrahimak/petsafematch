import { useCallback, useContext, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { supabase } from '../libs/supabase';

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

export const usePresence = () => {
  const { user } = useContext(AuthContext);
  const intervalRef = useRef(null);

  const updateLastSeen = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('[usePresence] last_seen_at güncellenemedi:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;

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
  }, [user?.id, updateLastSeen]);
};
