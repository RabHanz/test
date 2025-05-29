export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  MAINTENANCE = 'MAINTENANCE',
  DEPRECATED = 'DEPRECATED'
}

export enum IntegrationType {
  API = 'API',
  WEBHOOK = 'WEBHOOK',
  DATABASE = 'DATABASE',
  FILE_TRANSFER = 'FILE_TRANSFER',
  MESSAGE_QUEUE = 'MESSAGE_QUEUE',
  CUSTOM = 'CUSTOM'
}

export enum IntegrationProtocol {
  REST = 'REST',
  SOAP = 'SOAP',
  GRAPHQL = 'GRAPHQL',
  GRPC = 'GRPC',
  FTP = 'FTP',
  SFTP = 'SFTP',
  AMQP = 'AMQP',
  MQTT = 'MQTT',
  CUSTOM = 'CUSTOM'
}

export enum IntegrationSecurityType {
  NONE = 'NONE',
  BASIC = 'BASIC',
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  JWT = 'JWT',
  CUSTOM = 'CUSTOM'
}

export interface IntegrationProject {
  id: string;
  name: string;
  description: string;
  type: IntegrationType;
  protocol: IntegrationProtocol;
  status: IntegrationStatus;
  sourceSystem: string;
  targetSystem: string;
  ownerId: string;
  teamId: string;
  endpointUrl: string;
  securityType: IntegrationSecurityType;
  credentials: Record<string, any>;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  createdAt: Date;
}

export interface IntegrationMetric {
  id: string;
  integrationId: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface IntegrationAlert {
  id: string;
  integrationId: string;
  type: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationVersion {
  id: string;
  integrationId: string;
  version: string;
  changes: string[];
  releasedBy: string;
  releasedAt: Date;
}

export interface IntegrationDependency {
  id: string;
  integrationId: string;
  name: string;
  version: string;
  type: 'LIBRARY' | 'SERVICE' | 'API' | 'DATABASE';
}

export interface IntegrationTest {
  id: string;
  integrationId: string;
  name: string;
  description: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  lastRun: Date;
}

export interface IntegrationDocumentation {
  id: string;
  integrationId: string;
  title: string;
  content: string;
  version: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationTimelineEvent {
  id: string;
  integrationId: string;
  title: string;
  description: string;
  date: Date;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
}

export interface IntegrationHealthCheck {
  id: string;
  integrationId: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  responseTime: number;
  lastChecked: Date;
  details: Record<string, any>;
}

export interface IntegrationFilter {
  status?: IntegrationStatus;
  type?: IntegrationType;
  protocol?: IntegrationProtocol;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IntegrationMetrics {
  overallMetrics: {
    totalIntegrations: number;
    activeIntegrations: number;
    successRate: number;
    averageResponseTime: number;
  };
  metricsByType: Record<IntegrationType, {
    count: number;
    successRate: number;
    averageResponseTime: number;
  }>;
  metricsByProtocol: Record<IntegrationProtocol, {
    count: number;
    successRate: number;
    averageResponseTime: number;
  }>;
}

export interface IntegrationAuditLog {
  id: string;
  integrationId: string;
  action: string;
  userId: string;
  details: Record<string, any>;
  createdAt: Date;
} 