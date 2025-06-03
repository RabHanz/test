import { DashboardMetrics } from '../types/dashboard';

export const formatMetricValue = (value: number, type: string): string => {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    case 'percentage':
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value / 100);
    case 'number':
      return new Intl.NumberFormat('en-US').format(value);
    default:
      return value.toString();
  }
};

export const calculateTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

export const validateMetrics = (metrics: Partial<DashboardMetrics>): boolean => {
  const requiredFields = [
    'funnelMetrics',
    'exitIntentMetrics',
    'leadScoringMetrics',
    'revenueMetrics',
    'lastUpdated'
  ];

  return requiredFields.every(field => field in metrics);
};

export const getMetricChange = (current: number, previous: number): {
  value: number;
  direction: 'up' | 'down' | 'neutral';
} => {
  if (previous === 0) return { value: 0, direction: 'neutral' };
  
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  };
}; 