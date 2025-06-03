import { useState, useEffect, useCallback } from 'react';
import { JourneyService } from '../services/journey';
import { useUserStore } from '../store/userStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { Journey, JourneyStep, JourneyEvent } from '../types/journey';

interface UseJourneyTrackingOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  debug?: boolean;
}

interface JourneyTrackingState {
  currentJourney: Journey | null;
  steps: JourneyStep[];
  events: JourneyEvent[];
  isLoading: boolean;
  error: string | null;
}

export const useJourneyTracking = (options: UseJourneyTrackingOptions = {}) => {
  const {
    autoLoad = true,
    refreshInterval = 300000, // 5 minutes
    debug = false
  } = options;

  const [state, setState] = useState<JourneyTrackingState>({
    currentJourney: null,
    steps: [],
    events: [],
    isLoading: false,
    error: null
  });

  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();
  const journeyService = new JourneyService();

  const loadJourneyData = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const [journey, steps, events] = await Promise.all([
        journeyService.getCurrentJourney({
          userId: user.id,
          userPreferences: preferences
        }),
        journeyService.getJourneySteps({
          userId: user.id,
          userPreferences: preferences
        }),
        journeyService.getJourneyEvents({
          userId: user.id,
          userPreferences: preferences
        })
      ]);
      setState({
        currentJourney: journey,
        steps,
        events,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load journey data',
        isLoading: false
      }));
      if (debug) console.error('Journey data loading failed:', err);
    }
  }, [user, preferences, debug]);

  const trackEvent = useCallback(async (event: JourneyEvent) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const trackedEvent = await journeyService.trackEvent({
        ...event,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        events: [...prev.events, trackedEvent],
        isLoading: false
      }));
      return trackedEvent;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to track event',
        isLoading: false
      }));
      if (debug) console.error('Event tracking failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  const updateStep = useCallback(async (stepId: string, updates: Partial<JourneyStep>) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedStep = await journeyService.updateStep({
        stepId,
        updates,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId ? updatedStep : step
        ),
        isLoading: false
      }));
      return updatedStep;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update step',
        isLoading: false
      }));
      if (debug) console.error('Step update failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  useEffect(() => {
    if (!autoLoad) return;

    loadJourneyData();

    const interval = setInterval(loadJourneyData, refreshInterval);

    return () => clearInterval(interval);
  }, [autoLoad, refreshInterval, loadJourneyData]);

  return {
    ...state,
    loadJourneyData,
    trackEvent,
    updateStep
  };
}; 