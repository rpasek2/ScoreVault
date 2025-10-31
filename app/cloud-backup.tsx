import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { UI_PALETTE, CARD_SHADOW } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { backupToFirebase, restoreFromFirebase, getLastBackupInfo } from '@/utils/database';

export default function CloudBackupScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingBackup, setCheckingBackup] = useState(true);
  const [lastBackup, setLastBackup] = useState<{ timestamp?: number; exists: boolean }>({ exists: false });

  useEffect(() => {
    checkBackupStatus();
  }, [user]);

  const checkBackupStatus = async () => {
    if (!user?.uid) {
      setCheckingBackup(false);
      return;
    }

    setCheckingBackup(true);
    try {
      const info = await getLastBackupInfo(user.uid);
      setLastBackup(info);
    } catch (error) {
      console.error('Error checking backup status:', error);
    } finally {
      setCheckingBackup(false);
    }
  };

  const handleBackup = async () => {
    if (!user?.uid) {
      Alert.alert(t('common.error'), t('backup.mustBeLoggedIn'));
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      t('backup.backupToCloud'),
      t('backup.backupConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: t('settings.backupNow'),
          onPress: async () => {
            setLoading(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            try {
              const result = await backupToFirebase(user.uid);

              if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  t('backup.backupSuccessful'),
                  t('backup.backupSuccessMessage'),
                  [{ text: t('common.ok'), onPress: () => checkBackupStatus() }]
                );
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert(t('backup.backupFailed'), result.error || t('backup.backupError'));
              }
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(t('backup.backupFailed'), error.message || t('backup.unexpectedError'));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRestore = async () => {
    if (!user?.uid) {
      Alert.alert(t('common.error'), t('backup.mustBeLoggedInRestore'));
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      t('backup.restoreFromCloud'),
      t('backup.restoreWarningMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: t('backup.restore'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            try {
              const result = await restoreFromFirebase(user.uid);

              if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  t('backup.restoreSuccessful'),
                  t('backup.restoreSuccessMessage'),
                  [{
                    text: t('common.ok'),
                    onPress: () => {
                      // Navigate back to home to refresh data
                      router.replace('/');
                    }
                  }]
                );
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert(t('backup.restoreFailed'), result.error || t('backup.restoreError'));
              }
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(t('backup.restoreFailed'), error.message || t('backup.unexpectedError'));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    header: {
      padding: theme.spacing.xl,
      paddingTop: 60,
      alignItems: 'center'
    },
    headerIcon: {
      fontSize: 60,
      marginBottom: theme.spacing.base
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing.xs
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.lg
    },
    content: {
      paddingHorizontal: 15
    },
    infoCard: {
      padding: theme.spacing.lg,
      borderRadius: 12,
      marginBottom: theme.spacing.lg,
      ...CARD_SHADOW
    },
    infoTitle: {
      ...theme.typography.h6,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm
    },
    infoText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20
    },
    statusCard: {
      padding: theme.spacing.lg,
      borderRadius: 12,
      marginBottom: theme.spacing.lg,
      ...CARD_SHADOW
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm
    },
    statusLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      flex: 1
    },
    statusValue: {
      ...theme.typography.h6,
      color: theme.colors.textPrimary
    },
    statusValueSuccess: {
      color: theme.colors.success
    },
    statusValueError: {
      color: theme.colors.textSecondary
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(107, 110, 255, 0.1)',
      marginVertical: theme.spacing.sm
    },
    buttonContainer: {
      gap: 12
    },
    button: {
      padding: theme.spacing.base,
      borderRadius: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      ...CARD_SHADOW
    },
    buttonDisabled: {
      opacity: 0.5
    },
    buttonIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm
    },
    buttonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
      fontWeight: '600'
    },
    restoreButton: {
      borderWidth: 2,
      borderColor: theme.colors.error
    },
    restoreButtonText: {
      color: theme.colors.error
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    loadingText: {
      ...theme.typography.body,
      color: '#FFFFFF',
      marginTop: theme.spacing.base
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <LinearGradient
          colors={theme.colors.headerGradient}
          style={styles.header}>
          <Text style={styles.headerIcon}>☁️</Text>
          <Text style={styles.title}>{t('settings.cloudBackup')}</Text>
          <Text style={styles.subtitle}>
            {t('backup.subtitle')}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Info Card */}
          <LinearGradient
            colors={theme.colors.cardGradient}
            style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t('backup.howItWorks')}</Text>
            <Text style={styles.infoText}>
              {t('backup.howItWorksDescription')}
            </Text>
          </LinearGradient>

          {/* Status Card */}
          <LinearGradient
            colors={theme.colors.cardGradient}
            style={styles.statusCard}>
            <Text style={styles.infoTitle}>{t('backup.backupStatus')}</Text>

            {checkingBackup ? (
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing.base }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>{t('settings.lastBackup')}:</Text>
                  <Text style={[
                    styles.statusValue,
                    lastBackup.exists ? styles.statusValueSuccess : styles.statusValueError
                  ]}>
                    {lastBackup.exists && lastBackup.timestamp
                      ? formatDate(lastBackup.timestamp)
                      : t('settings.never')
                    }
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>{t('backup.status')}:</Text>
                  <Text style={[
                    styles.statusValue,
                    lastBackup.exists ? styles.statusValueSuccess : styles.statusValueError
                  ]}>
                    {lastBackup.exists ? t('backup.backupAvailable') : t('backup.noBackup')}
                  </Text>
                </View>
              </>
            )}
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBackup}
              disabled={loading}>
              <LinearGradient
                colors={theme.colors.avatarGradient}
                style={[styles.button, loading && styles.buttonDisabled]}>
                <Text style={styles.buttonIcon}>📤</Text>
                <Text style={styles.buttonText}>{t('settings.backupNow')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleRestore}
              disabled={loading || !lastBackup.exists}>
              <LinearGradient
                colors={theme.colors.cardGradient}
                style={[
                  styles.button,
                  styles.restoreButton,
                  (loading || !lastBackup.exists) && styles.buttonDisabled
                ]}>
                <Text style={styles.buttonIcon}>📥</Text>
                <Text style={styles.restoreButtonText}>{t('settings.restoreFromBackup')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>
            {loading ? t('backup.processing') : ''}
          </Text>
        </View>
      )}
    </View>
  );
}
