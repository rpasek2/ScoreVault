import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { getInitials, CARD_SHADOW } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

// User profile type for local storage
interface UserProfile {
  displayName?: string;
  photoUri?: string;
}

export default function ProfileSettingsScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Just use Firebase user data for now (profile persistence disabled during database refactoring)
    setDisplayName(user?.email?.split('@')[0] || 'User');
  }, [user]);

  const pickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          t('settings.permissionRequired'),
          t('settings.photoLibraryPermission'),
          [{ text: t('common.ok') }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhotoUri(result.assets[0].uri);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('settings.failedToPickImage'));
    }
  };

  const removePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('settings.removePhoto'),
      t('settings.removePhotoConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => {
            setPhotoUri(undefined);
            setIsEditing(true);
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert(t('settings.invalidName'), t('settings.pleaseEnterDisplayName'));
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Note: Profile persistence temporarily disabled during database refactoring
      // Changes are saved in memory only for this session

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEditing(false);
      Alert.alert(t('common.success'), t('settings.profileUpdatedTemporary'));
    } catch (error) {
      console.error('Error saving profile:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('settings.failedToSaveProfile'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadUserProfile();
    setIsEditing(false);
  };

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
    content: {
      padding: theme.spacing.base,
      paddingBottom: 100
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      marginBottom: theme.spacing.base
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: theme.spacing.base
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.large
    },
    avatarImage: {
      width: 100,
      height: 100,
      borderRadius: 50
    },
    avatarText: {
      ...theme.typography.h1,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 40
    },
    changePhotoButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium
    },
    changePhotoText: {
      fontSize: 20,
      color: '#FFFFFF'
    },
    removePhotoButton: {
      marginTop: theme.spacing.sm,
      padding: theme.spacing.sm
    },
    removePhotoText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      fontWeight: '600'
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
      ...CARD_SHADOW
    },
    sectionTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.base,
      fontWeight: '600'
    },
    input: {
      backgroundColor: isDark ? theme.colors.background : '#F5F5F5',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm
    },
    infoText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 22
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.base,
      marginTop: theme.spacing.lg
    },
    button: {
      flex: 1,
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      ...CARD_SHADOW
    },
    saveButton: {
      backgroundColor: theme.colors.primary
    },
    cancelButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border
    },
    buttonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
      fontWeight: '600'
    },
    cancelText: {
      ...theme.typography.button,
      color: theme.colors.textPrimary,
      fontWeight: '600'
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.profile')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.profile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={theme.colors.avatarGradient}
                style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            )}
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={pickImage}
              activeOpacity={0.7}>
              <Text style={styles.changePhotoText}>📷</Text>
            </TouchableOpacity>
          </View>
          {photoUri && (
            <TouchableOpacity onPress={removePhoto} style={styles.removePhotoButton}>
              <Text style={styles.removePhotoText}>{t('settings.removePhoto')}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.email}>{user?.email || t('settings.noEmail')}</Text>
        </View>

        {/* Edit Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.displayName')}</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              setIsEditing(true);
            }}
            placeholder={t('settings.enterDisplayName')}
            placeholderTextColor={theme.colors.textTertiary}
            autoCapitalize="words"
          />
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.aboutYourData')}</Text>
          <Text style={styles.infoText}>
            {t('settings.aboutYourDataDescription')}
          </Text>
        </View>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.7}>
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t('settings.saveChanges')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
