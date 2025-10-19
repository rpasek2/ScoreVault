import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppTheme } from '@/constants/theme';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'How do I add a gymnast?',
    answer: 'Go to the Gymnasts tab and tap the + button. Enter their name, date of birth (optional), USAG number (optional), level, and select their discipline (Women\'s or Men\'s). All data is saved locally on your device.'
  },
  {
    question: 'Does this app support Men\'s Gymnastics?',
    answer: 'Yes! When adding a gymnast, you can select either Women\'s or Men\'s discipline. Men\'s gymnastics includes Floor, Pommel Horse, Rings, Vault, Parallel Bars, and High Bar. Women\'s includes Vault, Bars, Beam, and Floor.'
  },
  {
    question: 'How do I add a meet?',
    answer: 'Go to the Meets tab and tap the + button. Enter the meet name, date, and optionally the location and season. Meets are automatically organized by date.'
  },
  {
    question: 'How do I add scores?',
    answer: 'Open a meet from the Meets tab, then tap the + button. Select the gymnast, enter their scores for each event (specific to their discipline), and optionally their placements. The All-Around score is calculated automatically.'
  },
  {
    question: 'How do I edit or delete scores?',
    answer: 'In a meet, tap the pencil icon on any score card to edit it, or tap the trash icon to delete it. You\'ll be asked to confirm before deleting.'
  },
  {
    question: 'How do I delete a gymnast or meet?',
    answer: 'Open the gymnast profile or meet details page and tap the trash icon in the top right corner. Note: Deleting a gymnast will also delete all their scores. Deleting a meet will delete all scores from that meet.'
  },
  {
    question: 'Where is my data stored?',
    answer: 'All your data (gymnasts, meets, scores) is stored locally on your device using SQLite. This means the app works completely offline and your data never leaves your device unless you create a cloud backup.'
  },
  {
    question: 'How do I backup my data?',
    answer: 'Go to Settings → Cloud Backup and tap "Backup Now". Your data will be securely backed up to the cloud and associated with your account. This is useful when getting a new device or if you need to restore data.'
  },
  {
    question: 'How do I restore from a backup?',
    answer: 'Go to Settings → Cloud Backup and tap "Restore from Backup". This will download your latest cloud backup and restore all your gymnasts, meets, and scores. Warning: This will replace your current local data.'
  },
  {
    question: 'How do I export my data?',
    answer: 'Go to Settings → Export Data. Choose CSV or JSON format. CSV is best for viewing in spreadsheet apps like Excel or Google Sheets. JSON is best for backing up your complete data and can be re-imported into ScoreVault. Note: Only JSON files can be imported - CSV exports are view-only.'
  },
  {
    question: 'What are the analytics showing?',
    answer: 'The analytics show:\n\n• Personal Records for each event\n• Average scores across all competitions\n• Score trend line charts (when you have 2+ meets)\n• Event-specific performance tracking\n\nThese help you see progress over time and identify strong/weak events.'
  },
  {
    question: 'Can I track multiple gymnasts?',
    answer: 'Yes! You can add as many gymnasts as you need. Each gymnast has their own profile with individual analytics and score tracking. This is perfect for parents with multiple children or coaches tracking a team.'
  },
  {
    question: 'What is a USAG number?',
    answer: 'A USAG number is a unique identifier assigned by USA Gymnastics to registered athletes. It\'s optional to enter, but helpful for record-keeping if your gymnast competes in USAG-sanctioned events.'
  },
  {
    question: 'I forgot my password. How do I reset it?',
    answer: 'On the sign-in screen, enter your email and tap "Forgot?" next to the password field. You\'ll receive an email with a link to reset your password.'
  },
  {
    question: 'How do I change my password?',
    answer: 'Go to Settings → Privacy & Security → Change Password. You\'ll need to enter your current password, then your new password twice to confirm.'
  },
  {
    question: 'How do I delete my account?',
    answer: 'Go to Settings → Privacy & Security, scroll to the "Danger Zone" section, and tap "Delete My Account". You\'ll be asked to confirm twice. This permanently deletes your account and cannot be undone.'
  },
  {
    question: 'How do I contact support?',
    answer: 'Go to Settings → Contact Support. Fill out the form with your question or issue, and tap "Send Message". This will open your email client with a pre-filled message to twotreessoftware@gmail.com.'
  }
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleQuestionPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Welcome to ScoreVault! 📊</Text>
          <Text style={styles.introText}>
            ScoreVault helps you track gymnastics scores, view performance analytics, and monitor progress over time.
            Tap any question below to learn more.
          </Text>
        </View>

        {/* FAQ Items */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

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
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            If you have questions not covered here, please reach out through Settings → Contact Support.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background
  },
  content: {
    flex: 1
  },
  introSection: {
    backgroundColor: AppTheme.colors.surface,
    padding: AppTheme.spacing.xl,
    marginBottom: AppTheme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border
  },
  introTitle: {
    ...AppTheme.typography.h3,
    color: AppTheme.colors.textPrimary,
    marginBottom: AppTheme.spacing.md,
    fontWeight: '600'
  },
  introText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textSecondary,
    lineHeight: 22
  },
  faqSection: {
    padding: AppTheme.spacing.base
  },
  sectionTitle: {
    ...AppTheme.typography.h4,
    color: AppTheme.colors.textPrimary,
    marginBottom: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.sm,
    fontWeight: '600'
  },
  faqItem: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.borderRadius.lg,
    marginBottom: AppTheme.spacing.md,
    overflow: 'hidden',
    ...AppTheme.shadows.medium
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: AppTheme.spacing.lg,
    paddingRight: AppTheme.spacing.base
  },
  question: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    paddingRight: AppTheme.spacing.md
  },
  expandIcon: {
    ...AppTheme.typography.h3,
    color: AppTheme.colors.primary,
    fontWeight: '300',
    width: 24,
    textAlign: 'center'
  },
  answerContainer: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingBottom: AppTheme.spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.borderLight
  },
  answer: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textSecondary,
    lineHeight: 22,
    marginTop: AppTheme.spacing.md
  },
  contactSection: {
    backgroundColor: AppTheme.colors.surfaceSecondary,
    padding: AppTheme.spacing.xl,
    margin: AppTheme.spacing.base,
    borderRadius: AppTheme.borderRadius.lg,
    marginBottom: AppTheme.spacing.xxxl
  },
  contactTitle: {
    ...AppTheme.typography.h5,
    color: AppTheme.colors.textPrimary,
    marginBottom: AppTheme.spacing.sm,
    fontWeight: '600'
  },
  contactText: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.textSecondary,
    lineHeight: 20
  }
});
