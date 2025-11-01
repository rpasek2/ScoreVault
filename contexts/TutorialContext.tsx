import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TutorialState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  highlightedTarget?: string;
}

interface TutorialContextType {
  state: TutorialState;
  startTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
  setHighlightedTarget: (target?: string) => void;
  checkAndStartTutorial: () => Promise<boolean>;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const TUTORIAL_COMPLETED_KEY = '@scorevault_tutorial_completed';
const TUTORIAL_SKIPPED_KEY = '@scorevault_tutorial_skipped';

// Total number of tutorial steps (will be imported from tutorialSteps.ts later)
const TOTAL_STEPS = 8;

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TutorialState>({
    isActive: false,
    currentStep: 0,
    totalSteps: TOTAL_STEPS,
    completed: false,
    highlightedTarget: undefined
  });

  // Check tutorial status - function to be called by screens when appropriate
  const checkAndStartTutorial = async () => {
    try {
      const completed = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
      const skipped = await AsyncStorage.getItem(TUTORIAL_SKIPPED_KEY);

      // If not completed or skipped, return true to indicate tutorial should start
      if (!completed && !skipped) {
        startTutorial();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking tutorial status:', error);
      return false;
    }
  };

  const startTutorial = () => {
    setState({
      isActive: true,
      currentStep: 0,
      totalSteps: TOTAL_STEPS,
      completed: false
    });
  };

  const nextStep = () => {
    setState(prev => {
      if (prev.currentStep < prev.totalSteps - 1) {
        return { ...prev, currentStep: prev.currentStep + 1 };
      } else {
        // Last step reached, complete tutorial
        completeTutorial();
        return prev;
      }
    });
  };

  const previousStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  };

  const skipTutorial = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_SKIPPED_KEY, 'true');
      setState(prev => ({
        ...prev,
        isActive: false,
        currentStep: 0
      }));
    } catch (error) {
      console.error('Error saving skip status:', error);
    }
  };

  const completeTutorial = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
      setState({
        isActive: false,
        currentStep: 0,
        totalSteps: TOTAL_STEPS,
        completed: true
      });
    } catch (error) {
      console.error('Error saving completion status:', error);
    }
  };

  const resetTutorial = async () => {
    try {
      await AsyncStorage.removeItem(TUTORIAL_COMPLETED_KEY);
      await AsyncStorage.removeItem(TUTORIAL_SKIPPED_KEY);
      setState({
        isActive: false,
        currentStep: 0,
        totalSteps: TOTAL_STEPS,
        completed: false,
        highlightedTarget: undefined
      });
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  };

  const setHighlightedTarget = (target?: string) => {
    setState(prev => ({
      ...prev,
      highlightedTarget: target
    }));
  };

  return (
    <TutorialContext.Provider
      value={{
        state,
        startTutorial,
        nextStep,
        previousStep,
        skipTutorial,
        completeTutorial,
        resetTutorial,
        setHighlightedTarget,
        checkAndStartTutorial
      }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
