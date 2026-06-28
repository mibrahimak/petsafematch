import { Tabs } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

// Themed Components

import ThemedText from '../../components/ThemedText';
import CustomHeader from '../../components/CustomHeader';

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
