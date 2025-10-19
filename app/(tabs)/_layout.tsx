import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.textPrimary,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 20,
          fontWeight: '600',
          marginTop: -10,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Gymnasts',
          headerTitle: 'My Gymnasts',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="meets"
        options={{
          title: 'Meets',
          headerTitle: 'All Meets',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          headerTitle: 'Team Scores',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.3.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
