import React, { useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { TUTORIAL_STEPS } from '@/constants/tutorialSteps';
import { TutorialModal } from './TutorialModal';
import { TutorialOverlay } from './TutorialOverlay';

export function Tutorial() {
  const { state, nextStep, skipTutorial, completeTutorial } = useTutorial();
  const { t } = useLanguage();

  if (!state.isActive) {
    return null;
  }

  const currentStepData = TUTORIAL_STEPS[state.currentStep];

  // Render modal for welcome and completion steps
  if (currentStepData.type === 'modal') {
    const isWelcome = currentStepData.id === 'welcome';
    const isComplete = currentStepData.id === 'complete';

    return (
      <TutorialModal
        visible={true}
        icon={currentStepData.icon}
        titleKey={currentStepData.titleKey}
        textKey={currentStepData.textKey}
        onPrimary={isComplete ? completeTutorial : nextStep}
        onSecondary={isWelcome ? skipTutorial : undefined}
        primaryLabel={isComplete ? t('tutorial.done') : t('tutorial.getStarted')}
        secondaryLabel={isWelcome ? t('tutorial.skip') : undefined}
      />
    );
  }

  // Render overlay for all other steps
  return <TutorialOverlay />;
}
