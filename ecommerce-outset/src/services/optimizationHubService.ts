import axios from 'axios';
import {
  PlatformMetrics,
  OptimizationTask,
  PersonaPerformance,
  IntegrationHealth,
  AnomalyAlert,
  OptimizationReport,
} from '../types/optimizationHub';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Platform Metrics
export const getPlatformMetrics = async (): Promise<PlatformMetrics[]> => {
  const response = await api.get('/optimization-hub/metrics');
  return response.data;
};

export const refreshPlatformMetrics = async (platformType: string): Promise<PlatformMetrics> => {
  const response = await api.post(`/optimization-hub/metrics/${platformType}/refresh`);
  return response.data;
};

// Optimization Tasks
export const getTasks = async (): Promise<OptimizationTask[]> => {
  const response = await api.get('/optimization-hub/tasks');
  return response.data;
};

export const createTask = async (task: Partial<OptimizationTask>): Promise<OptimizationTask> => {
  const response = await api.post('/optimization-hub/tasks', task);
  return response.data;
};

export const updateTask = async (
  taskId: string,
  updates: Partial<OptimizationTask>
): Promise<OptimizationTask> => {
  const response = await api.put(`/optimization-hub/tasks/${taskId}`, updates);
  return response.data;
};

// Persona Performance
export const getPersonaPerformance = async (): Promise<PersonaPerformance[]> => {
  const response = await api.get('/optimization-hub/persona-performance');
  return response.data;
};

export const getPersonaRecommendations = async (
  personaType: string
): Promise<PersonaPerformance> => {
  const response = await api.get(`/optimization-hub/persona-performance/${personaType}/recommendations`);
  return response.data;
};

// Integration Health
export const getIntegrationHealth = async (): Promise<IntegrationHealth[]> => {
  const response = await api.get('/optimization-hub/integrations/health');
  return response.data;
};

export const checkIntegrationHealth = async (
  platformType: string
): Promise<IntegrationHealth> => {
  const response = await api.post(`/optimization-hub/integrations/${platformType}/check`);
  return response.data;
};

// Alerts
export const getAlerts = async (): Promise<AnomalyAlert[]> => {
  const response = await api.get('/optimization-hub/alerts');
  return response.data;
};

export const resolveAlert = async (alertId: string): Promise<void> => {
  await api.put(`/optimization-hub/alerts/${alertId}/resolve`);
};

// Reports
export const getReports = async (): Promise<OptimizationReport[]> => {
  const response = await api.get('/optimization-hub/reports');
  return response.data;
};

export const generateReport = async (
  period: 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date
): Promise<OptimizationReport> => {
  const response = await api.post('/optimization-hub/reports/generate', {
    period,
    startDate,
    endDate,
  });
  return response.data;
};

// Project Management Integration
export const syncTasks = async (platform: 'clickup' | 'asana'): Promise<void> => {
  await api.post(`/optimization-hub/sync/${platform}`);
};

// Analytics Integration
export const syncAnalytics = async (platform: 'google' | 'email' | 'crm'): Promise<void> => {
  await api.post(`/optimization-hub/analytics/${platform}/sync`);
}; 