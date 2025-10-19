import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { Gymnast } from '@/types';
import FloatingActionButton from '@/components/FloatingActionButton';
import { getInitials, UI_PALETTE, CARD_SHADOW } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { getGymnasts, getScoreCountByGymnast } from '@/utils/database';

interface GymnastWithStats extends Gymnast {
  scoreCount: number;
}

export default function GymnastsScreen() {
  const [gymnasts, setGymnasts] = useState<GymnastWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const fetchGymnastsWithStats = async () => {
    try {
      // Fetch gymnasts from local database
      const gymnastsList = await getGymnasts();

      // Fetch score counts for each gymnast
      const gymnastsWithStats: GymnastWithStats[] = await Promise.all(
        gymnastsList.map(async (gymnast) => {
          const scoreCount = await getScoreCountByGymnast(gymnast.id);
          return {
            ...gymnast,
            scoreCount
          };
        })
      );

      setGymnasts(gymnastsWithStats);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching gymnasts:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchGymnastsWithStats();
    }, [])
  );

  useEffect(() => {
    fetchGymnastsWithStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGymnastsWithStats();
  };

  const handleAddGymnast = () => {
    router.push('/add-gymnast');
  };

  const handleGymnastPress = (gymnastId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/gymnast/${gymnastId}`);
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
    listContent: {
      padding: theme.spacing.base
    },
    gymnastCardWrapper: {
      marginBottom: theme.spacing.md,
      borderRadius: 28,
      overflow: 'hidden',
      ...CARD_SHADOW
    },
    gymnastCard: {
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center'
    },
    avatarContainer: {
      position: 'relative',
      marginRight: theme.spacing.lg
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    },
    avatarText: {
      ...theme.typography.h3,
      color: theme.colors.surface,
      fontWeight: '700'
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.accent,
      borderRadius: theme.borderRadius.full,
      minWidth: 24,
      height: 24,
      paddingHorizontal: 6,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.surface,
      ...theme.shadows.small
    },
    badgeText: {
      ...theme.typography.caption,
      color: theme.colors.surface,
      fontWeight: '700',
      fontSize: 11
    },
    gymnastInfo: {
      flex: 1
    },
    gymnastName: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
      fontWeight: '600'
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    levelBadge: {
      backgroundColor: 'rgba(107, 110, 255, 0.12)',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.md
    },
    levelText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600'
    },
    scoreCountText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary
    },
    chevronContainer: {
      marginLeft: theme.spacing.sm
    },
    chevron: {
      fontSize: 28,
      color: theme.colors.border,
      fontWeight: '300'
    }
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {gymnasts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={theme.colors.emptyIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
          </LinearGradient>
          <Text style={styles.emptyText}>No Gymnasts Yet</Text>
          <Text style={styles.emptySubtext}>
            Add your first gymnast to start tracking their progress and scores
          </Text>
        </View>
      ) : (
        <FlatList
          data={gymnasts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.gymnastCardWrapper}>
              <TouchableOpacity
                onPress={() => handleGymnastPress(item.id)}
                activeOpacity={0.7}>
                <LinearGradient
                  colors={theme.colors.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gymnastCard}>

                  {/* Avatar with Initials */}
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={theme.colors.avatarGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                    </LinearGradient>
                  </View>

                  {/* Gymnast Info */}
                  <View style={styles.gymnastInfo}>
                    <Text style={styles.gymnastName}>{item.name}</Text>
                    <View style={styles.metaRow}>
                      {item.level && (
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelText}>{item.level}</Text>
                        </View>
                      )}
                      {item.scoreCount > 0 && (
                        <Text style={styles.scoreCountText}>
                          {item.scoreCount} {item.scoreCount === 1 ? 'meet' : 'meets'}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Chevron */}
                  <View style={styles.chevronContainer}>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
      <FloatingActionButton onPress={handleAddGymnast} />
    </View>
  );
}
