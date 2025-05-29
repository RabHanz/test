export enum PersonaType {
  STARTUP_SAM = 'STARTUP_SAM',
  SCALING_SARAH = 'SCALING_SARAH',
  LEARNING_LARRY = 'LEARNING_LARRY',
  INVESTOR_IAN = 'INVESTOR_IAN',
  PROVIDER_PRIYA = 'PROVIDER_PRIYA'
}

export enum JourneyStage {
  QUIZ = 'QUIZ',
  ASSESSMENT = 'ASSESSMENT',
  KNOWLEDGE_TEST = 'KNOWLEDGE_TEST',
  INVESTMENT_QUIZ = 'INVESTMENT_QUIZ',
  POSITIONING_ASSESSMENT = 'POSITIONING_ASSESSMENT',
  EMAIL = 'EMAIL',
  CONSULTATION = 'CONSULTATION',
  COURSE_INTEREST = 'COURSE_INTEREST',
  ANALYSIS = 'ANALYSIS',
  NETWORK_ACCESS = 'NETWORK_ACCESS',
  SERVICE_INQUIRY = 'SERVICE_INQUIRY',
  ENROLLMENT = 'ENROLLMENT',
  PROGRAM_SIGNUP = 'PROGRAM_SIGNUP',
  PORTFOLIO_DISCUSSION = 'PORTFOLIO_DISCUSSION',
  CLIENT_CONNECTION = 'CLIENT_CONNECTION'
}

export interface JourneyMetrics {
  personaType: PersonaType;
  stages: {
    [key in JourneyStage]?: {
      started: number;
      completed: number;
      dropOffRate: number;
      averageTimeToComplete: number;
    };
  };
  overallCompletionRate: number;
  averageTimeToConversion: number;
  conversionRate: number;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: {
    id: string;
    name: string;
    config: Record<string, any>;
    weight: number;
  }[];
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  metrics: {
    impressions: number;
    conversions: number;
    conversionRate: number;
    statisticalSignificance: number;
  };
}

export interface PerformanceMetrics {
  pageLoadSpeed: number;
  lcp: number;
  fid: number;
  cls: number;
  deviceType: 'MOBILE' | 'DESKTOP';
  personaType?: PersonaType;
  timestamp: Date;
}

export interface UserFeedback {
  id: string;
  type: 'HELPFULNESS' | 'BUG' | 'FEATURE_REQUEST' | 'SATISFACTION';
  rating?: number;
  comment?: string;
  screenshot?: string;
  personaType?: PersonaType;
  pageUrl: string;
  deviceInfo: {
    userAgent: string;
    screenSize: string;
    browser: string;
  };
  createdAt: Date;
}

export interface AccessibilityReport {
  id: string;
  pageUrl: string;
  wcagScore: number;
  violations: {
    id: string;
    impact: 'MINOR' | 'MODERATE' | 'SERIOUS' | 'CRITICAL';
    description: string;
    help: string;
    nodes: string[];
  }[];
  passes: {
    id: string;
    impact: 'MINOR' | 'MODERATE' | 'SERIOUS' | 'CRITICAL';
    description: string;
    nodes: string[];
  }[];
  timestamp: Date;
}

export interface ErrorReport {
  id: string;
  type: 'JAVASCRIPT' | 'API' | 'PERFORMANCE' | 'RENDERING';
  message: string;
  stack?: string;
  userInfo: {
    personaType?: PersonaType;
    sessionId: string;
    pageUrl: string;
    deviceInfo: {
      userAgent: string;
      screenSize: string;
      browser: string;
    };
  };
  impact: {
    affectedUsers: number;
    frequency: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  status: 'NEW' | 'INVESTIGATING' | 'RESOLVED';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ConversionTest {
  id: string;
  name: string;
  type: 'EMAIL_CAPTURE' | 'SERVICE_INQUIRY' | 'PRICING' | 'SOCIAL_PROOF';
  variants: {
    id: string;
    name: string;
    config: Record<string, any>;
    metrics: {
      impressions: number;
      conversions: number;
      conversionRate: number;
      revenue: number;
    };
  }[];
  personaType?: PersonaType;
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  roi: {
    investment: number;
    revenue: number;
    roi: number;
  };
} 