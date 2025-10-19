import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials, UI_PALETTE, CARD_SHADOW } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const handleRateApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // App Store URLs - replace with your actual app IDs when published
    const APP_STORE_ID = 'YOUR_APP_STORE_ID'; // Replace with actual App Store ID
    const PLAY_STORE_ID = 'com.illuvatar.ScoreVault'; // From your app.json

    const storeUrl = Platform.select({
      ios: `https://apps.apple.com/app/id${APP_STORE_ID}`,
      android: `market://details?id=${PLAY_STORE_ID}`,
      default: 'https://scorevault.app' // Fallback web URL
    });

    const webFallbackUrl = Platform.select({
      ios: `https://apps.apple.com/app/id${APP_STORE_ID}`,
      android: `https://play.google.com/store/apps/details?id=${PLAY_STORE_ID}`,
      default: 'https://scorevault.app'
    });

    try {
      const canOpen = await Linking.canOpenURL(storeUrl);
      if (canOpen) {
        await Linking.openURL(storeUrl);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Fallback to web URL if app store not available
        await Linking.openURL(webFallbackUrl);
      }
    } catch (error) {
      // App not yet published - show thank you message
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '⭐ Thank You!',
        'ScoreVault will be available on the App Store and Google Play Store soon!\n\nWe appreciate your support and will notify you when you can leave a review.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          try {
            await signOut();
          } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const initials = getInitials(displayName);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    profileSection: {
      padding: theme.spacing.xl,
      alignItems: 'center',
      paddingTop: 60
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.base,
      ...theme.shadows.medium
    },
    avatarText: {
      ...theme.typography.h1,
      color: '#FFFFFF',
      fontWeight: '700'
    },
    displayName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs
    },
    email: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
    },
    accountBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: 'rgba(107, 110, 255, 0.2)'
    },
    accountBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '600'
    },
    section: {
      marginTop: theme.spacing.xl,
      marginHorizontal: 15
    },
    sectionTitle: {
      ...theme.typography.captionBold,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5
    },
    menuItemWrapper: {
      marginBottom: 8
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.base,
      borderRadius: 12,
      ...CARD_SHADOW
    },
    menuIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(107, 110, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md
    },
    menuIcon: {
      fontSize: 20
    },
    menuContent: {
      flex: 1
    },
    menuLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: 2
    },
    menuSubtext: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary
    },
    chevron: {
      fontSize: 24,
      color: theme.colors.textTertiary,
      marginLeft: theme.spacing.sm,
      fontWeight: '300'
    },
    signOutButton: {
      padding: theme.spacing.base,
      marginHorizontal: 15,
      marginTop: theme.spacing.xl,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.error,
      ...CARD_SHADOW
    },
    signOutText: {
      ...theme.typography.button,
      color: theme.colors.error,
      fontWeight: '600'
    },
    footer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxxl,
      marginTop: theme.spacing.lg
    },
    version: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginBottom: 4
    },
    footerText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary
    }
  });

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <LinearGradient
        colors={theme.colors.headerGradient}
        style={styles.profileSection}>
        <LinearGradient
          colors={theme.colors.avatarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
        <View style={styles.accountBadge}>
          <Text style={styles.accountBadgeText}>Free Account</Text>
        </View>
      </LinearGradient>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/profile-settings')}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>👤</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Profile Settings</Text>
                <Text style={styles.menuSubtext}>Manage your personal information</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/privacy-security')}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🔐</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Privacy & Security</Text>
                <Text style={styles.menuSubtext}>Password, authentication</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/cloud-backup')}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>☁️</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Cloud Backup</Text>
                <Text style={styles.menuSubtext}>Backup & restore from cloud</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/export-data')}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>📤</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Export Data</Text>
                <Text style={styles.menuSubtext}>Download your scores and meets</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/import-data')}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>📥</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Import Data</Text>
                <Text style={styles.menuSubtext}>Restore from JSON backup</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/appearance')}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🎨</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Appearance</Text>
                <Text style={styles.menuSubtext}>Theme and color preferences</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/help')}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>❓</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Help & FAQ</Text>
                <Text style={styles.menuSubtext}>Get answers to common questions</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/contact-support')}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>📧</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Contact Support</Text>
                <Text style={styles.menuSubtext}>Reach out to our team</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRateApp}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>⭐</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Rate ScoreVault</Text>
                <Text style={styles.menuSubtext}>Love the app? Let us know!</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/privacy')}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🔒</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Privacy Policy</Text>
                <Text style={styles.menuSubtext}>How we handle your data</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleSignOut}>
        <LinearGradient
          colors={theme.colors.cardGradient}
          style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.version}>ScoreVault v1.0.0</Text>
        <Text style={styles.footerText}>Made with ❤️ for gymnasts</Text>
      </View>
    </ScrollView>
  );
}
