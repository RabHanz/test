import { useState, useEffect, useCallback } from 'react';
import { ABTestingService } from '../services/abTesting';
import { useUserStore } from '../store/userStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { ABTest, ABTestVariant, ABTestResult } from '../types/abTesting';

interface UseABTestingOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  debug?: boolean;
}

interface ABTestingState {
  activeTests: ABTest[];
  variants: ABTestVariant[];
  results: ABTestResult[];
  isLoading: boolean;
  error: string | null;
}

export const useABTesting = (options: UseABTestingOptions = {}) => {
  const {
    autoLoad = true,
    refreshInterval = 300000, // 5 minutes
    debug = false
  } = options;

  const [state, setState] = useState<ABTestingState>({
    activeTests: [],
    variants: [],
    results: [],
    isLoading: false,
    error: null
  });

  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();
  const abTestingService = new ABTestingService();

  const loadABTestingData = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const [tests, variants, results] = await Promise.all([
        abTestingService.getActiveTests({
          userId: user.id,
          userPreferences: preferences
        }),
        abTestingService.getVariants({
          userId: user.id,
          userPreferences: preferences
        }),
        abTestingService.getResults({
          userId: user.id,
          userPreferences: preferences
        })
      ]);
      setState({
        activeTests: tests,
        variants,
        results,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load AB testing data',
        isLoading: false
      }));
      if (debug) console.error('AB testing data loading failed:', err);
    }
  }, [user, preferences, debug]);

  const assignVariant = useCallback(async (testId: string) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const variant = await abTestingService.assignVariant({
        testId,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        variants: [...prev.variants, variant],
        isLoading: false
      }));
      return variant;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to assign variant',
        isLoading: false
      }));
      if (debug) console.error('Variant assignment failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  const trackResult = useCallback(async (testId: string, result: ABTestResult) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const trackedResult = await abTestingService.trackResult({
        testId,
        result,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        results: [...prev.results, trackedResult],
        isLoading: false
      }));
      return trackedResult;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to track result',
        isLoading: false
      }));
      if (debug) console.error('Result tracking failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  useEffect(() => {
    if (!autoLoad) return;

    loadABTestingData();

    const interval = setInterval(loadABTestingData, refreshInterval);

    return () => clearInterval(interval);
  }, [autoLoad, refreshInterval, loadABTestingData]);

  return {
    ...state,
    loadABTestingData,
    assignVariant,
    trackResult
  };
}; 