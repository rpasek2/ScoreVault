import { DefaultTheme, DarkTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { Tutorial } from '@/components/Tutorial/Tutorial';
import { initDatabase } from '@/utils/database';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { user, loading: authLoading } = useAuth();
  const { isDark, theme } = useTheme();
  const [dbInitialized, setDbInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Initialize database on app startup
    const setupDatabase = async () => {
      try {
        await initDatabase();
        console.log('Database initialized successfully');
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Still allow app to load even if DB init fails
        setDbInitialized(true);
      }
    };

    setupDatabase();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (authLoading || !dbInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to sign-in if not authenticated
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, authLoading, dbInitialized]);

  // Show loading while checking auth or initializing database
  if (authLoading || !dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const navigationTheme = isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        {/* Auth screens */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Main app screens */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Dynamic routes */}
        <Stack.Screen name="gymnast/[id]" options={{ presentation: 'card', title: 'Gymnast Details' }} />
        <Stack.Screen name="meet/[id]" options={{ presentation: 'card', title: 'Meet Details' }} />

        {/* Modal screens */}
        <Stack.Screen name="add-gymnast" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="add-meet" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="add-score" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="edit-gymnast" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="edit-score" options={{ presentation: 'modal', headerShown: false }} />

        {/* Teams screens */}
        <Stack.Screen name="level-meets/[id]" options={{ presentation: 'card', title: 'Team Meets' }} />
        <Stack.Screen name="team-score/[id]" options={{ presentation: 'card', title: 'Team Score' }} />

        {/* Settings screens */}
        <Stack.Screen name="profile-settings" options={{ presentation: 'card', title: 'Profile Settings' }} />
        <Stack.Screen name="appearance" options={{ presentation: 'card', title: 'Appearance' }} />
        <Stack.Screen name="privacy-security" options={{ presentation: 'card', title: 'Privacy & Security' }} />
        <Stack.Screen name="cloud-backup" options={{ presentation: 'card', title: 'Cloud Backup' }} />
        <Stack.Screen name="export-data" options={{ presentation: 'card', title: 'Export Data' }} />
        <Stack.Screen name="import-data" options={{ presentation: 'card', title: 'Import Data' }} />
        <Stack.Screen name="contact-support" options={{ presentation: 'card', title: 'Contact Support' }} />
        <Stack.Screen name="help" options={{ presentation: 'card', title: 'Help' }} />
        <Stack.Screen name="privacy" options={{ presentation: 'card', title: 'Privacy Policy' }} />
        <Stack.Screen name="score-card-creator" options={{ presentation: 'card', title: 'Create Score Card' }} />
        <Stack.Screen name="team-score-card-creator" options={{ presentation: 'card', title: 'Create Team Score Card' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tutorial />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <TutorialProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </TutorialProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
