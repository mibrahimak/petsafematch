import {
  useEffect,
  useState,
  createContext,
  useMemo,
  useCallback,
} from 'react';
import { supabase } from '../libs/supabase';
import { signInWithProvider as oauthSignIn } from '../libs/oauth';
import { useFavoriteStore } from '../src/store/useFavoriteStore';
import { useNotificationStore } from '../src/store/useNotificationStore';
import { useMessagingStore } from '../src/store/useMessagingStore';
import PresenceTracker from '../components/PresenceTracker';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch warning:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  const syncUserData = useCallback(async (userId) => {
    await Promise.all([
      useFavoriteStore.getState().fetchFavorites(userId),
      useNotificationStore.getState().fetchNotifications(userId),
      useMessagingStore.getState().fetchUnreadCount(userId),
    ]);
    useNotificationStore.getState().subscribeToNotifications(userId);
    useMessagingStore.getState().subscribeToMessages(userId);
  }, []);

  const clearUserData = useCallback(() => {
    useFavoriteStore.getState().clearFavorites();
    useNotificationStore.getState().unsubscribeFromNotifications();
    useMessagingStore.getState().unsubscribeFromMessages();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setUser(session.user);
        fetchProfile(session.user.id);
        syncUserData(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(async () => {
        if (session) {
          setIsLoggedIn(true);
          setUser(session.user);
          await fetchProfile(session.user.id);
          await syncUserData(session.user.id);
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setProfile(null);
          clearUserData();
          setIsLoading(false);
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, syncUserData, clearUserData]);

  const register = useCallback(async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearUserData();
  }, [clearUserData]);

  const signInWithProvider = useCallback(async (provider) => {
    return oauthSignIn(provider);
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(async (fullName) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) throw error;

    setUser(data.user);

    return data;
  }, []);

  const updateUserProfile = useCallback(
    async ({ fullName, avatarUrl, city }) => {
      if (!user?.id) {
        throw new Error('Oturum bulunamadı.');
      }

      const updates = {
        full_name: fullName.trim(),
        updated_at: new Date().toISOString(),
      };

      if (avatarUrl !== undefined) {
        updates.avatar_url = avatarUrl;
      }

      if (city !== undefined) {
        updates.city = city || null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('[updateUserProfile] Profil güncellenemedi:', error);
        throw error;
      }

      const { data: authData, error: authError } =
        await supabase.auth.updateUser({
          data: { full_name: fullName.trim() },
        });

      if (authError) {
        console.error(
          '[updateUserProfile] Auth metadata güncellenemedi:',
          authError
        );
        throw authError;
      }

      setProfile(data);
      setUser(authData.user);

      return data;
    },
    [user?.id]
  );

  const value = useMemo(() => {
    return {
      isLoggedIn,
      setIsLoggedIn,
      isLoading,
      user,
      profile,
      refreshProfile,
      login,
      register,
      logout,
      signInWithProvider,
      resetPassword,
      updateProfile,
      updateUserProfile,
    };
  }, [
    isLoggedIn,
    isLoading,
    user,
    profile,
    refreshProfile,
    login,
    register,
    logout,
    signInWithProvider,
    resetPassword,
    updateProfile,
    updateUserProfile,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {isLoggedIn && user?.id ? <PresenceTracker userId={user.id} /> : null}
      {children}
    </AuthContext.Provider>
  );
};
