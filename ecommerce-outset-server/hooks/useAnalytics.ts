import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '@/store/userStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import type { UserEvent, PerformanceMetric, UserInteraction } from '@/types/analytics';

interface UseAnalyticsOptions {
  trackPageViews?: boolean;
  trackUserBehavior?: boolean;
  trackPerformance?: boolean;
  autoTrack?: boolean;
  debug?: boolean;
}

interface AnalyticsState {
  events: UserEvent[];
  metrics: PerformanceMetric[];
  userBehavior: UserInteraction[];
  isLoading: boolean;
  error: string | null;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const {
    trackPageViews = true,
    trackUserBehavior = true,
    trackPerformance = true,
    autoTrack = true,
    debug = false
  } = options;

  const [state, setState] = useState<AnalyticsState>({
    events: [],
    metrics: [],
    userBehavior: [],
    isLoading: false,
    error: null
  });

  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();

  const trackUserEvent = useCallback(async (event: UserEvent) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: event.type, data: { ...event, userId: user?.id } }),
      });
      setState(prev => ({
        ...prev,
        events: [...prev.events, { ...event, userId: user?.id }],
        isLoading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to track event',
        isLoading: false
      }));
      if (debug) console.error('Analytics event tracking failed:', err);
    }
  }, [user, debug]);

  const trackPerformanceMetric = useCallback(async (metric: PerformanceMetric) => {
    if (!trackPerformance) return;
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: 'performance', data: metric }),
      });
      setState(prev => ({
        ...prev,
        metrics: [...prev.metrics, metric],
        isLoading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to track metric',
        isLoading: false
      }));
      if (debug) console.error('Analytics metric tracking failed:', err);
    }
  }, [trackPerformance, debug]);

  const trackUserInteraction = useCallback(async (interaction: UserInteraction) => {
    if (!trackUserBehavior) return;
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: 'interaction', data: { ...interaction, userId: user?.id } }),
      });
      setState(prev => ({
        ...prev,
        userBehavior: [...prev.userBehavior, { ...interaction, userId: user?.id }],
        isLoading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to track interaction',
        isLoading: false
      }));
      if (debug) console.error('Analytics interaction tracking failed:', err);
    }
  }, [user, trackUserBehavior, debug]);

  const trackPageView = useCallback(async (path: string) => {
    if (!trackPageViews) return;
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: 'pageview', data: { path } }),
      });
      setState(prev => ({
        ...prev,
        events: [...prev.events, {
          id: '',
          type: 'pageview',
          userId: user?.id || '',
          timestamp: new Date(),
          properties: { path }
        }],
        isLoading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to track page view',
        isLoading: false
      }));
      if (debug) console.error('Analytics page view tracking failed:', err);
    }
  }, [user, trackPageViews, debug]);

  useEffect(() => {
    if (!autoTrack) return;
    // Optionally, add global listeners for errors, etc.
    // ...
  }, [autoTrack]);

  return {
    ...state,
    trackUserEvent,
    trackPerformance: trackPerformanceMetric,
    trackUserInteraction,
    trackPageView
  };
}; 