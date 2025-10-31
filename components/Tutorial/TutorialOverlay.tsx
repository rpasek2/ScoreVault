import { TUTORIAL_STEPS, TooltipPosition } from '@/constants/tutorialSteps';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTutorial } from '@/contexts/TutorialContext';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Tab bar dimensions (approximate)
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 83 : 60;
const TAB_WIDTH = width / 4; // 4 tabs

export function TutorialOverlay() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { state, nextStep, previousStep, skipTutorial, setHighlightedTarget } = useTutorial();
  const router = useRouter();

  if (!state.isActive) {
    return null;
  }

  const currentStepData = TUTORIAL_STEPS[state.currentStep];

  // Only show overlay for overlay-type steps
  if (currentStepData.type !== 'overlay') {
    return null;
  }

  // Auto-navigate to the correct tab and set highlighted target when step changes
  useEffect(() => {
    const target = currentStepData.target;

    // Set the highlighted target
    setHighlightedTarget(target);

    // Navigate to the correct tab
    if (target === 'tab-gymnasts') {
      router.push('/(tabs)');
    } else if (target === 'tab-meets') {
      router.push('/(tabs)/meets');
    } else if (target === 'tab-teams') {
      router.push('/(tabs)/teams');
    }

    // Cleanup: clear highlight when component unmounts
    return () => setHighlightedTarget(undefined);
  }, [state.currentStep, currentStepData.target]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    nextStep();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    previousStep();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    skipTutorial();
  };

  const getSpotlightArea = (target?: string) => {
    if (!target) return null;

    // Handle FAB (Floating Action Button)
    if (target === 'fab-add-gymnast') {
      const fabSize = 60;
      const fabRight = 20;
      const fabBottom = 20;
      const padding = 8; // Extra padding around FAB for better visibility

      return {
        x: width - fabRight - fabSize - padding,
        y: height - fabBottom - fabSize - padding,
        width: fabSize + (padding * 2),
        height: fabSize + (padding * 2),
        borderRadius: (fabSize + (padding * 2)) / 2 // Circular
      };
    }

    // Calculate tab positions based on target
    const tabIndex = {
      'tab-gymnasts': 0,
      'tab-meets': 1,
      'tab-teams': 2,
      'tab-settings': 3
    }[target];

    if (tabIndex === undefined) return null;

    // Adjust positioning to move spotlight up and to the right
    const leftOffset = 16; // Move significantly right from the left edge
    const rightOffset = -10; // Extend 10px beyond the right edge
    const topOffset = Platform.OS === 'ios' ? -20 : -15; // Move UP even more (negative = higher)
    const bottomOffset = Platform.OS === 'ios' ? 18 : 14; // Space from bottom

    const tabX = tabIndex * TAB_WIDTH + leftOffset;
    const tabY = height - TAB_BAR_HEIGHT + topOffset;
    const tabWidth = TAB_WIDTH - leftOffset - rightOffset;
    const tabHeight = TAB_BAR_HEIGHT - topOffset - bottomOffset;

    return {
      x: tabX,
      y: tabY,
      width: tabWidth,
      height: tabHeight,
      borderRadius: 12
    };
  };

  const getTooltipPosition = (position?: TooltipPosition, target?: string) => {
    // If highlighting FAB, position tooltip much higher to not cover it
    if (target === 'fab-add-gymnast') {
      return {
        top: height * 0.2 // Position in upper portion of screen
      };
    }

    // If highlighting a tab, position tooltip above the tab bar
    if (target && target.startsWith('tab-')) {
      return {
        bottom: TAB_BAR_HEIGHT + 20 // 20px above the tab bar
      };
    }

    switch (position) {
      case 'top':
        return { top: height * 0.1 };
      case 'bottom':
        return { bottom: height * 0.15 };
      case 'left':
        return { left: width * 0.05, top: height * 0.4 };
      case 'right':
        return { right: width * 0.05, top: height * 0.4 };
      case 'center':
      default:
        return {
          top: height * 0.5,
          transform: [{ translateY: -150 }]
        };
    }
  };

  const spotlightArea = getSpotlightArea(currentStepData.target);

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 9999
    },
    svgOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width,
      height
    },
    skipButton: {
      position: 'absolute',
      top: 60,
      right: 20,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      zIndex: 10001
    },
    skipButtonText: {
      ...theme.typography.caption,
      color: '#FFFFFF',
      fontWeight: '600'
    },
    tooltipContainer: {
      position: 'absolute',
      width: width - 40,
      maxWidth: 400,
      alignSelf: 'center',
      zIndex: 10000
    },
    tooltipCard: {
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    tooltipContent: {
      padding: theme.spacing.lg
    },
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.base,
      gap: theme.spacing.sm
    },
    icon: {
      fontSize: 32
    },
    stepIndicator: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600'
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing.sm
    },
    text: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: theme.spacing.lg
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: theme.spacing.base
    },
    button: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden'
    },
    backButton: {
      backgroundColor: theme.colors.surfaceSecondary,
      padding: theme.spacing.base,
      alignItems: 'center',
      justifyContent: 'center'
    },
    backButtonText: {
      ...theme.typography.button,
      color: theme.colors.textSecondary,
      fontWeight: '600'
    },
    nextButtonGradient: {
      padding: theme.spacing.base,
      alignItems: 'center',
      justifyContent: 'center'
    },
    nextButtonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
      fontWeight: '600'
    },
    progressDots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginTop: theme.spacing.base
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(107, 110, 255, 0.3)'
    },
    dotActive: {
      backgroundColor: theme.colors.primary,
      width: 24
    }
  });

  const tooltipStyle = [
    styles.tooltipContainer,
    getTooltipPosition(currentStepData.position, currentStepData.target)
  ];

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* No dark overlay - just let highlighted components stand out */}

      {/* Skip Button */}
      {currentStepData.showSkip && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}>
          <Text style={styles.skipButtonText}>{t('tutorial.skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Tooltip */}
      <View style={tooltipStyle} pointerEvents="box-none">
        <View style={styles.tooltipCard}>
          <LinearGradient
            colors={theme.colors.modalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tooltipContent}>

            <View style={styles.iconRow}>
              {currentStepData.icon && (
                <Text style={styles.icon}>{currentStepData.icon}</Text>
              )}
              {currentStepData.showProgress && (
                <Text style={styles.stepIndicator}>
                  {t('tutorial.stepOf', {
                    current: state.currentStep + 1,
                    total: state.totalSteps
                  })}
                </Text>
              )}
            </View>

            <Text style={styles.title}>{t(currentStepData.titleKey)}</Text>
            <Text style={styles.text}>{t(currentStepData.textKey)}</Text>

            <View style={styles.buttonsRow}>
              {currentStepData.showBack && (
                <TouchableOpacity
                  style={[styles.button, styles.backButton]}
                  onPress={handleBack}
                  activeOpacity={0.7}>
                  <Text style={styles.backButtonText}>{t('tutorial.back')}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={handleNext}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={theme.colors.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.nextButtonGradient}>
                  <Text style={styles.nextButtonText}>{t('tutorial.next')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Progress Dots */}
            {currentStepData.showProgress && (
              <View style={styles.progressDots}>
                {Array.from({ length: state.totalSteps }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === state.currentStep && styles.dotActive
                    ]}
                  />
                ))}
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}
