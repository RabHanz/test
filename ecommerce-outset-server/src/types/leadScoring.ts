export interface LeadScore {
  id: string;
  totalScore: number;
  behavioralScore: number;
  demographicScore: number;
  engagementScore: number;
  lastUpdated: Date;
  history: ScoreHistory[];
}

export interface ScoreHistory {
  timestamp: Date;
  score: number;
  changeReason: string;
}

export interface BehavioralEvent {
  id: string;
  type: BehavioralEventType;
  timestamp: Date;
  metadata: Record<string, any>;
  scoreImpact: number;
}

export enum BehavioralEventType {
  QUIZ_COMPLETION = 'QUIZ_COMPLETION',
  VIDEO_ENGAGEMENT = 'VIDEO_ENGAGEMENT',
  TOOL_USAGE = 'TOOL_USAGE',
  RESOURCE_DOWNLOAD = 'RESOURCE_DOWNLOAD',
  PRICING_PAGE_VISIT = 'PRICING_PAGE_VISIT',
  EMAIL_INTERACTION = 'EMAIL_INTERACTION',
  COMMUNITY_PARTICIPATION = 'COMMUNITY_PARTICIPATION'
}

export interface DemographicData {
  businessStage: BusinessStage;
  budgetRange: BudgetRange;
  personaType: PersonaType;
  industry: string;
  companySize: string;
}

export enum BusinessStage {
  STARTUP = 'STARTUP',
  GROWTH = 'GROWTH',
  ESTABLISHED = 'ESTABLISHED',
  ENTERPRISE = 'ENTERPRISE'
}

export enum BudgetRange {
  UNDER_10K = 'UNDER_10K',
  TEN_TO_50K = 'TEN_TO_50K',
  FIFTY_TO_100K = 'FIFTY_TO_100K',
  OVER_100K = 'OVER_100K'
}

export enum PersonaType {
  DECISION_MAKER = 'DECISION_MAKER',
  INFLUENCER = 'INFLUENCER',
  END_USER = 'END_USER',
  TECHNICAL_EVALUATOR = 'TECHNICAL_EVALUATOR'
}

export interface CRMIntegration {
  id: string;
  type: CRMType;
  status: IntegrationStatus;
  config: CRMConfig;
  lastSync: Date;
}

export enum CRMType {
  HUBSPOT = 'HUBSPOT',
  SALESFORCE = 'SALESFORCE',
  PIPEDRIVE = 'PIPEDRIVE'
}

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  SYNCING = 'SYNCING'
}

export interface CRMConfig {
  apiKey: string;
  webhookUrl: string;
  fieldMappings: FieldMapping[];
  syncSettings: SyncSettings;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
}

export interface SyncSettings {
  syncInterval: number;
  bidirectional: boolean;
  retryAttempts: number;
  errorThreshold: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  enabled: boolean;
}

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export enum ConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS'
}

export interface RuleAction {
  type: ActionType;
  target: string;
  parameters: Record<string, any>;
}

export enum ActionType {
  UPDATE_SCORE = 'UPDATE_SCORE',
  SEND_EMAIL = 'SEND_EMAIL',
  ASSIGN_TEAM = 'ASSIGN_TEAM',
  CREATE_TASK = 'CREATE_TASK',
  TRIGGER_WEBHOOK = 'TRIGGER_WEBHOOK'
}

export interface Lead {
  id: string;
  email: string;
  name: string;
  company: string;
  score: LeadScore;
  demographicData: DemographicData;
  behavioralEvents: BehavioralEvent[];
  crmData: Record<string, any>;
  assignedTeam?: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum LeadStatus {
  NEW = 'NEW',
  QUALIFIED = 'QUALIFIED',
  CONTACTED = 'CONTACTED',
  NEGOTIATING = 'NEGOTIATING',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
} 