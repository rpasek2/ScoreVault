import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { TeamScoreCard } from '@/components/TeamScoreCard';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GRADIENT_OPTIONS, DECORATIVE_ICON_OPTIONS } from '@/constants/gradients';
import { TeamScoreCardData, ScoreCardConfig, GradientName, AspectRatio, DecorativeIcon, EventScores } from '@/types';
import { getMeetById, getGymnasts, getScores, getTeamPlacement } from '@/utils/database';
import { calculateTeamScore } from '@/utils/teamScores';

export default function TeamScoreCardCreatorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const cardRef = useRef<View>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cardData, setCardData] = useState<TeamScoreCardData | null>(null);
  const [config, setConfig] = useState<ScoreCardConfig>({
    backgroundType: 'gradient',
    gradientName: 'purple',
    photoUri: undefined,
    aspectRatio: 'story',
    decorativeIcon: 'stars'
  });

  // Load team score data
  useEffect(() => {
    loadTeamScoreData();
  }, []);

  const loadTeamScoreData = async () => {
    try {
      const level = params.level as string;
      const discipline = params.discipline as 'Womens' | 'Mens';
      const meetId = params.meetId as string;
      const countingScoreCount = params.countingScoreCount ? parseInt(params.countingScoreCount as string) as 3 | 5 : 3;

      if (!level || !discipline || !meetId) {
        Alert.alert(t('common.error'), t('scoreCard.noScoreSelected'));
        router.back();
        return;
      }

      const meet = await getMeetById(meetId);
      if (!meet) {
        Alert.alert(t('common.error'), t('meets.meetNotFound'));
        router.back();
        return;
      }

      const [allGymnasts, allScores] = await Promise.all([
        getGymnasts(),
        getScores()
      ]);

      // Get scores for this meet and level
      const meetScores = allScores.filter(
        s => s.meetId === meetId && s.level === level
      );

      // Filter by discipline
      const relevantGymnasts = allGymnasts.filter(g => g.discipline === discipline);
      const gymnastIds = new Set(relevantGymnasts.map(g => g.id));
      const relevantScores = meetScores.filter(s => gymnastIds.has(s.gymnastId));

      if (relevantScores.length === 0) {
        Alert.alert(t('common.error'), t('scoreCard.noTeamScoresFound'));
        router.back();
        return;
      }

      // Calculate team scores
      const teamScore = calculateTeamScore(relevantScores, discipline, relevantGymnasts, countingScoreCount);

      // Convert teamScores Record to EventScores object
      const eventScores: EventScores = {
        vault: teamScore.teamScores.vault,
        bars: teamScore.teamScores.bars,
        beam: teamScore.teamScores.beam,
        floor: teamScore.teamScores.floor,
        pommelHorse: teamScore.teamScores.pommelHorse,
        rings: teamScore.teamScores.rings,
        parallelBars: teamScore.teamScores.parallelBars,
        highBar: teamScore.teamScores.highBar,
        allAround: teamScore.totalScore
      };

      // Load team placements
      const teamPlacementData = await getTeamPlacement(meetId, level, discipline);

      const data: TeamScoreCardData = {
        teamName: `${level} ${discipline === 'Womens' ? "Women's" : "Men's"} Team`,
        level: level,
        discipline: discipline,
        meetName: meet.name,
        meetDate: meet.date.toDate ? meet.date.toDate() : new Date(meet.date.toMillis!()),
        location: meet.location,
        teamScores: eventScores,
        teamPlacements: teamPlacementData?.placements,
        countingScoreCount: countingScoreCount
      };

      setCardData(data);
    } catch (error) {
      console.error('Error loading team score data:', error);
      Alert.alert(t('common.error'), t('scoreCard.failedToLoadScore'));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!cardRef.current) {
      console.log('Card ref is null');
      Alert.alert(t('common.error'), t('scoreCard.cardNotReady'));
      return null;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Longer delay to ensure view is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Capturing ref with current:', cardRef.current);
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile'
      });

      console.log('Captured successfully:', uri);
      return uri;
    } catch (error: any) {
      console.error('Error generating image:', error);
      Alert.alert(
        t('scoreCard.captureFailed'),
        t('scoreCard.captureError', { error: error.message })
      );
      return null;
    }
  };

  const handleShare = async () => {
    try {
      setGenerating(true);
      const uri = await handleGenerateImage();
      if (!uri) return;

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t('scoreCard.shareScoreCard')
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(t('common.error'), t('scoreCard.sharingNotAvailable'));
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert(t('common.error'), t('scoreCard.failedToShare'));
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToPhotos = async () => {
    try {
      // Request permission - use writeOnly to avoid audio permission
      console.log('Requesting media library permission...');
      const { status } = await MediaLibrary.requestPermissionsAsync(true); // true = writeOnly
      console.log('Permission status:', status);

      if (status !== 'granted') {
        Alert.alert(
          t('scoreCard.permissionRequired'),
          t('scoreCard.photoLibraryPermission')
        );
        return;
      }

      setGenerating(true);
      const uri = await handleGenerateImage();
      console.log('Generated image URI:', uri);
      if (!uri) return;

      // Save to photo library - this can take several seconds
      console.log('Saving to library...');
      const asset = await MediaLibrary.saveToLibraryAsync(uri);
      console.log('Saved asset:', asset);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), t('scoreCard.savedToLibrary'));
    } catch (error: any) {
      console.error('Error saving to photos:', error);
      Alert.alert(
        t('scoreCard.errorSaving'),
        t('scoreCard.saveError', { error: error.message || 'Unknown error' })
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectGradient = (gradientName: GradientName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfig(prev => ({ ...prev, gradientName }));
  };

  const handleToggleAspectRatio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfig(prev => ({
      ...prev,
      aspectRatio: prev.aspectRatio === 'square' ? 'story' : 'square'
    }));
  };

  const handleSelectPhoto = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('scoreCard.permissionRequired'),
          t('scoreCard.customBackgroundPermission')
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: config.aspectRatio === 'square' ? [1, 1] : [9, 16],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setConfig(prev => ({
          ...prev,
          backgroundType: 'photo',
          photoUri: result.assets[0].uri
        }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert(t('common.error'), t('scoreCard.failedToSelectPhoto'));
    }
  };

  const handleSwitchToGradient = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfig(prev => ({
      ...prev,
      backgroundType: 'gradient'
    }));
  };

  const handleSelectIcon = (icon: DecorativeIcon) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfig(prev => ({
      ...prev,
      decorativeIcon: icon
    }));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    hiddenCard: {
      position: 'absolute',
      top: 0,
      left: 0,
      opacity: 0,
      zIndex: -1,
      pointerEvents: 'none'
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background
    },
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.base
    },
    scrollContent: {
      padding: theme.spacing.base
    },
    previewSection: {
      marginBottom: theme.spacing.xl
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.base
    },
    previewContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      alignItems: 'center',
      ...theme.shadows.medium
    },
    cardWrapper: {
      transform: [{ scale: 0.3 }],
      marginVertical: -300
    },
    customizationSection: {
      marginBottom: theme.spacing.xl
    },
    controlGroup: {
      marginBottom: theme.spacing.lg
    },
    controlLabel: {
      ...theme.typography.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm
    },
    aspectRatioToggle: {
      flexDirection: 'row',
      gap: theme.spacing.sm
    },
    aspectRatioButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      padding: theme.spacing.base,
      alignItems: 'center'
    },
    aspectRatioButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '15'
    },
    aspectRatioButtonText: {
      ...theme.typography.body,
      fontWeight: '600',
      color: theme.colors.textSecondary
    },
    aspectRatioButtonTextActive: {
      color: theme.colors.primary
    },
    aspectRatioSubtext: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 4
    },
    gradientScroll: {
      marginHorizontal: -theme.spacing.base
    },
    gradientOption: {
      marginLeft: theme.spacing.base,
      alignItems: 'center',
      position: 'relative'
    },
    gradientOptionActive: {
      opacity: 1
    },
    gradientPreview: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      flexDirection: 'row',
      ...theme.shadows.small
    },
    gradientPreviewColor: {
      flex: 1
    },
    gradientLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs
    },
    iconScroll: {
      marginHorizontal: -theme.spacing.base
    },
    iconOption: {
      marginLeft: theme.spacing.base,
      alignItems: 'center',
      position: 'relative'
    },
    iconOptionActive: {
      opacity: 1
    },
    iconPreview: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.small
    },
    iconEmoji: {
      fontSize: 40
    },
    iconLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs
    },
    selectedIndicator: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: theme.colors.primary,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center'
    },
    selectedIndicatorText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700'
    },
    actionsSection: {
      gap: theme.spacing.sm
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.medium
    },
    actionButtonDisabled: {
      opacity: 0.5
    },
    shareButton: {
      backgroundColor: theme.colors.primary
    },
    saveButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary
    },
    actionButtonIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm
    },
    actionButtonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
      fontWeight: '600'
    },
    saveButtonText: {
      color: theme.colors.primary
    },
    backgroundTypeToggle: {
      flexDirection: 'row',
      gap: theme.spacing.sm
    },
    backgroundTypeButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      padding: theme.spacing.base,
      alignItems: 'center'
    },
    backgroundTypeButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '15'
    },
    backgroundTypeButtonText: {
      ...theme.typography.body,
      fontWeight: '600',
      color: theme.colors.textSecondary
    },
    backgroundTypeButtonTextActive: {
      color: theme.colors.primary
    },
    photoInfoContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.base,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    photoInfoText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary
    },
    changePhotoButton: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm
    },
    changePhotoButtonText: {
      ...theme.typography.body,
      fontWeight: '600',
      color: theme.colors.primary,
      fontSize: 14
    }
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('scoreCard.loadingData')}</Text>
      </View>
    );
  }

  if (!cardData) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Hidden full-size card for capture - absolutely positioned */}
      <View ref={cardRef} style={styles.hiddenCard} collapsable={false}>
        <TeamScoreCard data={cardData} config={config} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Preview Section */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>{t('scoreCard.preview')}</Text>
          <View style={styles.previewContainer}>
            <View style={styles.cardWrapper}>
              <TeamScoreCard data={cardData} config={config} />
            </View>
          </View>
        </View>

        {/* Customization Section */}
        <View style={styles.customizationSection}>
          <Text style={styles.sectionTitle}>{t('scoreCard.customize')}</Text>

          {/* Aspect Ratio Toggle */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>{t('scoreCard.format')}</Text>
            <View style={styles.aspectRatioToggle}>
              <TouchableOpacity
                style={[
                  styles.aspectRatioButton,
                  config.aspectRatio === 'square' && styles.aspectRatioButtonActive
                ]}
                onPress={handleToggleAspectRatio}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.aspectRatioButtonText,
                    config.aspectRatio === 'square' && styles.aspectRatioButtonTextActive
                  ]}>
                  {t('scoreCard.square')}
                </Text>
                <Text style={styles.aspectRatioSubtext}>{t('scoreCard.instagramPost')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.aspectRatioButton,
                  config.aspectRatio === 'story' && styles.aspectRatioButtonActive
                ]}
                onPress={handleToggleAspectRatio}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.aspectRatioButtonText,
                    config.aspectRatio === 'story' && styles.aspectRatioButtonTextActive
                  ]}>
                  {t('scoreCard.story')}
                </Text>
                <Text style={styles.aspectRatioSubtext}>{t('scoreCard.instagramStory')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Background Type Toggle */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>{t('scoreCard.backgroundType')}</Text>
            <View style={styles.backgroundTypeToggle}>
              <TouchableOpacity
                style={[
                  styles.backgroundTypeButton,
                  config.backgroundType === 'gradient' && styles.backgroundTypeButtonActive
                ]}
                onPress={handleSwitchToGradient}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.backgroundTypeButtonText,
                    config.backgroundType === 'gradient' && styles.backgroundTypeButtonTextActive
                  ]}>
                  🎨 {t('scoreCard.gradient')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.backgroundTypeButton,
                  config.backgroundType === 'photo' && styles.backgroundTypeButtonActive
                ]}
                onPress={handleSelectPhoto}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.backgroundTypeButtonText,
                    config.backgroundType === 'photo' && styles.backgroundTypeButtonTextActive
                  ]}>
                  📷 {t('scoreCard.photo')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Gradient Selector - Only show when gradient background is selected */}
          {config.backgroundType === 'gradient' && (
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>{t('scoreCard.gradient')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradientScroll}>
                {GRADIENT_OPTIONS.map((gradient) => (
                  <TouchableOpacity
                    key={gradient.name}
                    onPress={() => handleSelectGradient(gradient.name)}
                    activeOpacity={0.7}
                    style={[
                      styles.gradientOption,
                      config.gradientName === gradient.name && styles.gradientOptionActive
                    ]}>
                    <View style={styles.gradientPreview}>
                      <View
                        style={[
                          styles.gradientPreviewColor,
                          { backgroundColor: gradient.colors[0] }
                        ]}
                      />
                      <View
                        style={[
                          styles.gradientPreviewColor,
                          { backgroundColor: gradient.colors[1] }
                        ]}
                      />
                    </View>
                    <Text style={styles.gradientLabel}>{gradient.label}</Text>
                    {config.gradientName === gradient.name && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Decorative Icons Selector */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>{t('scoreCard.decorativeIcons')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {DECORATIVE_ICON_OPTIONS.map((iconOption) => (
                <TouchableOpacity
                  key={iconOption.type}
                  onPress={() => handleSelectIcon(iconOption.type)}
                  activeOpacity={0.7}
                  style={[
                    styles.iconOption,
                    config.decorativeIcon === iconOption.type && styles.iconOptionActive
                  ]}>
                  <View style={styles.iconPreview}>
                    <Text style={styles.iconEmoji}>{iconOption.emoji}</Text>
                  </View>
                  <Text style={styles.iconLabel}>{iconOption.label}</Text>
                  {config.decorativeIcon === iconOption.type && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedIndicatorText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Photo Background Info - Show when photo is selected */}
          {config.backgroundType === 'photo' && config.photoUri && (
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>{t('scoreCard.selectedPhoto')}</Text>
              <View style={styles.photoInfoContainer}>
                <Text style={styles.photoInfoText}>{t('scoreCard.photoSelected')}</Text>
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={handleSelectPhoto}
                  activeOpacity={0.7}>
                  <Text style={styles.changePhotoButtonText}>{t('scoreCard.changePhoto')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton, generating && styles.actionButtonDisabled]}
            onPress={handleShare}
            disabled={generating}
            activeOpacity={0.7}>
            {generating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>📤</Text>
                <Text style={styles.actionButtonText}>{t('scoreCard.share')}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton, generating && styles.actionButtonDisabled]}
            onPress={handleSaveToPhotos}
            disabled={generating}
            activeOpacity={0.7}>
            {generating ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>💾</Text>
                <Text style={[styles.actionButtonText, styles.saveButtonText]}>{t('scoreCard.saveToPhotos')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
