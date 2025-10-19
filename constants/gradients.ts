import { GradientName } from '@/types';

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
  }
};

// Array for easy iteration
export const GRADIENT_OPTIONS: GradientPreset[] = Object.values(SCORE_CARD_GRADIENTS);
