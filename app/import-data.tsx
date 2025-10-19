import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { importAllData } from '@/utils/database';

interface ImportResult {
  gymnasts: number;
  meets: number;
  scores: number;
  errors: string[];
}

export default function ImportDataScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleDownloadTemplate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDownloadingTemplate(true);

    try {
      // Template JSON structure with example data
      const template = {
        gymnasts: [
          {
            id: "example-gymnast-1",
            name: "Jane Smith",
            dateOfBirth: 1136073600000,
            usagNumber: "123456",
            level: "Level 7",
            discipline: "Womens",
            createdAt: 1704067200000
          },
          {
            id: "example-gymnast-2",
            name: "John Doe",
            dateOfBirth: null,
            usagNumber: null,
            level: "Level 8",
            discipline: "Mens",
            createdAt: 1704067200000
          }
        ],
        meets: [
          {
            id: "example-meet-1",
            name: "State Championship 2024",
            date: 1704585600000,
            season: "2023-2024",
            location: "Springfield Gym",
            createdAt: 1704067200000
          },
          {
            id: "example-meet-2",
            name: "Regional Qualifier",
            date: 1705190400000,
            season: "2023-2024",
            location: null,
            createdAt: 1704153600000
          }
        ],
        scores: [
          {
            id: "example-score-1",
            meetId: "example-meet-1",
            gymnastId: "example-gymnast-1",
            level: "Level 7",
            scores: {
              vault: 9.2,
              bars: 8.8,
              beam: 9.1,
              floor: 9.5,
              pommelHorse: null,
              rings: null,
              parallelBars: null,
              highBar: null,
              allAround: 36.6
            },
            placements: {
              vault: 2,
              bars: 5,
              beam: 3,
              floor: 1,
              pommelHorse: null,
              rings: null,
              parallelBars: null,
              highBar: null,
              allAround: 2
            },
            createdAt: 1704585600000
          },
          {
            id: "example-score-2",
            meetId: "example-meet-1",
            gymnastId: "example-gymnast-2",
            level: "Level 8",
            scores: {
              vault: 8.9,
              bars: null,
              beam: null,
              floor: 9.1,
              pommelHorse: 8.5,
              rings: 9.0,
              parallelBars: 8.7,
              highBar: 8.8,
              allAround: 53.0
            },
            placements: {
              vault: 3,
              bars: null,
              beam: null,
              floor: 2,
              pommelHorse: 4,
              rings: 1,
              parallelBars: 5,
              highBar: 3,
              allAround: 3
            },
            createdAt: 1704585600000
          }
        ]
      };

      const filename = 'scorevault-import-template.json';
      const data = JSON.stringify(template, null, 2);

      // Write to file
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, data);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Download Import Template',
          UTI: 'public.json'
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Success', `Template saved to ${fileUri}`);
      }
    } catch (error: any) {
      console.error('Download template error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to download template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleImport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json'],
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return;
      }

      setLoading(true);
      setResult(null);

      const file = result.assets[0];
      const response = await fetch(file.uri);
      const text = await response.text();

      // Confirm with user before importing
      Alert.alert(
        'Confirm Import',
        'This will import all data from the backup file. This may take a moment. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setLoading(false)
          },
          {
            text: 'Import',
            onPress: async () => {
              try {
                const data = JSON.parse(text);

                // Validate data structure
                if (!data.gymnasts || !data.meets || !data.scores) {
                  throw new Error('Invalid backup file format. Expected gymnasts, meets, and scores arrays.');
                }

                // Import all data using the database function
                await importAllData({
                  gymnasts: data.gymnasts,
                  meets: data.meets,
                  scores: data.scores
                });

                const importResult: ImportResult = {
                  gymnasts: data.gymnasts.length,
                  meets: data.meets.length,
                  scores: data.scores.length,
                  errors: []
                };

                setResult(importResult);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                Alert.alert(
                  'Import Complete',
                  `Successfully imported:\n• ${importResult.gymnasts} gymnasts\n• ${importResult.meets} meets\n• ${importResult.scores} scores`,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              } catch (error: any) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Import Failed', error.message || 'Failed to import data');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Import Failed', error.message || 'Failed to import data');
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      padding: theme.spacing.base,
      paddingTop: 60
    },
    header: {
      marginBottom: theme.spacing.xl
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      fontWeight: '600'
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 22
    },
    infoSection: {
      marginBottom: theme.spacing.xl
    },
    infoTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      fontWeight: '600'
    },
    formatCard: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.small
    },
    formatTitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs
    },
    formatDescription: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginBottom: theme.spacing.md
    },
    templateButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
      ...theme.shadows.small
    },
    templateButtonDisabled: {
      opacity: 0.5
    },
    templateButtonIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm
    },
    templateButtonText: {
      ...theme.typography.button,
      color: theme.colors.primary,
      fontSize: 14
    },
    warningSection: {
      backgroundColor: theme.colors.warning + '15',
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.warning + '40',
      marginBottom: theme.spacing.xl
    },
    warningTitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.md
    },
    warningText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.xs
    },
    resultSection: {
      marginBottom: theme.spacing.xl
    },
    resultTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      fontWeight: '600'
    },
    resultCard: {
      backgroundColor: theme.colors.success + '15',
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.success + '40'
    },
    resultText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs
    },
    importButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.medium
    },
    importButtonDisabled: {
      opacity: 0.6
    },
    importButtonIcon: {
      fontSize: 24,
      marginRight: theme.spacing.md
    },
    importButtonText: {
      ...theme.typography.button,
      color: theme.colors.surface
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Import Data</Text>
          <Text style={styles.subtitle}>
            Restore your gymnastics data from a JSON backup file
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📋 Supported Format</Text>

          <View style={styles.formatCard}>
            <Text style={styles.formatTitle}>JSON Backup Files Only</Text>
            <Text style={styles.formatDescription}>
              Only JSON files exported from ScoreVault can be imported. CSV files cannot be imported - they are for viewing in spreadsheet apps only.
            </Text>
          </View>

          <Text style={styles.formatDescription}>
            Need to create a custom import file? Download the template below to see the exact structure required.
          </Text>

          <TouchableOpacity
            style={[styles.templateButton, downloadingTemplate && styles.templateButtonDisabled]}
            onPress={handleDownloadTemplate}
            disabled={downloadingTemplate || loading}
            activeOpacity={0.7}>
            {downloadingTemplate ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <>
                <Text style={styles.templateButtonIcon}>📄</Text>
                <Text style={styles.templateButtonText}>Download Import Template</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>⚠️ Important Notes</Text>
          <Text style={styles.warningText}>
            • This will replace all existing data with the imported data
          </Text>
          <Text style={styles.warningText}>
            • Make sure to export your current data first if needed
          </Text>
          <Text style={styles.warningText}>
            • Cloud backup will not be replaced until you backup again
          </Text>
          <Text style={styles.warningText}>
            • Only import JSON files exported from ScoreVault
          </Text>
          <Text style={styles.warningText}>
            • The import process may take a moment to complete
          </Text>
        </View>

        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Import Summary</Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultText}>✓ {result.gymnasts} Gymnasts imported</Text>
              <Text style={styles.resultText}>✓ {result.meets} Meets imported</Text>
              <Text style={styles.resultText}>✓ {result.scores} Scores imported</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.importButton, loading && styles.importButtonDisabled]}
          onPress={handleImport}
          disabled={loading}
          activeOpacity={0.7}>
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <>
              <Text style={styles.importButtonIcon}>📁</Text>
              <Text style={styles.importButtonText}>Select File to Import</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
