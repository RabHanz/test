import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  AutomationWorkflow,
  AutomationTemplate,
  WebhookEvent,
  AutomationMetrics,
  AutomationAlert,
  AutomationRule,
  AutomationLog,
  AutomationPlatform,
  AutomationStatus,
  AutomationType,
} from '../types/automation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:3000/ws';

// WebSocket connection management
let ws: WebSocket | null = null;
let wsReconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

const connectWebSocket = (onMessage: (data: any) => void) => {
  if (ws) {
    ws.close();
  }

  ws = new WebSocket(WS_BASE_URL);

  ws.onopen = () => {
    console.log('WebSocket connected');
    wsReconnectAttempts = 0;
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    if (wsReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        wsReconnectAttempts++;
        connectWebSocket(onMessage);
      }, RECONNECT_DELAY);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error Handling
const handleError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw new Error(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'An error occurred');
  }
};

// Wrap API methods with error handling
const wrapApiMethod = <T>(method: (...args: any[]) => Promise<T>) => {
  return async (...args: any[]): Promise<T> => {
    try {
      return await method(...args);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
};

// Workflow Management
export const getWorkflows = wrapApiMethod(async (): Promise<AutomationWorkflow[]> => {
  const response = await api.get('/automation/workflows');
  return response.data;
});

export const getWorkflow = wrapApiMethod(async (id: string): Promise<AutomationWorkflow> => {
  const response = await api.get(`/automation/workflows/${id}`);
  return response.data;
});

export const createWorkflow = wrapApiMethod(async (workflow: Partial<AutomationWorkflow>): Promise<AutomationWorkflow> => {
  const response = await api.post('/automation/workflows', workflow);
  return response.data;
});

export const updateWorkflow = wrapApiMethod(async (id: string, workflow: Partial<AutomationWorkflow>): Promise<AutomationWorkflow> => {
  const response = await api.put(`/automation/workflows/${id}`, workflow);
  return response.data;
});

export const deleteWorkflow = wrapApiMethod(async (id: string): Promise<void> => {
  await api.delete(`/automation/workflows/${id}`);
});

export const toggleWorkflowStatus = wrapApiMethod(async (id: string, status: AutomationStatus): Promise<AutomationWorkflow> => {
  const response = await api.put(`/automation/workflows/${id}/status`, { status });
  return response.data;
});

// Template Management
export const getTemplates = wrapApiMethod(async (): Promise<AutomationTemplate[]> => {
  const response = await api.get('/automation/templates');
  return response.data;
});

export const getTemplate = wrapApiMethod(async (id: string): Promise<AutomationTemplate> => {
  const response = await api.get(`/automation/templates/${id}`);
  return response.data;
});

export const createTemplate = wrapApiMethod(async (template: Partial<AutomationTemplate>): Promise<AutomationTemplate> => {
  const response = await api.post('/automation/templates', template);
  return response.data;
});

export const updateTemplate = wrapApiMethod(async (id: string, template: Partial<AutomationTemplate>): Promise<AutomationTemplate> => {
  const response = await api.put(`/automation/templates/${id}`, template);
  return response.data;
});

export const deleteTemplate = wrapApiMethod(async (id: string): Promise<void> => {
  await api.delete(`/automation/templates/${id}`);
});

// Webhook Management
export const getWebhookEvents = wrapApiMethod(async (): Promise<WebhookEvent[]> => {
  const response = await api.get('/automation/webhooks/events');
  return response.data;
});

export const getWebhookEvent = wrapApiMethod(async (id: string): Promise<WebhookEvent> => {
  const response = await api.get(`/automation/webhooks/events/${id}`);
  return response.data;
});

export const retryWebhookEvent = wrapApiMethod(async (id: string): Promise<WebhookEvent> => {
  const response = await api.post(`/automation/webhooks/events/${id}/retry`);
  return response.data;
});

// Metrics and Analytics
export const getMetrics = wrapApiMethod(async (): Promise<AutomationMetrics> => {
  const response = await api.get('/automation/metrics');
  return response.data;
});

export const getPlatformMetrics = wrapApiMethod(async (platform: AutomationPlatform): Promise<AutomationMetrics['platformMetrics'][AutomationPlatform]> => {
  const response = await api.get(`/automation/metrics/platform/${platform}`);
  return response.data;
});

export const getPersonaMetrics = wrapApiMethod(async (personaType: string): Promise<AutomationMetrics['personaMetrics'][string]> => {
  const response = await api.get(`/automation/metrics/persona/${personaType}`);
  return response.data;
});

export const getWorkflowMetrics = wrapApiMethod(async (workflowId: string): Promise<AutomationMetrics> => {
  const response = await api.get(`/automation/metrics/workflow/${workflowId}`);
  return response.data;
});

// Alert Management
export const getAlerts = wrapApiMethod(async (): Promise<AutomationAlert[]> => {
  const response = await api.get('/automation/alerts');
  return response.data;
});

export const updateAlertStatus = wrapApiMethod(async (id: string, status: AutomationStatus): Promise<AutomationAlert> => {
  const response = await api.put(`/automation/alerts/${id}/status`, { status });
  return response.data;
});

// Rule Management
export const getRules = wrapApiMethod(async (): Promise<AutomationRule[]> => {
  const response = await api.get('/automation/rules');
  return response.data;
});

export const createRule = wrapApiMethod(async (rule: Partial<AutomationRule>): Promise<AutomationRule> => {
  const response = await api.post('/automation/rules', rule);
  return response.data;
});

export const updateRule = wrapApiMethod(async (id: string, rule: Partial<AutomationRule>): Promise<AutomationRule> => {
  const response = await api.put(`/automation/rules/${id}`, rule);
  return response.data;
});

export const deleteRule = wrapApiMethod(async (id: string): Promise<void> => {
  await api.delete(`/automation/rules/${id}`);
});

export const toggleRuleStatus = wrapApiMethod(async (id: string, enabled: boolean): Promise<AutomationRule> => {
  const response = await api.put(`/automation/rules/${id}/status`, { enabled });
  return response.data;
});

// Log Management
export const getLogs = wrapApiMethod(async (workflowId?: string): Promise<AutomationLog[]> => {
  const url = workflowId ? `/automation/logs?workflowId=${workflowId}` : '/automation/logs';
  const response = await api.get(url);
  return response.data;
});

export const getLog = wrapApiMethod(async (id: string): Promise<AutomationLog> => {
  const response = await api.get(`/automation/logs/${id}`);
  return response.data;
});

// Workflow Actions
export const executeWorkflow = wrapApiMethod(async (id: string): Promise<void> => {
  await api.post(`/automation/workflows/${id}/execute`);
});

// Rule Actions
export const executeRule = wrapApiMethod(async (id: string): Promise<void> => {
  await api.post(`/automation/rules/${id}/execute`);
});

// Real-time Updates
export const subscribeToUpdates = (onUpdate: (data: any) => void) => {
  const ws = connectWebSocket(onUpdate);
  return () => {
    if (ws) {
      ws.close();
    }
  };
};

// Advanced Filtering
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

export const getFilteredWorkflows = wrapApiMethod(async (filter: AutomationFilter): Promise<AutomationWorkflow[]> => {
  const response = await api.get('/automation/workflows/filter', { params: filter });
  return response.data;
});

export const getFilteredRules = wrapApiMethod(async (filter: AutomationFilter): Promise<AutomationRule[]> => {
  const response = await api.get('/automation/rules/filter', { params: filter });
  return response.data;
});

// Export Functionality
export const exportWorkflows = wrapApiMethod(async (format: 'csv' | 'json' | 'excel'): Promise<Blob> => {
  const response = await api.get('/automation/workflows/export', {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
});

export const exportRules = wrapApiMethod(async (format: 'csv' | 'json' | 'excel'): Promise<Blob> => {
  const response = await api.get('/automation/rules/export', {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
});

export const exportMetrics = wrapApiMethod(async (format: 'csv' | 'json' | 'excel'): Promise<Blob> => {
  const response = await api.get('/automation/metrics/export', {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
});

// Audit Logging
export interface AuditLog {
  id: string;
  action: string;
  entityType: 'workflow' | 'rule' | 'template';
  entityId: string;
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
}

export const getAuditLogs = wrapApiMethod(async (filter?: {
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<AuditLog[]> => {
  const response = await api.get('/automation/audit-logs', { params: filter });
  return response.data;
});

export const createAuditLog = wrapApiMethod(async (log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> => {
  const response = await api.post('/automation/audit-logs', log);
  return response.data;
}); 