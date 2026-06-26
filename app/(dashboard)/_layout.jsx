import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { ScrollContext } from '../../contexts/ScrollContext';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

// Themed Components

import ThemedText from '../../components/ThemedText';

const DashboardLayout = () => {
  const { colors } = useTheme();
  const { shouldHideTabBar } = useContext(ScrollContext);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: shouldHideTabBar ? 'none' : 'flex',
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
        name='ilanlarım'
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
        name='ilan-ver'
        options={{
          title: 'İlan Ver',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              size={24}
              name={focused ? 'create' : 'create-outline'}
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
