import { useState, useEffect, useCallback } from 'react';
import { ContentGovernanceService } from '../services/contentGovernance';
import { useUserStore } from '../store/userStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { ContentRule, ContentPolicy, ContentViolation } from '../types/contentGovernance';

interface UseContentGovernanceOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  debug?: boolean;
}

interface ContentGovernanceState {
  rules: ContentRule[];
  policies: ContentPolicy[];
  violations: ContentViolation[];
  isLoading: boolean;
  error: string | null;
}

export const useContentGovernance = (options: UseContentGovernanceOptions = {}) => {
  const {
    autoLoad = true,
    refreshInterval = 300000, // 5 minutes
    debug = false
  } = options;

  const [state, setState] = useState<ContentGovernanceState>({
    rules: [],
    policies: [],
    violations: [],
    isLoading: false,
    error: null
  });

  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();
  const contentGovernanceService = new ContentGovernanceService();

  const loadContentGovernance = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const [rules, policies, violations] = await Promise.all([
        contentGovernanceService.getRules({
          userId: user.id,
          userPreferences: preferences
        }),
        contentGovernanceService.getPolicies({
          userId: user.id,
          userPreferences: preferences
        }),
        contentGovernanceService.getViolations({
          userId: user.id,
          userPreferences: preferences
        })
      ]);
      setState({
        rules,
        policies,
        violations,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load content governance data',
        isLoading: false
      }));
      if (debug) console.error('Content governance data loading failed:', err);
    }
  }, [user, preferences, debug]);

  const updateRule = useCallback(async (ruleId: string, updates: Partial<ContentRule>) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedRule = await contentGovernanceService.updateRule({
        ruleId,
        updates,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        rules: prev.rules.map(rule =>
          rule.id === ruleId ? updatedRule : rule
        ),
        isLoading: false
      }));
      return updatedRule;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update rule',
        isLoading: false
      }));
      if (debug) console.error('Rule update failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  const updatePolicy = useCallback(async (policyId: string, updates: Partial<ContentPolicy>) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedPolicy = await contentGovernanceService.updatePolicy({
        policyId,
        updates,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        policies: prev.policies.map(policy =>
          policy.id === policyId ? updatedPolicy : policy
        ),
        isLoading: false
      }));
      return updatedPolicy;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update policy',
        isLoading: false
      }));
      if (debug) console.error('Policy update failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  const resolveViolation = useCallback(async (violationId: string) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const resolvedViolation = await contentGovernanceService.resolveViolation({
        violationId,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        violations: prev.violations.map(violation =>
          violation.id === violationId ? resolvedViolation : violation
        ),
        isLoading: false
      }));
      return resolvedViolation;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to resolve violation',
        isLoading: false
      }));
      if (debug) console.error('Violation resolution failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  useEffect(() => {
    if (!autoLoad) return;

    loadContentGovernance();

    const interval = setInterval(loadContentGovernance, refreshInterval);

    return () => clearInterval(interval);
  }, [autoLoad, refreshInterval, loadContentGovernance]);

  return {
    ...state,
    loadContentGovernance,
    updateRule,
    updatePolicy,
    resolveViolation
  };
}; 