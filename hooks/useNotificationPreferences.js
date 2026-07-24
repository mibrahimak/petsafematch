import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@petsafematch/notification_preferences';

const DEFAULT_PREFERENCES = {
  push: true,
  match: true,
  message: true,
  sound: true,
  email: false,
};

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
        }
      } catch (error) {
        console.error(
          '[useNotificationPreferences] Tercihler yüklenirken hata:',
          error
        );
      } finally {
        setIsLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const updatePreference = useCallback(async (key, value) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };

      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((error) => {
        console.error(
          '[useNotificationPreferences] Tercih kaydedilirken hata:',
          error
        );
      });

      return next;
    });
  }, []);

  return { preferences, isLoaded, updatePreference };
};
