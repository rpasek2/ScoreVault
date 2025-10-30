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
import { ScoreCard } from '@/components/ScoreCard';
import { useTheme } from '@/contexts/ThemeContext';
import { GRADIENT_OPTIONS, DECORATIVE_ICON_OPTIONS } from '@/constants/gradients';
import { ScoreCardData, ScoreCardConfig, GradientName, AspectRatio, DecorativeIcon } from '@/types';
import { getScoreById } from '@/utils/database';
import { getGymnastById } from '@/utils/database';
import { getMeetById } from '@/utils/database';

export default function ScoreCardCreatorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const cardRef = useRef<View>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cardData, setCardData] = useState<ScoreCardData | null>(null);
  const [config, setConfig] = useState<ScoreCardConfig>({
    backgroundType: 'gradient',
    gradientName: 'purple',
    photoUri: undefined,
    aspectRatio: 'story',
    decorativeIcon: 'stars'
  });

  // Load score data
  useEffect(() => {
    loadScoreData();
  }, []);

  const loadScoreData = async () => {
    try {
      const scoreId = params.scoreId as string;
      if (!scoreId) {
        Alert.alert('Error', 'No score selected');
        router.back();
        return;
      }

      const score = await getScoreById(scoreId);
      if (!score) {
        Alert.alert('Error', 'Score not found');
        router.back();
        return;
      }

      const gymnast = await getGymnastById(score.gymnastId);
      const meet = await getMeetById(score.meetId);

      if (!gymnast || !meet) {
        Alert.alert('Error', 'Failed to load data');
        router.back();
        return;
      }

      const data: ScoreCardData = {
        gymnastName: gymnast.name,
        level: score.level || gymnast.level,
        discipline: gymnast.discipline,
        meetName: meet.name,
        meetDate: meet.date.toDate ? meet.date.toDate() : new Date(meet.date.toMillis!()),
        location: meet.location,
        scores: score.scores,
        placements: score.placements
      };

      setCardData(data);
    } catch (error) {
      console.error('Error loading score data:', error);
      Alert.alert('Error', 'Failed to load score data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!cardRef.current) {
      console.log('Card ref is null');
      Alert.alert('Error', 'Card not ready. Please try again.');
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
        'Capture Failed',
        `Could not capture the score card.\n\nError: ${error.message}\n\nTry using the Share button instead.`
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
          dialogTitle: 'Share Score Card'
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share score card');
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
          'Permission Required',
          'Please allow access to your photo library to save score cards. You may need to enable this in your device settings.'
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
      Alert.alert('Success', 'Score card saved to your photo library!');
    } catch (error: any) {
      console.error('Error saving to photos:', error);
      Alert.alert(
        'Error Saving Photo',
        `Failed to save score card: ${error.message || 'Unknown error'}\n\nTry using the Share button instead.`
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
          'Permission Required',
          'Please allow access to your photo library to use custom backgrounds.'
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
      Alert.alert('Error', 'Failed to select photo');
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
        <Text style={styles.loadingText}>Loading score data...</Text>
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
        <ScoreCard data={cardData} config={config} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Preview Section */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewContainer}>
            <View style={styles.cardWrapper}>
              <ScoreCard data={cardData} config={config} />
            </View>
          </View>
        </View>

        {/* Customization Section */}
        <View style={styles.customizationSection}>
          <Text style={styles.sectionTitle}>Customize</Text>

          {/* Aspect Ratio Toggle */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Format</Text>
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
                  Square (1:1)
                </Text>
                <Text style={styles.aspectRatioSubtext}>Instagram Post</Text>
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
                  Story (9:16)
                </Text>
                <Text style={styles.aspectRatioSubtext}>Instagram Story</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Background Type Toggle */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Background Type</Text>
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
                  🎨 Gradient
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
                  📷 Photo
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Gradient Selector - Only show when gradient background is selected */}
          {config.backgroundType === 'gradient' && (
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Gradient</Text>
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
            <Text style={styles.controlLabel}>Decorative Icons</Text>
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
              <Text style={styles.controlLabel}>Selected Photo</Text>
              <View style={styles.photoInfoContainer}>
                <Text style={styles.photoInfoText}>✓ Photo selected</Text>
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={handleSelectPhoto}
                  activeOpacity={0.7}>
                  <Text style={styles.changePhotoButtonText}>Change Photo</Text>
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
                <Text style={styles.actionButtonText}>Share</Text>
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
                <Text style={[styles.actionButtonText, styles.saveButtonText]}>Save to Photos</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
