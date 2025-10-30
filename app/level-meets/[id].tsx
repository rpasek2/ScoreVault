import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { CARD_SHADOW, EVENT_LABELS, EventKey, getCardBorder } from '@/constants/theme';
import { getGymnasts, getMeets, getScores } from '@/utils/database';
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

interface MeetWithTeamScore {
  meet: Meet;
  teamScore: number;
  gymnastCount: number;
  teamScoreResult: any;
  gymnastsWithScores: GymnastWithScore[];
}

export default function LevelMeetsScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const level = params.level as string;
  const discipline = params.discipline as 'Womens' | 'Mens';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [meetsWithScores, setMeetsWithScores] = useState<MeetWithTeamScore[]>([]);
  const [countingScoreCount, setCountingScoreCount] = useState<3 | 5>(3);
  const [selectedEvent, setSelectedEvent] = useState<string>('allAround');

  const fetchData = async () => {
    try {
      const [gymnasts, meets, scores] = await Promise.all([
        getGymnasts(),
        getMeets(),
        getScores()
      ]);

      // Filter scores by level
      const levelScores = scores.filter(s => s.level === level);

      // Get gymnast IDs for this discipline
      const gymnastIds = new Set(
        gymnasts
          .filter(g => g.discipline === discipline)
          .map(g => g.id)
      );

      // Filter scores by discipline
      const relevantScores = levelScores.filter(s => gymnastIds.has(s.gymnastId));

      // Group by meet
      const meetScoresMap = new Map<string, Score[]>();
      relevantScores.forEach(score => {
        if (!meetScoresMap.has(score.meetId)) {
          meetScoresMap.set(score.meetId, []);
        }
        meetScoresMap.get(score.meetId)!.push(score);
      });

      // Calculate team score for each meet
      const meetsWithTeamScores: MeetWithTeamScore[] = Array.from(meetScoresMap.entries())
        .map(([meetId, meetScores]) => {
          const meet = meets.find(m => m.id === meetId);
          if (!meet) return null;

          const teamScoreResult = calculateTeamScore(meetScores, discipline, gymnasts, countingScoreCount);

          // Build gymnasts with scores array
          const gymnastsWithScoresData: GymnastWithScore[] = meetScores
            .map(score => {
              const gymnast = gymnasts.find(g => g.id === score.gymnastId);
              if (!gymnast) return null;
              return { gymnast, score };
            })
            .filter((item): item is GymnastWithScore => item !== null)
            .sort((a, b) => {
              // Sort by all-around score descending
              return b.score.scores.allAround - a.score.scores.allAround;
            });

          return {
            meet,
            teamScore: teamScoreResult.totalScore,
            gymnastCount: new Set(meetScores.map(s => s.gymnastId)).size,
            teamScoreResult,
            gymnastsWithScores: gymnastsWithScoresData
          };
        })
        .filter((m): m is MeetWithTeamScore => m !== null)
        .sort((a, b) => {
          // Sort by date descending (newest first)
          const dateA = a.meet.date.toMillis?.() || 0;
          const dateB = b.meet.date.toMillis?.() || 0;
          return dateB - dateA;
        });

      setMeetsWithScores(meetsWithTeamScores);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [level, discipline])
  );

  useEffect(() => {
    fetchData();
  }, [level, discipline]);

  // Recalculate team scores when counting score count changes
  useEffect(() => {
    if (meetsWithScores.length === 0) return;

    const updatedMeets = meetsWithScores.map(meetItem => {
      const scores = meetItem.gymnastsWithScores.map(item => item.score);
      const gymnasts = meetItem.gymnastsWithScores.map(item => item.gymnast);
      const teamScoreResult = calculateTeamScore(scores, discipline, gymnasts, countingScoreCount);

      return {
        ...meetItem,
        teamScore: teamScoreResult.totalScore,
        teamScoreResult
      };
    });

    setMeetsWithScores(updatedMeets);
  }, [countingScoreCount]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleMeetPress = (meetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/team-score/[id]',
      params: {
        id: `${level}-${discipline}-${meetId}`,
        level,
        discipline,
        meetId
      }
    });
  };

  const formatDate = (date: any) => {
    const d = date.toDate ? date.toDate() : new Date(date.toMillis!());
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      justifyContent: 'center'
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: 2
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
      flex: 1
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxxl
    },
    meetCardWrapper: {
      marginBottom: theme.spacing.md,
      marginHorizontal: theme.spacing.base,
      borderRadius: 16,
      overflow: 'hidden',
      ...CARD_SHADOW,
      ...getCardBorder(isDark)
    },
    meetCard: {
      padding: theme.spacing.lg
    },
    meetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm
    },
    meetName: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      flex: 1,
      marginRight: theme.spacing.md
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
    meetMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    metaText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary
    },
    separator: {
      color: theme.colors.textTertiary
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xxxl
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      overflow: 'hidden'
    },
    emptyIcon: {
      fontSize: 48,
      color: theme.colors.primary
    },
    emptyText: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center'
    },
    emptySubtext: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20
    },
    chevronIcon: {
      fontSize: 20,
      color: theme.colors.textTertiary,
      marginLeft: theme.spacing.sm
    },
    analyticsSection: {
      marginHorizontal: theme.spacing.base,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.lg,
      borderRadius: 28,
      ...CARD_SHADOW,
      ...getCardBorder(isDark)
    },
    sectionTitleAnalytics: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center'
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
    }
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const disciplineDisplay = discipline === 'Womens' ? "Women's" : "Men's";
  const events = discipline === 'Womens' ? WOMENS_EVENTS : MENS_EVENTS;

  // Helper function to check if a meet has enough competitors for an event
  const hasMinimumCompetitors = (meet: MeetWithTeamScore, event: string): boolean => {
    // Count how many gymnasts competed in this event
    const eventScores = meet.gymnastsWithScores.filter(
      item => {
        const score = item.score.scores[event as keyof typeof item.score.scores];
        return score != null && score > 0;
      }
    );
    return eventScores.length >= countingScoreCount;
  };

  // Helper function to check if a meet has minimum competitors for ALL events
  const hasMinimumCompetitorsAllEvents = (meet: MeetWithTeamScore): boolean => {
    return events.every(event => hasMinimumCompetitors(meet, event));
  };

  // Filter meets that have full teams (all events have minimum competitors)
  const fullTeamMeets = meetsWithScores.filter(hasMinimumCompetitorsAllEvents);

  // Calculate analytics data
  const totalMeets = meetsWithScores.length;
  const totalFullTeamMeets = fullTeamMeets.length;

  const avgTeamScore = totalFullTeamMeets > 0
    ? fullTeamMeets.reduce((sum, m) => sum + m.teamScore, 0) / totalFullTeamMeets
    : 0;
  const bestTeamScore = totalMeets > 0
    ? Math.max(...meetsWithScores.map(m => m.teamScore))
    : 0;

  // Calculate event averages across meets with minimum competitors for that event
  const eventAverages: any = {};
  events.forEach(event => {
    const meetsWithMinCompetitors = meetsWithScores.filter(m => hasMinimumCompetitors(m, event));
    eventAverages[event] = meetsWithMinCompetitors.length > 0
      ? meetsWithMinCompetitors.reduce((sum, m) => sum + (m.teamScoreResult.teamScores[event] || 0), 0) / meetsWithMinCompetitors.length
      : 0;
  });

  // Calculate best team scores per event (use all meets for bests)
  const bestEventScores: any = { allAround: bestTeamScore };
  events.forEach(event => {
    bestEventScores[event] = totalMeets > 0
      ? Math.max(...meetsWithScores.map(m => m.teamScoreResult.teamScores[event] || 0))
      : 0;
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.headerGradient}
        style={styles.header}>
        <Text style={styles.headerTitle}>{level} - {disciplineDisplay}</Text>
        <Text style={styles.headerSubtitle}>Team Scores by Meet</Text>
      </LinearGradient>

      {meetsWithScores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={theme.colors.emptyIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
          </LinearGradient>
          <Text style={styles.emptyText}>No Meets Yet</Text>
          <Text style={styles.emptySubtext}>
            No meets with scores found for {level} - {disciplineDisplay}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }>
          {/* Analytics Section */}
          {meetsWithScores.length > 0 && (
        <LinearGradient
          colors={theme.colors.analyticsCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.analyticsSection}>
          <Text style={styles.sectionTitleAnalytics}>Team Performance Analytics</Text>

          {/* Score Progress Chart */}
          {((selectedEvent === 'allAround' && fullTeamMeets.length >= 2) ||
            (selectedEvent !== 'allAround' && meetsWithScores.filter(m => hasMinimumCompetitors(m, selectedEvent)).length >= 2)) && (
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: selectedEvent === 'allAround'
                    ? fullTeamMeets.slice(0, 8).reverse().map((_, index) => '')
                    : meetsWithScores.filter(m => hasMinimumCompetitors(m, selectedEvent)).slice(0, 8).reverse().map((_, index) => ''),
                  datasets: [{
                    data: selectedEvent === 'allAround'
                      ? fullTeamMeets.slice(0, 8).reverse().map(m => m.teamScore)
                      : meetsWithScores.filter(m => hasMinimumCompetitors(m, selectedEvent)).slice(0, 8).reverse().map(m => m.teamScoreResult.teamScores[selectedEvent] || 0)
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
                {selectedEvent === 'allAround' ? 'Team Total' : EVENT_LABELS[selectedEvent as EventKey]} Score Trend (Last 8 Meets)
              </Text>
            </View>
          )}

          {/* Event Averages */}
          <View style={[
            styles.eventAverages,
            events.length === 4 && styles.eventAveragesWomens
          ]}>
            {events.map(event => (
              <TouchableOpacity
                key={event}
                style={[
                  styles.eventAvg,
                  events.length === 4 && styles.eventAvgWomens,
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
                  {EVENT_LABELS[event]} AVG
                </Text>
                <Text style={[styles.eventAvgValue, selectedEvent === event && styles.eventAvgValueSelected]}>
                  {formatTeamScore(eventAverages[event])}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* All-Around Toggle */}
          <TouchableOpacity
            style={[
              styles.eventAvg,
              { width: '100%', marginBottom: theme.spacing.lg, paddingVertical: theme.spacing.lg },
              selectedEvent === 'allAround' && styles.eventAvgSelected
            ]}
            onPress={() => {
              setSelectedEvent('allAround');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}>
            <Text style={styles.eventAvgLabel}>Team Total AVG</Text>
            <Text style={[styles.eventAvgValue, selectedEvent === 'allAround' && styles.eventAvgValueSelected]}>
              {formatTeamScore(avgTeamScore)}
            </Text>
          </TouchableOpacity>

          {/* Best Team Scores */}
          <View style={styles.personalRecords}>
            <Text style={styles.prTitle}>Best Team Scores</Text>
            <View style={styles.prGrid}>
              {events.map(event => (
                <View key={event} style={styles.prItem}>
                  <Text style={styles.prEvent}>{EVENT_LABELS[event]}</Text>
                  <Text style={styles.prScore}>{formatTeamScore(bestEventScores[event])}</Text>
                </View>
              ))}
              <View style={styles.prItemFull}>
                <Text style={styles.prEvent}>Team Total</Text>
                <Text style={[styles.prScore, styles.prScoreLarge]}>
                  {formatTeamScore(bestEventScores.allAround)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
          )}

          {/* Meets List */}
          {meetsWithScores.map((item) => {
            return (
              <View key={item.meet.id} style={styles.meetCardWrapper}>
                <TouchableOpacity
                  onPress={() => handleMeetPress(item.meet.id)}
                  activeOpacity={0.7}>
                  <LinearGradient
                    colors={theme.colors.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.meetCard}>
                    <View style={styles.meetHeader}>
                      <Text style={styles.meetName}>{item.meet.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                        <View style={styles.teamScoreBadge}>
                          <Text style={styles.teamScoreLabel}>TEAM SCORE</Text>
                          <Text style={styles.teamScoreValue}>{formatTeamScore(item.teamScore)}</Text>
                        </View>
                        <Text style={styles.chevronIcon}>›</Text>
                      </View>
                    </View>

                    <View style={styles.meetMeta}>
                      <Text style={styles.metaText}>📅 {formatDate(item.meet.date)}</Text>
                      {item.meet.location && (
                        <>
                          <Text style={styles.separator}>•</Text>
                          <Text style={styles.metaText}>📍 {item.meet.location}</Text>
                        </>
                      )}
                    </View>

                    <View style={[styles.meetMeta, { marginTop: theme.spacing.xs }]}>
                      <Text style={styles.metaText}>
                        {item.gymnastCount} {item.gymnastCount === 1 ? 'gymnast' : 'gymnasts'} competed
                      </Text>
                      <Text style={styles.separator}>•</Text>
                      <Text style={[styles.metaText, { color: theme.colors.primary }]}>
                        Tap to view details
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
