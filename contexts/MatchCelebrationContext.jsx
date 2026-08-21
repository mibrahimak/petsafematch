import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '../libs/supabase';
import MatchCelebrationModal from '../components/match/MatchCelebrationModal';

const MatchCelebrationContext = createContext(null);

export const MatchCelebrationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [celebration, setCelebration] = useState(null);
  const shownMatchIdsRef = useRef(new Set());
  const celebrationRef = useRef(null);

  celebrationRef.current = celebration;

  const hideCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const showCelebration = useCallback(async (data) => {
    const matchId = data.matchId || data.match_id;
    if (matchId && shownMatchIdsRef.current.has(matchId)) return;
    if (celebrationRef.current) return;

    let myPet = data.myPet;
    let matchedPet = data.matchedPet;

    const myPetId = data.myPetId || data.my_pet_id;
    const matchedPetId = data.matchedPetId || data.matched_pet_id;
    const matchedUserId =
      data.matchedUserId || data.matched_user_id || data.userId;

    if (!myPet?.name || !matchedPet?.name) {
      const petIds = [myPetId, matchedPetId].filter(Boolean);
      if (petIds.length > 0) {
        const { data: pets } = await supabase
          .from('user_pets')
          .select('id, name, image_url, userId')
          .in('id', petIds);

        const petMap = new Map((pets || []).map((p) => [p.id, p]));
        myPet = myPet || petMap.get(myPetId);
        matchedPet = matchedPet || petMap.get(matchedPetId);
      }
    }

    if (matchId) shownMatchIdsRef.current.add(matchId);

    setCelebration({
      matchId,
      myPet,
      matchedPet,
      matchedUserId,
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`match-celebration-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new;
          if (
            notification?.type === 'match' &&
            notification?.data?.is_mutual
          ) {
            showCelebration(notification.data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, showCelebration]);

  return (
    <MatchCelebrationContext.Provider value={{ showCelebration, hideCelebration }}>
      {children}
      <MatchCelebrationModal
        visible={Boolean(celebration)}
        myPet={celebration?.myPet}
        matchedPet={celebration?.matchedPet}
        matchedUserId={celebration?.matchedUserId}
        onClose={hideCelebration}
      />
    </MatchCelebrationContext.Provider>
  );
};

export const useMatchCelebration = () => {
  const context = useContext(MatchCelebrationContext);
  if (!context) {
    throw new Error('useMatchCelebration must be used within MatchCelebrationProvider');
  }
  return context;
};
