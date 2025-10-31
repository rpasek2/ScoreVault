import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials, UI_PALETTE, CARD_SHADOW } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('scorevault.db');

interface UserProfile {
  displayName?: string;
  photoUri?: string;
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      const result = await db.getFirstAsync<UserProfile>(
        'SELECT displayName, photoUri FROM user_profile WHERE id = 1'
      );
      if (result) {
        setUserProfile(result);
      }
    } catch (error) {
      console.log('Error loading user profile:', error);
    }
  };

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
        t('settings.thankYou'),
        t('settings.appComingSoon'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleLanguageChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Language / Idioma',
      'Select your preferred language\nSelecciona tu idioma preferido',
      [
        {
          text: 'English',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await setLanguage('en');
          }
        },
        {
          text: 'Español',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await setLanguage('es');
          }
        },
        {
          text: 'Cancel / Cancelar',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
      ]
    );
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(t('auth.signOut'), t('auth.signOut') + '?', [
      {
        text: t('common.cancel'),
        style: 'cancel',
        onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      },
      {
        text: t('auth.signOut'),
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          try {
            await signOut();
          } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(t('common.error'), error.message);
          }
        }
      }
    ]);
  };

  const displayName = userProfile.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const photoUri = userProfile.photoUri;
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
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40
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
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatarImage} />
        ) : (
          <LinearGradient
            colors={theme.colors.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
        )}
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </LinearGradient>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.profile')}</Text>

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
                <Text style={styles.menuLabel}>{t('settings.profileSettings')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.profileSettings')}</Text>
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
                <Text style={styles.menuLabel}>{t('settings.privacySecurity')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.changePassword')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.exportData')}</Text>

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
                <Text style={styles.menuLabel}>{t('settings.cloudBackup')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.backupNow')}</Text>
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
                <Text style={styles.menuLabel}>{t('settings.exportData')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.exportData')}</Text>
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
                <Text style={styles.menuLabel}>{t('settings.importData')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.importJSON')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/hidden-gymnasts')}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>👁️</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{t('settings.hiddenGymnasts')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.hiddenGymnasts')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.settings')}</Text>

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
                <Text style={styles.menuLabel}>{t('settings.appearance')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.appearance')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.menuItemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLanguageChange}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🌐</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{t('settings.language')}</Text>
                <Text style={styles.menuSubtext}>{language === 'en' ? t('settings.english') : t('settings.spanish')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.help')}</Text>

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
                <Text style={styles.menuLabel}>{t('settings.helpFAQ')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.helpFAQ')}</Text>
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
                <Text style={styles.menuLabel}>{t('settings.contactSupport')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.contactSupport')}</Text>
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
                <Text style={styles.menuLabel}>{t('settings.rateApp')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.shareYourFeedback')}</Text>
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
                <Text style={styles.menuLabel}>{t('settings.privacyPolicy')}</Text>
                <Text style={styles.menuSubtext}>{t('settings.howWeHandleData')}</Text>
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
          <Text style={styles.signOutText}>{t('auth.signOut')}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.version}>ScoreVault v1.0.0</Text>
        <Text style={styles.footerText}>{t('settings.madeWithLove')}</Text>
      </View>
    </ScrollView>
  );
}
