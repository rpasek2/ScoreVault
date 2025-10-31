import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface FAQItem {
  question: string;
  answer: string;
}


export default function HelpScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Get FAQ data from translations
  const FAQ_DATA: FAQItem[] = [
    { question: t('help.q1'), answer: t('help.a1') },
    { question: t('help.q2'), answer: t('help.a2') },
    { question: t('help.q3'), answer: t('help.a3') },
    { question: t('help.q4'), answer: t('help.a4') },
    { question: t('help.q5'), answer: t('help.a5') },
    { question: t('help.q6'), answer: t('help.a6') },
    { question: t('help.q7'), answer: t('help.a7') },
    { question: t('help.q8'), answer: t('help.a8') },
    { question: t('help.q9'), answer: t('help.a9') },
    { question: t('help.q10'), answer: t('help.a10') },
    { question: t('help.q11'), answer: t('help.a11') },
    { question: t('help.q12'), answer: t('help.a12') },
    { question: t('help.q13'), answer: t('help.a13') },
    { question: t('help.q14'), answer: t('help.a14') },
    { question: t('help.q15'), answer: t('help.a15') },
    { question: t('help.q16'), answer: t('help.a16') },
    { question: t('help.q17'), answer: t('help.a17') },
    { question: t('help.q18'), answer: t('help.a18') },
    { question: t('help.q19'), answer: t('help.a19') },
    { question: t('help.q20'), answer: t('help.a20') },
    { question: t('help.q21'), answer: t('help.a21') }
  ];

  const handleQuestionPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      flex: 1
    },
    introSection: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    introTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      fontWeight: '600'
    },
    introText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 22
    },
    faqSection: {
      padding: theme.spacing.base
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      fontWeight: '600'
    },
    faqItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
      ...theme.shadows.medium
    },
    questionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      paddingRight: theme.spacing.base
    },
    question: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      flex: 1,
      paddingRight: theme.spacing.md
    },
    expandIcon: {
      ...theme.typography.h3,
      color: theme.colors.primary,
      fontWeight: '300',
      width: 24,
      textAlign: 'center'
    },
    answerContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      paddingTop: 0,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight
    },
    answer: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginTop: theme.spacing.md
    },
    contactSection: {
      backgroundColor: theme.colors.surfaceSecondary,
      padding: theme.spacing.xl,
      margin: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.xxxl
    },
    contactTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      fontWeight: '600'
    },
    contactText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>{t('help.welcome')}</Text>
          <Text style={styles.introText}>
            {t('help.intro')}
          </Text>
        </View>

        {/* FAQ Items */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>{t('help.faqTitle')}</Text>

          {FAQ_DATA.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.questionContainer}
                onPress={() => handleQuestionPress(index)}
                activeOpacity={0.7}>
                <Text style={styles.question}>{item.question}</Text>
                <Text style={styles.expandIcon}>
                  {expandedIndex === index ? '−' : '+'}
                </Text>
              </TouchableOpacity>

              {expandedIndex === index && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answer}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>{t('help.needHelp')}</Text>
          <Text style={styles.contactText}>
            {t('help.contactSupport')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
