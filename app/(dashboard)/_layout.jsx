import { Tabs } from 'expo-router';

import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

// Themed Components

import ThemedText from '../../components/ThemedText';
import CustomHeader from '../../components/CustomHeader';
import AppLogo from '../../components/AppLogo';

const DashboardLayout = () => {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        header: () => <CustomHeader />,
        headerTitle: '',
        tabBarStyle: {
          backgroundColor: colors.navBackground,
          paddingTop: 10,
          height: 90,
          borderTopColor: colors.navBackground,
        },
        tabBarActiveTintColor: colors.iconColorFocused,
        tabBarInactiveTintColor: colors.iconColor,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={24}
              name={focused ? 'search' : 'search-outline'}
              color={focused ? colors.iconColorFocused : colors.iconColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='mylistings'
        options={{
          title: 'İlanlarım',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={24}
              name={focused ? 'list' : 'list-outline'}
              color={focused ? colors.iconColorFocused : colors.iconColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='match'
        options={{
          title: 'Match',
          tabBarIcon: ({ focused }) => (
            <AppLogo
              color={focused ? colors.iconColorFocused : colors.iconColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='favorites'
        options={{
          title: 'Favoriler',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={24}
              name={focused ? 'heart' : 'heart-outline'}
              color={focused ? colors.iconColorFocused : colors.iconColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={24}
              name={focused ? 'person' : 'person-outline'}
              color={focused ? colors.iconColorFocused : colors.iconColor}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default DashboardLayout;
