export interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  revenue: number;
  topProducts: {
    id: string;
    name: string;
    sales: number;
  }[];
  recentOrders: {
    id: string;
    total: number;
    status: string;
    createdAt: Date;
  }[];
  userGrowth: {
    date: string;
    count: number;
  }[];
  revenueByDay: {
    date: string;
    amount: number;
  }[];
  performance: {
    pageLoad: number;
    timeToInteractive: number;
    firstContentfulPaint: number;
    cumulativeLayoutShift: number;
  };
  analytics: {
    visitors: number;
    pageViews: number;
    bounceRate: number;
    averageSessionDuration: number;
    conversionRate: number;
  };
  lastUpdated: string;
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  productId?: string;
  userId?: string;
}

export interface AnalyticsData {
  id: string;
  userId: string;
  type: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsReport {
  id: string;
  userId: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  schedule?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  description?: string;
  type: 'number' | 'percentage' | 'currency' | 'duration';
  unit?: string;
  value: number;
  trend?: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
} 