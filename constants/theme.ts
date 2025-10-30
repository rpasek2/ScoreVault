/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform, ViewStyle } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// UI Palette - consistent color scheme across the app
export const UI_PALETTE = {
  background: '#EEF3FF',
  headerGradient: ['#EEF3FF', '#FAF5FF'] as const,
  avatarGradient: ['#6B6EFF', '#A86CFF'] as const,
  statGradients: [
    ['#FFE4F6', '#FFF6FB'] as const,
    ['#E4F1FF', '#F7FBFF'] as const,
    ['#FFEFD9', '#FFF8ED'] as const
  ] as const,
  cardGradient: ['#FFFFFF', '#F5F7FF'] as const,
  analyticsCardGradient: ['#FFFFFF', '#F6F9FF'] as const,
  scoreCardGradient: ['#FFFFFF', '#F2F6FF'] as const,
  emptyIconGradient: ['#FFFFFF', '#E9F1FF'] as const,
  modalGradient: ['#FFFFFF', '#F7F9FF'] as const,
  primaryText: '#2B2E55',
  secondaryText: 'rgba(43, 46, 85, 0.72)',
  tertiaryText: 'rgba(43, 46, 85, 0.55)',
  accentText: '#4C3FE0'
} as const;

// Event names by discipline
export const WOMENS_EVENTS = ['vault', 'bars', 'beam', 'floor'] as const;
export const MENS_EVENTS = ['floor', 'pommelHorse', 'rings', 'vault', 'parallelBars', 'highBar'] as const;

export const EVENT_LABELS = {
  vault: 'Vault',
  bars: 'Bars',
  beam: 'Beam',
  floor: 'Floor',
  pommelHorse: 'Pommel Horse',
  rings: 'Rings',
  parallelBars: 'Parallel Bars',
  highBar: 'High Bar'
} as const;

export type WomensEvent = typeof WOMENS_EVENTS[number];
export type MensEvent = typeof MENS_EVENTS[number];
export type EventKey = WomensEvent | MensEvent;

// Shadow styles
export const CARD_SHADOW: ViewStyle =
  Platform.OS === 'android'
    ? { elevation: 10 }
    : {
        shadowColor: '#9AA5FF',
        shadowOpacity: 0.18,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 }
      };

export const SOFT_SHADOW: ViewStyle =
  Platform.OS === 'android'
    ? { elevation: 6 }
    : {
        shadowColor: '#A7B3FF',
        shadowOpacity: 0.16,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 }
      };

// Card border for better visibility in light mode
export const getCardBorder = (isDark: boolean = false): ViewStyle => {
  if (isDark) {
    return {};
  }
  return {
    borderWidth: 1.5,
    borderColor: 'rgba(107, 110, 255, 0.35)', // Semi-transparent purple
  };
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Get colors for theme based on dark mode
const getColors = (isDark: boolean = false) => {
  const primaryColor = UI_PALETTE.accentText; // Keep original blue accent
  const primaryColorDark = '#A78BFA'; // Lighter purple for dark mode visibility

  if (isDark) {
    return {
      // Primary Colors
      primary: primaryColorDark,
      primaryDark: primaryColorDark,
      primaryLight: primaryColorDark,
      accent: primaryColorDark,

      // Gradients (Dark Mode)
      headerGradient: ['#1C1C1E', '#1C1C1E'] as const,
      avatarGradient: [primaryColorDark, primaryColorDark] as const,
      cardGradient: ['#1C1C1E', '#2C2C2E'] as const,
      emptyIconGradient: ['#2C2C2E', '#1C1C1E'] as const,
      modalGradient: ['#1C1C1E', '#2C2C2E'] as const,
      analyticsCardGradient: ['#1C1C1E', '#2C2C2E'] as const,
      scoreCardGradient: ['#1C1C1E', '#2C2C2E'] as const,
      statGradients: [
        ['#2C2C2E', '#1C1C1E'] as const,
        ['#2C2C2E', '#1C1C1E'] as const,
        ['#2C2C2E', '#1C1C1E'] as const
      ] as const,

      // Status Colors
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',

      // Neutral Colors (Dark Mode)
      background: '#000000',
      surface: '#1C1C1E',
      surfaceSecondary: '#2C2C2E',

      // Text Colors (Dark Mode)
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      textTertiary: 'rgba(255, 255, 255, 0.5)',
      textDisabled: '#636366',

      // Border Colors
      border: '#38383A',
      borderLight: '#2C2C2E',
      borderDark: '#48484A',

      // Score Colors
      scorePurple: '#8B5CF6',
      scoreGreen: '#34C759',
      scoreBlue: '#4A90E2',
      scoreYellow: '#FFC107',
      scoreGrey: '#999999',

      // Placement Colors
      placementGold: '#FFD700',
      placementSilver: '#AAB7B8',
      placementBronze: '#CD7F32',
      placementGrey: '#636366',

      // Overlay
      overlay: 'rgba(0, 0, 0, 0.7)',
      overlayLight: 'rgba(0, 0, 0, 0.5)',
    };
  }

  // Light mode colors
  return {
    // Primary Colors (from UI_PALETTE)
    primary: primaryColor,
    primaryDark: primaryColor,
    primaryLight: primaryColor,
    accent: primaryColor,

    // Gradients (Light Mode)
    headerGradient: UI_PALETTE.headerGradient,
    avatarGradient: UI_PALETTE.avatarGradient,
    cardGradient: UI_PALETTE.cardGradient,
    emptyIconGradient: UI_PALETTE.emptyIconGradient,
    modalGradient: UI_PALETTE.modalGradient,
    analyticsCardGradient: UI_PALETTE.analyticsCardGradient,
    scoreCardGradient: UI_PALETTE.scoreCardGradient,
    statGradients: UI_PALETTE.statGradients,

    // Status Colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',

    // Neutral Colors (from UI_PALETTE)
    background: UI_PALETTE.background,
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F6F7',

    // Text Colors (from UI_PALETTE)
    textPrimary: UI_PALETTE.primaryText,
    textSecondary: UI_PALETTE.secondaryText,
    textTertiary: UI_PALETTE.tertiaryText,
    textDisabled: '#C7C7CC',

    // Border Colors
    border: '#E5E5EA',
    borderLight: '#F0F0F0',
    borderDark: '#D1D1D6',

    // Score Colors
    scorePurple: '#8B5CF6',
    scoreGreen: '#34C759',
    scoreBlue: '#4A90E2',
    scoreYellow: '#FFC107',
    scoreGrey: '#999999',

    // Placement Colors
    placementGold: '#FFD700',
    placementSilver: '#AAB7B8',
    placementBronze: '#CD7F32',
    placementGrey: '#D1D1D6',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  };
};

// Function to get theme based on dark mode
export const getTheme = (isDark: boolean = false) => ({
  colors: getColors(isDark),

typography: {
    // Font Sizes
    h1: { fontSize: 34, fontWeight: '700' as const, lineHeight: 41, letterSpacing: -0.5 },
    h2: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.3 },
    h3: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28, letterSpacing: -0.2 },
    h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 23, letterSpacing: 0 },
    h5: { fontSize: 16, fontWeight: '600' as const, lineHeight: 21, letterSpacing: 0 },
    h6: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18, letterSpacing: 0 },

    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22, letterSpacing: 0 },
    bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 24, letterSpacing: 0 },
    bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, letterSpacing: 0 },

    caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16, letterSpacing: 0 },
    captionBold: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.5 },

    button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 21, letterSpacing: 0 },
    buttonSmall: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18, letterSpacing: 0 },
  },

  // Spacing Scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  // Border Radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  // Shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    fab: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
  },
});

// Default theme export (for backward compatibility)
export const AppTheme = getTheme();

// Helper function to get score color based on value (for individual events)
export const getScoreColor = (score: number, theme = AppTheme): string => {
  return theme.colors.primary;  // All scores use primary color
};

// Helper function to get score color for All-Around scores
export const getAAScoreColor = (score: number, theme = AppTheme): string => {
  return theme.colors.primary;  // All AA scores use primary color
};

// Helper function to get placement color based on position
export const getPlacementColor = (placement: number, theme = AppTheme): string => {
  if (placement === 1) return theme.colors.placementGold;   // 1st: Gold
  if (placement === 2) return theme.colors.placementSilver; // 2nd: Silver
  if (placement === 3) return theme.colors.placementBronze; // 3rd: Bronze
  return theme.colors.placementGrey;                        // 4th+: Grey
};

// Helper function to convert placement number to ordinal string (1st, 2nd, 3rd, etc.)
export const getOrdinal = (placement: number): string => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const value = placement % 100;
  return placement + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
};

// Helper function to get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
