import { useState, useEffect, useCallback } from 'react';
import {
  FunnelMetrics,
  ExitIntentMetrics,
  LeadScoringMetrics,
  RevenueMetrics,
  Alert,
  OptimizationRecommendation,
  ContentAnalytics,
  PerformanceMetric,
  UserEvent,
  UserInteraction,
} from '../types/analytics';
import { analyticsService } from '../services/analytics';

interface UseAnalyticsOptions {
  personaId?: string;
  startDate?: Date;
  endDate?: Date;
  refreshInterval?: number;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    personaId = 'default',
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    refreshInterval = 300000, // 5 minutes
  } = options;

  const [funnelMetrics, setFunnelMetrics] = useState<FunnelMetrics | null>(null);
  const [exitIntentMetrics, setExitIntentMetrics] = useState<ExitIntentMetrics | null>(null);
  const [leadScoringMetrics, setLeadScoringMetrics] = useState<LeadScoringMetrics | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      };

      const [
        funnelResponse,
        exitIntentResponse,
        leadScoringResponse,
        revenueResponse,
        alertsResponse,
        recommendationsResponse,
      ] = await Promise.all([
        fetch(`/api/analytics/funnel?personaId=${personaId}&startDate=${dateRange.start}&endDate=${dateRange.end}`),
        fetch(`/api/analytics/exit-intent?personaId=${personaId}&startDate=${dateRange.start}&endDate=${dateRange.end}`),
        fetch('/api/analytics/lead-scoring'),
        fetch(`/api/analytics/revenue?startDate=${dateRange.start}&endDate=${dateRange.end}`),
        fetch('/api/analytics/alerts'),
        fetch('/api/analytics/recommendations'),
      ]);

      if (!funnelResponse.ok) throw new Error('Failed to fetch funnel metrics');
      if (!exitIntentResponse.ok) throw new Error('Failed to fetch exit intent metrics');
      if (!leadScoringResponse.ok) throw new Error('Failed to fetch lead scoring metrics');
      if (!revenueResponse.ok) throw new Error('Failed to fetch revenue metrics');
      if (!alertsResponse.ok) throw new Error('Failed to fetch alerts');
      if (!recommendationsResponse.ok) throw new Error('Failed to fetch recommendations');

      const [
        funnelData,
        exitIntentData,
        leadScoringData,
        revenueData,
        alertsData,
        recommendationsData,
      ] = await Promise.all([
        funnelResponse.json(),
        exitIntentResponse.json(),
        leadScoringResponse.json(),
        revenueResponse.json(),
        alertsResponse.json(),
        recommendationsResponse.json(),
      ]);

      setFunnelMetrics(funnelData);
      setExitIntentMetrics(exitIntentData);
      setLeadScoringMetrics(leadScoringData);
      setRevenueMetrics(revenueData);
      setAlerts(alertsData);
      setRecommendations(recommendationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [personaId, startDate, endDate, refreshInterval]);

  const refresh = () => {
    fetchData();
  };

  // Analytics tracking methods
  const trackPageView = useCallback((pagePath: string, metadata?: Record<string, any>) => {
    return analyticsService.trackPageView(pagePath, metadata);
  }, []);

  const trackContentView = useCallback((contentId: string, path: string, metadata?: Record<string, any>) => {
    return analyticsService.trackContentView(contentId, path, metadata);
  }, []);

  const trackSearch = useCallback((query: string, path: string, metadata?: Record<string, any>) => {
    return analyticsService.trackSearch(query, path, metadata);
  }, []);

  const trackDownload = useCallback((contentId: string, path: string, metadata?: Record<string, any>) => {
    return analyticsService.trackDownload(contentId, path, metadata);
  }, []);

  const trackInteraction = useCallback((interactionType: string, path: string, metadata?: Record<string, any>) => {
    return analyticsService.trackInteraction(interactionType, path, metadata);
  }, []);

  const trackPerformance = useCallback((metric: PerformanceMetric) => {
    return analyticsService.trackPerformance(metric);
  }, []);

  const trackContentInteraction = useCallback((contentId: string, interactionType: string, metadata?: Record<string, any>) => {
    return analyticsService.trackContentInteraction(contentId, interactionType, metadata);
  }, []);

  // Analytics retrieval methods
  const getContentAnalytics = useCallback((contentId: string) => {
    return analyticsService.getContentAnalytics(contentId);
  }, []);

  const getPerformanceMetrics = useCallback((type?: string, startDate?: Date, endDate?: Date) => {
    return analyticsService.getPerformanceMetrics(type, startDate, endDate);
  }, []);

  const getUserEvents = useCallback((type?: string, startDate?: Date, endDate?: Date) => {
    return analyticsService.getUserEvents(type, startDate, endDate);
  }, []);

  return {
    // State
    funnelMetrics,
    exitIntentMetrics,
    leadScoringMetrics,
    revenueMetrics,
    alerts,
    recommendations,
    loading,
    error,

    // Tracking methods
    trackPageView,
    trackContentView,
    trackSearch,
    trackDownload,
    trackInteraction,
    trackPerformance,
    trackContentInteraction,

    // Retrieval methods
    getContentAnalytics,
    getPerformanceMetrics,
    getUserEvents,

    // Utility methods
    refresh,
  };
}

interface UseAnalyticsProps {
  contentId?: string;
  path?: string;
}

export const useAnalytics = ({ contentId, path }: UseAnalyticsProps = {}) => {
  const trackPageView = useCallback((pagePath: string, metadata?: Record<string, any>) => {
    return analyticsService.trackPageView(pagePath, metadata);
  }, []);

  const trackContentView = useCallback((viewContentId: string, viewPath: string, metadata?: Record<string, any>) => {
    return analyticsService.trackContentView(viewContentId, viewPath, metadata);
  }, []);

  const trackSearch = useCallback((query: string, searchPath: string, metadata?: Record<string, any>) => {
    return analyticsService.trackSearch(query, searchPath, metadata);
  }, []);

  const trackDownload = useCallback((downloadContentId: string, downloadPath: string, metadata?: Record<string, any>) => {
    return analyticsService.trackDownload(downloadContentId, downloadPath, metadata);
  }, []);

  const trackInteraction = useCallback((interactionType: string, interactionPath: string, metadata?: Record<string, any>) => {
    return analyticsService.trackInteraction(interactionType, interactionPath, metadata);
  }, []);

  const trackPerformance = useCallback((metric: PerformanceMetric) => {
    return analyticsService.trackPerformance(metric);
  }, []);

  const trackContentInteraction = useCallback((interactionContentId: string, interactionType: string, metadata?: Record<string, any>) => {
    return analyticsService.trackContentInteraction(interactionContentId, interactionType, metadata);
  }, []);

  const getContentAnalytics = useCallback((analyticsContentId: string) => {
    return analyticsService.getContentAnalytics(analyticsContentId);
  }, []);

  const getPerformanceMetrics = useCallback((type?: string, startDate?: Date, endDate?: Date) => {
    return analyticsService.getPerformanceMetrics(type, startDate, endDate);
  }, []);

  const getUserEvents = useCallback((type?: string, startDate?: Date, endDate?: Date) => {
    return analyticsService.getUserEvents(type, startDate, endDate);
  }, []);

  return {
    trackPageView,
    trackContentView,
    trackSearch,
    trackDownload,
    trackInteraction,
    trackPerformance,
    trackContentInteraction,
    getContentAnalytics,
    getPerformanceMetrics,
    getUserEvents
  };
}; 