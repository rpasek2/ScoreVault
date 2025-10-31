import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AppearanceScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, theme } = useTheme();
  const { t } = useLanguage();

  const handleThemeModeChange = (mode: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(mode);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      flex: 1
    },
    section: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight
    },
    sectionTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs
    },
    sectionDescription: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 20
    },
    themeOptions: {
      flexDirection: 'row',
      gap: theme.spacing.md
    },
    themeOption: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
      position: 'relative',
      ...theme.shadows.small
    },
    themeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10'
    },
    themeIcon: {
      fontSize: 32,
      marginBottom: theme.spacing.sm
    },
    themeLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '500'
    },
    themeLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600'
    },
    checkmark: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center'
    },
    checkmarkText: {
      color: theme.colors.surface,
      fontSize: 12,
      fontWeight: '700'
    },
    previewCard: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.medium
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight
    },
    previewAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md
    },
    previewAvatarText: {
      ...theme.typography.h5,
      color: theme.colors.surface,
      fontWeight: '700'
    },
    previewInfo: {
      flex: 1
    },
    previewName: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: 4
    },
    previewLevel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary
    },
    previewScores: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg
    },
    previewScore: {
      alignItems: 'center'
    },
    previewScoreLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: 4,
      textTransform: 'uppercase',
      fontSize: 10
    },
    previewScoreValue: {
      ...theme.typography.h5,
      color: theme.colors.primary,
      fontWeight: '700'
    },
    previewButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center'
    },
    previewButtonText: {
      ...theme.typography.button,
      color: theme.colors.surface
    },
    infoSection: {
      backgroundColor: theme.colors.primary + '15',
      padding: theme.spacing.lg,
      margin: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.primary + '40'
    },
    infoText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      textAlign: 'center'
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: theme.spacing.xxxl }}>
        {/* Theme Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('appearance.themeMode')}</Text>
          <Text style={styles.sectionDescription}>
            {t('appearance.themeModeDescription')}
          </Text>

          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'light' && styles.themeOptionSelected
              ]}
              onPress={() => handleThemeModeChange('light')}
              activeOpacity={0.7}>
              <Text style={styles.themeIcon}>☀️</Text>
              <Text style={[
                styles.themeLabel,
                themeMode === 'light' && styles.themeLabelSelected
              ]}>
                {t('settings.lightMode')}
              </Text>
              {themeMode === 'light' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'dark' && styles.themeOptionSelected
              ]}
              onPress={() => handleThemeModeChange('dark')}
              activeOpacity={0.7}>
              <Text style={styles.themeIcon}>🌙</Text>
              <Text style={[
                styles.themeLabel,
                themeMode === 'dark' && styles.themeLabelSelected
              ]}>
                {t('settings.darkMode')}
              </Text>
              {themeMode === 'dark' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'auto' && styles.themeOptionSelected
              ]}
              onPress={() => handleThemeModeChange('auto')}
              activeOpacity={0.7}>
              <Text style={styles.themeIcon}>🔄</Text>
              <Text style={[
                styles.themeLabel,
                themeMode === 'auto' && styles.themeLabelSelected
              ]}>
                {t('appearance.auto')}
              </Text>
              {themeMode === 'auto' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>


        {/* Preview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('appearance.preview')}</Text>
          <Text style={styles.sectionDescription}>
            {t('appearance.previewDescription')}
          </Text>

          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewAvatar}>
                <Text style={styles.previewAvatarText}>GS</Text>
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{t('appearance.gymnastName')}</Text>
                <Text style={styles.previewLevel}>{t('appearance.level4')}</Text>
              </View>
            </View>

            <View style={styles.previewScores}>
              <View style={styles.previewScore}>
                <Text style={styles.previewScoreLabel}>{t('scores.vault')}</Text>
                <Text style={styles.previewScoreValue}>9.2</Text>
              </View>
              <View style={styles.previewScore}>
                <Text style={styles.previewScoreLabel}>{t('scores.bars')}</Text>
                <Text style={styles.previewScoreValue}>8.8</Text>
              </View>
              <View style={styles.previewScore}>
                <Text style={styles.previewScoreLabel}>{t('scores.beam')}</Text>
                <Text style={styles.previewScoreValue}>9.0</Text>
              </View>
              <View style={styles.previewScore}>
                <Text style={styles.previewScoreLabel}>{t('scores.floor')}</Text>
                <Text style={styles.previewScoreValue}>9.4</Text>
              </View>
            </View>

            <View style={styles.previewButton}>
              <Text style={styles.previewButtonText}>{t('appearance.sampleButton')}</Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            {t('appearance.themeChangeNote')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
