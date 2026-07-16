import {
  useEffect,
  useState,
  createContext,
  useMemo,
  useCallback,
} from 'react';
import { supabase } from '../libs/supabase';
import { signInWithProvider as oauthSignIn } from '../libs/oauth';

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setUser(session.user);
        fetchProfile(session.user.id);
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
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

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
  }, []);

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
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
