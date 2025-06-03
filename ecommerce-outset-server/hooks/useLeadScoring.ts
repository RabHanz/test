import { useState, useEffect, useCallback } from 'react';
import { LeadScoringService } from '../services/leadScoring';
import { useUserStore } from '../store/userStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { Lead, LeadScore, LeadStage } from '../types/leadScoring';

interface UseLeadScoringOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  debug?: boolean;
}

interface LeadScoringState {
  leads: Lead[];
  scores: LeadScore[];
  stages: LeadStage[];
  isLoading: boolean;
  error: string | null;
}

export const useLeadScoring = (options: UseLeadScoringOptions = {}) => {
  const {
    autoLoad = true,
    refreshInterval = 300000, // 5 minutes
    debug = false
  } = options;

  const [state, setState] = useState<LeadScoringState>({
    leads: [],
    scores: [],
    stages: [],
    isLoading: false,
    error: null
  });

  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();
  const leadScoringService = new LeadScoringService();

  const loadLeadScoringData = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const [leads, scores, stages] = await Promise.all([
        leadScoringService.getLeads({
          userId: user.id,
          userPreferences: preferences
        }),
        leadScoringService.getScores({
          userId: user.id,
          userPreferences: preferences
        }),
        leadScoringService.getStages({
          userId: user.id,
          userPreferences: preferences
        })
      ]);
      setState({
        leads,
        scores,
        stages,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load lead scoring data',
        isLoading: false
      }));
      if (debug) console.error('Lead scoring data loading failed:', err);
    }
  }, [user, preferences, debug]);

  const updateScore = useCallback(async (leadId: string, score: number) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedScore = await leadScoringService.updateScore({
        leadId,
        score,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        scores: prev.scores.map(s =>
          s.leadId === leadId ? updatedScore : s
        ),
        isLoading: false
      }));
      return updatedScore;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update score',
        isLoading: false
      }));
      if (debug) console.error('Score update failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  const updateStage = useCallback(async (leadId: string, stage: LeadStage) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedStage = await leadScoringService.updateStage({
        leadId,
        stage,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        stages: prev.stages.map(s =>
          s.leadId === leadId ? updatedStage : s
        ),
        isLoading: false
      }));
      return updatedStage;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update stage',
        isLoading: false
      }));
      if (debug) console.error('Stage update failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  useEffect(() => {
    if (!autoLoad) return;

    loadLeadScoringData();

    const interval = setInterval(loadLeadScoringData, refreshInterval);

    return () => clearInterval(interval);
  }, [autoLoad, refreshInterval, loadLeadScoringData]);

  return {
    ...state,
    loadLeadScoringData,
    updateScore,
    updateStage
  };
}; 