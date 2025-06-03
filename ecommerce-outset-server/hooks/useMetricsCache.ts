import { useState, useEffect, useCallback } from 'react';
import { MetricsService } from '../services/metrics';
import { useUserStore } from '../store/userStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { Metric, MetricCache } from '../types/metrics';

interface UseMetricsCacheOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  debug?: boolean;
}

interface MetricsCacheState {
  cache: MetricCache;
  isLoading: boolean;
  error: string | null;
}

export const useMetricsCache = (options: UseMetricsCacheOptions = {}) => {
  const {
    autoLoad = true,
    refreshInterval = 300000, // 5 minutes
    debug = false
  } = options;

  const [state, setState] = useState<MetricsCacheState>({
    cache: {},
    isLoading: false,
    error: null
  });

  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();
  const metricsService = new MetricsService();

  const loadMetricsCache = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const cache = await metricsService.getMetricsCache({
        userId: user.id,
        userPreferences: preferences
      });
      setState({
        cache,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load metrics cache',
        isLoading: false
      }));
      if (debug) console.error('Metrics cache loading failed:', err);
    }
  }, [user, preferences, debug]);

  const updateMetric = useCallback(async (metricId: string, value: number) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedMetric = await metricsService.updateMetric({
        metricId,
        value,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        cache: {
          ...prev.cache,
          [metricId]: updatedMetric
        },
        isLoading: false
      }));
      return updatedMetric;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update metric',
        isLoading: false
      }));
      if (debug) console.error('Metric update failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  const clearCache = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await metricsService.clearMetricsCache({
        userId: user.id,
        userPreferences: preferences
      });
      setState({
        cache: {},
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to clear metrics cache',
        isLoading: false
      }));
      if (debug) console.error('Metrics cache clearing failed:', err);
    }
  }, [user, preferences, debug]);

  useEffect(() => {
    if (!autoLoad) return;

    loadMetricsCache();

    const interval = setInterval(loadMetricsCache, refreshInterval);

    return () => clearInterval(interval);
  }, [autoLoad, refreshInterval, loadMetricsCache]);

  return {
    ...state,
    loadMetricsCache,
    updateMetric,
    clearCache
  };
}; 