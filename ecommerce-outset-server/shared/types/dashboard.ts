export interface FunnelMetrics {
  totalVisits: number;
  conversionRate: number;
  dropOffRate: number;
  stages: Array<{
    name: string;
    count: number;
    conversionRate: number;
  }>;
}

export interface ExitIntentMetrics {
  totalExits: number;
  exitRate: number;
  commonExitPages: Array<{
    page: string;
    count: number;
    percentage: number;
  }>;
}

export interface LeadScoringMetrics {
  totalLeads: number;
  averageScore: number;
  distribution: Array<{
    score: number;
    count: number;
    percentage: number;
  }>;
}

export interface RevenueMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  revenueBySource: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
}

export interface DashboardMetrics {
  funnelMetrics: FunnelMetrics;
  exitIntentMetrics: ExitIntentMetrics;
  leadScoringMetrics: LeadScoringMetrics;
  revenueMetrics: RevenueMetrics;
  lastUpdated: number;
}

export interface DashboardProps {
  metrics: DashboardMetrics;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
} 