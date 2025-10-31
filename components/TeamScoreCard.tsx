import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TeamScoreCardData, ScoreCardConfig } from '@/types';
import { SCORE_CARD_GRADIENTS, DECORATIVE_ICON_OPTIONS } from '@/constants/gradients';

interface TeamScoreCardProps {
  data: TeamScoreCardData;
  config: ScoreCardConfig;
}

export const TeamScoreCard: React.FC<TeamScoreCardProps> = ({ data, config }) => {
  const gradient = SCORE_CARD_GRADIENTS[config.gradientName];
  const isStory = config.aspectRatio === 'story';
  const iconConfig = DECORATIVE_ICON_OPTIONS.find(opt => opt.type === config.decorativeIcon) || DECORATIVE_ICON_OPTIONS[0];

  // Extract accent color from gradient for dynamic theming
  const accentColor = gradient.colors[0];

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get medal emoji for placement
  const getMedalEmoji = (placement?: number): string => {
    if (!placement) return '';
    if (placement === 1) return '🥇';
    if (placement === 2) return '🥈';
    if (placement === 3) return '🥉';
    if (placement <= 10) return '🏅';
    return '';
  };

  // Get placement background color
  const getPlacementColor = (placement?: number): string => {
    if (!placement) return 'transparent';
    if (placement === 1) return '#FFD700';
    if (placement === 2) return '#C0C0C0';
    if (placement === 3) return '#CD7F32';
    return '#6B6EFF';
  };

  // Get events to display based on discipline
  const getEvents = () => {
    if (data.discipline === 'Womens') {
      return [
        { name: 'Vault', score: data.teamScores.vault, placement: data.teamPlacements?.vault },
        { name: 'Bars', score: data.teamScores.bars, placement: data.teamPlacements?.bars },
        { name: 'Beam', score: data.teamScores.beam, placement: data.teamPlacements?.beam },
        { name: 'Floor', score: data.teamScores.floor, placement: data.teamPlacements?.floor }
      ];
    } else {
      return [
        { name: 'Floor', score: data.teamScores.floor, placement: data.teamPlacements?.floor },
        { name: 'Pommel Horse', score: data.teamScores.pommelHorse, placement: data.teamPlacements?.pommelHorse },
        { name: 'Rings', score: data.teamScores.rings, placement: data.teamPlacements?.rings },
        { name: 'Vault', score: data.teamScores.vault, placement: data.teamPlacements?.vault },
        { name: 'Parallel Bars', score: data.teamScores.parallelBars, placement: data.teamPlacements?.parallelBars },
        { name: 'High Bar', score: data.teamScores.highBar, placement: data.teamPlacements?.highBar }
      ];
    }
  };

  const events = getEvents();
  const containerStyle = isStory ? styles.containerStory : styles.containerSquare;
  const contentStyle = isStory ? styles.contentStory : styles.contentSquare;
  const eventBoxWidth = data.discipline === 'Womens' ? '48%' : '31%';

  // More transparent cards when using photo background
  const cardOpacity = config.backgroundType === 'photo' ? 0.80 : 0.95;

  // Card content JSX (reused for both background types)
  const cardContent = (
    <View style={contentStyle}>
      {/* Header - Team Info with optional decorative icons */}
      <View style={styles.header}>
        <View style={styles.decorativeStars}>
          {iconConfig.headerIcon && <Text style={styles.starLeft}>{iconConfig.headerIcon}</Text>}
          <View style={[styles.nameContainer, !iconConfig.headerIcon && styles.nameContainerFull]}>
            <Text style={styles.teamName}>{data.teamName}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.teamInfo}>
                {data.level}
              </Text>
            </View>
          </View>
          {iconConfig.headerIcon && <Text style={styles.starRight}>{iconConfig.headerIcon}</Text>}
        </View>
      </View>

      {/* Meet Info */}
      <View style={[styles.meetCard, { backgroundColor: `rgba(255, 255, 255, ${cardOpacity})` }]}>
        <Text style={styles.meetName}>{data.meetName}</Text>
        {data.location && <Text style={styles.meetLocation}>{data.location}</Text>}
        <Text style={styles.meetDate}>{formatDate(data.meetDate)}</Text>
      </View>

      {/* Event Scores */}
      <View style={styles.scoresCard}>
        <View style={styles.eventsGrid}>
          {events.map((event, index) => (
            event.score !== undefined && (
              <View key={index} style={[styles.eventBox, { width: eventBoxWidth, backgroundColor: `rgba(255, 255, 255, ${cardOpacity})` }]}>
                <View style={styles.eventBoxHeader}>
                  <Text style={styles.eventBoxName}>{event.name}</Text>
                  {event.placement && event.placement <= 3 && (
                    <Text style={styles.eventBoxMedal}>{getMedalEmoji(event.placement)}</Text>
                  )}
                </View>
                <Text style={[styles.eventBoxScore, { color: accentColor }]}>
                  {event.score && event.score > 0 ? event.score : '—'}
                </Text>
                {event.placement && (
                  <View style={[
                    styles.eventBoxPlacement,
                    { backgroundColor: getPlacementColor(event.placement) }
                  ]}>
                    <Text style={styles.eventBoxPlacementText}>
                      {event.placement === 1 ? '1st' :
                       event.placement === 2 ? '2nd' :
                       event.placement === 3 ? '3rd' :
                       `${event.placement}${event.placement === 21 || event.placement === 31 ? 'st' :
                          event.placement === 22 || event.placement === 32 ? 'nd' :
                          event.placement === 23 || event.placement === 33 ? 'rd' : 'th'}`}
                    </Text>
                  </View>
                )}
              </View>
            )
          ))}
        </View>
      </View>

      {/* Team Total - Featured Score */}
      <View style={[styles.teamTotalCard, { backgroundColor: `rgba(255, 255, 255, ${cardOpacity})` }]}>
        <View style={styles.teamTotalHeader}>
          {iconConfig.allAroundIcon && <Text style={styles.starDecoration}>{iconConfig.allAroundIcon}</Text>}
          <Text style={styles.teamTotalLabel}>TEAM TOTAL</Text>
          {iconConfig.allAroundIcon && <Text style={styles.starDecoration}>{iconConfig.allAroundIcon}</Text>}
        </View>
        <View style={styles.teamTotalContent}>
          <View style={styles.teamTotalValueWrapper}>
            <Text style={[styles.teamTotalValue, { color: accentColor }]}>
              {data.teamScores.allAround}
            </Text>
            {data.teamPlacements?.allAround && (
              <View style={[
                styles.teamTotalPlacementBadge,
                { backgroundColor: getPlacementColor(data.teamPlacements.allAround) }
              ]}>
                <Text style={styles.teamTotalPlacementEmoji}>
                  {getMedalEmoji(data.teamPlacements.allAround)}
                </Text>
                <Text style={styles.teamTotalPlacementText}>
                  {data.teamPlacements.allAround === 1 ? '1ST' :
                   data.teamPlacements.allAround === 2 ? '2ND' :
                   data.teamPlacements.allAround === 3 ? '3RD' :
                   `${data.teamPlacements.allAround}TH`}
                </Text>
              </View>
            )}
          </View>
        </View>
        {data.countingScoreCount && (
          <Text style={styles.countingScoreNote}>
            Top {data.countingScoreCount} scores counting
          </Text>
        )}
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
    marginBottom: 24
  },
  decorativeStars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20
  },
  starLeft: {
    fontSize: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  starRight: {
    fontSize: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  nameContainer: {
    alignItems: 'center',
    flex: 1
  },
  nameContainerFull: {
    flex: 0
  },
  teamName: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    textAlign: 'center',
    letterSpacing: 1
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)'
  },
  teamInfo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5
  },
  meetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)'
  },
  meetName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5
  },
  meetLocation: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B6E80',
    textAlign: 'center',
    marginBottom: 6
  },
  meetDate: {
    fontSize: 20,
    fontWeight: '500',
    color: '#8B8E9E',
    textAlign: 'center'
  },
  scoresCard: {
    padding: 20
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  eventBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)'
  },
  eventBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  eventBoxName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    letterSpacing: 0.3
  },
  eventBoxScore: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  eventBoxMedal: {
    fontSize: 16
  },
  eventBoxPlacement: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  eventBoxPlacementText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5
  },
  teamTotalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)'
  },
  teamTotalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  starDecoration: {
    fontSize: 28,
    opacity: 0.9
  },
  teamTotalLabel: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: 2
  },
  teamTotalContent: {
    alignItems: 'center'
  },
  teamTotalValueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  teamTotalValue: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: 1
  },
  teamTotalPlacementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
  },
  teamTotalPlacementEmoji: {
    fontSize: 32
  },
  teamTotalPlacementText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1
  },
  countingScoreNote: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6E80',
    marginTop: 12,
    fontStyle: 'italic'
  },
  branding: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginTop: 20,
    letterSpacing: 0.5
  }
});
