import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingHorizontal: 16,
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
          title: t('tabs.gymnasts'),
          headerTitle: t('tabs.gymnasts'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
          tabBarTestID: 'tab-gymnasts',
        }}
      />
      <Tabs.Screen
        name="meets"
        options={{
          title: t('tabs.meets'),
          headerTitle: t('tabs.meets'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          tabBarTestID: 'tab-meets',
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: t('tabs.teams'),
          headerTitle: t('tabs.teams'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.3.fill" color={color} />,
          tabBarTestID: 'tab-teams',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          tabBarTestID: 'tab-settings',
        }}
      />
    </Tabs>
  );
}
