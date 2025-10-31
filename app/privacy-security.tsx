import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { UI_PALETTE, CARD_SHADOW } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';

export default function PrivacySecurityScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const auth = getAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('security.fillAllPasswordFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('security.passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('security.passwordMinLength'));
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      t('settings.changePassword'),
      t('security.changePasswordConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: t('security.change'),
          onPress: async () => {
            setLoading(true);
            try {
              const currentUser = auth.currentUser;
              if (!currentUser || !currentUser.email) {
                throw new Error('No user logged in');
              }

              // Re-authenticate user before changing password
              const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
              await reauthenticateWithCredential(currentUser, credential);

              // Change password
              await updatePassword(currentUser, newPassword);

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(t('common.success'), t('security.passwordChangedSuccess'));

              // Clear form
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              let errorMessage = t('security.failedToChangePassword');

              if (error.code === 'auth/wrong-password') {
                errorMessage = t('security.currentPasswordIncorrect');
              } else if (error.code === 'auth/weak-password') {
                errorMessage = t('security.passwordTooWeak');
              } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = t('security.reloginRequired');
              }

              Alert.alert(t('common.error'), errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      t('security.deleteAccountTitle'),
      t('security.deleteAccountWarning'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: t('security.deleteForever'),
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              t('security.finalConfirmation'),
              t('security.deleteAccountItems'),
              [
                {
                  text: t('common.cancel'),
                  style: 'cancel'
                },
                {
                  text: t('security.deleteEverything'),
                  style: 'destructive',
                  onPress: async () => {
                    setLoading(true);
                    try {
                      const currentUser = auth.currentUser;
                      if (!currentUser) {
                        throw new Error('No user logged in');
                      }

                      // Delete user account from Firebase
                      await deleteUser(currentUser);

                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                      // Note: Local SQLite data will remain until app is uninstalled
                      // User can manually clear it or it will be overwritten on next login

                      // Sign out will be handled automatically by auth state change
                    } catch (error: any) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                      let errorMessage = t('security.failedToDeleteAccount');

                      if (error.code === 'auth/requires-recent-login') {
                        errorMessage = t('security.reloginToDelete');
                      }

                      Alert.alert(t('common.error'), errorMessage);
                    } finally {
                      setLoading(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
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
    section: {
      marginBottom: theme.spacing.xl
    },
    sectionTitle: {
      ...theme.typography.captionBold,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5
    },
    card: {
      padding: theme.spacing.lg,
      borderRadius: 12,
      ...CARD_SHADOW
    },
    cardTitle: {
      ...theme.typography.h6,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm
    },
    cardText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.md
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm
    },
    button: {
      padding: theme.spacing.base,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      ...CARD_SHADOW
    },
    buttonDisabled: {
      opacity: 0.5
    },
    buttonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
      fontWeight: '600'
    },
    deleteButton: {
      borderWidth: 2,
      borderColor: theme.colors.error
    },
    deleteButtonText: {
      color: theme.colors.error
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm
    },
    bullet: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.sm
    },
    infoText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 20
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <LinearGradient
          colors={theme.colors.headerGradient}
          style={styles.header}>
          <Text style={styles.headerIcon}>🔐</Text>
          <Text style={styles.title}>{t('settings.privacySecurity')}</Text>
          <Text style={styles.subtitle}>
            {t('security.manageSecuritySettings')}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Change Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('security.password')}</Text>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.card}>
              <Text style={styles.cardTitle}>{t('settings.changePassword')}</Text>
              <Text style={styles.cardText}>
                {t('security.updatePasswordToKeepSecure')}
              </Text>

              <TextInput
                style={styles.input}
                placeholder={t('settings.currentPassword')}
                placeholderTextColor={theme.colors.textTertiary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder={t('security.newPasswordPlaceholder')}
                placeholderTextColor={theme.colors.textTertiary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder={t('settings.confirmNewPassword')}
                placeholderTextColor={theme.colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleChangePassword}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}>
                <LinearGradient
                  colors={theme.colors.avatarGradient}
                  style={[styles.button, (loading || !currentPassword || !newPassword || !confirmPassword) && styles.buttonDisabled]}>
                  <Text style={styles.buttonText}>{t('settings.changePassword')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Data Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('security.dataPrivacy')}</Text>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.card}>
              <Text style={styles.cardTitle}>{t('security.yourData')}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('security.dataStoredLocally')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('security.cloudBackupsOptional')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('security.neverSharedWithThirdParties')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('security.canExportOrDelete')}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Account Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('security.accountSecurity')}</Text>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.card}>
              <Text style={styles.cardTitle}>{t('security.securityTips')}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('security.useStrongPassword')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('security.changePasswordRegularly')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('security.neverSharePassword')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('security.logoutSharedDevices')}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Delete Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.dangerZone')}</Text>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.card}>
              <Text style={styles.cardTitle}>{t('settings.deleteAccount')}</Text>
              <Text style={styles.cardText}>
                {t('security.deleteAccountDescription')}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDeleteAccount}
                disabled={loading}>
                <LinearGradient
                  colors={theme.colors.cardGradient}
                  style={[styles.button, styles.deleteButton, loading && styles.buttonDisabled]}>
                  <Text style={styles.deleteButtonText}>{t('settings.deleteAccount')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
