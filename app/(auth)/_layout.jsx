import { Stack } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

const AuthLayout = () => {
  const { colors } = useTheme();
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
      <Stack.Screen name="login" options={{ title: 'Giriş Yap' }} />
      <Stack.Screen name="register" options={{ title: 'Kaydol' }} />
    </Stack>
  );
};

export default AuthLayout;
