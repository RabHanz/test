import {
  IntegrationProject,
  IntegrationLog,
  IntegrationMetric,
  IntegrationAlert,
  IntegrationVersion,
  IntegrationDependency,
  IntegrationTest,
  IntegrationDocumentation,
  IntegrationTimelineEvent,
  IntegrationHealthCheck,
  IntegrationStatus,
  IntegrationType,
  IntegrationProtocol,
  IntegrationSecurityType,
} from '../types/integration';

export const createMockIntegration = (overrides: Partial<IntegrationProject> = {}): IntegrationProject => ({
  id: '1',
  name: 'Test Integration',
  description: 'Test Description',
  type: IntegrationType.API,
  protocol: IntegrationProtocol.REST,
  status: IntegrationStatus.ACTIVE,
  sourceSystem: 'System A',
  targetSystem: 'System B',
  ownerId: 'user1',
  teamId: 'team1',
  endpointUrl: 'https://api.example.com',
  securityType: IntegrationSecurityType.OAUTH2,
  credentials: {},
  config: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockLog = (overrides: Partial<IntegrationLog> = {}): IntegrationLog => ({
  id: '1',
  integrationId: '1',
  level: 'INFO',
  message: 'Test log message',
  createdAt: new Date(),
  ...overrides,
});

export const createMockMetric = (overrides: Partial<IntegrationMetric> = {}): IntegrationMetric => ({
  id: '1',
  integrationId: '1',
  name: 'Response Time',
  value: 150,
  unit: 'ms',
  timestamp: new Date(),
  ...overrides,
});

export const createMockAlert = (overrides: Partial<IntegrationAlert> = {}): IntegrationAlert => ({
  id: '1',
  integrationId: '1',
  type: 'ERROR',
  message: 'Test alert message',
  severity: 'HIGH',
  isResolved: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockVersion = (overrides: Partial<IntegrationVersion> = {}): IntegrationVersion => ({
  id: '1',
  integrationId: '1',
  version: '1.0.0',
  changes: ['Initial release'],
  releasedBy: 'user1',
  releasedAt: new Date(),
  ...overrides,
});

export const createMockDependency = (overrides: Partial<IntegrationDependency> = {}): IntegrationDependency => ({
  id: '1',
  integrationId: '1',
  name: 'Test Dependency',
  version: '1.0.0',
  type: 'LIBRARY',
  ...overrides,
});

export const createMockTest = (overrides: Partial<IntegrationTest> = {}): IntegrationTest => ({
  id: '1',
  integrationId: '1',
  name: 'Test Case',
  description: 'Test Description',
  status: 'PASSED',
  lastRun: new Date(),
  ...overrides,
});

export const createMockDocumentation = (overrides: Partial<IntegrationDocumentation> = {}): IntegrationDocumentation => ({
  id: '1',
  integrationId: '1',
  title: 'API Documentation',
  content: 'Test content',
  version: '1.0.0',
  createdBy: 'user1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockTimelineEvent = (overrides: Partial<IntegrationTimelineEvent> = {}): IntegrationTimelineEvent => ({
  id: '1',
  integrationId: '1',
  title: 'Test Event',
  description: 'Test Description',
  date: new Date(),
  type: 'INFO',
  ...overrides,
});

export const createMockHealthCheck = (overrides: Partial<IntegrationHealthCheck> = {}): IntegrationHealthCheck => ({
  id: '1',
  integrationId: '1',
  status: 'HEALTHY',
  responseTime: 100,
  lastChecked: new Date(),
  details: { uptime: '99.9%' },
  createdAt: new Date(),
  ...overrides,
});

export const createMockIntegrations = (count: number): IntegrationProject[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockIntegration({
      id: `${index + 1}`,
      name: `Test Integration ${index + 1}`,
    })
  );
};

export const createMockMetrics = (count: number): IntegrationMetric[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockMetric({
      id: `${index + 1}`,
      name: `Metric ${index + 1}`,
    })
  );
};

export const createMockAlerts = (count: number): IntegrationAlert[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockAlert({
      id: `${index + 1}`,
      message: `Alert ${index + 1}`,
    })
  );
}; 