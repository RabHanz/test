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
import { BaseService } from './BaseService';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

const handleError = (error: any) => {
  if (error.response) {
    throw new Error(error.response.data.message || 'An error occurred');
  }
  throw error;
};

class IntegrationService extends BaseService<IntegrationProject> {
  constructor() {
    super('/integrations');
  }

  async getIntegrations(filter?: IntegrationFilter): Promise<IntegrationProject[]> {
    return this.getAll(filter);
  }

  async getIntegrationMetrics(): Promise<IntegrationMetrics> {
    try {
      const response = await this.api.get(`${this.baseUrl}/metrics`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getVersions(id: string): Promise<IntegrationVersion[]> {
    try {
      const response = await this.api.get(`${this.baseUrl}/${id}/versions`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDependencies(id: string): Promise<IntegrationDependency[]> {
    try {
      const response = await this.api.get(`${this.baseUrl}/${id}/dependencies`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTests(id: string): Promise<IntegrationTest[]> {
    try {
      const response = await this.api.get(`${this.baseUrl}/${id}/tests`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDocumentation(id: string): Promise<IntegrationDocumentation[]> {
    try {
      const response = await this.api.get(`${this.baseUrl}/${id}/documentation`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTimeline(id: string): Promise<IntegrationTimelineEvent[]> {
    try {
      const response = await this.api.get(`${this.baseUrl}/${id}/timeline`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async runHealthCheck(id: string): Promise<IntegrationHealthCheck> {
    try {
      const response = await this.api.post(`${this.baseUrl}/${id}/health/run`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async resolveAlert(id: string, alertId: string): Promise<void> {
    try {
      await this.api.post(`${this.baseUrl}/${id}/alerts/${alertId}/resolve`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addDependency(id: string, dependency: Partial<IntegrationDependency>): Promise<IntegrationDependency> {
    try {
      const response = await this.api.post(`${this.baseUrl}/${id}/dependencies`, dependency);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async removeDependency(id: string, dependencyId: string): Promise<void> {
    try {
      await this.api.delete(`${this.baseUrl}/${id}/dependencies/${dependencyId}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addTest(id: string, test: Partial<IntegrationTest>): Promise<IntegrationTest> {
    try {
      const response = await this.api.post(`${this.baseUrl}/${id}/tests`, test);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async runTest(id: string, testId: string): Promise<IntegrationTest> {
    try {
      const response = await this.api.post(`${this.baseUrl}/${id}/tests/${testId}/run`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addDocumentation(id: string, doc: Partial<IntegrationDocumentation>): Promise<IntegrationDocumentation> {
    try {
      const response = await this.api.post(`${this.baseUrl}/${id}/documentation`, doc);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateDocumentation(id: string, docId: string, doc: Partial<IntegrationDocumentation>): Promise<IntegrationDocumentation> {
    try {
      const response = await this.api.put(`${this.baseUrl}/${id}/documentation/${docId}`, doc);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const integrationService = new IntegrationService();

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

// Health Checks
export const getHealthChecks = async (integrationId: string): Promise<IntegrationHealthCheck[]> => {
  try {
    const response = await api.get(`/integrations/${integrationId}/health-checks`);
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