
import { create } from 'zustand';
import type { AnalyticsDashboardState, DateRangeOption } from '../types';
import {
  MOCK_DASHBOARD_OVERVIEW_DATA,
  MOCK_TRAFFIC_SOURCES_DATA,
  MOCK_PERSONA_ANALYTICS_DATA,
  MOCK_CONVERSION_TRACKING_DATA,
  MOCK_SHADOW_FUNNEL_DATA,
  MOCK_CONTENT_PERFORMANCE_DATA,
} from '../constants';
import { trackDashboardEvent } from '../utils/trackingUtils'; // Updated Import

const useAnalyticsStore = create<AnalyticsDashboardState>()((set, get) => ({
  dateRange: '30d',
  customStartDate: undefined,
  customEndDate: undefined,
  isLoading: false,
  overviewData: undefined,
  trafficSourcesData: undefined,
  personaAnalyticsData: undefined,
  conversionTrackingData: undefined,
  shadowFunnelData: undefined,
  contentPerformanceData: undefined,
  activeTab: 'overview',

  setActiveTab: (tabId: string) => {
    set({ activeTab: tabId });
    trackDashboardEvent('tab_changed', { tab_id: tabId });
  },

  setDateRange: (range: DateRangeOption) => {
    set({ dateRange: range, customStartDate: undefined, customEndDate: undefined });
    trackDashboardEvent('date_range_changed', { range });
    get().fetchData();
  },

  setCustomDateRange: (start: string, end: string) => {
    set({ dateRange: 'custom', customStartDate: start, customEndDate: end });
    trackDashboardEvent('custom_date_range_set', { start_date: start, end_date: end });
    get().fetchData();
  },

  fetchData: async () => {
    set({ isLoading: true });
    trackDashboardEvent('fetch_data_started', { range: get().dateRange, customStart: get().customStartDate, customEnd: get().customEndDate });
    // console.log('Simulating fetching analytics data for range:', get().dateRange, get().customStartDate, get().customEndDate);

    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call delay

    set({
      overviewData: MOCK_DASHBOARD_OVERVIEW_DATA,
      trafficSourcesData: MOCK_TRAFFIC_SOURCES_DATA,
      personaAnalyticsData: MOCK_PERSONA_ANALYTICS_DATA,
      conversionTrackingData: MOCK_CONVERSION_TRACKING_DATA,
      shadowFunnelData: MOCK_SHADOW_FUNNEL_DATA,
      contentPerformanceData: MOCK_CONTENT_PERFORMANCE_DATA,
      isLoading: false,
    });
    trackDashboardEvent('fetch_data_completed');
    // console.log('Analytics data "fetched" and set.');
  },
}));

export default useAnalyticsStore;
