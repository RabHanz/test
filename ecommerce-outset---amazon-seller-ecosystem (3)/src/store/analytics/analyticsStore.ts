import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AnalyticsState {
  // Executive Overview
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  conversions: {
    current: number;
    previous: number;
    change: number;
  };
  satisfaction: {
    current: number;
    previous: number;
    change: number;
  };
  revenueHistory: Array<{
    date: string;
    revenue: number;
  }>;

  // Traffic Analytics
  trafficSources: {
    organic: number;
    paid: number;
    social: number;
    referral: number;
    direct: number;
  };

  // Conversion Funnel
  funnelMetrics: {
    visitors: number;
    quizCompletions: number;
    emailCaptures: number;
    inquiries: number;
    strategySessions: number;
    enrollments: number;
  };

  // Actions
  updateMetrics: (metrics: Partial<AnalyticsState>) => void;
  fetchAnalyticsData: () => Promise<void>;
}

const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        revenue: {
          current: 0,
          previous: 0,
          change: 0,
        },
        conversions: {
          current: 0,
          previous: 0,
          change: 0,
        },
        satisfaction: {
          current: 0,
          previous: 0,
          change: 0,
        },
        revenueHistory: [],
        trafficSources: {
          organic: 0,
          paid: 0,
          social: 0,
          referral: 0,
          direct: 0,
        },
        funnelMetrics: {
          visitors: 0,
          quizCompletions: 0,
          emailCaptures: 0,
          inquiries: 0,
          strategySessions: 0,
          enrollments: 0,
        },

        // Actions
        updateMetrics: (metrics) => set((state) => ({ ...state, ...metrics })),
        fetchAnalyticsData: async () => {
          try {
            // TODO: Implement actual API call
            const mockData = {
              revenue: {
                current: 150000,
                previous: 120000,
                change: 25,
              },
              conversions: {
                current: 3.5,
                previous: 3.0,
                change: 16.67,
              },
              satisfaction: {
                current: 8.5,
                previous: 8.2,
                change: 3.66,
              },
              revenueHistory: [
                { date: '2024-01', revenue: 120000 },
                { date: '2024-02', revenue: 135000 },
                { date: '2024-03', revenue: 150000 },
              ],
              trafficSources: {
                organic: 40,
                paid: 25,
                social: 20,
                referral: 10,
                direct: 5,
              },
              funnelMetrics: {
                visitors: 10000,
                quizCompletions: 5000,
                emailCaptures: 2500,
                inquiries: 1000,
                strategySessions: 500,
                enrollments: 250,
              },
            };
            set(mockData);
          } catch (error) {
            console.error('Error fetching analytics data:', error);
          }
        },
      }),
      {
        name: 'analytics-storage',
      }
    )
  )
);

export default useAnalyticsStore; 