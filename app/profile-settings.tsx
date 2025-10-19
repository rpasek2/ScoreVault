import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getInitials } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileSettingsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const displayName = user?.email?.split('@')[0] || 'User';
  const initials = getInitials(displayName);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    header: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.base,
      paddingTop: 60,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '600'
    },
    disabled: {
      opacity: 0.4
    },
    content: {
      padding: theme.spacing.base,
      paddingBottom: 100
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      marginBottom: theme.spacing.base
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.base,
      ...theme.shadows.large
    },
    avatarText: {
      ...theme.typography.h1,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 40
    },
    displayNameText: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: 4
    },
    email: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.base,
      ...theme.shadows.medium
    },
    sectionTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.base,
      fontWeight: '600'
    },
    infoText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 22
    },
    infoBox: {
      backgroundColor: theme.colors.primary + '15',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
      marginTop: theme.spacing.base
    },
    infoBoxText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      lineHeight: 22
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={theme.colors.avatarGradient}
            style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.displayNameText}>{displayName}</Text>
          <Text style={styles.email}>{user?.email || 'No email'}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This App</Text>
          <Text style={styles.infoText}>
            ScoreVault stores all your data locally on this device. Your gymnast records, meet information, and scores are saved in a local database.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <Text style={styles.infoText}>
            To backup your data or transfer it to another device, use the Export Data feature in Settings. You can later restore the data using Import Data.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            💡 Your data is private and stays on your device. Cloud backup is optional and only happens when you request it.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
