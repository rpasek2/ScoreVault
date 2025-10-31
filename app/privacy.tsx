import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();

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
          <Text style={styles.title}>{t('privacy.title')}</Text>
          <Text style={styles.lastUpdated}>{t('privacy.lastUpdated')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.introduction')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.introductionText')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.informationWeCollect')}</Text>

          <Text style={styles.subsectionTitle}>{t('privacy.accountInformation')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.accountInformationText')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.emailAddress')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.displayNameOptional')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.passwordEncrypted')}</Text>

          <Text style={styles.subsectionTitle}>{t('privacy.userGeneratedContent')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.userGeneratedContentText')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.gymnastProfiles')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.meetInformation')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.competitionScores')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.howWeUse')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.howWeUseText')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.provideService')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.manageAccount')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.storeDataSecurely')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.generateAnalytics')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.enableExport')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.improveApp')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.dataStorage')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.dataStorageText')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.dataEncrypted')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.authFirebase')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.databaseRestricted')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.userOnlyAccess')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.dataSharing')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.dataSharingText')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.neverAdvertisers')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.neverSold')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.onlyYouAccess')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.storedForService')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.yourRights')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.yourRightsText')}
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>{t('privacy.access')}:</Text> {t('privacy.accessText')}</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>{t('privacy.export')}:</Text> {t('privacy.exportText')}</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>{t('common.edit')}:</Text> {t('privacy.editText')}</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>{t('common.delete')}:</Text> {t('privacy.deleteText')}</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>{t('privacy.portability')}:</Text> {t('privacy.portabilityText')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.childrensPrivacy')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.childrensPrivacyText')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.dataRetention')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.dataRetentionText')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.individualDelete')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.accountDeletion')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.deletedNoRecovery')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.analyticsCookies')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.analyticsCookiesText')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.changes')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.changesText')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('privacy.contactUs')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.contactUsText')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.contactApp')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.contactEmail')}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('privacy.footer')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
