import { LeadStatus } from './leadScoring';

export enum ProgramType {
  LAUNCH = 'LAUNCH',
  SCALE = 'SCALE',
  MASTER = 'MASTER',
  INVEST = 'INVEST',
  CONNECT = 'CONNECT'
}

export interface Program {
  id: string;
  type: ProgramType;
  name: string;
  description: string;
  features: ProgramFeature[];
  integrations: ProgramIntegration[];
  templates: ProgramTemplate[];
  status: ProgramStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramFeature {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  configuration: Record<string, any>;
}

export interface ProgramIntegration {
  id: string;
  platform: IntegrationPlatform;
  status: IntegrationStatus;
  config: Record<string, any>;
  lastSync: Date;
}

export enum IntegrationPlatform {
  CLICKUP = 'CLICKUP',
  TEACHABLE = 'TEACHABLE',
  THINKIFIC = 'THINKIFIC',
  CALENDLY = 'CALENDLY',
  SLACK = 'SLACK',
  DISCORD = 'DISCORD'
}

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  SYNCING = 'SYNCING'
}

export interface ProgramTemplate {
  id: string;
  name: string;
  type: TemplateType;
  content: Record<string, any>;
  isDefault: boolean;
}

export enum TemplateType {
  CLICKUP_PROJECT = 'CLICKUP_PROJECT',
  LEARNING_COURSE = 'LEARNING_COURSE',
  CALENDAR_EVENT = 'CALENDAR_EVENT',
  COMMUNITY_SPACE = 'COMMUNITY_SPACE',
  RESOURCE_COLLECTION = 'RESOURCE_COLLECTION'
}

export enum ProgramStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED'
}

export interface ClientProgram {
  id: string;
  programId: string;
  clientId: string;
  type: ProgramType;
  status: ClientProgramStatus;
  startDate: Date;
  endDate?: Date;
  progress: ProgramProgress;
  integrations: ClientProgramIntegration[];
  team: ProgramTeam;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramProgress {
  overallProgress: number;
  clickupProgress: number;
  learningProgress: number;
  sessionAttendance: number;
  communityEngagement: number;
  resourceUtilization: number;
  lastUpdated: Date;
}

export interface ClientProgramIntegration {
  id: string;
  platform: IntegrationPlatform;
  status: IntegrationStatus;
  credentials: Record<string, any>;
  lastSync: Date;
}

export interface ProgramTeam {
  coach: string;
  support: string[];
  specialists: string[];
}

export enum ClientProgramStatus {
  ACTIVE = 'ACTIVE',
  ONBOARDING = 'ONBOARDING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
} 