import axios from 'axios';
import { Lead, CRMIntegration, AutomationRule } from '../types/leadScoring';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lead endpoints
export const getLeads = async (): Promise<Lead[]> => {
  const response = await api.get('/leads');
  return response.data;
};

export const getLead = async (id: string): Promise<Lead> => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

export const createLead = async (lead: Omit<Lead, 'id'>): Promise<Lead> => {
  const response = await api.post('/leads', lead);
  return response.data;
};

export const updateLead = async (id: string, updates: Partial<Lead>): Promise<Lead> => {
  const response = await api.patch(`/leads/${id}`, updates);
  return response.data;
};

export const deleteLead = async (id: string): Promise<void> => {
  await api.delete(`/leads/${id}`);
};

// Integration endpoints
export const getIntegrations = async (): Promise<CRMIntegration[]> => {
  const response = await api.get('/integrations');
  return response.data;
};

export const getIntegration = async (id: string): Promise<CRMIntegration> => {
  const response = await api.get(`/integrations/${id}`);
  return response.data;
};

export const createIntegration = async (
  integration: Omit<CRMIntegration, 'id'>
): Promise<CRMIntegration> => {
  const response = await api.post('/integrations', integration);
  return response.data;
};

export const updateIntegration = async (
  id: string,
  updates: Partial<CRMIntegration>
): Promise<CRMIntegration> => {
  const response = await api.patch(`/integrations/${id}`, updates);
  return response.data;
};

export const deleteIntegration = async (id: string): Promise<void> => {
  await api.delete(`/integrations/${id}`);
};

// Automation Rule endpoints
export const getAutomationRules = async (): Promise<AutomationRule[]> => {
  const response = await api.get('/automation-rules');
  return response.data;
};

export const getAutomationRule = async (id: string): Promise<AutomationRule> => {
  const response = await api.get(`/automation-rules/${id}`);
  return response.data;
};

export const createAutomationRule = async (
  rule: Omit<AutomationRule, 'id'>
): Promise<AutomationRule> => {
  const response = await api.post('/automation-rules', rule);
  return response.data;
};

export const updateAutomationRule = async (
  id: string,
  updates: Partial<AutomationRule>
): Promise<AutomationRule> => {
  const response = await api.patch(`/automation-rules/${id}`, updates);
  return response.data;
};

export const deleteAutomationRule = async (id: string): Promise<void> => {
  await api.delete(`/automation-rules/${id}`);
};

// Webhook endpoints
export const registerWebhook = async (
  integrationId: string,
  webhookUrl: string
): Promise<void> => {
  await api.post(`/integrations/${integrationId}/webhooks`, { webhookUrl });
};

export const unregisterWebhook = async (
  integrationId: string,
  webhookId: string
): Promise<void> => {
  await api.delete(`/integrations/${integrationId}/webhooks/${webhookId}`);
};

// Error handling middleware
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      throw new Error('Network error occurred');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
      throw new Error('Request setup error');
    }
  }
); 