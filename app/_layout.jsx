import { useTheme } from '../hooks/useTheme';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ThemeProvider from '../contexts/ThemeContext';

import { AuthProvider } from '../contexts/AuthContext';
import { MatchCelebrationProvider } from '../contexts/MatchCelebrationContext';
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
        <Stack.Screen name='messages' options={{ headerShown: false }} />
        <Stack.Screen name='notifications' options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <MatchCelebrationProvider>
            <ScrollProvider>
              <LayoutContent />
            </ScrollProvider>
          </MatchCelebrationProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
