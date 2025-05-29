export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
  ON_HOLD = 'ON_HOLD'
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  EMAIL_CAMPAIGN = 'EMAIL_CAMPAIGN',
  EVENT = 'EVENT',
  DIRECT_CALL = 'DIRECT_CALL',
  OTHER = 'OTHER'
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum CommunicationType {
  EMAIL = 'EMAIL',
  CALL = 'CALL',
  MEETING = 'MEETING',
  MESSAGE = 'MESSAGE',
  OTHER = 'OTHER'
}

export interface LeadProject {
  id: string;
  name: string;
  description?: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  ownerId: string;
  teamId: string;
  companyName?: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  expectedValue?: number;
  expectedCloseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadCommunication {
  id: string;
  leadId: string;
  type: CommunicationType;
  content: string;
  direction: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadTask {
  id: string;
  leadId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadDocument {
  id: string;
  leadId: string;
  name: string;
  type: string;
  url: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadMetric {
  id: string;
  leadId: string;
  metricType: string;
  value: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadTag {
  id: string;
  leadId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadFilter {
  status?: LeadStatus;
  source?: LeadSource;
  priority?: LeadPriority;
  ownerId?: string;
  teamId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export interface LeadMetrics {
  overallMetrics: {
    totalLeads: number;
    activeLeads: number;
    closedLeads: number;
    conversionRate: number;
    averageValue: number;
  };
  statusMetrics: {
    [key in LeadStatus]: number;
  };
  sourceMetrics: {
    [key in LeadSource]: number;
  };
  priorityMetrics: {
    [key in LeadPriority]: number;
  };
}

export interface LeadAlert {
  id: string;
  leadId: string;
  type: string;
  message: string;
  priority: LeadPriority;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadTimelineEvent {
  id: string;
  leadId: string;
  type: string;
  title: string;
  description: string;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 