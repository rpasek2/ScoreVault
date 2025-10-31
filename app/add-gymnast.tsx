import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { UI_PALETTE, CARD_SHADOW, getInitials } from '@/constants/theme';
import { addGymnast } from '@/utils/database';

const LEVEL_OPTIONS = [
  'Level 1',
  'Level 2',
  'Level 3',
  'Level 4',
  'Level 5',
  'Level 6',
  'Level 7',
  'Level 8',
  'Level 9',
  'Level 10',
  'Xcel Bronze',
  'Xcel Silver',
  'Xcel Gold',
  'Xcel Platinum',
  'Xcel Diamond',
  'Xcel Sapphire',
  'Elite'
];

export default function AddGymnastScreen() {
  const [name, setName] = useState('');
  const [usagNumber, setUsagNumber] = useState('');
  const [level, setLevel] = useState('');
  const [discipline, setDiscipline] = useState<'Womens' | 'Mens'>('Womens');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      flexGrow: 1,
      padding: 15,
      paddingTop: 0
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: 60
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary
    },
    cancelButton: {
      fontSize: 16,
      color: theme.colors.textSecondary
    },
    disabled: {
      opacity: 0.4
    },
    form: {
      padding: 20,
      borderRadius: 12,
      marginTop: 15,
      ...CARD_SHADOW
    },
    inputGroup: {
      marginBottom: 24
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 8
    },
    required: {
      color: theme.colors.error
    },
    input: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      borderRadius: 8,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary
    },
    hint: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      marginTop: 6
    },
    dateInput: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    dateText: {
      fontSize: 16,
      color: theme.colors.textPrimary
    },
    datePlaceholder: {
      fontSize: 16,
      color: theme.colors.textTertiary
    },
    levelGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8
    },
    levelOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface
    },
    levelOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    levelOptionText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      fontWeight: '500'
    },
    levelOptionTextSelected: {
      color: theme.colors.surface,
      fontWeight: '600'
    },
    saveButtonContainer: {
      marginTop: 24,
      marginBottom: 20,
      borderRadius: 12,
      overflow: 'hidden',
      ...CARD_SHADOW
    },
    saveButtonDisabled: {
      opacity: 0.5
    },
    saveButtonGradient: {
      padding: 18,
      alignItems: 'center',
      justifyContent: 'center'
    },
    saveButtonText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5
    },
    photoSection: {
      alignItems: 'center',
      marginBottom: 24
    },
    photoContainer: {
      position: 'relative',
      marginBottom: 12
    },
    photoAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      ...CARD_SHADOW
    },
    photoImage: {
      width: 100,
      height: 100,
      borderRadius: 50
    },
    photoAvatarText: {
      fontSize: 40,
      color: '#FFFFFF',
      fontWeight: '700'
    },
    photoButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...CARD_SHADOW
    },
    photoButtonText: {
      fontSize: 20,
      color: '#FFFFFF'
    },
    removePhotoButton: {
      padding: 8
    },
    removePhotoText: {
      fontSize: 12,
      color: theme.colors.error,
      fontWeight: '600'
    }
  });

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('gymnasts.enterName'));
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert(t('common.error'), t('gymnasts.nameMinLength'));
      return;
    }

    if (!level) {
      Alert.alert(t('common.error'), t('gymnasts.selectLevel'));
      return;
    }

    setLoading(true);
    try {
      await addGymnast({
        name: name.trim(),
        usagNumber: usagNumber.trim() || undefined,
        level: level,
        discipline: discipline,
        dateOfBirth: dateOfBirth ? { toMillis: () => dateOfBirth.getTime() } : undefined,
        photoUri: photoUri
      });

      router.back();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          t('common.permissionRequired'),
          t('common.grantPhotoAccess'),
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
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('common.failedToPickImage'));
    }
  };

  const removePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhotoUri(undefined);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={theme.colors.headerGradient}
        style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
          <Text style={[styles.cancelButton, loading && styles.disabled]}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('gymnasts.addGymnast')}</Text>
        <View style={{ width: 50 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={theme.colors.cardGradient}
          style={styles.form}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              ) : (
                <LinearGradient
                  colors={theme.colors.avatarGradient}
                  style={styles.photoAvatar}>
                  <Text style={styles.photoAvatarText}>{getInitials(name || 'Gymnast')}</Text>
                </LinearGradient>
              )}
              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickImage}
                disabled={loading}
                activeOpacity={0.7}>
                <Text style={styles.photoButtonText}>📷</Text>
              </TouchableOpacity>
            </View>
            {photoUri && (
              <TouchableOpacity
                onPress={removePhoto}
                style={styles.removePhotoButton}
                disabled={loading}>
                <Text style={styles.removePhotoText}>{t('common.removePhoto')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('gymnasts.gymnastName')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t('gymnasts.enterName')}
              placeholderTextColor={theme.colors.textTertiary}
              value={name}
              onChangeText={setName}
              editable={!loading}
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('gymnasts.dateOfBirth')}</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}>
              <Text style={dateOfBirth ? styles.dateText : styles.datePlaceholder}>
                {dateOfBirth ? formatDate(dateOfBirth) : t('gymnasts.selectDateOfBirth')}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('gymnasts.usagNumber')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('gymnasts.enterUsagNumber')}
              placeholderTextColor={theme.colors.textTertiary}
              value={usagNumber}
              onChangeText={setUsagNumber}
              editable={!loading}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('gymnasts.discipline')} <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.levelGrid}>
              <TouchableOpacity
                style={[
                  styles.levelOption,
                  discipline === 'Womens' && styles.levelOptionSelected
                ]}
                onPress={() => setDiscipline('Womens')}
                disabled={loading}>
                <Text
                  style={[
                    styles.levelOptionText,
                    discipline === 'Womens' && styles.levelOptionTextSelected
                  ]}>
                  {t('gymnasts.womens')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.levelOption,
                  discipline === 'Mens' && styles.levelOptionSelected
                ]}
                onPress={() => setDiscipline('Mens')}
                disabled={loading}>
                <Text
                  style={[
                    styles.levelOptionText,
                    discipline === 'Mens' && styles.levelOptionTextSelected
                  ]}>
                  {t('gymnasts.mens')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t('gymnasts.level')} <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.levelGrid}>
              {LEVEL_OPTIONS.map((levelOption) => (
                <TouchableOpacity
                  key={levelOption}
                  style={[
                    styles.levelOption,
                    level === levelOption && styles.levelOptionSelected
                  ]}
                  onPress={() => setLevel(levelOption)}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.levelOptionText,
                      level === levelOption && styles.levelOptionTextSelected
                    ]}>
                    {levelOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.hint}>{t('gymnasts.updateLevelLater')}</Text>
          </View>
        </LinearGradient>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButtonContainer, (!name.trim() || !level || loading) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || !level || loading}
          activeOpacity={0.8}>
          <LinearGradient
            colors={(!name.trim() || !level || loading) ? ['#CCCCCC', '#AAAAAA'] : [theme.colors.primary, theme.colors.primaryDark]}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>{t('gymnasts.saveGymnast')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}