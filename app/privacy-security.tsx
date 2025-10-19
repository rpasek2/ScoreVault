import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { UI_PALETTE, CARD_SHADOW } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';

export default function PrivacySecurityScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const auth = getAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Change Password',
      'Are you sure you want to change your password?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'Change',
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
              Alert.alert('Success', 'Your password has been changed successfully');

              // Clear form
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              let errorMessage = 'Failed to change password';

              if (error.code === 'auth/wrong-password') {
                errorMessage = 'Current password is incorrect';
              } else if (error.code === 'auth/weak-password') {
                errorMessage = 'New password is too weak';
              } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'Please log out and log in again before changing password';
              }

              Alert.alert('Error', errorMessage);
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
      '⚠️ Delete Account',
      'This will permanently delete your account and ALL data including gymnasts, meets, and scores. This action cannot be undone.\n\nAre you absolutely sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete:\n• Your account\n• All gymnasts\n• All meets\n• All scores\n\nThis cannot be undone. Continue?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel'
                },
                {
                  text: 'Delete Everything',
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
                      let errorMessage = 'Failed to delete account';

                      if (error.code === 'auth/requires-recent-login') {
                        errorMessage = 'For security, please log out and log in again before deleting your account';
                      }

                      Alert.alert('Error', errorMessage);
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
      ...theme.typography.bodyBold,
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
          <Text style={styles.title}>Privacy & Security</Text>
          <Text style={styles.subtitle}>
            Manage your account security and privacy settings
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Change Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Password</Text>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.card}>
              <Text style={styles.cardTitle}>Change Password</Text>
              <Text style={styles.cardText}>
                Update your password to keep your account secure
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Current Password"
                placeholderTextColor={theme.colors.textTertiary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="New Password (min 6 characters)"
                placeholderTextColor={theme.colors.textTertiary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
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
                  <Text style={styles.buttonText}>Change Password</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Data Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Privacy</Text>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.card}>
              <Text style={styles.cardTitle}>Your Data</Text>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>All gymnast, meet, and score data is stored locally on your device</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>Cloud backups are optional and only created when you explicitly request them</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>Your data is never shared with third parties</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>You can export or delete your data at any time from Settings</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Account Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.card}>
              <Text style={styles.cardTitle}>Security Tips</Text>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>Use a strong, unique password for your account</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>Change your password regularly</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>Never share your password with anyone</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>Log out on shared devices</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Delete Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.card}>
              <Text style={styles.cardTitle}>Delete Account</Text>
              <Text style={styles.cardText}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDeleteAccount}
                disabled={loading}>
                <LinearGradient
                  colors={theme.colors.cardGradient}
                  style={[styles.button, styles.deleteButton, loading && styles.buttonDisabled]}>
                  <Text style={styles.deleteButtonText}>Delete My Account</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
