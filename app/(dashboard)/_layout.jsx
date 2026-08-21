import { useMemo } from 'react';
import { Tabs, useSegments } from 'expo-router';

import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

import CustomHeader from '../../components/CustomHeader';
import AppLogo from '../../components/AppLogo';
import DashboardChromeController from '../../components/home/DashboardChromeController';
import { HomeScreenProvider, useHomeScreen } from '../../contexts/HomeScreenContext';

const isHomeSegment = (segments) =>
  segments[0] === '(dashboard)' &&
  (segments.length === 1 || segments[1] === 'index');

const DashboardTabs = () => {
  const { colors } = useTheme();
  const { uiVisible } = useHomeScreen();
  const segments = useSegments();
  const isHomeScreen = isHomeSegment(segments);

  const tabBarStyle = useMemo(
    () =>
      isHomeScreen && !uiVisible
        ? { display: 'none' }
        : {
            backgroundColor: colors.navBackground,
            paddingTop: 10,
            height: 90,
            borderTopColor: colors.navBackground,
          },
    [colors.navBackground, isHomeScreen, uiVisible]
  );

  return (
    <>
      <DashboardChromeController />
      <Tabs
        screenOptions={{
          headerShown: isHomeScreen ? uiVisible : true,
          headerStyle: { backgroundColor: colors.background },
          header: () => <CustomHeader />,
          headerTitle: '',
          tabBarStyle,
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
                size={28}
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
    </>
  );
};

const DashboardLayout = () => (
  <HomeScreenProvider>
    <DashboardTabs />
  </HomeScreenProvider>
);

export default DashboardLayout;
