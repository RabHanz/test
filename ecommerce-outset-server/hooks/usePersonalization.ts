import { useState, useEffect, useCallback } from 'react';
import { PersonalizationService } from '../services/personalization';
import { useUserStore } from '../store/userStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { PersonalizationRule, UserSegment } from '../types/personalization';

interface UsePersonalizationOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  debug?: boolean;
}

interface PersonalizationState {
  rules: PersonalizationRule[];
  segments: UserSegment[];
  isLoading: boolean;
  error: string | null;
}

export const usePersonalization = (options: UsePersonalizationOptions = {}) => {
  const {
    autoLoad = true,
    refreshInterval = 300000, // 5 minutes
    debug = false
  } = options;

  const [state, setState] = useState<PersonalizationState>({
    rules: [],
    segments: [],
    isLoading: false,
    error: null
  });

  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();
  const personalizationService = new PersonalizationService();

  const loadPersonalization = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const [rules, segments] = await Promise.all([
        personalizationService.getRules({
          userId: user.id,
          userPreferences: preferences
        }),
        personalizationService.getSegments({
          userId: user.id,
          userPreferences: preferences
        })
      ]);
      setState({
        rules,
        segments,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load personalization data',
        isLoading: false
      }));
      if (debug) console.error('Personalization data loading failed:', err);
    }
  }, [user, preferences, debug]);

  const applyRule = useCallback(async (ruleId: string) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const result = await personalizationService.applyRule({
        ruleId,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        rules: prev.rules.map(rule =>
          rule.id === ruleId ? { ...rule, lastApplied: new Date().toISOString() } : rule
        ),
        isLoading: false
      }));
      return result;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to apply rule',
        isLoading: false
      }));
      if (debug) console.error('Rule application failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  const updateSegment = useCallback(async (segmentId: string, updates: Partial<UserSegment>) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedSegment = await personalizationService.updateSegment({
        segmentId,
        updates,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        segments: prev.segments.map(segment =>
          segment.id === segmentId ? updatedSegment : segment
        ),
        isLoading: false
      }));
      return updatedSegment;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update segment',
        isLoading: false
      }));
      if (debug) console.error('Segment update failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  useEffect(() => {
    if (!autoLoad) return;

    loadPersonalization();

    const interval = setInterval(loadPersonalization, refreshInterval);

    return () => clearInterval(interval);
  }, [autoLoad, refreshInterval, loadPersonalization]);

  return {
    ...state,
    loadPersonalization,
    applyRule,
    updateSegment
  };
}; 