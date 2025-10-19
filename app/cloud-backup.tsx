import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { UI_PALETTE, CARD_SHADOW } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { backupToFirebase, restoreFromFirebase, getLastBackupInfo } from '@/utils/database';

export default function CloudBackupScreen() {
  const { theme } = useTheme();
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
      Alert.alert('Error', 'You must be logged in to backup data');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Backup to Cloud',
      'This will backup all your gymnasts, meets, and scores to the cloud. Any existing backup will be overwritten.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'Backup Now',
          onPress: async () => {
            setLoading(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            try {
              const result = await backupToFirebase(user.uid);

              if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  'Backup Successful',
                  'Your data has been securely backed up to the cloud.',
                  [{ text: 'OK', onPress: () => checkBackupStatus() }]
                );
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Backup Failed', result.error || 'An error occurred while backing up your data.');
              }
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Backup Failed', error.message || 'An unexpected error occurred.');
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
      Alert.alert('Error', 'You must be logged in to restore data');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Restore from Cloud',
      '⚠️ WARNING: This will replace ALL current data with your cloud backup. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            try {
              const result = await restoreFromFirebase(user.uid);

              if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  'Restore Successful',
                  'Your data has been restored from the cloud backup. The app will refresh.',
                  [{
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to home to refresh data
                      router.replace('/');
                    }
                  }]
                );
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Restore Failed', result.error || 'An error occurred while restoring your data.');
              }
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Restore Failed', error.message || 'An unexpected error occurred.');
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
      ...theme.typography.bodyBold,
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
      ...theme.typography.bodyBold,
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
          <Text style={styles.title}>Cloud Backup</Text>
          <Text style={styles.subtitle}>
            Secure your data in the cloud for easy device transfers and peace of mind
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Info Card */}
          <LinearGradient
            colors={theme.colors.cardGradient}
            style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Your data is stored locally on your device for fast, offline access. Use cloud backup to securely store a copy online, making it easy to restore on a new device or after a reset.
            </Text>
          </LinearGradient>

          {/* Status Card */}
          <LinearGradient
            colors={theme.colors.cardGradient}
            style={styles.statusCard}>
            <Text style={styles.infoTitle}>Backup Status</Text>

            {checkingBackup ? (
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing.base }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Last Backup:</Text>
                  <Text style={[
                    styles.statusValue,
                    lastBackup.exists ? styles.statusValueSuccess : styles.statusValueError
                  ]}>
                    {lastBackup.exists && lastBackup.timestamp
                      ? formatDate(lastBackup.timestamp)
                      : 'Never'
                    }
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <Text style={[
                    styles.statusValue,
                    lastBackup.exists ? styles.statusValueSuccess : styles.statusValueError
                  ]}>
                    {lastBackup.exists ? '✓ Backup Available' : 'No Backup'}
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
                <Text style={styles.buttonText}>Backup Now</Text>
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
                <Text style={styles.restoreButtonText}>Restore from Backup</Text>
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
            {loading ? 'Processing...' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}
