export interface DashboardMetrics {
  funnelMetrics: {
    totalVisits: number;
    conversionRate: number;
    stages: Array<{
      name: string;
      value: number;
      change: number;
    }>;
  };
  exitIntentMetrics: {
    exitRate: number;
    totalExits: number;
    commonExitPages: Array<{
      path: string;
      count: number;
    }>;
  };
  leadScoringMetrics: {
    totalLeads: number;
    averageScore: number;
    distribution: Array<{
      score: number;
      count: number;
    }>;
  };
  revenueMetrics: {
    totalRevenue: number;
    averageOrderValue: number;
    revenueBySource: Array<{
      source: string;
      amount: number;
    }>;
  };
  lastUpdated: number;
}

export interface DashboardProps {
  metrics?: DashboardMetrics;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
} 