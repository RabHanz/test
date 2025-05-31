export enum IntegrationStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  UNKNOWN = 'UNKNOWN'
}

export enum ChecklistItemStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_STARTED = 'NOT_STARTED',
  FAILED = 'FAILED'
}

export enum PersonaType {
  STARTUP_SAM = 'STARTUP_SAM',
  SCALING_SARAH = 'SCALING_SARAH',
  LEARNING_LARRY = 'LEARNING_LARRY',
  INVESTOR_IAN = 'INVESTOR_IAN',
  PROVIDER_PRIYA = 'PROVIDER_PRIYA'
}

export interface IntegrationHealth {
  id: string;
  name: string;
  status: IntegrationStatus;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: ChecklistItemStatus;
  category: 'AUTOMATED' | 'MANUAL';
  verificationMethod?: string;
  lastVerified?: Date;
  verifiedBy?: string;
  notes?: string;
}

export interface PersonaJourney {
  personaType: PersonaType;
  steps: {
    id: string;
    name: string;
    status: ChecklistItemStatus;
    conversionRate?: number;
    dropOffRate?: number;
    averageTimeToComplete?: number;
  }[];
  overallStatus: ChecklistItemStatus;
}

export interface BusinessMetrics {
  personaType: PersonaType;
  conversionRate: number;
  timeToConversion: number;
  emailCaptureRate: number;
  serviceInquiryRate: number;
  paymentCompletionRate: number;
  baselineMetrics?: {
    conversionRate: number;
    timeToConversion: number;
    emailCaptureRate: number;
    serviceInquiryRate: number;
    paymentCompletionRate: number;
  };
}

export interface LaunchNotification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
}

export interface RollbackPlan {
  id: string;
  name: string;
  status: ChecklistItemStatus;
  lastVerified: Date;
  verificationMethod: string;
  rollbackProcedure: string;
  emergencyContacts: {
    name: string;
    role: string;
    contact: string;
  }[];
}

export interface LaunchSuccessMetrics {
  trafficIncrease: number;
  conversionRateImprovement: number;
  emailSignupRateChange: number;
  serviceInquiryRateImprovement: number;
  paymentCompletionRateChange: number;
  goals: {
    id: string;
    name: string;
    target: number;
    current: number;
    achieved: boolean;
  }[];
} 