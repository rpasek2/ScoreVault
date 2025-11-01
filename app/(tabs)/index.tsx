import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Image
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTutorial } from '@/contexts/TutorialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Gymnast } from '@/types';
import FloatingActionButton from '@/components/FloatingActionButton';
import { getInitials, UI_PALETTE, CARD_SHADOW, getCardBorder } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { getGymnasts, getScoreCountByGymnast } from '@/utils/database';

interface GymnastWithStats extends Gymnast {
  scoreCount: number;
}

interface GymnastGroup {
  level: string;
  discipline: 'Womens' | 'Mens';
  gymnasts: GymnastWithStats[];
  isCollapsible: boolean;
}

export default function GymnastsScreen() {
  const [gymnasts, setGymnasts] = useState<GymnastWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { checkAndStartTutorial } = useTutorial();
  const { user } = useAuth();
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

  // Check if tutorial should be shown after user is logged in and screen loads
  useEffect(() => {
    const initTutorial = async () => {
      // Only check tutorial if user is logged in and data has finished loading
      if (user && !loading) {
        // Small delay to ensure everything is rendered
        setTimeout(async () => {
          await checkAndStartTutorial();
        }, 500);
      }
    };

    initTutorial();
  }, [user, loading]);

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

  // Group gymnasts by level and discipline
  const groupGymnasts = (): GymnastGroup[] => {
    const groups = new Map<string, GymnastWithStats[]>();

    gymnasts.forEach((gymnast) => {
      const key = `${gymnast.level}-${gymnast.discipline}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(gymnast);
    });

    // Check if ANY group has more than 3 gymnasts
    let shouldAllBeCollapsible = false;
    for (const gymnastsList of groups.values()) {
      if (gymnastsList.length > 3) {
        shouldAllBeCollapsible = true;
        break;
      }
    }

    const result: GymnastGroup[] = [];
    groups.forEach((gymnastsList, key) => {
      const [level, discipline] = key.split('-');
      result.push({
        level,
        discipline: discipline as 'Womens' | 'Mens',
        gymnasts: gymnastsList.sort((a, b) => a.name.localeCompare(b.name)),
        isCollapsible: shouldAllBeCollapsible
      });
    });

    // Sort groups by level, then discipline
    return result.sort((a, b) => {
      const levelA = getLevelOrder(a.level);
      const levelB = getLevelOrder(b.level);
      if (levelA !== levelB) return levelA - levelB;
      return a.discipline === 'Womens' ? -1 : 1;
    });
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

  const toggleSection = (level: string, discipline: string) => {
    const key = `${level}-${discipline}`;
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(key)) {
      newCollapsed.delete(key);
    } else {
      newCollapsed.add(key);
    }
    setCollapsedSections(newCollapsed);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const isSectionCollapsed = (level: string, discipline: string): boolean => {
    return collapsedSections.has(`${level}-${discipline}`);
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
    scrollContent: {
      padding: theme.spacing.base,
      paddingBottom: 100
    },
    sectionCard: {
      marginBottom: theme.spacing.lg,
      borderRadius: 28,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      ...CARD_SHADOW,
      ...getCardBorder(isDark)
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface
    },
    sectionHeaderText: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      flex: 1
    },
    sectionCount: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm
    },
    sectionChevron: {
      fontSize: 24,
      color: theme.colors.textSecondary,
      fontWeight: '300',
      marginLeft: theme.spacing.sm
    },
    sectionDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.lg
    },
    gymnastCardWrapper: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    gymnastCardWrapperLast: {
      borderBottomWidth: 0
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
    avatarImage: {
      width: 64,
      height: 64,
      borderRadius: 32
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
      backgroundColor: isDark ? 'rgba(107, 110, 255, 0.3)' : 'rgba(107, 110, 255, 0.12)',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.md
    },
    levelText: {
      ...theme.typography.caption,
      color: isDark ? '#A5A8FF' : theme.colors.primary,
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
      color: theme.colors.textSecondary,
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

  const groups = groupGymnasts();

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
          <Text style={styles.emptyText}>{t('gymnasts.noGymnasts')}</Text>
          <Text style={styles.emptySubtext}>
            {t('gymnasts.noGymnastsSubtext')}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }>
          {groups.map((group) => {
            const isCollapsed = isSectionCollapsed(group.level, group.discipline);
            const shouldShowGymnasts = !group.isCollapsible || !isCollapsed;

            return (
              <View key={`${group.level}-${group.discipline}`} style={styles.sectionCard}>
                {/* Section Header */}
                <TouchableOpacity
                  onPress={() => group.isCollapsible && toggleSection(group.level, group.discipline)}
                  disabled={!group.isCollapsible}
                  activeOpacity={0.7}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>
                      {group.level} - {group.discipline === 'Womens' ? t('gymnasts.womens') : t('gymnasts.mens')}
                      <Text style={styles.sectionCount}> ({group.gymnasts.length})</Text>
                    </Text>
                    {group.isCollapsible && (
                      <Text style={styles.sectionChevron}>
                        {isCollapsed ? '›' : '⌄'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Divider after header if expanded */}
                {shouldShowGymnasts && group.gymnasts.length > 0 && (
                  <View style={styles.sectionDivider} />
                )}

                {/* Gymnast Cards */}
                {shouldShowGymnasts && group.gymnasts.map((gymnast, index) => (
                  <View
                    key={gymnast.id}
                    style={[
                      styles.gymnastCardWrapper,
                      index === group.gymnasts.length - 1 && styles.gymnastCardWrapperLast
                    ]}>
                    <TouchableOpacity
                      onPress={() => handleGymnastPress(gymnast.id)}
                      activeOpacity={0.7}>
                      <View style={styles.gymnastCard}>
                        {/* Avatar with Photo or Initials */}
                        <View style={styles.avatarContainer}>
                          {gymnast.photoUri ? (
                            <Image source={{ uri: gymnast.photoUri }} style={styles.avatarImage} />
                          ) : (
                            <LinearGradient
                              colors={theme.colors.avatarGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.avatar}>
                              <Text style={styles.avatarText}>{getInitials(gymnast.name)}</Text>
                            </LinearGradient>
                          )}
                        </View>

                        {/* Gymnast Info */}
                        <View style={styles.gymnastInfo}>
                          <Text style={styles.gymnastName}>{gymnast.name}</Text>
                          <View style={styles.metaRow}>
                            {gymnast.scoreCount > 0 && (
                              <Text style={styles.scoreCountText}>
                                {gymnast.scoreCount} {gymnast.scoreCount === 1 ? t('gymnasts.meets') : t('gymnasts.meetsPlural')}
                              </Text>
                            )}
                          </View>
                        </View>

                        {/* Chevron */}
                        <View style={styles.chevronContainer}>
                          <Text style={styles.chevron}>›</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
      <FloatingActionButton onPress={handleAddGymnast} testID="fab-add-gymnast" />
    </View>
  );
}
