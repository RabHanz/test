import axios from 'axios';
import {
  IntegrationProject,
  IntegrationLog,
  IntegrationMetric,
  IntegrationAlert,
  IntegrationVersion,
  IntegrationDependency,
  IntegrationTest,
  IntegrationDocumentation,
  IntegrationFilter,
  IntegrationMetrics,
  IntegrationTimelineEvent,
  IntegrationHealthCheck,
  IntegrationAuditLog,
  IntegrationStatus,
  IntegrationType,
  IntegrationProtocol,
  IntegrationSecurityType,
} from '../types/integration';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

const handleError = (error: any) => {
  if (error.response) {
    throw new Error(error.response.data.message || 'An error occurred');
  }
  throw error;
};

// Integration Project Management
export const getIntegrations = async (filter?: IntegrationFilter): Promise<IntegrationProject[]> => {
  try {
    const response = await api.get('/integrations', { params: filter });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getIntegration = async (id: string): Promise<IntegrationProject> => {
  try {
    const response = await api.get(`/integrations/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createIntegration = async (integration: Partial<IntegrationProject>): Promise<IntegrationProject> => {
  try {
    const response = await api.post('/integrations', integration);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateIntegration = async (id: string, integration: Partial<IntegrationProject>): Promise<IntegrationProject> => {
  try {
    const response = await api.put(`/integrations/${id}`, integration);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteIntegration = async (id: string): Promise<void> => {
  try {
    await api.delete(`/integrations/${id}`);
  } catch (error) {
    return handleError(error);
  }
};

// Logs Management
export const getLogs = async (integrationId: string): Promise<IntegrationLog[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/logs`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addLog = async (integrationId: string, log: Partial<IntegrationLog>): Promise<IntegrationLog> => {
  try {
    const response = await api.post(`/integrations/${integrationId}/logs`, log);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Metrics Management
export const getMetrics = async (integrationId: string): Promise<IntegrationMetric[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/metrics`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addMetric = async (integrationId: string, metric: Partial<IntegrationMetric>): Promise<IntegrationMetric> => {
  try {
    const response = await api.post(`/integrations/${integrationId}/metrics`, metric);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Alerts Management
export const getAlerts = async (integrationId: string): Promise<IntegrationAlert[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/alerts`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addAlert = async (integrationId: string, alert: Partial<IntegrationAlert>): Promise<IntegrationAlert> => {
  try {
    const response = await api.post(`/integrations/${integrationId}/alerts`, alert);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const resolveAlert = async (integrationId: string, alertId: string): Promise<IntegrationAlert> => {
  try {
    const response = await api.put(`/integrations/${integrationId}/alerts/${alertId}/resolve`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Version Management
export const getVersions = async (integrationId: string): Promise<IntegrationVersion[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/versions`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addVersion = async (integrationId: string, version: Partial<IntegrationVersion>): Promise<IntegrationVersion> => {
  try {
    const response = await api.post(`/integrations/${integrationId}/versions`, version);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Dependencies Management
export const getDependencies = async (integrationId: string): Promise<IntegrationDependency[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/dependencies`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addDependency = async (integrationId: string, dependency: Partial<IntegrationDependency>): Promise<IntegrationDependency> => {
  try {
    const response = await api.post(`/integrations/${integrationId}/dependencies`, dependency);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const removeDependency = async (integrationId: string, dependencyId: string): Promise<void> => {
  try {
    await api.delete(`/integrations/${integrationId}/dependencies/${dependencyId}`);
  } catch (error) {
    return handleError(error);
  }
};

// Tests Management
export const getTests = async (integrationId: string): Promise<IntegrationTest[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/tests`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addTest = async (integrationId: string, test: Partial<IntegrationTest>): Promise<IntegrationTest> => {
  try {
    const response = await api.post(`/integrations/${integrationId}/tests`, test);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const runTest = async (integrationId: string, testId: string): Promise<IntegrationTest> => {
  try {
    const response = await api.post(`/integrations/${integrationId}/tests/${testId}/run`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Documentation Management
export const getDocumentation = async (integrationId: string): Promise<IntegrationDocumentation[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/documentation`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addDocumentation = async (integrationId: string, doc: Partial<IntegrationDocumentation>): Promise<IntegrationDocumentation> => {
  try {
    const response = await api.post(`/integrations/${integrationId}/documentation`, doc);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateDocumentation = async (integrationId: string, docId: string, doc: Partial<IntegrationDocumentation>): Promise<IntegrationDocumentation> => {
  try {
    const response = await api.put(`/integrations/${integrationId}/documentation/${docId}`, doc);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Analytics and Reporting
export const getIntegrationMetrics = async (): Promise<IntegrationMetrics> => {
  try {
    const response = await api.get('/integrations/metrics');
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getTimeline = async (integrationId: string): Promise<IntegrationTimelineEvent[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/timeline`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Health Checks
export const getHealthChecks = async (integrationId: string): Promise<IntegrationHealthCheck[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/health-checks`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const runHealthCheck = async (integrationId: string): Promise<IntegrationHealthCheck> => {
  try {
    const response = await api.post(`/integrations/${integrationId}/health-checks/run`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Audit Logs
export const getAuditLogs = async (integrationId: string): Promise<IntegrationAuditLog[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/audit-logs`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Real-time Updates
let ws: WebSocket | null = null;
let subscribers: ((data: any) => void)[] = [];

export const subscribeToUpdates = (callback: (data: any) => void) => {
  subscribers.push(callback);
  if (!ws) {
    ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      subscribers.forEach(subscriber => subscriber(data));
    };
  }
  return () => {
    subscribers = subscribers.filter(sub => sub !== callback);
    if (subscribers.length === 0 && ws) {
      ws.close();
      ws = null;
    }
  };
};

export const unsubscribeFromUpdates = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
  subscribers = [];
}; 