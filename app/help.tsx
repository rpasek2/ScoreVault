import { useTheme } from '@/contexts/ThemeContext';
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
    answer: 'Go to the Meets tab and tap the + button. Enter the meet name, date, and optionally the location. Meets are automatically organized by date.'
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
    question: 'How do I view team scores?',
    answer: 'Go to the Teams tab to see team scoring by level and discipline. Tap any level to view team scores for all meets. The app automatically calculates team totals using the top 3 scores per event (or top 5 for Women\'s Levels 1-5). You can expand each meet to see detailed score breakdowns and which scores are counting toward the team total.'
  },
  {
    question: 'What are team analytics?',
    answer: 'Team analytics show:\n\n• Performance trend charts over time\n• Average team scores per event (only counting meets with full teams)\n• Best team scores achieved\n• Event-by-event breakdowns\n\nThese help coaches track team performance and identify areas for improvement.'
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
  const { theme } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
          <Text style={styles.introTitle}>Welcome to ScoreVault! 📊</Text>
          <Text style={styles.introText}>
            ScoreVault helps you track individual gymnast scores, view performance analytics, and monitor team progress over time.
            Whether tracking one athlete or managing a whole team, tap any question below to learn more.
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
