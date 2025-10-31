export type TutorialStepType = 'modal' | 'spotlight' | 'overlay';
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TutorialStep {
  id: string;
  type: TutorialStepType;
  target?: string; // Component ID to highlight (for spotlight)
  position?: TooltipPosition;
  titleKey: string; // Translation key
  textKey: string;  // Translation key
  icon?: string; // Emoji icon
  showProgress?: boolean; // Show progress dots
  showSkip?: boolean; // Show skip button
  showBack?: boolean; // Show back button
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    type: 'modal',
    titleKey: 'tutorial.welcome.title',
    textKey: 'tutorial.welcome.text',
    icon: '🏆',
    showProgress: false,
    showSkip: true,
    showBack: false
  },
  {
    id: 'gymnasts-tab',
    type: 'overlay',
    target: 'tab-gymnasts',
    position: 'top',
    titleKey: 'tutorial.gymnastsTab.title',
    textKey: 'tutorial.gymnastsTab.text',
    icon: '👥',
    showProgress: true,
    showSkip: true,
    showBack: false
  },
  {
    id: 'add-gymnast',
    type: 'overlay',
    target: 'fab-add-gymnast',
    position: 'center',
    titleKey: 'tutorial.addGymnast.title',
    textKey: 'tutorial.addGymnast.text',
    icon: '👤',
    showProgress: true,
    showSkip: true,
    showBack: true
  },
  {
    id: 'meets-tab',
    type: 'overlay',
    target: 'tab-meets',
    position: 'top',
    titleKey: 'tutorial.meetsTab.title',
    textKey: 'tutorial.meetsTab.text',
    icon: '📅',
    showProgress: true,
    showSkip: true,
    showBack: true
  },
  {
    id: 'add-score',
    type: 'overlay',
    position: 'center',
    titleKey: 'tutorial.addScore.title',
    textKey: 'tutorial.addScore.text',
    icon: '🎯',
    showProgress: true,
    showSkip: true,
    showBack: true
  },
  {
    id: 'teams-tab',
    type: 'overlay',
    target: 'tab-teams',
    position: 'top',
    titleKey: 'tutorial.teamsTab.title',
    textKey: 'tutorial.teamsTab.text',
    icon: '🏅',
    showProgress: true,
    showSkip: true,
    showBack: true
  },
  {
    id: 'social-cards',
    type: 'overlay',
    position: 'center',
    titleKey: 'tutorial.socialCards.title',
    textKey: 'tutorial.socialCards.text',
    icon: '📱',
    showProgress: true,
    showSkip: true,
    showBack: true
  },
  {
    id: 'complete',
    type: 'modal',
    titleKey: 'tutorial.complete.title',
    textKey: 'tutorial.complete.text',
    icon: '✨',
    showProgress: false,
    showSkip: false,
    showBack: false
  }
];
