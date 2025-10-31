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
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CARD_SHADOW, getCardBorder } from '@/constants/theme';
import { getGymnasts, getMeets, getScores } from '@/utils/database';
import { Gymnast, Meet, Score } from '@/types';

interface LevelDisciplineCombo {
  level: string;
  discipline: 'Womens' | 'Mens';
  gymnastCount: number;
  meetCount: number;
}

export default function TeamsScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allGymnasts, setAllGymnasts] = useState<Gymnast[]>([]);
  const [allMeets, setAllMeets] = useState<Meet[]>([]);
  const [allScores, setAllScores] = useState<Score[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [levelDisciplineCombos, setLevelDisciplineCombos] = useState<LevelDisciplineCombo[]>([]);

  const fetchData = async () => {
    try {
      const [gymnasts, meets, scores] = await Promise.all([
        getGymnasts(),
        getMeets(),
        getScores()
      ]);

      setAllGymnasts(gymnasts);
      setAllMeets(meets);
      setAllScores(scores);

      // Extract unique seasons from meets that have scores
      const meetIdsWithScores = new Set(scores.map(s => s.meetId));
      const seasonsWithScores = meets
        .filter(m => meetIdsWithScores.has(m.id))
        .map(m => m.season);

      const seasons = Array.from(new Set(seasonsWithScores)).sort().reverse();
      setAvailableSeasons(seasons);

      // Set selected season to most recent if not already set
      if (!selectedSeason && seasons.length > 0) {
        setSelectedSeason(seasons[0]);
      }

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
    }, [])
  );

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate level-discipline combos when data or season changes
  useEffect(() => {
    if (!selectedSeason || allScores.length === 0) {
      setLevelDisciplineCombos([]);
      return;
    }

    // Get meet IDs for selected season
    const seasonMeetIds = new Set(
      allMeets.filter(m => m.season === selectedSeason).map(m => m.id)
    );

    // Get scores from those meets
    const seasonScores = allScores.filter(s => seasonMeetIds.has(s.meetId));

    // Build level-discipline combinations
    const combosMap = new Map<string, LevelDisciplineCombo>();

    seasonScores.forEach(score => {
      if (!score.level) return;

      const gymnast = allGymnasts.find(g => g.id === score.gymnastId);
      if (!gymnast) return;

      const key = `${score.level}-${gymnast.discipline}`;

      if (!combosMap.has(key)) {
        combosMap.set(key, {
          level: score.level,
          discipline: gymnast.discipline,
          gymnastCount: 0,
          meetCount: 0
        });
      }
    });

    // Count gymnasts and meets for each combo
    const combos = Array.from(combosMap.values()).map(combo => {
      // Get gymnast IDs for this level-discipline in this season
      const gymnastIds = new Set(
        seasonScores
          .filter(s => {
            const g = allGymnasts.find(gymnast => gymnast.id === s.gymnastId);
            return s.level === combo.level && g?.discipline === combo.discipline;
          })
          .map(s => s.gymnastId)
      );

      // Get unique meets for this level-discipline
      const meetIds = new Set(
        seasonScores
          .filter(s => {
            const g = allGymnasts.find(gymnast => gymnast.id === s.gymnastId);
            return s.level === combo.level && g?.discipline === combo.discipline;
          })
          .map(s => s.meetId)
      );

      return {
        ...combo,
        gymnastCount: gymnastIds.size,
        meetCount: meetIds.size
      };
    });

    // Sort combos
    setLevelDisciplineCombos(sortLevelDisciplineCombos(combos));
  }, [selectedSeason, allScores, allGymnasts, allMeets]);

  const sortLevelDisciplineCombos = (combos: LevelDisciplineCombo[]) => {
    return combos.sort((a, b) => {
      // First sort by level
      const levelOrder = getLevelOrder(a.level) - getLevelOrder(b.level);
      if (levelOrder !== 0) return levelOrder;

      // Then by discipline (Women's first)
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePreviousSeason = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentIndex = availableSeasons.indexOf(selectedSeason);
    if (currentIndex < availableSeasons.length - 1) {
      setSelectedSeason(availableSeasons[currentIndex + 1]);
    }
  };

  const handleNextSeason = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentIndex = availableSeasons.indexOf(selectedSeason);
    if (currentIndex > 0) {
      setSelectedSeason(availableSeasons[currentIndex - 1]);
    }
  };

  const handleLevelPress = (level: string, discipline: 'Womens' | 'Mens') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/level-meets/[id]',
      params: { id: `${level}|${discipline}`, level, discipline }
    });
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
    seasonNavigator: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.md
    },
    arrowButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    arrowButtonDisabled: {
      opacity: 0.3
    },
    arrowText: {
      fontSize: 28,
      color: theme.colors.primary,
      fontWeight: '300',
      lineHeight: 28
    },
    arrowTextDisabled: {
      color: theme.colors.textTertiary
    },
    seasonDisplay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg
    },
    seasonPickerText: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '700'
    },
    content: {
      flex: 1
    },
    scrollContent: {
      padding: theme.spacing.base
    },
    sectionHeader: {
      ...theme.typography.captionBold,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.lg,
      letterSpacing: 0.5
    },
    firstSectionHeader: {
      marginTop: 0
    },
    teamCardWrapper: {
      marginBottom: theme.spacing.md,
      borderRadius: 16,
      overflow: 'hidden',
      ...CARD_SHADOW,
      ...getCardBorder(isDark)
    },
    teamCard: {
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center'
    },
    teamInfo: {
      flex: 1
    },
    teamName: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs
    },
    teamMeta: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary
    },
    chevron: {
      fontSize: 28,
      color: theme.colors.border,
      fontWeight: '300'
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
    infoCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.base,
      marginTop: theme.spacing.base,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    infoIcon: {
      fontSize: 18
    },
    infoText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 18
    }
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const currentSeasonIndex = availableSeasons.indexOf(selectedSeason);
  const canGoPrevious = currentSeasonIndex < availableSeasons.length - 1;
  const canGoNext = currentSeasonIndex > 0;

  // Group combos by discipline
  const womensCombos = levelDisciplineCombos.filter(c => c.discipline === 'Womens');
  const mensCombos = levelDisciplineCombos.filter(c => c.discipline === 'Mens');

  return (
    <View style={styles.container}>
      {/* Season Navigator */}
      {availableSeasons.length > 0 && (
        <View style={styles.seasonNavigator}>
          <TouchableOpacity
            style={[styles.arrowButton, !canGoPrevious && styles.arrowButtonDisabled]}
            onPress={handlePreviousSeason}
            disabled={!canGoPrevious}
            activeOpacity={0.7}>
            <Text style={[styles.arrowText, !canGoPrevious && styles.arrowTextDisabled]}>‹</Text>
          </TouchableOpacity>

          <View style={styles.seasonDisplay}>
            <Text style={styles.seasonPickerText}>{selectedSeason}</Text>
          </View>

          <TouchableOpacity
            style={[styles.arrowButton, !canGoNext && styles.arrowButtonDisabled]}
            onPress={handleNextSeason}
            disabled={!canGoNext}
            activeOpacity={0.7}>
            <Text style={[styles.arrowText, !canGoNext && styles.arrowTextDisabled]}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Info Card - Only show when there are teams */}
      {levelDisciplineCombos.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            {t('teams.teamsInfo')}
          </Text>
        </View>
      )}

      {levelDisciplineCombos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={theme.colors.emptyIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
          </LinearGradient>
          <Text style={styles.emptyText}>
            {allScores.length === 0 || !selectedSeason ? t('teams.noTeams') : t('teams.noTeamsForSeason', { season: selectedSeason })}
          </Text>
          <Text style={styles.emptySubtext}>
            {allScores.length === 0 || !selectedSeason
              ? t('teams.noTeamsSubtext')
              : t('teams.noTeamsForSeasonSubtext')
            }
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
          {/* Women's Section */}
          {womensCombos.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, styles.firstSectionHeader]}>{t('teams.womensArtistic')}</Text>
              {womensCombos.map((combo) => (
                <View key={`${combo.level}-${combo.discipline}`} style={styles.teamCardWrapper}>
                  <TouchableOpacity
                    onPress={() => handleLevelPress(combo.level, combo.discipline)}
                    activeOpacity={0.7}>
                    <LinearGradient
                      colors={theme.colors.cardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.teamCard}>
                      <View style={styles.teamInfo}>
                        <Text style={styles.teamName}>{combo.level} - {t('gymnasts.womens')}</Text>
                        <Text style={styles.teamMeta}>
                          {combo.gymnastCount} {combo.gymnastCount === 1 ? t('teams.gymnast') : t('teams.gymnastsPlural')} • {combo.meetCount} {combo.meetCount === 1 ? t('gymnasts.meets') : t('gymnasts.meetsPlural')}
                        </Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Men's Section */}
          {mensCombos.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>{t('teams.mensArtistic')}</Text>
              {mensCombos.map((combo) => (
                <View key={`${combo.level}-${combo.discipline}`} style={styles.teamCardWrapper}>
                  <TouchableOpacity
                    onPress={() => handleLevelPress(combo.level, combo.discipline)}
                    activeOpacity={0.7}>
                    <LinearGradient
                      colors={theme.colors.cardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.teamCard}>
                      <View style={styles.teamInfo}>
                        <Text style={styles.teamName}>{combo.level} - {t('gymnasts.mens')}</Text>
                        <Text style={styles.teamMeta}>
                          {combo.gymnastCount} {combo.gymnastCount === 1 ? t('teams.gymnast') : t('teams.gymnastsPlural')} • {combo.meetCount} {combo.meetCount === 1 ? t('gymnasts.meets') : t('gymnasts.meetsPlural')}
                        </Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
