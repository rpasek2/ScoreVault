import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { UI_PALETTE, CARD_SHADOW } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactSupportScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const SUPPORT_EMAIL = 'twotreessoftware@gmail.com';

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('contact.fillBothFields'));
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userEmail = user?.email || t('settings.noEmail');
    const emailBody = `
${t('contact.messageFrom')}
---------------------------
${t('contact.from')}: ${userEmail}
${t('contact.subject')}: ${subject}

${t('contact.message')}:
${message}

---------------------------
${t('contact.deviceInfo')}:
${t('contact.userId')}: ${user?.uid || t('contact.unknown')}
    `.trim();

    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Clear form after opening email client
        setSubject('');
        setMessage('');

        Alert.alert(
          t('contact.emailClientOpened'),
          t('contact.emailClientOpenedMessage')
        );
      } else {
        throw new Error('Cannot open email client');
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('contact.emailNotAvailable'),
        t('contact.emailNotAvailableMessage', { email: SUPPORT_EMAIL, subject, message })
      );
    }
  };

  const openFAQ = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to help screen - assuming it exists
    Alert.alert(t('contact.helpFAQ'), t('contact.checkHelpFAQ'));
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
    card: {
      padding: theme.spacing.lg,
      borderRadius: 12,
      ...CARD_SHADOW
    },
    label: {
      ...theme.typography.h6,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md
    },
    textArea: {
      minHeight: 150,
      textAlignVertical: 'top'
    },
    userInfo: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.md
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
    infoCard: {
      padding: theme.spacing.lg,
      borderRadius: 12,
      ...CARD_SHADOW
    },
    infoTitle: {
      ...theme.typography.h6,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm
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
    },
    linkButton: {
      padding: theme.spacing.base,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.primary
    },
    linkButtonText: {
      ...theme.typography.button,
      color: theme.colors.primary,
      fontWeight: '600'
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <LinearGradient
          colors={theme.colors.headerGradient}
          style={styles.header}>
          <Text style={styles.headerIcon}>📧</Text>
          <Text style={styles.title}>{t('settings.contactSupport')}</Text>
          <Text style={styles.subtitle}>
            {t('contact.subtitle')}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Contact Form */}
          <View style={styles.section}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.card}>
              <Text style={styles.label}>{t('contact.yourEmail')}</Text>
              <Text style={styles.userInfo}>{user?.email || t('contact.notAvailable')}</Text>

              <Text style={styles.label}>{t('contact.subject')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('contact.subjectPlaceholder')}
                placeholderTextColor={theme.colors.textTertiary}
                value={subject}
                onChangeText={setSubject}
                editable={!loading}
              />

              <Text style={styles.label}>{t('contact.message')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('contact.messagePlaceholder')}
                placeholderTextColor={theme.colors.textTertiary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                editable={!loading}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSendEmail}
                disabled={loading || !subject.trim() || !message.trim()}>
                <LinearGradient
                  colors={theme.colors.avatarGradient}
                  style={[
                    styles.button,
                    (loading || !subject.trim() || !message.trim()) && styles.buttonDisabled
                  ]}>
                  <Text style={styles.buttonText}>{t('contact.sendMessage')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Quick Help Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.infoCard}>
              <Text style={styles.infoTitle}>{t('contact.beforeYouContact')}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('contact.checkHelpFAQSection')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('contact.includeDetailedSteps')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{t('contact.screenshotsHelpful')}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={openFAQ}>
                <LinearGradient
                  colors={theme.colors.cardGradient}
                  style={styles.linkButton}>
                  <Text style={styles.linkButtonText}>{t('contact.viewHelpFAQ')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Direct Contact Info */}
          <View style={styles.section}>
            <LinearGradient
              colors={theme.colors.cardGradient}
              style={styles.infoCard}>
              <Text style={styles.infoTitle}>{t('contact.directContact')}</Text>
              <Text style={styles.infoText}>
                {t('contact.emailDirectly')}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.primary, fontWeight: '600', marginTop: theme.spacing.sm }]}>
                {SUPPORT_EMAIL}
              </Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
