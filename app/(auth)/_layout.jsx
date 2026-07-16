import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import { useTheme } from '../../hooks/useTheme';
import { createSessionFromUrl } from '../../libs/oauth';

const AuthLayout = () => {
  const { colors } = useTheme();
  const url = Linking.useURL();

  useEffect(() => {
    if (!url) {
      return;
    }

    const handleDeepLink = async () => {
      try {
        await createSessionFromUrl(url);
      } catch (error) {
        console.error('[AuthLayout] Deep link oturum hatası:', error);
      }
    };

    handleDeepLink();
  }, [url]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.navBackground,
        },
        headerTintColor: colors.title,
      }}
    >
      <Stack.Screen name='login' options={{ headerShown: false }} />
      <Stack.Screen name='register' options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;
