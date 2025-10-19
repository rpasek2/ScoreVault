import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScoreCardData, ScoreCardConfig } from '@/types';
import { SCORE_CARD_GRADIENTS } from '@/constants/gradients';

interface ScoreCardProps {
  data: ScoreCardData;
  config: ScoreCardConfig;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ data, config }) => {
  const gradient = SCORE_CARD_GRADIENTS[config.gradientName];
  const isStory = config.aspectRatio === 'story';

  // Get medal emoji for placement
  const getMedalEmoji = (placement?: number): string => {
    if (!placement) return '';
    if (placement === 1) return '🥇';
    if (placement === 2) return '🥈';
    if (placement === 3) return '🥉';
    if (placement <= 10) return '🏅';
    return '';
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get events to display based on discipline
  const getEvents = () => {
    if (data.discipline === 'Womens') {
      return [
        { name: 'Vault', score: data.scores.vault, placement: data.placements.vault },
        { name: 'Bars', score: data.scores.bars, placement: data.placements.bars },
        { name: 'Beam', score: data.scores.beam, placement: data.placements.beam },
        { name: 'Floor', score: data.scores.floor, placement: data.placements.floor }
      ];
    } else {
      return [
        { name: 'Floor', score: data.scores.floor, placement: data.placements.floor },
        { name: 'Pommel Horse', score: data.scores.pommelHorse, placement: data.placements.pommelHorse },
        { name: 'Rings', score: data.scores.rings, placement: data.placements.rings },
        { name: 'Vault', score: data.scores.vault, placement: data.placements.vault },
        { name: 'Parallel Bars', score: data.scores.parallelBars, placement: data.placements.parallelBars },
        { name: 'High Bar', score: data.scores.highBar, placement: data.placements.highBar }
      ];
    }
  };

  const events = getEvents();
  const containerStyle = isStory ? styles.containerStory : styles.containerSquare;
  const contentStyle = isStory ? styles.contentStory : styles.contentSquare;

  // Card content JSX (reused for both background types)
  const cardContent = (
    <View style={contentStyle}>
      {/* Header - Gymnast Info */}
      <View style={styles.header}>
        <Text style={styles.gymnastName}>{data.gymnastName}</Text>
        <Text style={styles.gymnastInfo}>
          {data.level} • {data.discipline === 'Womens' ? "Women's" : "Men's"}
        </Text>
      </View>

      {/* Meet Info */}
      <View style={styles.meetCard}>
        <Text style={styles.meetName}>{data.meetName}</Text>
        {data.location && <Text style={styles.meetLocation}>{data.location}</Text>}
        <Text style={styles.meetDate}>{formatDate(data.meetDate)}</Text>
      </View>

      {/* Event Scores */}
      <View style={styles.scoresCard}>
        {events.map((event, index) => (
          event.score !== undefined && (
            <View key={index} style={styles.scoreRow}>
              <Text style={styles.eventName}>{event.name}</Text>
              <View style={styles.scoreValueContainer}>
                <Text style={styles.scoreValue}>{event.score.toFixed(1)}</Text>
                {event.placement && (
                  <View style={styles.placementContainer}>
                    <Text style={styles.placementEmoji}>{getMedalEmoji(event.placement)}</Text>
                    <Text style={styles.placementText}>
                      {event.placement === 1 ? '1st' :
                       event.placement === 2 ? '2nd' :
                       event.placement === 3 ? '3rd' :
                       `${event.placement}th`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )
        ))}
      </View>

      {/* All-Around */}
      <View style={styles.allAroundCard}>
        <Text style={styles.allAroundLabel}>All-Around</Text>
        <View style={styles.allAroundValueContainer}>
          <Text style={styles.allAroundValue}>{data.scores.allAround.toFixed(1)}</Text>
          {data.placements.allAround && (
            <View style={styles.allAroundPlacementContainer}>
              <Text style={styles.allAroundPlacementEmoji}>
                {getMedalEmoji(data.placements.allAround)}
              </Text>
              <Text style={styles.allAroundPlacementText}>
                {data.placements.allAround === 1 ? '1st' :
                 data.placements.allAround === 2 ? '2nd' :
                 data.placements.allAround === 3 ? '3rd' :
                 `${data.placements.allAround}th`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Branding */}
      <Text style={styles.branding}>Tracked with ScoreVault 📊</Text>
    </View>
  );

  return (
    <View style={containerStyle}>
      {config.backgroundType === 'photo' && config.photoUri ? (
        <ImageBackground
          source={{ uri: config.photoUri }}
          style={styles.photoBackground}
          resizeMode="cover">
          {/* Dark overlay for text readability */}
          <View style={styles.photoOverlay}>
            {cardContent}
          </View>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={gradient.colors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          {cardContent}
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerSquare: {
    width: 1080,
    height: 1080,
    backgroundColor: 'transparent'
  },
  containerStory: {
    width: 607.5, // 1080 / (16/9) to maintain proper ratio
    height: 1080,
    backgroundColor: 'transparent'
  },
  gradient: {
    flex: 1,
    padding: 40
  },
  photoBackground: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  photoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 50% dark overlay
    padding: 40
  },
  contentSquare: {
    flex: 1,
    justifyContent: 'space-between'
  },
  contentStory: {
    flex: 1,
    justifyContent: 'space-evenly'
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  gymnastName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    textAlign: 'center'
  },
  gymnastInfo: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginTop: 8
  },
  meetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  meetName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 8
  },
  meetLocation: {
    fontSize: 24,
    fontWeight: '500',
    color: '#6B6E80',
    textAlign: 'center',
    marginBottom: 4
  },
  meetDate: {
    fontSize: 22,
    fontWeight: '400',
    color: '#6B6E80',
    textAlign: 'center'
  },
  scoresCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(107, 110, 128, 0.15)'
  },
  eventName: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1
  },
  scoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6B6EFF',
    minWidth: 60,
    textAlign: 'right'
  },
  placementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 80
  },
  placementEmoji: {
    fontSize: 24
  },
  placementText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#6B6E80'
  },
  allAroundCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  allAroundLabel: {
    fontSize: 28,
    fontWeight: '600',
    color: '#6B6E80',
    marginBottom: 12
  },
  allAroundValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  allAroundValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#6B6EFF'
  },
  allAroundPlacementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  allAroundPlacementEmoji: {
    fontSize: 40
  },
  allAroundPlacementText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6B6E80'
  },
  branding: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginTop: 16
  }
});
