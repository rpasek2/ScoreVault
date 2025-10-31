import { CARD_SHADOW, EVENT_LABELS, EventKey, getAAScoreColor, getInitials, getOrdinal, getPlacementColor, getScoreColor, MENS_EVENTS, SOFT_SHADOW, WOMENS_EVENTS, getCardBorder } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Gymnast, Meet, Score, Timestamp } from '@/types';
import { formatDate, formatScore } from '@/utils/seasonUtils';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation, useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { getGymnastById, getMeets, getScoresByGymnast, deleteGymnast, updateGymnast, hideGymnast } from '@/utils/database';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const LEVEL_OPTIONS = [
  'Level 1',
  'Level 2',
  'Level 3',
  'Level 4',
  'Level 5',
  'Level 6',
  'Level 7',
  'Level 8',
  'Level 9',
  'Level 10',
  'Xcel Bronze',
  'Xcel Silver',
  'Xcel Gold',
  'Xcel Platinum',
  'Xcel Diamond',
  'Xcel Sapphire',
  'Elite'
];

interface ScoreWithMeet extends Score {
  meetName: string;
  meetDate: Timestamp;
}

export default function GymnastProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [gymnast, setGymnast] = useState<Gymnast | null>(null);
  const [scores, setScores] = useState<ScoreWithMeet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventKey | 'allAround'>('allAround');
  const [levelFilter, setLevelFilter] = useState<'CURRENT' | 'ALL' | string>('CURRENT');
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const navigation = useNavigation();

  const fetchGymnastData = useCallback(async () => {
    if (!id) return;

    try {
      // Fetch gymnast details from local database
      const gymnastData = await getGymnastById(id);
      if (gymnastData) {
        setGymnast(gymnastData);
        navigation.setOptions({ title: gymnastData.name });

        // Fetch all meets to map IDs to names
        const allMeets = await getMeets();
        const meetsMap: { [key: string]: Meet } = {};
        allMeets.forEach((meet) => {
          meetsMap[meet.id] = meet;
        });

        // Fetch all scores for this gymnast
        const scoresData = await getScoresByGymnast(id);
        const scoresList: ScoreWithMeet[] = scoresData.map((score) => {
          const meet = meetsMap[score.meetId];
          return {
            ...score,
            meetName: meet?.name || t('meets.unknownMeet'),
            meetDate: meet?.date || { toMillis: () => 0, toDate: () => new Date() } as Timestamp
          };
        }).filter(score => score.meetName !== t('meets.unknownMeet'));

        // Sort by date (most recent first)
        scoresList.sort((a, b) => {
          const dateA = a.meetDate.toMillis?.() || 0;
          const dateB = b.meetDate.toMillis?.() || 0;
          return dateB - dateA;
        });

        setScores(scoresList);
      } else {
        Alert.alert(t('common.error'), t('gymnasts.gymnastNotFound'));
        router.back();
      }
    } catch (error) {
      console.error('Error fetching gymnast:', error);
      Alert.alert(t('common.error'), t('gymnasts.failedToLoadProfile'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchGymnastData();
    }, [fetchGymnastData])
  );

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  header: {
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: theme.spacing.lg,
    marginHorizontal: theme.spacing.base,
    ...CARD_SHADOW,
    ...getCardBorder(isDark)
  },
  deleteButtonGymnast: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    ...SOFT_SHADOW,
    zIndex: 10
  },
  deleteButtonTextGymnast: {
    fontSize: 20,
    color: theme.colors.error
  },
  hideButtonGymnast: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg + 52,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    ...SOFT_SHADOW,
    zIndex: 10
  },
  hideButtonTextGymnast: {
    fontSize: 20,
    color: theme.colors.warning
  },
  editButtonGymnast: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    ...SOFT_SHADOW,
    zIndex: 10
  },
  editButtonTextGymnast: {
    fontSize: 20,
    color: theme.colors.primary
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...SOFT_SHADOW
  },
  avatarLargeImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: theme.spacing.md
  },
  avatarLargeText: {
    ...theme.typography.h1,
    color: theme.colors.surface,
    fontWeight: '700'
  },
  gymnastName: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs
  },
  levelBadge: {
    backgroundColor: 'rgba(107, 110, 255, 0.12)',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg
  },
  levelText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    fontWeight: '600'
  },
  levelTip: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    opacity: 0.7,
    fontStyle: 'italic'
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg
  },
  statCard: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 24,
    alignItems: 'center',
    overflow: 'hidden',
    ...SOFT_SHADOW
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center'
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    textAlign: 'center'
  },
  analyticsSection: {
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.base,
    padding: theme.spacing.lg,
    borderRadius: 28,
    ...CARD_SHADOW,
    ...getCardBorder(isDark)
  },
  chartContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center'
  },
  chartLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs
  },
  eventAverages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm
  },
  eventAveragesWomens: {
    gap: theme.spacing.xs
  },
  eventAvg: {
    minWidth: '30%',
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  eventAvgWomens: {
    minWidth: '24%',
    maxWidth: '24%',
    flex: 0
  },
  eventAvgSelected: {
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 2,
    borderColor: theme.colors.primary
  },
  eventAvgLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontSize: 10,
    textTransform: 'uppercase',
    height: 24,
    textAlign: 'center'
  },
  eventAvgValue: {
    ...theme.typography.h5,
    color: theme.colors.textPrimary,
    fontWeight: '700'
  },
  eventAvgValueSelected: {
    color: theme.colors.primary
  },
  personalRecords: {
    marginTop: theme.spacing.base
  },
  prTitle: {
    ...theme.typography.h5,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
    textAlign: 'center'
  },
  prGrid: {
    gap: theme.spacing.sm
  },
  prItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary
  },
  prItemFull: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 0
  },
  prEvent: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600'
  },
  prScore: {
    ...theme.typography.h5,
    color: theme.colors.textPrimary,
    fontWeight: '700'
  },
  prScoreLarge: {
    ...theme.typography.h3,
    color: theme.colors.primary
  },
  scoresSection: {
    paddingHorizontal: theme.spacing.base,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md
  },
  emptyScores: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...SOFT_SHADOW
  },
  emptyIcon: {
    fontSize: 40,
    color: theme.colors.primary
  },
  emptyText: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center'
  },
  scoreCardWrapper: {
    marginBottom: theme.spacing.md,
    borderRadius: 28,
    backgroundColor: 'transparent',
    ...CARD_SHADOW,
    ...getCardBorder(isDark)
  },
  scoreCardTouchable: {
    borderRadius: 28,
    overflow: 'hidden'
  },
  scoreCard: {
    padding: theme.spacing.lg,
    borderRadius: 28
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.base,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 35, 64, 0.08)'
  },
  meetInfo: {
    flex: 1
  },
  shareButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...CARD_SHADOW
  },
  shareButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.base,
    gap: 6
  },
  shareButtonIcon: {
    fontSize: 16
  },
  shareButtonLabel: {
    ...theme.typography.button,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12
  },
  meetName: {
    ...theme.typography.h5,
    color: theme.colors.textPrimary,
    marginBottom: 4
  },
  meetDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary
  },
  meetMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  scoreLevelBadge: {
    backgroundColor: 'rgba(107, 110, 255, 0.12)',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md
  },
  scoreLevelText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '600'
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.base
  },
  scoresGridWomens: {
    gap: theme.spacing.sm
  },
  eventScore: {
    minWidth: '30%',
    maxWidth: '31%',
    flex: 1,
    alignItems: 'center'
  },
  eventScoreWomens: {
    minWidth: '23%',
    maxWidth: '23%',
    flex: 0
  },
  eventLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
    height: 24,
    textAlign: 'center',
    fontSize: 10
  },
  eventValue: {
    ...theme.typography.h5,
    fontWeight: '700',
    marginBottom: 4,
    color: theme.colors.textPrimary
  },
  placementBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
    ...SOFT_SHADOW
  },
  placementText: {
    ...theme.typography.caption,
    color: theme.colors.surface,
    fontSize: 10,
    fontWeight: '700'
  },
  placementTextDark: {
    color: theme.colors.textPrimary
  },
  allAroundContainer: {
    borderRadius: 24,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  allAroundContent: {
    flex: 1
  },
  allAroundLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: 4,
    color: theme.colors.textSecondary
  },
  allAroundValue: {
    ...theme.typography.h3,
    fontWeight: '700',
    color: theme.colors.textPrimary
  },
  placementBadgeLarge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    ...SOFT_SHADOW
  },
  placementTextLarge: {
    ...theme.typography.h5,
    color: theme.colors.surface,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  modalContent: {
    borderRadius: 32,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...CARD_SHADOW,
    ...getCardBorder(isDark)
  },
  modalTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm
  },
  modalSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
    textAlign: 'center'
  },
  modalLevelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl
  },
  modalLevelOption: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: 'rgba(107, 110, 255, 0.08)'
  },
  modalLevelOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    borderWidth: 0
  },
  modalLevelOptionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    fontWeight: '500'
  },
  modalLevelOptionTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md
  },
  modalCancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceSecondary,
    alignItems: 'center'
  },
  modalCancelText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600'
  },
  modalSaveButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center'
  },
  modalSaveText: {
    ...theme.typography.body,
    color: theme.colors.surface,
    fontWeight: '600'
  },
  levelFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    alignItems: 'center'
  },
  levelFilterButton: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 110, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  levelFilterButtonActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary
  },
  levelFilterButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600'
  },
  levelFilterButtonTextActive: {
    color: theme.colors.primary
  }
});

  if (loading || !gymnast) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const handleScorePress = (meetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/meet/${meetId}`);
  };

  const handleShareScore = (scoreId: string, e: any) => {
    // Stop propagation to prevent navigating to meet
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/score-card-creator',
      params: { scoreId }
    });
  };

  const handleHideGymnast = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('gymnasts.hideGymnast'),
      t('gymnasts.hideGymnastConfirm', { name: gymnast?.name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: t('gymnasts.hide'),
          style: 'default',
          onPress: async () => {
            try {
              await hideGymnast(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(t('common.error'), error.message || t('gymnasts.failedToHide'));
            }
          }
        }
      ]
    );
  };

  const handleDeleteGymnast = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('gymnasts.deleteGymnast'),
      t('gymnasts.deleteGymnastConfirm', { name: gymnast?.name, count: scores.length }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

              // Delete the gymnast (scores will be cascade deleted by database)
              await deleteGymnast(id);

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(t('common.error'), error.message || t('gymnasts.failedToDelete'));
            }
          }
        }
      ]
    );
  };

  const handleLevelPress = () => {
    if (gymnast) {
      setSelectedLevel(gymnast.level);
      setShowLevelModal(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSaveLevel = async () => {
    if (!id || !selectedLevel) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateGymnast(id, {
        level: selectedLevel
      });

      if (gymnast) {
        setGymnast({ ...gymnast, level: selectedLevel });
      }

      setShowLevelModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), error.message || t('gymnasts.failedToUpdateLevel'));
    }
  };

  // Get unique levels from scores (excluding current level to avoid duplication)
  const uniqueLevels = Array.from(new Set(scores.map(s => s.level)))
    .filter(level => level !== gymnast.level)
    .sort((a, b) => {
      // Sort levels numerically if they're "Level X" format
      const aMatch = a.match(/Level (\d+)/);
      const bMatch = b.match(/Level (\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return a.localeCompare(b);
    });

  // Filter scores by level
  const filteredScores =
    levelFilter === 'ALL'
      ? scores
      : levelFilter === 'CURRENT'
      ? scores.filter(s => s.level === gymnast.level)
      : scores.filter(s => s.level === levelFilter);

  // Calculate stats from filtered scores
  const totalScores = filteredScores.length;
  const avgAllAround = totalScores > 0
    ? filteredScores.reduce((sum, s) => sum + s.scores.allAround, 0) / totalScores
    : 0;
  const bestScore = totalScores > 0
    ? Math.max(...filteredScores.map(s => s.scores.allAround))
    : 0;

  // Get current events based on discipline
  const currentEvents = gymnast.discipline === 'Mens' ? MENS_EVENTS : WOMENS_EVENTS;

  // Calculate event averages from filtered scores (dynamic based on discipline)
  const eventAverages: any = {};
  currentEvents.forEach(event => {
    eventAverages[event] = totalScores > 0
      ? filteredScores.reduce((sum, s) => sum + (s.scores[event] || 0), 0) / totalScores
      : 0;
  });

  // Calculate personal records from filtered scores (dynamic based on discipline)
  const personalRecords: any = { allAround: bestScore };
  currentEvents.forEach(event => {
    personalRecords[event] = totalScores > 0
      ? Math.max(...filteredScores.map(s => s.scores[event] || 0))
      : 0;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      {/* Header with Avatar */}
      <LinearGradient
        colors={theme.colors.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <TouchableOpacity
          style={styles.hideButtonGymnast}
          onPress={handleHideGymnast}
          activeOpacity={0.7}>
          <Text style={styles.hideButtonTextGymnast}>👁️‍🗨️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButtonGymnast}
          onPress={handleDeleteGymnast}
          activeOpacity={0.7}>
          <Text style={styles.deleteButtonTextGymnast}>🗑️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButtonGymnast}
          onPress={() => router.push({ pathname: '/edit-gymnast', params: { gymnastId: id } })}
          activeOpacity={0.7}>
          <Text style={styles.editButtonTextGymnast}>✏️</Text>
        </TouchableOpacity>

        {gymnast.photoUri ? (
          <Image source={{ uri: gymnast.photoUri }} style={styles.avatarLargeImage} />
        ) : (
          <LinearGradient
            colors={theme.colors.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{getInitials(gymnast.name)}</Text>
          </LinearGradient>
        )}
        <Text style={styles.gymnastName}>{gymnast.name}</Text>
        {gymnast.level && (
          <>
            <TouchableOpacity
              style={styles.levelBadge}
              onPress={handleLevelPress}
              activeOpacity={0.7}>
              <Text style={styles.levelText}>{gymnast.level}</Text>
            </TouchableOpacity>
            <Text style={styles.levelTip}>{t('gymnasts.tapLevelToChange')}</Text>
          </>
        )}
      </LinearGradient>

      {/* Level Change Modal */}
      <Modal
        visible={showLevelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLevelModal(false)}>
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={theme.colors.modalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('gymnasts.changeLevel')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('gymnasts.changeLevelNote')}
            </Text>

            <View style={styles.modalLevelGrid}>
              {LEVEL_OPTIONS.map((levelOption) => (
                <TouchableOpacity
                  key={levelOption}
                  style={[
                    styles.modalLevelOption,
                    selectedLevel === levelOption && styles.modalLevelOptionSelected
                  ]}
                  onPress={() => setSelectedLevel(levelOption)}>
                  <Text
                    style={[
                      styles.modalLevelOptionText,
                      selectedLevel === levelOption && styles.modalLevelOptionTextSelected
                    ]}>
                    {levelOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLevelModal(false)}
                activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveLevel}
                activeOpacity={0.7}>
                <Text style={styles.modalSaveText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={theme.colors.statGradients[0]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
            {totalScores}
          </Text>
          <Text style={styles.statLabel}>{t('gymnasts.meets')}</Text>
        </LinearGradient>
        <LinearGradient
          colors={theme.colors.statGradients[1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}>
          <Text
            style={[styles.statValue, { color: getAAScoreColor(avgAllAround, theme) }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}>
            {avgAllAround > 0 ? formatScore(avgAllAround) : '-'}
          </Text>
          <Text style={styles.statLabel}>{t('gymnasts.averageAA')}</Text>
        </LinearGradient>
        <LinearGradient
          colors={theme.colors.statGradients[2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}>
          <Text
            style={[styles.statValue, { color: getAAScoreColor(bestScore, theme) }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}>
            {bestScore > 0 ? formatScore(bestScore) : '-'}
          </Text>
          <Text style={styles.statLabel}>{t('gymnasts.bestScore')}</Text>
        </LinearGradient>
      </View>

      {/* Level Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.levelFilterContainer}>
        <Text style={styles.levelFilterButtonText}>{t('gymnasts.show')}:</Text>
        <TouchableOpacity
          style={[styles.levelFilterButton, levelFilter === 'CURRENT' && styles.levelFilterButtonActive]}
          onPress={() => {
            setLevelFilter('CURRENT');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          activeOpacity={0.7}>
          <Text style={[styles.levelFilterButtonText, levelFilter === 'CURRENT' && styles.levelFilterButtonTextActive]}>
            {gymnast.level || t('gymnasts.currentLevel')}
          </Text>
        </TouchableOpacity>
        {uniqueLevels.map(level => (
          <TouchableOpacity
            key={level}
            style={[styles.levelFilterButton, levelFilter === level && styles.levelFilterButtonActive]}
            onPress={() => {
              setLevelFilter(level);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}>
            <Text style={[styles.levelFilterButtonText, levelFilter === level && styles.levelFilterButtonTextActive]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.levelFilterButton, levelFilter === 'ALL' && styles.levelFilterButtonActive]}
          onPress={() => {
            setLevelFilter('ALL');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          activeOpacity={0.7}>
          <Text style={[styles.levelFilterButtonText, levelFilter === 'ALL' && styles.levelFilterButtonTextActive]}>
            {t('gymnasts.allLevels')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Analytics Section */}
      {filteredScores.length > 0 && (
        <LinearGradient
          colors={theme.colors.analyticsCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>{t('gymnasts.performanceAnalytics')}</Text>

          {/* Score Progress Chart */}
          {filteredScores.length >= 2 && (
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: filteredScores.slice(0, 8).reverse().map((_, index) => ''),
                  datasets: [{
                    data: filteredScores.slice(0, 8).reverse().map(s => s.scores[selectedEvent] || 0)
                  }]
                }}
                width={Dimensions.get('window').width - 64}
                height={180}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.analyticsCardGradient[0],
                  backgroundGradientTo: theme.colors.analyticsCardGradient[1],
                  decimalPlaces: 1,
                  color: () => theme.colors.primary,
                  labelColor: () => theme.colors.textSecondary,
                  style: {
                    borderRadius: theme.borderRadius.md
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: theme.colors.primary
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: theme.colors.border,
                    strokeWidth: 1
                  }
                }}
                bezier
                style={{
                  marginVertical: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md
                }}
              />
              <Text style={styles.chartLabel}>
                {selectedEvent === 'allAround' ? t('scores.allAround') : EVENT_LABELS[selectedEvent as EventKey]} {t('gymnasts.scoreTrend')}
              </Text>
            </View>
          )}

          {/* Event Averages */}
          <View style={[
            styles.eventAverages,
            currentEvents.length === 4 && styles.eventAveragesWomens
          ]}>
            {currentEvents.map(event => (
              <TouchableOpacity
                key={event}
                style={[
                  styles.eventAvg,
                  currentEvents.length === 4 && styles.eventAvgWomens,
                  selectedEvent === event && styles.eventAvgSelected
                ]}
                onPress={() => {
                  setSelectedEvent(event);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}>
                <Text
                  style={styles.eventAvgLabel}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}>
                  {EVENT_LABELS[event]} {t('gymnasts.avg')}
                </Text>
                <Text style={[styles.eventAvgValue, selectedEvent === event && styles.eventAvgValueSelected]}>
                  {formatScore(eventAverages[event])}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* All-Around Toggle */}
          <TouchableOpacity
            style={[
              styles.eventAvg,
              { width: '100%', marginBottom: theme.spacing.lg },
              selectedEvent === 'allAround' && styles.eventAvgSelected
            ]}
            onPress={() => {
              setSelectedEvent('allAround');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}>
            <Text style={styles.eventAvgLabel}>{t('scores.allAround')} {t('gymnasts.avg')}</Text>
            <Text style={[styles.eventAvgValue, selectedEvent === 'allAround' && styles.eventAvgValueSelected]}>
              {formatScore(avgAllAround)}
            </Text>
          </TouchableOpacity>

          {/* Personal Records */}
          <View style={styles.personalRecords}>
          <Text style={styles.prTitle}>{t('gymnasts.personalRecords')}</Text>
            <View style={styles.prGrid}>
              {currentEvents.map(event => (
                <View key={event} style={styles.prItem}>
                  <Text style={styles.prEvent}>{EVENT_LABELS[event]}</Text>
                  <Text style={styles.prScore}>{formatScore(personalRecords[event])}</Text>
                </View>
              ))}
              <View style={styles.prItemFull}>
                <Text style={styles.prEvent}>{t('scores.allAround')}</Text>
                <Text style={[styles.prScore, styles.prScoreLarge]}>
                  {formatScore(personalRecords.allAround)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* Scores Section */}
      <View style={styles.scoresSection}>
        <Text style={styles.sectionTitle}>{t('gymnasts.competitionScores')}</Text>

        {filteredScores.length === 0 ? (
          <View style={styles.emptyScores}>
            <LinearGradient
              colors={theme.colors.emptyIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>★</Text>
            </LinearGradient>
            <Text style={styles.emptyText}>{t('gymnasts.noScoresYet')}</Text>
            <Text style={styles.emptySubtext}>
              {t('gymnasts.scoresWillAppear')}
            </Text>
          </View>
        ) : (
          filteredScores.map((score) => (
            <View key={score.id} style={styles.scoreCardWrapper}>
              <TouchableOpacity
                style={styles.scoreCardTouchable}
                onPress={() => handleScorePress(score.meetId)}
                activeOpacity={0.7}>
                <LinearGradient
                  colors={theme.colors.scoreCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.scoreCard}>

                  {/* Meet Info Header */}
                  <View style={styles.scoreHeader}>
                    <View style={styles.meetInfo}>
                      <Text style={styles.meetName}>{score.meetName}</Text>
                      <View style={styles.meetMetadata}>
                        <Text style={styles.meetDate}>
                          {formatDate(
                            typeof score.meetDate === 'object' && score.meetDate !== null && 'toMillis' in score.meetDate
                              ? (score.meetDate.toDate ? score.meetDate.toDate() : new Date(score.meetDate.toMillis!()))
                              : new Date(score.meetDate as any)
                          )}
                        </Text>
                        {score.level && (
                          <View style={styles.scoreLevelBadge}>
                            <Text style={styles.scoreLevelText}>{score.level}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => handleShareScore(score.id, e)}
                      style={styles.shareButton}
                      activeOpacity={0.7}>
                      <LinearGradient
                        colors={theme.colors.avatarGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.shareButtonGradient}>
                        <Text style={styles.shareButtonLabel}>{t('scoreCard.createSocialCard')}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Event Scores Grid */}
                  <View style={[
                    styles.scoresGrid,
                    currentEvents.length === 4 && styles.scoresGridWomens
                  ]}>
                    {currentEvents.map(event => (
                      <View key={event} style={[
                        styles.eventScore,
                        currentEvents.length === 4 && styles.eventScoreWomens
                      ]}>
                        <Text
                          style={styles.eventLabel}
                          numberOfLines={2}
                          adjustsFontSizeToFit
                          minimumFontScale={0.7}>
                          {EVENT_LABELS[event]}
                        </Text>
                        <Text style={[styles.eventValue, { color: getScoreColor(score.scores[event] || 0, theme) }]}>
                          {formatScore(score.scores[event] || 0)}
                        </Text>
                        {score.placements[event] != null && (
                          <View style={[
                            styles.placementBadge,
                            { backgroundColor: getPlacementColor(score.placements[event]!, theme) }
                          ]}>
                            <Text style={[
                              styles.placementText,
                              score.placements[event]! > 3 && styles.placementTextDark
                            ]}>
                              {getOrdinal(score.placements[event]!)}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>

                  {/* All-Around Score */}
                  <View style={[
                    styles.allAroundContainer,
                    { backgroundColor: getAAScoreColor(score.scores.allAround, theme) + '15' }
                  ]}>
                    <View style={styles.allAroundContent}>
                      <Text style={styles.allAroundLabel}>{t('scores.allAround')}</Text>
                      <Text style={[styles.allAroundValue, { color: getAAScoreColor(score.scores.allAround, theme) }]}>
                        {formatScore(score.scores.allAround)}
                      </Text>
                    </View>
                    {score.placements.allAround != null && (
                      <View style={[
                        styles.placementBadgeLarge,
                        { backgroundColor: getPlacementColor(score.placements.allAround, theme) }
                      ]}>
                        <Text style={[
                          styles.placementTextLarge,
                          score.placements.allAround > 3 && styles.placementTextDark
                        ]}>
                          {getOrdinal(score.placements.allAround)}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
