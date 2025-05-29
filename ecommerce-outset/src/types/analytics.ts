// Analytics Platform Types
export interface AnalyticsPlatform {
  id: string;
  name: string;
  type: 'website' | 'social' | 'email' | 'payment' | 'project' | 'learning';
  status: 'active' | 'inactive' | 'error';
  lastSync: Date;
  config: Record<string, any>;
}

// Funnel Metrics Types
export interface FunnelMetrics {
  totalVisitors: number;
  conversionRate: number;
  dropOffRate: number;
  averageTimeToConvert: number;
  stages: {
    name: string;
    visitors: number;
    conversionRate: number;
  }[];
}

export interface PersonaMetrics {
  id: string;
  name: string;
  funnelMetrics: FunnelMetrics;
  trafficSources: TrafficSourceMetrics[];
  deviceBreakdown: DeviceMetrics;
  geographicData: GeographicMetrics[];
  seasonalPatterns: SeasonalMetrics[];
}

// Shadow Funnel Types
export interface ExitIntentMetrics {
  totalExits: number;
  exitRate: number;
  averageTimeOnPage: number;
  exitPages: {
    path: string;
    exits: number;
    exitRate: number;
  }[];
}

export interface EmailRecoveryMetrics {
  sequenceId: string;
  name: string;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  optimalSendTime: string;
  personaBreakdown: {
    personaId: string;
    metrics: {
      openRate: number;
      clickRate: number;
      conversionRate: number;
    };
  }[];
}

export interface RetargetingMetrics {
  platform: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  roi: number;
  attribution: {
    firstTouch: number;
    lastTouch: number;
    linear: number;
  };
}

// Lead Scoring Types
export interface LeadScoringMetrics {
  totalLeads: number;
  averageScore: number;
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  topScoringLeads: {
    id: string;
    score: number;
    lastActivity: string;
  }[];
}

// Revenue Attribution Types
export interface RevenueMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  revenueByProduct: {
    productId: string;
    revenue: number;
    units: number;
  }[];
  revenueByChannel: {
    channel: string;
    revenue: number;
    percentage: number;
  }[];
}

// Alert Types
export interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  value: number;
  severity: 'info' | 'warning' | 'critical';
  notificationChannels: ('email' | 'slack')[];
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
}

// Competitive Intelligence Types
export interface KeywordMetrics {
  keyword: string;
  rank: number;
  volume: number;
  difficulty: number;
  trend: number[];
}

export interface CompetitorMetrics {
  domain: string;
  keywords: KeywordMetrics[];
  backlinks: number;
  contentGaps: {
    keyword: string;
    opportunity: number;
  }[];
}

// Report Types
export interface ReportTemplate {
  id: string;
  name: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  metrics: string[];
  visualization: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    day?: number;
    time: string;
  };
  recipients: string[];
}

// Optimization Types
export interface OptimizationRecommendation {
  id: string;
  type: 'content' | 'performance' | 'conversion';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  status: 'pending' | 'implemented' | 'rejected';
}

// Dashboard Configuration Types
export interface DashboardConfig {
  id: string;
  name: string;
  widgets: {
    id: string;
    type: string;
    config: Record<string, any>;
    position: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
  }[];
  filters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    personas: string[];
    platforms: string[];
  };
}

export interface PlatformData {
  type: 'website' | 'social' | 'email' | 'payment' | 'project' | 'learning';
  data: any;
  timestamp: Date;
}

export interface NormalizedMetrics {
  visitors: number;
  engagement: number;
  conversions: number;
  revenue: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  geographicBreakdown: {
    [country: string]: number;
  };
  timeBreakdown: {
    [hour: number]: number;
  };
  sourceBreakdown: {
    [source: string]: number;
  };
}

export interface ContentAnalytics {
  contentId: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  interactions: {
    type: string;
    count: number;
  }[];
}

export interface PerformanceMetric {
  type: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserEvent {
  type: string;
  timestamp: string;
  path: string;
  metadata?: Record<string, any>;
}

export interface UserInteraction {
  type: string;
  timestamp: string;
  contentId?: string;
  metadata?: Record<string, any>;
} 