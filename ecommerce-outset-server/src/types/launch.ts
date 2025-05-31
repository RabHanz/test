export enum LaunchStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  DELAYED = 'DELAYED',
}

export enum LaunchPhase {
  PLANNING = 'PLANNING',
  PREPARATION = 'PREPARATION',
  VALIDATION = 'VALIDATION',
  EXECUTION = 'EXECUTION',
  POST_LAUNCH = 'POST_LAUNCH',
}

export enum ValidationStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export enum LaunchPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface LaunchProject {
  id: string;
  name: string;
  description?: string;
  status: LaunchStatus;
  phase: LaunchPhase;
  startDate?: Date;
  targetLaunchDate?: Date;
  actualLaunchDate?: Date;
  ownerId: string;
  teamId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaunchChecklist {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  category: string;
  priority: LaunchPriority;
  isRequired: boolean;
  status: ValidationStatus;
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaunchValidation {
  id: string;
  projectId: string;
  checklistId?: string;
  name: string;
  description?: string;
  validationType: string;
  status: ValidationStatus;
  validationResult?: Record<string, any>;
  validatedBy?: string;
  validatedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaunchMetric {
  id: string;
  projectId: string;
  metricName: string;
  metricValue?: number;
  metricUnit?: string;
  targetValue?: number;
  actualValue?: number;
  status: ValidationStatus;
  measuredAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaunchTimelineEvent {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  eventType: string;
  startDate: Date;
  endDate?: Date;
  status: LaunchStatus;
  assignedTo?: string;
  dependencies?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaunchDocument {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  documentType: string;
  filePath: string;
  fileSize?: number;
  fileType?: string;
  uploadedBy: string;
  version: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaunchTeamMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  responsibilities: string[];
  isLead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaunchFilter {
  status?: LaunchStatus;
  phase?: LaunchPhase;
  priority?: LaunchPriority;
  assignedTo?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export interface LaunchMetrics {
  overallMetrics: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    blockedProjects: number;
    averageCompletionTime: number;
  };
  phaseMetrics: {
    [key in LaunchPhase]: {
      totalProjects: number;
      completedProjects: number;
      averageTimeInPhase: number;
    };
  };
  validationMetrics: {
    totalValidations: number;
    passedValidations: number;
    failedValidations: number;
    pendingValidations: number;
  };
  timelineMetrics: {
    onTimeEvents: number;
    delayedEvents: number;
    upcomingEvents: number;
    averageDelay: number;
  };
}

export interface LaunchAlert {
  id: string;
  projectId: string;
  type: 'VALIDATION' | 'TIMELINE' | 'METRIC' | 'DOCUMENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
} 