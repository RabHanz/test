import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  LaunchProject,
  LaunchChecklist,
  LaunchValidation,
  LaunchMetric,
  LaunchTimelineEvent,
  LaunchDocument,
  LaunchTeamMember,
  LaunchFilter,
  LaunchMetrics,
  LaunchAlert,
  LaunchStatus,
  LaunchPhase,
  ValidationStatus,
  LaunchPriority,
} from '../types/launch';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling
const handleError = (error: any) => {
  if (error.response) {
    throw new Error(error.response.data.message || 'API Error');
  } else if (error.request) {
    throw new Error('No response received from server');
  } else {
    throw new Error('Request failed');
  }
};

// Wrap API methods with error handling
const wrapApiMethod = async <T>(method: () => Promise<T>): Promise<T> => {
  try {
    return await method();
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Project Management
export const getProjects = async (filter?: LaunchFilter): Promise<LaunchProject[]> => {
  return wrapApiMethod(() => api.get('/launch/projects', { params: filter }).then(res => res.data));
};

export const getProject = async (id: string): Promise<LaunchProject> => {
  return wrapApiMethod(() => api.get(`/launch/projects/${id}`).then(res => res.data));
};

export const createProject = async (project: Partial<LaunchProject>): Promise<LaunchProject> => {
  return wrapApiMethod(() => api.post('/launch/projects', project).then(res => res.data));
};

export const updateProject = async (id: string, project: Partial<LaunchProject>): Promise<LaunchProject> => {
  return wrapApiMethod(() => api.put(`/launch/projects/${id}`, project).then(res => res.data));
};

export const deleteProject = async (id: string): Promise<void> => {
  return wrapApiMethod(() => api.delete(`/launch/projects/${id}`).then(res => res.data));
};

// Checklist Management
export const getChecklists = async (projectId: string): Promise<LaunchChecklist[]> => {
  return wrapApiMethod(() => api.get(`/launch/projects/${projectId}/checklists`).then(res => res.data));
};

export const createChecklist = async (projectId: string, checklist: Partial<LaunchChecklist>): Promise<LaunchChecklist> => {
  return wrapApiMethod(() => api.post(`/launch/projects/${projectId}/checklists`, checklist).then(res => res.data));
};

export const updateChecklist = async (projectId: string, id: string, checklist: Partial<LaunchChecklist>): Promise<LaunchChecklist> => {
  return wrapApiMethod(() => api.put(`/launch/projects/${projectId}/checklists/${id}`, checklist).then(res => res.data));
};

export const deleteChecklist = async (projectId: string, id: string): Promise<void> => {
  return wrapApiMethod(() => api.delete(`/launch/projects/${projectId}/checklists/${id}`).then(res => res.data));
};

// Validation Management
export const getValidations = async (projectId: string): Promise<LaunchValidation[]> => {
  return wrapApiMethod(() => api.get(`/launch/projects/${projectId}/validations`).then(res => res.data));
};

export const createValidation = async (projectId: string, validation: Partial<LaunchValidation>): Promise<LaunchValidation> => {
  return wrapApiMethod(() => api.post(`/launch/projects/${projectId}/validations`, validation).then(res => res.data));
};

export const updateValidation = async (projectId: string, id: string, validation: Partial<LaunchValidation>): Promise<LaunchValidation> => {
  return wrapApiMethod(() => api.put(`/launch/projects/${projectId}/validations/${id}`, validation).then(res => res.data));
};

// Metrics Management
export const getMetrics = async (projectId: string): Promise<LaunchMetric[]> => {
  return wrapApiMethod(() => api.get(`/launch/projects/${projectId}/metrics`).then(res => res.data));
};

export const createMetric = async (projectId: string, metric: Partial<LaunchMetric>): Promise<LaunchMetric> => {
  return wrapApiMethod(() => api.post(`/launch/projects/${projectId}/metrics`, metric).then(res => res.data));
};

export const updateMetric = async (projectId: string, id: string, metric: Partial<LaunchMetric>): Promise<LaunchMetric> => {
  return wrapApiMethod(() => api.put(`/launch/projects/${projectId}/metrics/${id}`, metric).then(res => res.data));
};

// Timeline Management
export const getTimelineEvents = async (projectId: string): Promise<LaunchTimelineEvent[]> => {
  return wrapApiMethod(() => api.get(`/launch/projects/${projectId}/timeline`).then(res => res.data));
};

export const createTimelineEvent = async (projectId: string, event: Partial<LaunchTimelineEvent>): Promise<LaunchTimelineEvent> => {
  return wrapApiMethod(() => api.post(`/launch/projects/${projectId}/timeline`, event).then(res => res.data));
};

export const updateTimelineEvent = async (projectId: string, id: string, event: Partial<LaunchTimelineEvent>): Promise<LaunchTimelineEvent> => {
  return wrapApiMethod(() => api.put(`/launch/projects/${projectId}/timeline/${id}`, event).then(res => res.data));
};

export const deleteTimelineEvent = async (projectId: string, id: string): Promise<void> => {
  return wrapApiMethod(() => api.delete(`/launch/projects/${projectId}/timeline/${id}`).then(res => res.data));
};

// Document Management
export const getDocuments = async (projectId: string): Promise<LaunchDocument[]> => {
  return wrapApiMethod(() => api.get(`/launch/projects/${projectId}/documents`).then(res => res.data));
};

export const uploadDocument = async (projectId: string, file: File, metadata: Partial<LaunchDocument>): Promise<LaunchDocument> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));

  return wrapApiMethod(() => api.post(`/launch/projects/${projectId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data));
};

export const deleteDocument = async (projectId: string, id: string): Promise<void> => {
  return wrapApiMethod(() => api.delete(`/launch/projects/${projectId}/documents/${id}`).then(res => res.data));
};

// Team Management
export const getTeamMembers = async (projectId: string): Promise<LaunchTeamMember[]> => {
  return wrapApiMethod(() => api.get(`/launch/projects/${projectId}/team`).then(res => res.data));
};

export const addTeamMember = async (projectId: string, member: Partial<LaunchTeamMember>): Promise<LaunchTeamMember> => {
  return wrapApiMethod(() => api.post(`/launch/projects/${projectId}/team`, member).then(res => res.data));
};

export const updateTeamMember = async (projectId: string, id: string, member: Partial<LaunchTeamMember>): Promise<LaunchTeamMember> => {
  return wrapApiMethod(() => api.put(`/launch/projects/${projectId}/team/${id}`, member).then(res => res.data));
};

export const removeTeamMember = async (projectId: string, id: string): Promise<void> => {
  return wrapApiMethod(() => api.delete(`/launch/projects/${projectId}/team/${id}`).then(res => res.data));
};

// Analytics and Reporting
export const getProjectMetrics = async (projectId: string): Promise<LaunchMetrics> => {
  return wrapApiMethod(() => api.get(`/launch/projects/${projectId}/analytics`).then(res => res.data));
};

export const getAlerts = async (projectId: string): Promise<LaunchAlert[]> => {
  return wrapApiMethod(() => api.get(`/launch/projects/${projectId}/alerts`).then(res => res.data));
};

export const markAlertAsRead = async (projectId: string, alertId: string): Promise<void> => {
  return wrapApiMethod(() => api.put(`/launch/projects/${projectId}/alerts/${alertId}/read`).then(res => res.data));
};

// Export functionality
export const exportProjectData = async (projectId: string, format: 'csv' | 'json' | 'excel'): Promise<Blob> => {
  return wrapApiMethod(() => api.get(`/launch/projects/${projectId}/export`, {
    params: { format },
    responseType: 'blob',
  }).then(res => res.data));
};

// WebSocket connection for real-time updates
let ws: WebSocket | null = null;
const subscribers: ((data: any) => void)[] = [];

export const connectWebSocket = (projectId: string) => {
  const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:3000'}/launch/${projectId}`;
  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    subscribers.forEach(callback => callback(data));
  };

  ws.onclose = () => {
    setTimeout(() => connectWebSocket(projectId), 5000);
  };
};

export const subscribeToUpdates = (callback: (data: any) => void) => {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}; 