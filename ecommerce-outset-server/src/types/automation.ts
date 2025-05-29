export enum AutomationPlatform {
  ZAPIER = 'ZAPIER',
  MAKE = 'MAKE',
  CONVERTKIT = 'CONVERTKIT',
  MAILCHIMP = 'MAILCHIMP',
  HUBSPOT = 'HUBSPOT',
  CLICKUP = 'CLICKUP',
  CALENDLY = 'CALENDLY',
  SALESFORCE = 'SALESFORCE',
  MARKETO = 'MARKETO',
  CUSTOM = 'CUSTOM',
}

export enum AutomationStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  DRAFT = 'DRAFT',
}

export enum AutomationType {
  WORKFLOW = 'WORKFLOW',
  TEMPLATE = 'TEMPLATE',
  WEBHOOK = 'WEBHOOK',
  SEQUENCE = 'SEQUENCE',
  TASK = 'TASK',
  RULE = 'RULE',
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  platform: AutomationPlatform;
  type: AutomationType;
  status: AutomationStatus;
  trigger: {
    type: string;
    config: Record<string, any>;
  };
  actions: Array<{
    type: string;
    target: string;
    parameters: Record<string, any>;
  }>;
  metadata: {
    personaType?: string;
    tags: string[];
    description: string;
    createdBy: string;
    lastModifiedBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
  metrics: {
    successRate: number;
    totalExecutions: number;
    averageExecutionTime: number;
    lastExecution: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  id: string;
  type: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  error?: string;
  createdAt: Date;
  processedAt?: Date;
  platform: AutomationPlatform;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  type: AutomationType;
  platform: AutomationPlatform;
  content: Record<string, any>;
  metadata: {
    tags: string[];
    createdBy: string;
    lastModifiedBy: string;
  };
  personaType?: string;
  usageCount: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationMetrics {
  overallMetrics: {
    totalWorkflows: number;
    activeWorkflows: number;
    averageSuccessRate: number;
    totalExecutions: number;
  };
  platformMetrics: Record<AutomationPlatform, {
    activeWorkflows: number;
    conversionRate: number;
    averageTimeToConversion: number;
    revenueAttribution: number;
  }>;
  personaMetrics: Record<string, {
    activeWorkflows: number;
    conversionRate: number;
    averageTimeToConversion: number;
    revenueAttribution: number;
  }>;
}

export interface AutomationAlert {
  id: string;
  type: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: AutomationStatus;
  source: {
    type: 'WORKFLOW' | 'RULE' | 'SYSTEM';
    id: string;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  resolvedAt?: Date;
  workflowId?: string;
  platform: AutomationPlatform;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: string;
    target: string;
    parameters: Record<string, any>;
  }>;
  priority: number;
  enabled: boolean;
  metadata: {
    tags: string[];
    createdBy: string;
    lastModifiedBy: string;
  };
  createdAt: Date;
  updatedAt: Date;
  personaType?: string;
}

export interface AutomationLog {
  id: string;
  type: 'WORKFLOW' | 'RULE' | 'SYSTEM';
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  metadata: Record<string, any>;
  timestamp: Date;
  workflowId: string;
  platform: AutomationPlatform;
  event: string;
  status: AutomationStatus;
  details: Record<string, any>;
  duration?: number;
  error?: string;
}

export interface AutomationFilter {
  platform?: AutomationPlatform;
  status?: AutomationStatus;
  type?: AutomationType;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'workflow' | 'rule' | 'template';
  entityId: string;
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface RealTimeUpdate {
  type: 'workflow' | 'rule' | 'alert' | 'metrics';
  id: string;
  data: AutomationWorkflow | AutomationRule | AutomationAlert | AutomationMetrics;
  timestamp: Date;
} 