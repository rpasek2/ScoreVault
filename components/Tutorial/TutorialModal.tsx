import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface TutorialModalProps {
  visible: boolean;
  icon?: string;
  titleKey: string;
  textKey: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  primaryLabel: string;
  secondaryLabel?: string;
}

export function TutorialModal({
  visible,
  icon,
  titleKey,
  textKey,
  onPrimary,
  onSecondary,
  primaryLabel,
  secondaryLabel
}: TutorialModalProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  const handlePrimary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPrimary();
  };

  const handleSecondary = () => {
    if (onSecondary) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSecondary();
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl
    },
    modalCard: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    modalContent: {
      padding: theme.spacing.xxxl,
      alignItems: 'center'
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      overflow: 'hidden'
    },
    icon: {
      fontSize: 60
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: theme.spacing.base
    },
    text: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: theme.spacing.xl
    },
    buttonsContainer: {
      width: '100%',
      gap: theme.spacing.base
    },
    primaryButton: {
      borderRadius: 16,
      overflow: 'hidden'
    },
    primaryButtonGradient: {
      padding: theme.spacing.md,
      alignItems: 'center'
    },
    primaryButtonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16
    },
    secondaryButton: {
      padding: theme.spacing.md,
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: 'transparent'
    },
    secondaryButtonText: {
      ...theme.typography.button,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      fontSize: 16
    }
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <LinearGradient
            colors={theme.colors.modalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}>
            {icon && (
              <LinearGradient
                colors={theme.colors.emptyIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}>
                <Text style={styles.icon}>{icon}</Text>
              </LinearGradient>
            )}

            <Text style={styles.title}>{t(titleKey)}</Text>
            <Text style={styles.text}>{t(textKey)}</Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handlePrimary}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={theme.colors.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButtonGradient}>
                  <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {secondaryLabel && onSecondary && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleSecondary}
                  activeOpacity={0.7}>
                  <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}
