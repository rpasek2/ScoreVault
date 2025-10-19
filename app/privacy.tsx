import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      flex: 1
    },
    header: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xl,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      fontWeight: '700'
    },
    lastUpdated: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontStyle: 'italic'
    },
    section: {
      padding: theme.spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      fontWeight: '600'
    },
    subsectionTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      fontWeight: '600'
    },
    paragraph: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 24,
      marginBottom: theme.spacing.md
    },
    bulletPoint: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 24,
      marginBottom: theme.spacing.sm,
      paddingLeft: theme.spacing.md
    },
    bold: {
      fontWeight: '600',
      color: theme.colors.textPrimary
    },
    footer: {
      backgroundColor: theme.colors.surfaceSecondary,
      padding: theme.spacing.xl,
      marginTop: theme.spacing.base,
      marginBottom: theme.spacing.xxxl
    },
    footerText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      textAlign: 'center',
      fontStyle: 'italic'
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            ScoreVault ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>

          <Text style={styles.subsectionTitle}>Account Information</Text>
          <Text style={styles.paragraph}>
            When you create an account, we collect:
          </Text>
          <Text style={styles.bulletPoint}>• Email address</Text>
          <Text style={styles.bulletPoint}>• Display name (optional)</Text>
          <Text style={styles.bulletPoint}>• Password (encrypted and stored securely)</Text>

          <Text style={styles.subsectionTitle}>User-Generated Content</Text>
          <Text style={styles.paragraph}>
            Information you create within the app:
          </Text>
          <Text style={styles.bulletPoint}>• Gymnast profiles (names, dates of birth, USAG numbers, levels)</Text>
          <Text style={styles.bulletPoint}>• Meet information (names, dates, locations, seasons)</Text>
          <Text style={styles.bulletPoint}>• Competition scores and placements</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide and maintain the ScoreVault service</Text>
          <Text style={styles.bulletPoint}>• Create and manage your account</Text>
          <Text style={styles.bulletPoint}>• Store your gymnastics data securely</Text>
          <Text style={styles.bulletPoint}>• Generate analytics and performance insights</Text>
          <Text style={styles.bulletPoint}>• Enable data export functionality</Text>
          <Text style={styles.bulletPoint}>• Improve and optimize the app experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            Your data is stored securely using Google Firebase, a trusted cloud platform with industry-standard security measures:
          </Text>
          <Text style={styles.bulletPoint}>• All data is encrypted in transit and at rest</Text>
          <Text style={styles.bulletPoint}>• Authentication is handled by Firebase Auth</Text>
          <Text style={styles.bulletPoint}>• Database access is restricted to authenticated users only</Text>
          <Text style={styles.bulletPoint}>• Each user can only access their own data</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or share your personal information with third parties. Your data is:
          </Text>
          <Text style={styles.bulletPoint}>• Never shared with advertisers</Text>
          <Text style={styles.bulletPoint}>• Never sold to data brokers</Text>
          <Text style={styles.bulletPoint}>• Only accessible by you through your account</Text>
          <Text style={styles.bulletPoint}>• Stored solely for providing the ScoreVault service</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights and Controls</Text>
          <Text style={styles.paragraph}>
            You have complete control over your data:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Access:</Text> View all your data within the app</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Export:</Text> Download your data as CSV or JSON files</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Edit:</Text> Modify or update any information at any time</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Delete:</Text> Remove individual entries or your entire account</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Portability:</Text> Take your data with you via export</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            ScoreVault is designed for parents and coaches to track gymnastics scores. While the app may contain information about children (gymnasts), accounts must be created and managed by adults (18+ years). We do not knowingly collect personal information directly from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your information for as long as your account is active. You can delete your data at any time:
          </Text>
          <Text style={styles.bulletPoint}>• Individual items can be deleted within the app</Text>
          <Text style={styles.bulletPoint}>• Account deletion removes all associated data</Text>
          <Text style={styles.bulletPoint}>• Deleted data cannot be recovered</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics and Cookies</Text>
          <Text style={styles.paragraph}>
            ScoreVault does not use tracking cookies or third-party analytics services. All analytics shown in the app are generated locally from your own data for your personal use.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this policy. Continued use of ScoreVault after changes constitutes acceptance of the updated policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy or how we handle your data, please contact us through:
          </Text>
          <Text style={styles.bulletPoint}>• Settings → Contact Support in the app</Text>
          <Text style={styles.bulletPoint}>• Email: twotreessoftware@gmail.com</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using ScoreVault, you agree to this Privacy Policy and our handling of your information as described above.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
