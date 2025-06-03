export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface PerformanceMetrics {
  pageLoad: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

export interface AnalyticsData {
  visitors: number;
  pageViews: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversionRate: number;
}

export interface DashboardData {
  performance: PerformanceMetrics;
  analytics: AnalyticsData;
  lastUpdated: string;
}

export type PersonaId = 'launch' | 'scale' | 'master' | 'invest' | 'connect';
export type EngagementLevel = 'low' | 'medium' | 'high';

export interface DynamicContentVariant {
  content: string | { text: string; actionType: string; variant?: string };
  metadata?: Record<string, any>;
} 