import { useEffect, useCallback } from 'react';
import { trackJourneyStage, getJourneyMetrics } from '../services/testingService';
import { PersonaType, JourneyStage, JourneyMetrics } from '../types/testing';

interface UseJourneyTrackingOptions {
  personaType: PersonaType;
  initialStage?: JourneyStage;
}

export const useJourneyTracking = ({ personaType, initialStage }: UseJourneyTrackingOptions) => {
  const trackStage = useCallback(async (stage: JourneyStage, action: 'START' | 'COMPLETE') => {
    try {
      await trackJourneyStage(personaType, stage, action);
    } catch (error) {
      console.error('Error tracking journey stage:', error);
    }
  }, [personaType]);

  const getMetrics = useCallback(async (): Promise<JourneyMetrics[]> => {
    try {
      return await getJourneyMetrics(personaType);
    } catch (error) {
      console.error('Error getting journey metrics:', error);
      return [];
    }
  }, [personaType]);

  useEffect(() => {
    if (initialStage) {
      trackStage(initialStage, 'START');
    }
  }, [initialStage, trackStage]);

  return {
    trackStage,
    getMetrics,
  };
};

// Helper function to get the next stage in a persona's journey
export function getNextJourneyStage(personaType: PersonaType, currentStage: JourneyStage): JourneyStage | null {
  const journeyMap: Record<PersonaType, JourneyStage[]> = {
    [PersonaType.STARTUP_SAM]: [
      JourneyStage.QUIZ,
      JourneyStage.EMAIL,
      JourneyStage.SERVICE_INQUIRY,
    ],
    [PersonaType.SCALING_SARAH]: [
      JourneyStage.ASSESSMENT,
      JourneyStage.CONSULTATION,
      JourneyStage.ENROLLMENT,
    ],
    [PersonaType.LEARNING_LARRY]: [
      JourneyStage.KNOWLEDGE_TEST,
      JourneyStage.COURSE_INTEREST,
      JourneyStage.PROGRAM_SIGNUP,
    ],
    [PersonaType.INVESTOR_IAN]: [
      JourneyStage.INVESTMENT_QUIZ,
      JourneyStage.ANALYSIS,
      JourneyStage.PORTFOLIO_DISCUSSION,
    ],
    [PersonaType.PROVIDER_PRIYA]: [
      JourneyStage.POSITIONING_ASSESSMENT,
      JourneyStage.NETWORK_ACCESS,
      JourneyStage.CLIENT_CONNECTION,
    ],
  };

  const stages = journeyMap[personaType];
  const currentIndex = stages.indexOf(currentStage);
  
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null;
  }

  return stages[currentIndex + 1];
}

// Helper function to check if a stage is the last in a persona's journey
export function isLastJourneyStage(personaType: PersonaType, stage: JourneyStage): boolean {
  const journeyMap: Record<PersonaType, JourneyStage[]> = {
    [PersonaType.STARTUP_SAM]: [
      JourneyStage.QUIZ,
      JourneyStage.EMAIL,
      JourneyStage.SERVICE_INQUIRY,
    ],
    [PersonaType.SCALING_SARAH]: [
      JourneyStage.ASSESSMENT,
      JourneyStage.CONSULTATION,
      JourneyStage.ENROLLMENT,
    ],
    [PersonaType.LEARNING_LARRY]: [
      JourneyStage.KNOWLEDGE_TEST,
      JourneyStage.COURSE_INTEREST,
      JourneyStage.PROGRAM_SIGNUP,
    ],
    [PersonaType.INVESTOR_IAN]: [
      JourneyStage.INVESTMENT_QUIZ,
      JourneyStage.ANALYSIS,
      JourneyStage.PORTFOLIO_DISCUSSION,
    ],
    [PersonaType.PROVIDER_PRIYA]: [
      JourneyStage.POSITIONING_ASSESSMENT,
      JourneyStage.NETWORK_ACCESS,
      JourneyStage.CLIENT_CONNECTION,
    ],
  };

  const stages = journeyMap[personaType];
  return stages[stages.length - 1] === stage;
} 