import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { Meet, Score, Gymnast } from '@/types';
import { formatDate, formatScore } from '@/utils/seasonUtils';
import FloatingActionButton from '@/components/FloatingActionButton';
import { WOMENS_EVENTS, MENS_EVENTS, EVENT_LABELS, EventKey } from '@/constants/theme';
import { getMeetById, getGymnasts, getScoresByMeet, deleteMeet } from '@/utils/database';

interface ScoreWithGymnast extends Score {
  gymnastName: string;
  gymnastDiscipline: 'Womens' | 'Mens';
}

export default function MeetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [meet, setMeet] = useState<Meet | null>(null);
  const [scores, setScores] = useState<ScoreWithGymnast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const fetchMeetData = async () => {
    if (!id) return;

    try {
      const meetData = await getMeetById(id);
      if (meetData) {
        setMeet(meetData);
        navigation.setOptions({ title: meetData.name });

        // Fetch all gymnasts to map IDs to names and disciplines
        const allGymnasts = await getGymnasts();
        const gymnastsMap: { [key: string]: { name: string; discipline: 'Womens' | 'Mens' } } = {};
        allGymnasts.forEach((gymnast) => {
          gymnastsMap[gymnast.id] = {
            name: gymnast.name,
            discipline: gymnast.discipline || 'Womens'
          };
        });

        // Fetch scores for this meet
        const scoresData = await getScoresByMeet(id);
        const scoresList: ScoreWithGymnast[] = scoresData.map((score) => {
          const gymnastInfo = gymnastsMap[score.gymnastId];
          return {
            ...score,
            gymnastName: gymnastInfo?.name || 'Unknown',
            gymnastDiscipline: gymnastInfo?.discipline || 'Womens'
          };
        });

        // Sort by gymnast name
        scoresList.sort((a, b) => a.gymnastName.localeCompare(b.gymnastName));

        setScores(scoresList);
        setLoading(false);
        setRefreshing(false);
      } else {
        Alert.alert('Error', 'Meet not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching meet:', error);
      Alert.alert('Error', 'Failed to load meet');
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
      elevation: 3
    },
    gymnastName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight
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
    }
  });

  if (loading || !meet) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Meet Header */}
      <View style={styles.meetHeader}>
        <View style={styles.meetHeaderTop}>
          <View style={styles.meetInfo}>
            <Text style={styles.meetName}>{meet.name}</Text>
            <Text style={styles.meetDate}>
              {formatDate(meet.date.toDate())} • {meet.season}
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

      {/* Scores List */}
      {scores.length === 0 ? (
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
                onPress={() => handleScorePress(item.id)}>
                <Text style={styles.gymnastName}>{item.gymnastName}</Text>

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
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <FloatingActionButton onPress={handleAddScore} />
    </View>
  );
}

