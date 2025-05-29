import axios from 'axios';
import {
  IntegrationHealth,
  ChecklistItem,
  PersonaJourney,
  BusinessMetrics,
  LaunchNotification,
  RollbackPlan,
  LaunchSuccessMetrics,
} from '../types/launchReadiness';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Integration Health
export const getIntegrationHealth = async (): Promise<IntegrationHealth[]> => {
  const response = await api.get('/launch-readiness/integrations');
  return response.data;
};

export const checkIntegrationHealth = async (integrationId: string): Promise<IntegrationHealth> => {
  const response = await api.post(`/launch-readiness/integrations/${integrationId}/check`);
  return response.data;
};

// Checklist
export const getChecklist = async (): Promise<ChecklistItem[]> => {
  const response = await api.get('/launch-readiness/checklist');
  return response.data;
};

export const updateChecklistItem = async (
  itemId: string,
  status: string,
  notes?: string
): Promise<ChecklistItem> => {
  const response = await api.put(`/launch-readiness/checklist/${itemId}`, {
    status,
    notes,
  });
  return response.data;
};

// Persona Journeys
export const getPersonaJourneys = async (): Promise<PersonaJourney[]> => {
  const response = await api.get('/launch-readiness/persona-journeys');
  return response.data;
};

export const testPersonaJourney = async (
  personaType: string,
  journeyId: string
): Promise<PersonaJourney> => {
  const response = await api.post(`/launch-readiness/persona-journeys/${personaType}/${journeyId}/test`);
  return response.data;
};

// Business Metrics
export const getBusinessMetrics = async (): Promise<BusinessMetrics[]> => {
  const response = await api.get('/launch-readiness/business-metrics');
  return response.data;
};

export const updateBusinessMetrics = async (
  personaType: string,
  metrics: Partial<BusinessMetrics>
): Promise<BusinessMetrics> => {
  const response = await api.put(`/launch-readiness/business-metrics/${personaType}`, metrics);
  return response.data;
};

// Notifications
export const getNotifications = async (): Promise<LaunchNotification[]> => {
  const response = await api.get('/launch-readiness/notifications');
  return response.data;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await api.put(`/launch-readiness/notifications/${notificationId}/read`);
};

// Rollback Plan
export const getRollbackPlan = async (): Promise<RollbackPlan> => {
  const response = await api.get('/launch-readiness/rollback-plan');
  return response.data;
};

export const verifyRollbackStep = async (stepId: string): Promise<void> => {
  await api.post(`/launch-readiness/rollback-plan/${stepId}/verify`);
};

// Launch Success Metrics
export const getLaunchSuccessMetrics = async (): Promise<LaunchSuccessMetrics> => {
  const response = await api.get('/launch-readiness/success-metrics');
  return response.data;
};

export const updateLaunchGoal = async (
  goalId: string,
  current: number
): Promise<void> => {
  await api.put(`/launch-readiness/success-metrics/goals/${goalId}`, { current });
}; 