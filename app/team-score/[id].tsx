import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CARD_SHADOW, getCardBorder } from '@/constants/theme';
import { getGymnasts, getMeets, getScores, saveTeamPlacement, getTeamPlacement } from '@/utils/database';
import {
  calculateTeamScore,
  formatTeamScore,
  getEventDisplayName,
  isCountingScore,
  MENS_EVENTS,
  WOMENS_EVENTS
} from '@/utils/teamScores';
import { Gymnast, Meet, Score } from '@/types';

interface GymnastWithScore {
  gymnast: Gymnast;
  score: Score;
}

export default function TeamScoreCardScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useLocalSearchParams();
  const level = params.level as string;
  const discipline = params.discipline as 'Womens' | 'Mens';
  const meetId = params.meetId as string;
  const { width: screenWidth } = useWindowDimensions();

  // Calculate scale factor based on screen width
  const getScaleFactor = () => {
    if (screenWidth < 600) return 1.0; // Phone
    if (screenWidth < 900) return 1.4; // Small tablet
    return 1.8; // Large tablet
  };
  const scaleFactor = getScaleFactor();

  const [loading, setLoading] = useState(true);
  const [meet, setMeet] = useState<Meet | null>(null);
  const [gymnastsWithScores, setGymnastsWithScores] = useState<GymnastWithScore[]>([]);
  const [teamScoreResult, setTeamScoreResult] = useState<any>(null);
  const [countingScoreCount, setCountingScoreCount] = useState<3 | 5>(3);
  const [placementsModalVisible, setPlacementsModalVisible] = useState(false);
  const [placements, setPlacements] = useState<{
    vault?: string;
    bars?: string;
    beam?: string;
    floor?: string;
    pommelHorse?: string;
    rings?: string;
    parallelBars?: string;
    highBar?: string;
    allAround?: string;
  }>({});

  const fetchData = async () => {
    try {
      const [allGymnasts, allMeets, allScores] = await Promise.all([
        getGymnasts(),
        getMeets(),
        getScores()
      ]);

      const currentMeet = allMeets.find(m => m.id === meetId);
      setMeet(currentMeet || null);

      // Get scores for this meet and level
      const meetScores = allScores.filter(
        s => s.meetId === meetId && s.level === level
      );

      // Filter by discipline
      const relevantGymnasts = allGymnasts.filter(g => g.discipline === discipline);
      const gymnastIds = new Set(relevantGymnasts.map(g => g.id));
      const relevantScores = meetScores.filter(s => gymnastIds.has(s.gymnastId));

      // Build gymnasts with scores array
      const gymnastsWithScoresData: GymnastWithScore[] = relevantScores
        .map(score => {
          const gymnast = relevantGymnasts.find(g => g.id === score.gymnastId);
          if (!gymnast) return null;
          return { gymnast, score };
        })
        .filter((item): item is GymnastWithScore => item !== null)
        .sort((a, b) => {
          // Sort by all-around score descending
          return b.score.scores.allAround - a.score.scores.allAround;
        });

      setGymnastsWithScores(gymnastsWithScoresData);

      // Load existing team placements
      const existingPlacements = await getTeamPlacement(meetId, level, discipline);
      if (existingPlacements) {
        setPlacements({
          vault: existingPlacements.placements.vault?.toString() || '',
          bars: existingPlacements.placements.bars?.toString() || '',
          beam: existingPlacements.placements.beam?.toString() || '',
          floor: existingPlacements.placements.floor?.toString() || '',
          pommelHorse: existingPlacements.placements.pommelHorse?.toString() || '',
          rings: existingPlacements.placements.rings?.toString() || '',
          parallelBars: existingPlacements.placements.parallelBars?.toString() || '',
          highBar: existingPlacements.placements.highBar?.toString() || '',
          allAround: existingPlacements.placements.allAround?.toString() || ''
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Recalculate team scores when counting score count changes
  useEffect(() => {
    if (gymnastsWithScores.length === 0) return;

    const scores = gymnastsWithScores.map(item => item.score);
    const gymnasts = gymnastsWithScores.map(item => item.gymnast);
    const teamScore = calculateTeamScore(scores, discipline, gymnasts, countingScoreCount);
    setTeamScoreResult(teamScore);
  }, [countingScoreCount, gymnastsWithScores, discipline]);

  // Initial calculation on data load
  useEffect(() => {
    if (gymnastsWithScores.length > 0 && !teamScoreResult) {
      const scores = gymnastsWithScores.map(item => item.score);
      const gymnasts = gymnastsWithScores.map(item => item.gymnast);
      const teamScore = calculateTeamScore(scores, discipline, gymnasts, countingScoreCount);
      setTeamScoreResult(teamScore);
    }
  }, [gymnastsWithScores]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [meetId, level, discipline])
  );

  useEffect(() => {
    fetchData();
  }, [meetId, level, discipline]);

  const handleGymnastPress = (gymnastId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/edit-score',
      params: { gymnastId, meetId }
    });
  };

  const handleCreateSocialCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/team-score-card-creator',
      params: {
        level,
        discipline,
        meetId,
        countingScoreCount: countingScoreCount.toString()
      }
    });
  };

  const handleOpenPlacementsModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlacementsModalVisible(true);
  };

  const handleSavePlacements = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const placementsData: any = {};
      if (placements.vault) placementsData.vault = parseInt(placements.vault);
      if (placements.bars) placementsData.bars = parseInt(placements.bars);
      if (placements.beam) placementsData.beam = parseInt(placements.beam);
      if (placements.floor) placementsData.floor = parseInt(placements.floor);
      if (placements.pommelHorse) placementsData.pommelHorse = parseInt(placements.pommelHorse);
      if (placements.rings) placementsData.rings = parseInt(placements.rings);
      if (placements.parallelBars) placementsData.parallelBars = parseInt(placements.parallelBars);
      if (placements.highBar) placementsData.highBar = parseInt(placements.highBar);
      if (placements.allAround) placementsData.allAround = parseInt(placements.allAround);

      await saveTeamPlacement(meetId, level, discipline, placementsData);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), t('teams.placementsSaved'));
      setPlacementsModalVisible(false);
    } catch (error) {
      console.error('Error saving placements:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('teams.failedToSavePlacements'));
    }
  };

  const events = discipline === 'Womens' ? WOMENS_EVENTS : MENS_EVENTS;

  // Check if we should show the counting score toggle (Women's levels 1-5 only)
  const showCountingToggle = discipline === 'Womens' &&
    ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'].includes(level);

  const handleToggleChange = (count: 3 | 5) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCountingScoreCount(count);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    header: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    headerTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing.xs
    },
    headerSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    content: {
      padding: theme.spacing.base
    },
    teamSummaryCard: {
      padding: theme.spacing.lg,
      borderRadius: 16,
      marginBottom: theme.spacing.md,
      ...CARD_SHADOW,
      ...getCardBorder(isDark)
    },
    teamScoreLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.xs
    },
    teamScoreValue: {
      ...theme.typography.h1,
      color: theme.colors.primary,
      fontWeight: '700',
      marginBottom: theme.spacing.md
    },
    eventScoresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm
    },
    eventScoreItem: {
      backgroundColor: theme.colors.surfaceSecondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: discipline === 'Womens' ? '22%' : '30%'
    },
    eventLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      marginBottom: 2
    },
    eventScore: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      fontWeight: '700'
    },
    sectionTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.md
    },
    gridCard: {
      borderRadius: 16,
      overflow: 'hidden',
      ...CARD_SHADOW,
      ...getCardBorder(isDark)
    },
    gridScrollContainer: {
      padding: theme.spacing.sm
    },
    gridTable: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden'
    },
    gridTableLeft: {
      borderTopLeftRadius: theme.borderRadius.md,
      borderBottomLeftRadius: theme.borderRadius.md,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRightWidth: 0
    },
    gridTableRight: {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderTopRightRadius: theme.borderRadius.md,
      borderBottomRightRadius: theme.borderRadius.md,
      borderLeftWidth: 0
    },
    gridHeader: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceSecondary,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border
    },
    gridHeaderCell: {
      paddingVertical: theme.spacing.xs * scaleFactor,
      paddingHorizontal: 4 * scaleFactor,
      justifyContent: 'center',
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: theme.colors.border
    },
    gridHeaderCellLast: {
      borderRightWidth: 0
    },
    gridHeaderText: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      fontSize: 12 * scaleFactor
    },
    nameColumn: {
      width: 100 * scaleFactor,
      alignItems: 'flex-start',
      paddingLeft: theme.spacing.sm * scaleFactor
    },
    scoreColumn: {
      width: 60 * scaleFactor
    },
    gridRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    gridRowLast: {
      borderBottomWidth: 0
    },
    gridCell: {
      paddingVertical: theme.spacing.xs * scaleFactor,
      paddingHorizontal: 4 * scaleFactor,
      justifyContent: 'center',
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      backgroundColor: theme.colors.surface
    },
    gridCellCounting: {
      backgroundColor: theme.colors.warning + '20'
    },
    gridCellLast: {
      borderRightWidth: 0
    },
    nameCell: {
      alignItems: 'flex-start',
      paddingLeft: theme.spacing.sm * scaleFactor
    },
    gymnastName: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      fontSize: 14 * scaleFactor
    },
    scoreText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '500',
      fontSize: 14 * scaleFactor
    },
    scoreTextCounting: {
      color: theme.colors.warning,
      fontWeight: '700'
    },
    countingIndicator: {
      ...theme.typography.caption,
      color: theme.colors.warning,
      fontWeight: '700',
      marginLeft: 2
    },
    legend: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center'
    },
    legendText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm
    },
    legendStar: {
      ...theme.typography.caption,
      color: theme.colors.warning,
      fontWeight: '700'
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xxxl,
      paddingVertical: theme.spacing.xxxl
    },
    emptyText: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm
    },
    emptySubtext: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center'
    },
    toggleContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md
    },
    toggleButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center'
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    toggleButtonText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600'
    },
    toggleButtonTextActive: {
      color: '#FFFFFF'
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md
    },
    actionButton: {
      flex: 1,
      borderRadius: 16,
      overflow: 'hidden'
    },
    socialCardButton: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      ...CARD_SHADOW
    },
    socialCardGradient: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.base,
      gap: theme.spacing.sm
    },
    socialCardIcon: {
      fontSize: 20
    },
    socialCardButtonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
      fontWeight: '600'
    },
    placementsButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      ...CARD_SHADOW
    },
    placementsButtonInner: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.base,
      gap: theme.spacing.sm
    },
    placementsButtonIcon: {
      fontSize: 20
    },
    placementsButtonText: {
      ...theme.typography.button,
      color: theme.colors.primary,
      fontWeight: '600'
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 500,
      maxHeight: '80%',
      ...theme.shadows.large
    },
    modalTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing.xs
    },
    modalSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg
    },
    modalScroll: {
      maxHeight: 400
    },
    placementInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md
    },
    placementLabel: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      flex: 1
    },
    placementLabelBold: {
      fontWeight: '700'
    },
    placementInput: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      width: 80,
      textAlign: 'center'
    },
    placementInputBold: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      fontWeight: '700'
    },
    modalButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg
    },
    modalButton: {
      flex: 1,
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center'
    },
    modalButtonCancel: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    modalButtonSave: {
      backgroundColor: theme.colors.primary
    },
    modalButtonTextCancel: {
      ...theme.typography.button,
      color: theme.colors.textPrimary,
      fontWeight: '600'
    },
    modalButtonTextSave: {
      ...theme.typography.button,
      color: '#FFFFFF',
      fontWeight: '600'
    }
  });

  if (loading || !teamScoreResult) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!meet || gymnastsWithScores.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={theme.colors.headerGradient}
          style={styles.header}>
          <Text style={styles.headerTitle}>{meet?.name || t('teams.teamScores')}</Text>
          <Text style={styles.headerSubtitle}>
            {level} - {discipline === 'Womens' ? t('gymnasts.womens') : t('gymnasts.mens')}
          </Text>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('teams.noScoresYet')}</Text>
          <Text style={styles.emptySubtext}>
            {t('teams.noGymnastsCompetedAt', {
              level,
              discipline: discipline === 'Womens' ? t('gymnasts.womens') : t('gymnasts.mens')
            })}
          </Text>
        </View>
      </View>
    );
  }

  const disciplineDisplay = discipline === 'Womens' ? t('gymnasts.womens') : t('gymnasts.mens');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.headerGradient}
        style={styles.header}>
        <Text style={styles.headerTitle}>{meet.name}</Text>
        <Text style={styles.headerSubtitle}>
          {level} - {disciplineDisplay}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Counting Score Toggle (Levels 1-5 Women's only) */}
        {showCountingToggle && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                countingScoreCount === 3 && styles.toggleButtonActive
              ]}
              onPress={() => handleToggleChange(3)}
              activeOpacity={0.7}>
              <Text style={[
                styles.toggleButtonText,
                countingScoreCount === 3 && styles.toggleButtonTextActive
              ]}>
                {t('teams.top3Scores')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                countingScoreCount === 5 && styles.toggleButtonActive
              ]}
              onPress={() => handleToggleChange(5)}
              activeOpacity={0.7}>
              <Text style={[
                styles.toggleButtonText,
                countingScoreCount === 5 && styles.toggleButtonTextActive
              ]}>
                {t('teams.top5Scores')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Team Summary */}
        <LinearGradient
          colors={theme.colors.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.teamSummaryCard}>
          <Text style={styles.teamScoreLabel}>{t('teams.teamScore')}</Text>
          <Text style={styles.teamScoreValue}>
            {formatTeamScore(teamScoreResult.totalScore)}
          </Text>

          <View style={styles.eventScoresGrid}>
            {events.map((event) => (
              <View key={event} style={styles.eventScoreItem}>
                <Text style={styles.eventLabel}>{getEventDisplayName(event)}</Text>
                <Text style={styles.eventScore}>
                  {formatTeamScore(teamScoreResult.teamScores[event] || 0)}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.socialCardButton]}
            onPress={handleCreateSocialCard}
            activeOpacity={0.7}>
            <LinearGradient
              colors={theme.colors.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.socialCardGradient}>
              <Text style={styles.socialCardButtonText}>{t('scoreCard.createSocialCard')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.placementsButton]}
            onPress={handleOpenPlacementsModal}
            activeOpacity={0.7}>
            <View style={styles.placementsButtonInner}>
              <Text style={styles.placementsButtonIcon}>🏆</Text>
              <Text style={styles.placementsButtonText}>{t('teams.teamPlacements')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Score Grid */}
        <Text style={styles.sectionTitle}>{t('teams.gymnastScores')}</Text>
        <LinearGradient
          colors={theme.colors.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gridCard}>
          <View style={styles.gridScrollContainer}>
            <View style={{ flexDirection: 'row' }}>
              {/* Fixed Names Column */}
              <View style={[styles.gridTable, styles.gridTableLeft]}>
                {/* Header */}
                <View style={styles.gridHeader}>
                  <View style={[styles.gridHeaderCell, styles.nameColumn]}>
                    <Text style={styles.gridHeaderText}>{t('scores.gymnast')}</Text>
                  </View>
                </View>
                {/* Data Rows */}
                {gymnastsWithScores.map((item, rowIndex) => (
                  <TouchableOpacity
                    key={item.gymnast.id}
                    onPress={() => handleGymnastPress(item.gymnast.id)}
                    activeOpacity={0.7}>
                    <View style={[styles.gridRow, rowIndex === gymnastsWithScores.length - 1 && styles.gridRowLast]}>
                      <View style={[styles.gridCell, styles.nameColumn, styles.nameCell]}>
                        <Text style={styles.gymnastName} numberOfLines={1}>
                          {item.gymnast.name}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Scrollable Scores */}
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={[styles.gridTable, styles.gridTableRight]}>
                  {/* Header Row */}
                  <View style={styles.gridHeader}>
                    {events.map((event, index) => (
                      <View
                        key={event}
                        style={[
                          styles.gridHeaderCell,
                          styles.scoreColumn,
                          index === events.length && styles.gridHeaderCellLast
                        ]}>
                        <Text style={styles.gridHeaderText}>{getEventDisplayName(event)}</Text>
                      </View>
                    ))}
                    <View style={[styles.gridHeaderCell, styles.scoreColumn, styles.gridHeaderCellLast]}>
                      <Text style={styles.gridHeaderText}>{t('teams.aa')}</Text>
                    </View>
                  </View>

                  {/* Data Rows */}
                  {gymnastsWithScores.map((item, rowIndex) => (
                    <View key={item.gymnast.id} style={[styles.gridRow, rowIndex === gymnastsWithScores.length - 1 && styles.gridRowLast]}>
                      {events.map((event, index) => {
                        const score = item.score.scores[event];
                        const isCounting = score
                          ? isCountingScore(item.gymnast.id, event, teamScoreResult.countingScores)
                          : false;

                        return (
                          <View
                            key={event}
                            style={[
                              styles.gridCell,
                              styles.scoreColumn,
                              isCounting && styles.gridCellCounting,
                              index === events.length && styles.gridCellLast
                            ]}>
                            <Text style={[styles.scoreText, isCounting && styles.scoreTextCounting]}>
                              {score ? score.toFixed(3) : '-'}
                            </Text>
                          </View>
                        );
                      })}
                      <View style={[styles.gridCell, styles.scoreColumn, styles.gridCellLast]}>
                        <Text style={styles.scoreText}>
                          {item.score.scores.allAround.toFixed(3)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Placements Modal */}
      <Modal
        visible={placementsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPlacementsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('teams.teamPlacements')}</Text>
            <Text style={styles.modalSubtitle}>{t('teams.enterTeamPlacements')}</Text>

            <ScrollView style={styles.modalScroll}>
              {events.map((event) => (
                <View key={event} style={styles.placementInputRow}>
                  <Text style={styles.placementLabel}>{getEventDisplayName(event)}</Text>
                  <TextInput
                    style={styles.placementInput}
                    placeholder={t('teams.place')}
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="number-pad"
                    value={placements[event as keyof typeof placements] || ''}
                    onChangeText={(text) => setPlacements(prev => ({ ...prev, [event]: text }))}
                  />
                </View>
              ))}

              {/* All-Around */}
              <View style={styles.placementInputRow}>
                <Text style={[styles.placementLabel, styles.placementLabelBold]}>{t('scores.allAround')}</Text>
                <TextInput
                  style={[styles.placementInput, styles.placementInputBold]}
                  placeholder={t('teams.place')}
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="number-pad"
                  value={placements.allAround || ''}
                  onChangeText={(text) => setPlacements(prev => ({ ...prev, allAround: text }))}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setPlacementsModalVisible(false)}
                activeOpacity={0.7}>
                <Text style={styles.modalButtonTextCancel}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSavePlacements}
                activeOpacity={0.7}>
                <Text style={styles.modalButtonTextSave}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
