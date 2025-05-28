import { format, subDays } from 'date-fns';

export interface ProcessedAnalyticsData {
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
  trafficSources: {
    organic: number;
    paid: number;
    social: number;
    referral: number;
    direct: number;
  };
  trafficTrend: Array<{
    date: string;
    visitors: number;
    pageviews: number;
  }>;
  funnelMetrics: {
    visitors: number;
    quizCompletions: number;
    emailCaptures: number;
    inquiries: number;
    strategySessions: number;
    enrollments: number;
  };
}

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const generateDateRange = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  }
  return dates;
};

export const aggregateTrafficData = (rawData: any[]): ProcessedAnalyticsData['trafficTrend'] => {
  const dateRange = generateDateRange(30);
  return dateRange.map(date => {
    const dayData = rawData.filter(d => d.date === date);
    return {
      date,
      visitors: dayData.reduce((sum, d) => sum + d.visitors, 0),
      pageviews: dayData.reduce((sum, d) => sum + d.pageviews, 0),
    };
  });
};

export const calculateFunnelMetrics = (rawData: any[]): ProcessedAnalyticsData['funnelMetrics'] => {
  return {
    visitors: rawData.reduce((sum, d) => sum + d.visitors, 0),
    quizCompletions: rawData.reduce((sum, d) => sum + d.quizCompletions, 0),
    emailCaptures: rawData.reduce((sum, d) => sum + d.emailCaptures, 0),
    inquiries: rawData.reduce((sum, d) => sum + d.inquiries, 0),
    strategySessions: rawData.reduce((sum, d) => sum + d.strategySessions, 0),
    enrollments: rawData.reduce((sum, d) => sum + d.enrollments, 0),
  };
};

export const processAnalyticsData = (rawData: any): ProcessedAnalyticsData => {
  const currentPeriod = rawData.current;
  const previousPeriod = rawData.previous;

  return {
    revenue: {
      current: currentPeriod.revenue,
      previous: previousPeriod.revenue,
      change: calculatePercentageChange(currentPeriod.revenue, previousPeriod.revenue),
    },
    conversions: {
      current: currentPeriod.conversionRate,
      previous: previousPeriod.conversionRate,
      change: calculatePercentageChange(currentPeriod.conversionRate, previousPeriod.conversionRate),
    },
    satisfaction: {
      current: currentPeriod.satisfactionScore,
      previous: previousPeriod.satisfactionScore,
      change: calculatePercentageChange(currentPeriod.satisfactionScore, previousPeriod.satisfactionScore),
    },
    revenueHistory: rawData.revenueHistory,
    trafficSources: rawData.trafficSources,
    trafficTrend: aggregateTrafficData(rawData.trafficData),
    funnelMetrics: calculateFunnelMetrics(rawData.funnelData),
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}; 