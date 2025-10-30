import { GradientName, DecorativeIcon } from '@/types';

export interface GradientPreset {
  name: GradientName;
  colors: [string, string];
  label: string;
}

export const SCORE_CARD_GRADIENTS: Record<GradientName, GradientPreset> = {
  purple: {
    name: 'purple',
    colors: ['#6B6EFF', '#9B59B6'],
    label: 'Purple'
  },
  ocean: {
    name: 'ocean',
    colors: ['#2E3192', '#1BFFFF'],
    label: 'Ocean'
  },
  sunset: {
    name: 'sunset',
    colors: ['#FF6B6B', '#FFD93D'],
    label: 'Sunset'
  },
  forest: {
    name: 'forest',
    colors: ['#134E5E', '#71B280'],
    label: 'Forest'
  },
  royal: {
    name: 'royal',
    colors: ['#9D50BB', '#6E48AA'],
    label: 'Royal'
  },
  fire: {
    name: 'fire',
    colors: ['#F857A6', '#FF5858'],
    label: 'Fire'
  },
  skyBlue: {
    name: 'skyBlue',
    colors: ['#4A90E2', '#50C9FF'],
    label: 'Sky Blue'
  },
  rosePink: {
    name: 'rosePink',
    colors: ['#FF6FA5', '#FF99C8'],
    label: 'Rose Pink'
  },
  midnight: {
    name: 'midnight',
    colors: ['#2C3E50', '#4CA1AF'],
    label: 'Midnight'
  },
  crimson: {
    name: 'crimson',
    colors: ['#DC143C', '#FF6B6B'],
    label: 'Crimson'
  }
};

// Array for easy iteration
export const GRADIENT_OPTIONS: GradientPreset[] = Object.values(SCORE_CARD_GRADIENTS);

// Decorative Icon Options
export interface DecorativeIconOption {
  type: DecorativeIcon;
  emoji: string;
  label: string;
  headerIcon: string;
  allAroundIcon: string;
}

export const DECORATIVE_ICON_OPTIONS: DecorativeIconOption[] = [
  {
    type: 'none',
    emoji: '✕',
    label: 'None',
    headerIcon: '',
    allAroundIcon: ''
  },
  {
    type: 'stars',
    emoji: '✨',
    label: 'Stars',
    headerIcon: '✨',
    allAroundIcon: '⭐'
  },
  {
    type: 'trophy',
    emoji: '🏆',
    label: 'Trophy',
    headerIcon: '🏆',
    allAroundIcon: '🏆'
  },
  {
    type: 'medal',
    emoji: '🏅',
    label: 'Medal',
    headerIcon: '🏅',
    allAroundIcon: '🥇'
  },
  {
    type: 'fire',
    emoji: '🔥',
    label: 'Fire',
    headerIcon: '🔥',
    allAroundIcon: '🔥'
  },
  {
    type: 'sparkles',
    emoji: '✨',
    label: 'Sparkles',
    headerIcon: '✨',
    allAroundIcon: '✨'
  }
];
