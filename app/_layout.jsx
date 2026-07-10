import { useTheme } from '../hooks/useTheme';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import ThemeProvider from '../contexts/ThemeContext';

import { AuthProvider } from '../contexts/AuthContext';
import { ScrollProvider } from '../contexts/ScrollContext';
import CustomHeader from '../components/CustomHeader';

const LayoutContent = () => {
  const { colors, theme } = useTheme();

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.navBackground },
          headerTintColor: colors.title,
        }}
      >
        <Stack.Screen name='index' options={{ title: 'Home' }} />
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen name='(dashboard)' options={{ headerShown: false }} />
        <Stack.Screen
          name='(profile)'
          options={{ headerShown: true, header: () => <CustomHeader /> }}
        />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ScrollProvider>
          <LayoutContent />
        </ScrollProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
