import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import AnalyticsService, { AnalyticsFilters } from './analyticsService';
import { ProcessedAnalyticsData } from './dataProcessing';

export const useAnalytics = (initialFilters?: AnalyticsFilters) => {
  const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters || {});
  const analyticsService = AnalyticsService.getInstance();

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery<ProcessedAnalyticsData>(
    ['analytics', filters],
    () => analyticsService.fetchAnalyticsData(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  const {
    data: trafficData,
    isLoading: isTrafficLoading,
    error: trafficError,
  } = useQuery(
    ['traffic', filters],
    () => analyticsService.fetchTrafficData(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const {
    data: funnelData,
    isLoading: isFunnelLoading,
    error: funnelError,
  } = useQuery(
    ['funnel', filters],
    () => analyticsService.fetchFunnelData(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const {
    data: revenueData,
    isLoading: isRevenueLoading,
    error: revenueError,
  } = useQuery(
    ['revenue', filters],
    () => analyticsService.fetchRevenueData(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const {
    data: satisfactionData,
    isLoading: isSatisfactionLoading,
    error: satisfactionError,
  } = useQuery(
    ['satisfaction', filters],
    () => analyticsService.fetchCustomerSatisfaction(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const {
    data: teamData,
    isLoading: isTeamLoading,
    error: teamError,
  } = useQuery(
    ['team', filters],
    () => analyticsService.fetchTeamPerformance(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const exportData = useCallback(async () => {
    try {
      const blob = await analyticsService.exportAnalyticsData(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }, [filters]);

  const isLoadingAny = isLoading || isTrafficLoading || isFunnelLoading || 
    isRevenueLoading || isSatisfactionLoading || isTeamLoading;

  const hasError = error || trafficError || funnelError || 
    revenueError || satisfactionError || teamError;

  return {
    analyticsData,
    trafficData,
    funnelData,
    revenueData,
    satisfactionData,
    teamData,
    filters,
    updateFilters,
    exportData,
    isLoading: isLoadingAny,
    error: hasError,
    refetch,
  };
};

export default useAnalytics; 