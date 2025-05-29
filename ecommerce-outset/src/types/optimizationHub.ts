export enum PlatformType {
  GOOGLE_ANALYTICS = 'GOOGLE_ANALYTICS',
  EMAIL_PLATFORM = 'EMAIL_PLATFORM',
  CRM = 'CRM',
  SERVICE_DELIVERY = 'SERVICE_DELIVERY',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT'
}

export enum PersonaType {
  STARTUP_SAM = 'STARTUP_SAM',
  SCALING_SARAH = 'SCALING_SARAH',
  LEARNING_LARRY = 'LEARNING_LARRY',
  INVESTOR_IAN = 'INVESTOR_IAN',
  PROVIDER_PRIYA = 'PROVIDER_PRIYA'
}

export enum OptimizationType {
  CRO = 'CRO',
  RVO = 'RVO'
}

export interface ConversionMetrics {
  conversionRate: number;
  bounceRate: number;
  funnelCompletion: number;
}

export interface RevenueMetrics {
  avgOrderValue: number;
  revenuePerVisitor: number;
  customerLTV: number;
}

export interface PlatformMetrics {
  platformType: PlatformType;
  metrics: {
    name: string;
    value: number;
    previousValue?: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  conversionMetrics?: ConversionMetrics;
  revenueMetrics?: RevenueMetrics;
  lastUpdated: Date;
}

export interface OptimizationTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  platformType: PlatformType;
  optimizationType: OptimizationType;
  personaType?: PersonaType;
  source: 'automated' | 'manual';
  insights: string[];
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonaPerformance {
  personaType: PersonaType;
  metrics: {
    conversionRate: number;
    engagementRate: number;
    revenuePerUser: number;
    retentionRate: number;
    satisfactionScore: number;
  };
  trends: {
    metric: string;
    values: number[];
    dates: Date[];
  }[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    description: string;
    expectedImpact: string;
    optimizationType: OptimizationType;
  }[];
  bundleOffers?: {
    name: string;
    description: string;
    price: number;
    conversionRate: number;
    revenueImpact: number;
  }[];
  serviceTiers?: {
    name: string;
    features: string[];
    price: number;
    conversionRate: number;
    revenueImpact: number;
  }[];
}

export interface IntegrationHealth {
  platformType: PlatformType;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastChecked: Date;
  responseTime: number;
  error?: string;
  details?: Record<string, any>;
}

export interface OptimizationReport {
  id: string;
  period: 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  summary: {
    overallPerformance: number;
    keyAchievements: string[];
    challenges: string[];
    croImpact: number;
    rvoImpact: number;
  };
  metrics: PlatformMetrics[];
  tasks: OptimizationTask[];
  personaPerformance: PersonaPerformance[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    description: string;
    expectedImpact: string;
    implementationEffort: 'low' | 'medium' | 'high';
    optimizationType: OptimizationType;
  }[];
}

export interface AnomalyAlert {
  id: string;
  type: 'metric' | 'integration' | 'task';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  details: Record<string, any>;
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'resolved';
  optimizationType?: OptimizationType;
} 