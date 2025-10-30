import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { exportAllData } from '@/utils/database';
import { formatDate } from '@/utils/seasonUtils';

export default function ExportDataScreen() {
  const { theme } = useTheme();
  const [exporting, setExporting] = useState(false);

  const convertToCSV = (headers: string[], rows: any[][]): string => {
    const csvHeaders = headers.join(',');
    const csvRows = rows.map(row =>
      row.map(cell => {
        // Escape cells that contain commas or quotes
        if (cell === null || cell === undefined) return '';
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  };

  const handleExport = async (type: 'json' | 'csv-gymnasts' | 'csv-meets' | 'csv-scores' | 'csv-team-scores') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExporting(true);

    try {
      const allData = await exportAllData();
      let filename: string;
      let data: string;
      let mimeType: string;
      let uti: string;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

      switch (type) {
        case 'json':
          filename = `scorevault-backup-${timestamp}.json`;
          data = JSON.stringify(allData, null, 2);
          mimeType = 'application/json';
          uti = 'public.json';
          break;

        case 'csv-gymnasts':
          filename = `gymnasts-${timestamp}.csv`;
          const gymnastRows = allData.gymnasts.map(g => [
            g.id,
            g.name,
            g.dateOfBirth ? formatDate(new Date(g.dateOfBirth.toMillis!())) : '',
            g.usagNumber || '',
            g.level,
            g.discipline,
            formatDate(new Date(g.createdAt.toMillis!()))
          ]);
          data = convertToCSV(
            ['ID', 'Name', 'Date of Birth', 'USAG Number', 'Level', 'Discipline', 'Created At'],
            gymnastRows
          );
          mimeType = 'text/csv';
          uti = 'public.comma-separated-values-text';
          break;

        case 'csv-meets':
          filename = `meets-${timestamp}.csv`;
          const meetRows = allData.meets.map(m => [
            m.id,
            m.name,
            formatDate(new Date(m.date.toMillis!())),
            m.season,
            m.location || '',
            formatDate(new Date(m.createdAt.toMillis!()))
          ]);
          data = convertToCSV(
            ['ID', 'Name', 'Date', 'Season', 'Location', 'Created At'],
            meetRows
          );
          mimeType = 'text/csv';
          uti = 'public.comma-separated-values-text';
          break;

        case 'csv-scores':
          filename = `scores-${timestamp}.csv`;
          const scoreRows = allData.scores.map(s => [
            s.id,
            s.gymnastId,
            s.meetId,
            s.level || '',
            s.scores.vault || '',
            s.scores.bars || '',
            s.scores.beam || '',
            s.scores.floor || '',
            s.scores.pommelHorse || '',
            s.scores.rings || '',
            s.scores.parallelBars || '',
            s.scores.highBar || '',
            s.scores.allAround,
            formatDate(new Date(s.createdAt.toMillis!()))
          ]);
          data = convertToCSV(
            ['ID', 'Gymnast ID', 'Meet ID', 'Level', 'Vault', 'Bars', 'Beam', 'Floor', 'Pommel Horse', 'Rings', 'Parallel Bars', 'High Bar', 'All-Around', 'Created At'],
            scoreRows
          );
          mimeType = 'text/csv';
          uti = 'public.comma-separated-values-text';
          break;

        case 'csv-team-scores':
          filename = `team-scores-${timestamp}.csv`;
          const teamRows: any[][] = [];

          // Group scores by level and discipline
          const levelDisciplineMap = new Map<string, any[]>();

          allData.scores.forEach(score => {
            if (!score.level) return;
            const gymnast = allData.gymnasts.find(g => g.id === score.gymnastId);
            if (!gymnast) return;

            const key = `${score.level}-${gymnast.discipline}`;
            if (!levelDisciplineMap.has(key)) {
              levelDisciplineMap.set(key, []);
            }
            levelDisciplineMap.get(key)!.push({ score, gymnast });
          });

          // Build rows for each score
          for (const [key, items] of levelDisciplineMap.entries()) {
            for (const { score, gymnast } of items) {
              const meet = allData.meets.find(m => m.id === score.meetId);
              if (!meet) continue;

              const meetDate = formatDate(new Date(meet.date.toMillis!()));

              if (gymnast.discipline === 'Womens') {
                teamRows.push([
                  score.level,
                  "Women's",
                  meet.name,
                  meetDate,
                  meet.season,
                  gymnast.name,
                  score.scores.vault || '',
                  score.scores.bars || '',
                  score.scores.beam || '',
                  score.scores.floor || '',
                  score.scores.allAround
                ]);
              } else {
                teamRows.push([
                  score.level,
                  "Men's",
                  meet.name,
                  meetDate,
                  meet.season,
                  gymnast.name,
                  score.scores.floor || '',
                  score.scores.pommelHorse || '',
                  score.scores.rings || '',
                  score.scores.vault || '',
                  score.scores.parallelBars || '',
                  score.scores.highBar || '',
                  score.scores.allAround
                ]);
              }
            }
          }

          // Check if we have mixed disciplines
          const hasMens = allData.scores.some(s => {
            const g = allData.gymnasts.find(gymnast => gymnast.id === s.gymnastId);
            return g?.discipline === 'Mens';
          });
          const hasWomens = allData.scores.some(s => {
            const g = allData.gymnasts.find(gymnast => gymnast.id === s.gymnastId);
            return g?.discipline === 'Womens';
          });

          let teamHeaders: string[];
          if (hasMens && !hasWomens) {
            teamHeaders = ['Level', 'Discipline', 'Meet', 'Date', 'Season', 'Gymnast', 'Floor', 'Pommel Horse', 'Rings', 'Vault', 'Parallel Bars', 'High Bar', 'All-Around'];
          } else if (hasWomens && !hasMens) {
            teamHeaders = ['Level', 'Discipline', 'Meet', 'Date', 'Season', 'Gymnast', 'Vault', 'Bars', 'Beam', 'Floor', 'All-Around'];
          } else {
            // Mixed - use a generic header
            teamHeaders = ['Level', 'Discipline', 'Meet', 'Date', 'Season', 'Gymnast', 'Event 1', 'Event 2', 'Event 3', 'Event 4', 'Event 5', 'Event 6', 'All-Around'];
          }

          data = convertToCSV(teamHeaders, teamRows);
          mimeType = 'text/csv';
          uti = 'public.comma-separated-values-text';
          break;
      }

      // Write to file
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, data);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: mimeType,
          dialogTitle: 'Export Data',
          UTI: uti
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Success', `File saved to ${fileUri}`);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    header: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.base,
      paddingTop: 60,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '600'
    },
    disabled: {
      opacity: 0.4
    },
    content: {
      padding: theme.spacing.base
    },
    description: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 20
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.base,
      ...theme.shadows.medium
    },
    sectionTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      fontWeight: '600'
    },
    sectionDesc: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.base,
      lineHeight: 20
    },
    exportButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      minHeight: 48
    },
    exportButtonSecondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary
    },
    exportButtonDisabled: {
      opacity: 0.5
    },
    exportButtonText: {
      ...theme.typography.button,
      color: theme.colors.surface,
      fontWeight: '600'
    },
    exportButtonTextSecondary: {
      ...theme.typography.button,
      color: theme.colors.primary,
      fontWeight: '600'
    },
    infoBox: {
      backgroundColor: theme.colors.primary + '15',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.base,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary
    },
    infoText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      lineHeight: 20
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Export Data</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Export your data to share with others or backup your information.
        </Text>

        {/* JSON Export */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complete Backup (JSON)</Text>
          <Text style={styles.sectionDesc}>
            Export all your data in JSON format. Includes gymnasts, meets, and scores with full details.
          </Text>
          <TouchableOpacity
            style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
            onPress={() => handleExport('json')}
            disabled={exporting}
            activeOpacity={0.7}>
            {exporting ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              <Text style={styles.exportButtonText}>Export JSON</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* CSV Exports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spreadsheet Format (CSV)</Text>
          <Text style={styles.sectionDesc}>
            Export data to CSV files that can be opened in Excel, Google Sheets, or other spreadsheet applications.
          </Text>

          <TouchableOpacity
            style={[styles.exportButton, styles.exportButtonSecondary, exporting && styles.exportButtonDisabled]}
            onPress={() => handleExport('csv-gymnasts')}
            disabled={exporting}
            activeOpacity={0.7}>
            <Text style={styles.exportButtonTextSecondary}>Export Gymnasts (CSV)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, styles.exportButtonSecondary, exporting && styles.exportButtonDisabled]}
            onPress={() => handleExport('csv-meets')}
            disabled={exporting}
            activeOpacity={0.7}>
            <Text style={styles.exportButtonTextSecondary}>Export Meets (CSV)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, styles.exportButtonSecondary, exporting && styles.exportButtonDisabled]}
            onPress={() => handleExport('csv-scores')}
            disabled={exporting}
            activeOpacity={0.7}>
            <Text style={styles.exportButtonTextSecondary}>Export Scores (CSV)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, styles.exportButtonSecondary, exporting && styles.exportButtonDisabled]}
            onPress={() => handleExport('csv-team-scores')}
            disabled={exporting}
            activeOpacity={0.7}>
            <Text style={styles.exportButtonTextSecondary}>Export Team Scores (CSV)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Tip: After exporting, you can share the file via email, cloud storage, or any other app on your device.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
