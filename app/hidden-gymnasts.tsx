import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { CARD_SHADOW } from '@/constants/theme';
import { Gymnast } from '@/types';
import { getHiddenGymnasts, unhideGymnast } from '@/utils/database';

export default function HiddenGymnastsScreen() {
  const [hiddenGymnasts, setHiddenGymnasts] = useState<Gymnast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const fetchHiddenGymnasts = async () => {
    try {
      const gymnasts = await getHiddenGymnasts();
      setHiddenGymnasts(gymnasts);
    } catch (error) {
      console.error('Error fetching hidden gymnasts:', error);
      Alert.alert('Error', 'Failed to load hidden gymnasts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHiddenGymnasts();
  }, []);

  const handleUnhide = (gymnast: Gymnast) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Unhide Gymnast',
      `Restore "${gymnast.name}" to the active roster?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'Unhide',
          style: 'default',
          onPress: async () => {
            try {
              await unhideGymnast(gymnast.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              // Refresh the list
              await fetchHiddenGymnasts();
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', error.message || 'Failed to unhide gymnast');
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
    header: {
      paddingTop: 60,
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.xl
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
    content: {
      padding: theme.spacing.base
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxxl,
      paddingHorizontal: theme.spacing.xl
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg
    },
    emptyIcon: {
      fontSize: 40
    },
    emptyText: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      fontWeight: '600'
    },
    emptySubtext: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20
    },
    gymnastCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderRadius: 16,
      ...CARD_SHADOW
    },
    gymnastInfo: {
      flex: 1
    },
    gymnastName: {
      ...theme.typography.h5,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs
    },
    gymnastDetails: {
      flexDirection: 'row',
      gap: theme.spacing.sm
    },
    detailBadge: {
      backgroundColor: theme.colors.surfaceSecondary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: 6
    },
    detailText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500'
    },
    unhideButton: {
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginLeft: theme.spacing.md
    },
    unhideButtonText: {
      ...theme.typography.bodySmall,
      color: '#FFFFFF',
      fontWeight: '600'
    }
  });

  if (loading) {
    return (
      <LinearGradient
        colors={theme.colors.headerGradient}
        style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.headerGradient}
        style={styles.header}>
        <Text style={styles.headerTitle}>Hidden Gymnasts</Text>
        <Text style={styles.headerSubtitle}>
          {hiddenGymnasts.length} {hiddenGymnasts.length === 1 ? 'gymnast' : 'gymnasts'} hidden
        </Text>
      </LinearGradient>

      {hiddenGymnasts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={theme.colors.emptyIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>👁️</Text>
          </LinearGradient>
          <Text style={styles.emptyText}>No Hidden Gymnasts</Text>
          <Text style={styles.emptySubtext}>
            When you hide a gymnast, they'll appear here. You can unhide them anytime to restore them to the active roster.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {hiddenGymnasts.map((gymnast) => (
            <LinearGradient
              key={gymnast.id}
              colors={theme.colors.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gymnastCard}>
              <View style={styles.gymnastInfo}>
                <Text style={styles.gymnastName}>{gymnast.name}</Text>
                <View style={styles.gymnastDetails}>
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailText}>{gymnast.level}</Text>
                  </View>
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailText}>
                      {gymnast.discipline === 'Mens' ? "Men's" : "Women's"}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleUnhide(gymnast)}
                activeOpacity={0.7}>
                <LinearGradient
                  colors={theme.colors.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.unhideButton}>
                  <Text style={styles.unhideButtonText}>Unhide</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
