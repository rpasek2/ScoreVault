import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Meet, Score, Gymnast } from '@/types';
import { formatDate, formatScore } from '@/utils/seasonUtils';
import FloatingActionButton from '@/components/FloatingActionButton';
import { WOMENS_EVENTS, MENS_EVENTS, EVENT_LABELS, EventKey, getCardBorder } from '@/constants/theme';
import { getMeetById, getGymnasts, getScoresByMeet, deleteMeet } from '@/utils/database';
import {
  calculateTeamScore,
  formatTeamScore,
  getEventDisplayName,
  isCountingScore
} from '@/utils/teamScores';

interface ScoreWithGymnast extends Score {
  gymnastName: string;
  gymnastDiscipline: 'Womens' | 'Mens';
  gymnastLevel: string;
}

interface GymnastWithScore {
  gymnast: Gymnast;
  score: Score;
}

interface TeamSection {
  level: string;
  discipline: 'Womens' | 'Mens';
  teamScore: number;
  teamScoreResult: any;
  gymnastsWithScores: GymnastWithScore[];
  countingScoreCount: 3 | 5;
}

export default function MeetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [meet, setMeet] = useState<Meet | null>(null);
  const [scores, setScores] = useState<ScoreWithGymnast[]>([]);
  const [allGymnasts, setAllGymnasts] = useState<Gymnast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'gymnasts' | 'teams'>('gymnasts');
  const [teamSections, setTeamSections] = useState<TeamSection[]>([]);
  const [teamCountingCounts, setTeamCountingCounts] = useState<{ [key: string]: 3 | 5 }>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  const calculateTeamSections = (scoresData: Score[], gymnasts: Gymnast[]) => {
    // Group scores by level and discipline
    const groupMap = new Map<string, Score[]>();

    scoresData.forEach(score => {
      const gymnast = gymnasts.find(g => g.id === score.gymnastId);
      if (!gymnast || !score.level) return;

      const key = `${score.level}-${gymnast.discipline}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(score);
    });

    // Calculate team score for each group
    const sections: TeamSection[] = [];

    groupMap.forEach((groupScores, key) => {
      const [level, discipline] = key.split('-');
      const disc = discipline as 'Womens' | 'Mens';

      // Get default counting count from state or use 3
      const countingKey = `${level}-${discipline}`;
      const countingCount = teamCountingCounts[countingKey] || 3;

      const teamScoreResult = calculateTeamScore(groupScores, disc, gymnasts, countingCount);

      const gymnastsWithScoresData: GymnastWithScore[] = groupScores
        .map(score => {
          const gymnast = gymnasts.find(g => g.id === score.gymnastId);
          if (!gymnast) return null;
          return { gymnast, score };
        })
        .filter((item): item is GymnastWithScore => item !== null)
        .sort((a, b) => b.score.scores.allAround - a.score.scores.allAround);

      sections.push({
        level,
        discipline: disc,
        teamScore: teamScoreResult.totalScore,
        teamScoreResult,
        gymnastsWithScores: gymnastsWithScoresData,
        countingScoreCount: countingCount
      });
    });

    // Sort sections by level, then discipline
    sections.sort((a, b) => {
      const levelA = getLevelOrder(a.level);
      const levelB = getLevelOrder(b.level);
      if (levelA !== levelB) return levelA - levelB;
      return a.discipline === 'Womens' ? -1 : 1;
    });

    setTeamSections(sections);
  };

  const getLevelOrder = (level: string): number => {
    if (level.startsWith('Level ')) {
      return parseInt(level.replace('Level ', ''));
    }
    const xcelOrder: Record<string, number> = {
      'Xcel Bronze': 11,
      'Xcel Silver': 12,
      'Xcel Gold': 13,
      'Xcel Platinum': 14,
      'Xcel Diamond': 15,
      'Xcel Sapphire': 16
    };
    if (level in xcelOrder) return xcelOrder[level];
    if (level === 'Elite') return 100;
    return 999;
  };

  const handleToggleChange = (level: string, discipline: string, count: 3 | 5) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const key = `${level}-${discipline}`;
    setTeamCountingCounts(prev => ({ ...prev, [key]: count }));

    // Recalculate team sections with new counting count
    if (allGymnasts.length > 0 && scores.length > 0) {
      calculateTeamSections(scores, allGymnasts);
    }
  };

  const toggleSectionCollapse = (level: string, discipline: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const key = `${level}-${discipline}`;
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const isSectionCollapsed = (level: string, discipline: string): boolean => {
    return collapsedSections.has(`${level}-${discipline}`);
  };

  const getScaleFactor = () => {
    if (screenWidth < 600) return 1.0; // Phone
    if (screenWidth < 900) return 1.4; // Small tablet
    return 1.8; // Large tablet
  };

  const fetchMeetData = async () => {
    if (!id) return;

    try {
      const meetData = await getMeetById(id);
      if (meetData) {
        setMeet(meetData);
        navigation.setOptions({ title: meetData.name });

        // Fetch all gymnasts to map IDs to names, disciplines, and levels
        const gymnasts = await getGymnasts();
        setAllGymnasts(gymnasts);
        const gymnastsMap: { [key: string]: { name: string; discipline: 'Womens' | 'Mens'; level: string } } = {};
        gymnasts.forEach((gymnast) => {
          gymnastsMap[gymnast.id] = {
            name: gymnast.name,
            discipline: gymnast.discipline || 'Womens',
            level: gymnast.level
          };
        });

        // Fetch scores for this meet
        const scoresData = await getScoresByMeet(id);
        const scoresList: ScoreWithGymnast[] = scoresData.map((score) => {
          const gymnastInfo = gymnastsMap[score.gymnastId];
          return {
            ...score,
            gymnastName: gymnastInfo?.name || 'Unknown',
            gymnastDiscipline: gymnastInfo?.discipline || 'Womens',
            gymnastLevel: gymnastInfo?.level || ''
          };
        });

        // Sort by gymnast name
        scoresList.sort((a, b) => a.gymnastName.localeCompare(b.gymnastName));

        setScores(scoresList);

        // Calculate team sections
        calculateTeamSections(scoresData, gymnasts);

        setLoading(false);
        setRefreshing(false);
      } else {
        Alert.alert(t('common.error'), t('meets.meetNotFound'));
        router.back();
      }
    } catch (error) {
      console.error('Error fetching meet:', error);
      Alert.alert(t('common.error'), t('meets.failedToLoadMeet'));
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeetData();
  }, [id]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMeetData();
    }, [id])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMeetData();
  };

  const handleAddScore = () => {
    router.push({ pathname: '/add-score', params: { meetId: id } });
  };

  const handleScorePress = (scoreId: string) => {
    router.push({ pathname: '/edit-score', params: { scoreId } });
  };

  const handleDeleteMeet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Meet',
      `Are you sure you want to delete "${meet?.name}"? This will also delete all ${scores.length} score(s) associated with this meet.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

              // Delete the meet (scores will be cascade deleted by database)
              await deleteMeet(id);

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', error.message || 'Failed to delete meet');
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background
    },
    meetHeader: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    meetHeaderTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    },
    meetInfo: {
      flex: 1
    },
    deleteButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.error
    },
    deleteButtonText: {
      fontSize: 20
    },
    meetName: {
      fontSize: 22,
      fontWeight: 'bold' as const,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm
    },
    meetDate: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs
    },
    meetLocation: {
      fontSize: 14,
      color: theme.colors.textSecondary
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      textAlign: 'center'
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      textAlign: 'center'
    },
    listContent: {
      padding: theme.spacing.base
    },
    scoreCard: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      ...getCardBorder(isDark)
    },
    gymnastHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight
    },
    gymnastName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      flex: 1
    },
    gymnastInfo: {
      backgroundColor: theme.colors.surfaceSecondary,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.xs,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    gymnastInfoText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textSecondary
    },
    scoresRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md
    },
    scoreItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start'
    },
    eventLabel: {
      fontSize: 10,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase' as const,
      height: 24,
      textAlign: 'center' as const
    },
    scoreValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary
    },
    allAroundContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md
    },
    allAroundLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary
    },
    allAroundValue: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.primary
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    segmentButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
      marginHorizontal: 4
    },
    segmentButtonActive: {
      backgroundColor: theme.colors.primary
    },
    segmentButtonText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '600'
    },
    segmentButtonTextActive: {
      color: '#FFFFFF'
    },
    teamSection: {
      marginBottom: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...getCardBorder(isDark)
    },
    teamSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceSecondary,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border
    },
    teamSectionTitle: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      flex: 1
    },
    sectionChevron: {
      fontSize: 24,
      color: theme.colors.textSecondary,
      fontWeight: '300',
      marginRight: theme.spacing.sm
    },
    teamScoreBadge: {
      backgroundColor: theme.colors.primary + '15',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary + '40'
    },
    teamScoreLabel: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 9,
      letterSpacing: 0.5,
      marginBottom: 2
    },
    teamScoreValue: {
      ...theme.typography.h5,
      color: theme.colors.primary,
      fontWeight: '700'
    },
    teamContent: {
      padding: theme.spacing.lg
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
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center'
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    toggleButtonText: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '600'
    },
    toggleButtonTextActive: {
      color: '#FFFFFF'
    },
    eventScoresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg
    },
    eventScoreItem: {
      backgroundColor: theme.colors.surfaceSecondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: '22%'
    },
    eventScoreLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      marginBottom: 2,
      fontSize: 9
    },
    eventScoreValue: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '700'
    },
    sectionTitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.sm
    },
    gridScrollContainer: {
      marginBottom: theme.spacing.md
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
      paddingVertical: theme.spacing.xs * getScaleFactor(),
      paddingHorizontal: 4 * getScaleFactor(),
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
      fontSize: 10 * getScaleFactor()
    },
    nameColumn: {
      width: 100 * getScaleFactor(),
      alignItems: 'flex-start',
      paddingLeft: theme.spacing.sm * getScaleFactor()
    },
    scoreColumn: {
      width: 60 * getScaleFactor()
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
      paddingVertical: theme.spacing.xs * getScaleFactor(),
      paddingHorizontal: 4 * getScaleFactor(),
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
      paddingLeft: theme.spacing.sm * getScaleFactor()
    },
    gymnastNameGrid: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      fontSize: 12 * getScaleFactor()
    },
    scoreTextGrid: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '500',
      fontSize: 12 * getScaleFactor()
    },
    scoreTextCounting: {
      color: theme.colors.warning,
      fontWeight: '700'
    },
    teamsScrollContent: {
      padding: theme.spacing.base,
      paddingBottom: theme.spacing.xxxl
    }
  });

  if (loading || !meet) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const scaleFactor = getScaleFactor();

  return (
    <View style={styles.container}>
      {/* Meet Header */}
      <View style={styles.meetHeader}>
        <View style={styles.meetHeaderTop}>
          <View style={styles.meetInfo}>
            <Text style={styles.meetName}>{meet.name}</Text>
            <Text style={styles.meetDate}>
              {formatDate(meet.date.toDate ? meet.date.toDate() : meet.date as Date)} • {meet.season}
            </Text>
            {meet.location && (
              <Text style={styles.meetLocation}>📍 {meet.location}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteMeet}
            activeOpacity={0.7}>
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentButton, selectedTab === 'gymnasts' && styles.segmentButtonActive]}
          onPress={() => {
            setSelectedTab('gymnasts');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          activeOpacity={0.7}>
          <Text style={[styles.segmentButtonText, selectedTab === 'gymnasts' && styles.segmentButtonTextActive]}>
            {t('tabs.gymnasts')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, selectedTab === 'teams' && styles.segmentButtonActive]}
          onPress={() => {
            setSelectedTab('teams');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          activeOpacity={0.7}>
          <Text style={[styles.segmentButtonText, selectedTab === 'teams' && styles.segmentButtonTextActive]}>
            {t('tabs.teams')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gymnasts Tab */}
      {selectedTab === 'gymnasts' && (
        scores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No scores recorded</Text>
            <Text style={styles.emptySubtext}>
              Tap the '+' button to add scores for this meet
            </Text>
          </View>
        ) : (
          <FlatList
          data={scores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const currentEvents = item.gymnastDiscipline === 'Mens' ? MENS_EVENTS : WOMENS_EVENTS;
            return (
              <TouchableOpacity
                style={styles.scoreCard}
                onPress={() => handleScorePress(item.id)}
                activeOpacity={0.7}>
                <View style={styles.gymnastHeader}>
                  <Text style={styles.gymnastName}>{item.gymnastName}</Text>
                  <View style={styles.gymnastInfo}>
                    <Text style={styles.gymnastInfoText}>
                      {item.gymnastDiscipline === 'Mens' ? 'M' : 'W'} • Level {item.gymnastLevel}
                    </Text>
                  </View>
                </View>

                <View style={styles.scoresRow}>
                  {currentEvents.map(event => (
                    <View key={event} style={styles.scoreItem}>
                      <Text
                        style={styles.eventLabel}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}>
                        {EVENT_LABELS[event]}
                      </Text>
                      <Text style={styles.scoreValue}>{formatScore(item.scores[event] || 0)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.allAroundContainer}>
                  <Text style={styles.allAroundLabel}>All-Around</Text>
                  <Text style={styles.allAroundValue}>
                    {formatScore(item.scores.allAround)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          />
        )
      )}

      {/* Teams Tab */}
      {selectedTab === 'teams' && (
        teamSections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No team data</Text>
            <Text style={styles.emptySubtext}>
              Add more scores to see team breakdowns by level and discipline
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.teamsScrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
              />
            }>
            {teamSections.map((section) => {
              const events = section.discipline === 'Womens' ? WOMENS_EVENTS : MENS_EVENTS;
              const showCountingToggle = section.discipline === 'Womens' &&
                ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'].includes(section.level);
              const isCollapsed = isSectionCollapsed(section.level, section.discipline);

              return (
                <View key={`${section.level}-${section.discipline}`} style={styles.teamSection}>
                  {/* Section Header */}
                  <TouchableOpacity
                    onPress={() => toggleSectionCollapse(section.level, section.discipline)}
                    activeOpacity={0.7}>
                    <View style={styles.teamSectionHeader}>
                      <Text style={styles.teamSectionTitle}>
                        {section.level} - {section.discipline === 'Womens' ? "Women's" : "Men's"}
                      </Text>
                      <Text style={styles.sectionChevron}>
                        {isCollapsed ? '›' : '⌄'}
                      </Text>
                      <View style={styles.teamScoreBadge}>
                        <Text style={styles.teamScoreLabel}>TEAM SCORE</Text>
                        <Text style={styles.teamScoreValue}>{formatTeamScore(section.teamScore)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Section Content */}
                  {!isCollapsed && (
                    <View style={styles.teamContent}>
                    {/* Counting Score Toggle */}
                    {showCountingToggle && (
                      <View style={styles.toggleContainer}>
                        <TouchableOpacity
                          style={[
                            styles.toggleButton,
                            section.countingScoreCount === 3 && styles.toggleButtonActive
                          ]}
                          onPress={() => handleToggleChange(section.level, section.discipline, 3)}
                          activeOpacity={0.7}>
                          <Text style={[
                            styles.toggleButtonText,
                            section.countingScoreCount === 3 && styles.toggleButtonTextActive
                          ]}>
                            Top 3
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.toggleButton,
                            section.countingScoreCount === 5 && styles.toggleButtonActive
                          ]}
                          onPress={() => handleToggleChange(section.level, section.discipline, 5)}
                          activeOpacity={0.7}>
                          <Text style={[
                            styles.toggleButtonText,
                            section.countingScoreCount === 5 && styles.toggleButtonTextActive
                          ]}>
                            Top 5
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Event Team Scores */}
                    <View style={styles.eventScoresGrid}>
                      {events.map((event) => (
                        <View key={event} style={styles.eventScoreItem}>
                          <Text style={styles.eventScoreLabel}>{getEventDisplayName(event)}</Text>
                          <Text style={styles.eventScoreValue}>
                            {formatTeamScore(section.teamScoreResult.teamScores[event] || 0)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Gymnast Scores Table */}
                    <Text style={styles.sectionTitle}>Gymnast Scores</Text>
                    <View style={styles.gridScrollContainer}>
                      <View style={{ flexDirection: 'row' }}>
                        {/* Fixed Names Column */}
                        <View style={[styles.gridTable, styles.gridTableLeft]}>
                          {/* Header */}
                          <View style={styles.gridHeader}>
                            <View style={[styles.gridHeaderCell, styles.nameColumn]}>
                              <Text style={styles.gridHeaderText}>Gymnast</Text>
                            </View>
                          </View>
                          {/* Data Rows */}
                          {section.gymnastsWithScores.map((gymnastItem, rowIndex) => (
                            <View key={gymnastItem.gymnast.id} style={[styles.gridRow, rowIndex === section.gymnastsWithScores.length - 1 && styles.gridRowLast]}>
                              <View style={[styles.gridCell, styles.nameColumn, styles.nameCell]}>
                                <Text style={styles.gymnastNameGrid} numberOfLines={1}>
                                  {gymnastItem.gymnast.name}
                                </Text>
                              </View>
                            </View>
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
                                <Text style={styles.gridHeaderText}>AA</Text>
                              </View>
                            </View>

                            {/* Data Rows */}
                            {section.gymnastsWithScores.map((gymnastItem, rowIndex) => (
                              <View key={gymnastItem.gymnast.id} style={[styles.gridRow, rowIndex === section.gymnastsWithScores.length - 1 && styles.gridRowLast]}>
                                {events.map((event, index) => {
                                  const score = gymnastItem.score.scores[event];
                                  const isCounting = score
                                    ? isCountingScore(gymnastItem.gymnast.id, event, section.teamScoreResult.countingScores)
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
                                      <Text style={[styles.scoreTextGrid, isCounting && styles.scoreTextCounting]}>
                                        {score ? score.toFixed(3) : '-'}
                                      </Text>
                                    </View>
                                  );
                                })}
                                <View style={[styles.gridCell, styles.scoreColumn, styles.gridCellLast]}>
                                  <Text style={styles.scoreTextGrid}>
                                    {gymnastItem.score.scores.allAround.toFixed(3)}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    </View>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )
      )}

      <FloatingActionButton onPress={handleAddScore} />
    </View>
  );
}

