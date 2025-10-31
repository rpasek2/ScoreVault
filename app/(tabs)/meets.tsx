import FloatingActionButton from '@/components/FloatingActionButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Meet, Timestamp } from '@/types';
import * as Haptics from 'expo-haptics';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UI_PALETTE, CARD_SHADOW, getCardBorder } from '@/constants/theme';
import { getMeets } from '@/utils/database';

export default function MeetsScreen() {
  const [allMeets, setAllMeets] = useState<Meet[]>([]);
  const [filteredMeets, setFilteredMeets] = useState<Meet[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const fetchMeets = async () => {
    try {
      const meetsList = await getMeets();

      // Sort by date (earliest first)
      meetsList.sort((a, b) => {
        const dateA = a.date.toMillis?.() || new Date(a.date as any).getTime();
        const dateB = b.date.toMillis?.() || new Date(b.date as any).getTime();
        return dateA - dateB;
      });

      // Extract unique seasons
      const seasons = Array.from(new Set(meetsList.map(m => m.season))).sort().reverse();
      setAvailableSeasons(seasons);

      // Set selected season to most recent if not already set
      if (!selectedSeason && seasons.length > 0) {
        setSelectedSeason(seasons[0]);
      }

      setAllMeets(meetsList);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching meets:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMeets();
    }, [])
  );

  useEffect(() => {
    fetchMeets();
  }, []);

  // Filter meets when season changes
  useEffect(() => {
    if (selectedSeason) {
      setFilteredMeets(allMeets.filter(meet => meet.season === selectedSeason));
    } else {
      setFilteredMeets(allMeets);
    }
  }, [selectedSeason, allMeets]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMeets();
  };

  const handleAddMeet = () => {
    router.push('/add-meet');
  };

  const handleMeetPress = (meetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/meet/[id]', params: { id: meetId } });
  };

  const isUpcoming = (date: Timestamp | Date) => {
    // Check if it's a Timestamp object with toMillis method
    if (typeof date === 'object' && date !== null && 'toMillis' in date) {
      const timestamp = date as Timestamp;
      const meetDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.toMillis!());
      return meetDate > new Date();
    }
    // Otherwise treat as Date
    const meetDate = date as Date;
    return meetDate > new Date();
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
    meetCardWrapper: {
      marginBottom: theme.spacing.md,
      borderRadius: 28,
      overflow: 'hidden',
      ...CARD_SHADOW,
      ...getCardBorder(isDark)
    },
    meetCard: {
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center'
    },
    dateBadge: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.base,
      borderWidth: 2,
      borderColor: theme.colors.border
    },
    dateBadgeUpcoming: {
      backgroundColor: theme.colors.primary + '15',
      borderColor: theme.colors.primary
    },
    dateDay: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      lineHeight: 28
    },
    dateMonth: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '700',
      letterSpacing: 0.5
    },
    dateTextUpcoming: {
      color: theme.colors.primary
    },
    meetInfo: {
      flex: 1
    },
    meetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
      gap: theme.spacing.sm
    },
    meetName: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      flex: 1,
      fontWeight: '600'
    },
    upcomingBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.xs
    },
    upcomingText: {
      ...theme.typography.caption,
      color: theme.colors.surface,
      fontWeight: '700',
      fontSize: 9,
      letterSpacing: 0.5
    },
    meetMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    seasonBadge: {
      backgroundColor: theme.colors.surfaceSecondary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.xs,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    seasonBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      fontSize: 11
    },
    location: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      flex: 1
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

  const currentSeasonIndex = availableSeasons.indexOf(selectedSeason);
  const canGoPrevious = currentSeasonIndex < availableSeasons.length - 1;
  const canGoNext = currentSeasonIndex > 0;

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

      {filteredMeets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={theme.colors.emptyIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
          </LinearGradient>
          <Text style={styles.emptyText}>
            {allMeets.length === 0 ? t('meets.noMeets') : `${t('meets.noMeets')} ${selectedSeason}`}
          </Text>
          <Text style={styles.emptySubtext}>
            {allMeets.length === 0
              ? t('meets.noMeetsSubtext')
              : t('meets.noMeetsSubtext')
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMeets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const upcoming = isUpcoming(item.date);
            return (
              <View style={styles.meetCardWrapper}>
                <TouchableOpacity
                  onPress={() => handleMeetPress(item.id)}
                  activeOpacity={0.7}>
                  <LinearGradient
                    colors={theme.colors.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.meetCard}>

                {/* Date Badge */}
                <View style={[
                  styles.dateBadge,
                  upcoming && styles.dateBadgeUpcoming
                ]}>
                  <Text style={[
                    styles.dateDay,
                    upcoming && styles.dateTextUpcoming
                  ]}>
                    {typeof item.date === 'object' && item.date !== null && 'toMillis' in item.date
                      ? (item.date.toDate ? item.date.toDate() : new Date(item.date.toMillis!())).getDate()
                      : new Date(item.date as any).getDate()}
                  </Text>
                  <Text style={[
                    styles.dateMonth,
                    upcoming && styles.dateTextUpcoming
                  ]}>
                    {typeof item.date === 'object' && item.date !== null && 'toMillis' in item.date
                      ? (item.date.toDate ? item.date.toDate() : new Date(item.date.toMillis!())).toLocaleString('en-US', { month: 'short' }).toUpperCase()
                      : new Date(item.date as any).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                  </Text>
                </View>

                {/* Meet Info */}
                <View style={styles.meetInfo}>
                  <View style={styles.meetHeader}>
                    <Text style={styles.meetName}>{item.name}</Text>
                    {upcoming && (
                      <View style={styles.upcomingBadge}>
                        <Text style={styles.upcomingText}>{t('meets.upcoming')}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.meetMeta}>
                    <View style={styles.seasonBadge}>
                      <Text style={styles.seasonBadgeText}>{item.season}</Text>
                    </View>
                    {item.location && (
                      <Text style={styles.location}>📍 {item.location}</Text>
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
      )}
      <FloatingActionButton onPress={handleAddMeet} />
    </View>
  );
}
