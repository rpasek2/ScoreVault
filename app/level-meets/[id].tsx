import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { CARD_SHADOW } from '@/constants/theme';
import { getGymnasts, getMeets, getScores } from '@/utils/database';
import { calculateTeamScore, formatTeamScore } from '@/utils/teamScores';
import { Gymnast, Meet, Score } from '@/types';

interface MeetWithTeamScore {
  meet: Meet;
  teamScore: number;
  gymnastCount: number;
}

export default function LevelMeetsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const level = params.level as string;
  const discipline = params.discipline as 'Womens' | 'Mens';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [meetsWithScores, setMeetsWithScores] = useState<MeetWithTeamScore[]>([]);

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

          const { totalScore } = calculateTeamScore(meetScores, discipline, gymnasts);

          return {
            meet,
            teamScore: totalScore,
            gymnastCount: new Set(meetScores.map(s => s.gymnastId)).size
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleMeetPress = (meetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/team-score/[id]',
      params: { id: `${level}|${discipline}|${meetId}`, level, discipline, meetId }
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
      padding: theme.spacing.lg,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    headerTitle: {
      ...theme.typography.h3,
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
      flex: 1
    },
    scrollContent: {
      padding: theme.spacing.base
    },
    meetCardWrapper: {
      marginBottom: theme.spacing.md,
      borderRadius: 16,
      overflow: 'hidden',
      ...CARD_SHADOW
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }>
          {meetsWithScores.map((item) => (
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
                    <View style={styles.teamScoreBadge}>
                      <Text style={styles.teamScoreLabel}>TEAM SCORE</Text>
                      <Text style={styles.teamScoreValue}>{formatTeamScore(item.teamScore)}</Text>
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
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
