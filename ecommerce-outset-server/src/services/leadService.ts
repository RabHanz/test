import axios from 'axios';
import {
  LeadProject,
  LeadCommunication,
  LeadNote,
  LeadTask,
  LeadDocument,
  LeadMetric,
  LeadTag,
  LeadFilter,
  LeadMetrics,
  LeadAlert,
  LeadTimelineEvent,
  LeadStatus,
  LeadSource,
  LeadPriority,
  CommunicationType
} from '../types/lead';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
});

// Error handling
const handleError = (error: any) => {
  if (error.response) {
    throw new Error(error.response.data.message || 'An error occurred');
  }
  throw error;
};

// Lead Project Management
export const getLeads = async (filter?: LeadFilter): Promise<LeadProject[]> => {
  try {
    const response = await api.get('/leads', { params: filter });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getLead = async (id: string): Promise<LeadProject> => {
  try {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createLead = async (lead: Partial<LeadProject>): Promise<LeadProject> => {
  try {
    const response = await api.post('/leads', lead);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateLead = async (id: string, lead: Partial<LeadProject>): Promise<LeadProject> => {
  try {
    const response = await api.put(`/leads/${id}`, lead);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteLead = async (id: string): Promise<void> => {
  try {
    await api.delete(`/leads/${id}`);
  } catch (error) {
    return handleError(error);
  }
};

// Communication Management
export const getCommunications = async (leadId: string): Promise<LeadCommunication[]> => {
  try {
    const response = await api.get(`/leads/${leadId}/communications`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addCommunication = async (leadId: string, communication: Partial<LeadCommunication>): Promise<LeadCommunication> => {
  try {
    const response = await api.post(`/leads/${leadId}/communications`, communication);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Notes Management
export const getNotes = async (leadId: string): Promise<LeadNote[]> => {
  try {
    const response = await api.get(`/leads/${leadId}/notes`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addNote = async (leadId: string, note: Partial<LeadNote>): Promise<LeadNote> => {
  try {
    const response = await api.post(`/leads/${leadId}/notes`, note);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Tasks Management
export const getTasks = async (leadId: string): Promise<LeadTask[]> => {
  try {
    const response = await api.get(`/leads/${leadId}/tasks`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addTask = async (leadId: string, task: Partial<LeadTask>): Promise<LeadTask> => {
  try {
    const response = await api.post(`/leads/${leadId}/tasks`, task);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateTask = async (leadId: string, taskId: string, task: Partial<LeadTask>): Promise<LeadTask> => {
  try {
    const response = await api.put(`/leads/${leadId}/tasks/${taskId}`, task);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Documents Management
export const getDocuments = async (leadId: string): Promise<LeadDocument[]> => {
  try {
    const response = await api.get(`/leads/${leadId}/documents`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const uploadDocument = async (leadId: string, file: File): Promise<LeadDocument> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/leads/${leadId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteDocument = async (leadId: string, documentId: string): Promise<void> => {
  try {
    await api.delete(`/leads/${leadId}/documents/${documentId}`);
  } catch (error) {
    return handleError(error);
  }
};

// Metrics Management
export const getMetrics = async (leadId: string): Promise<LeadMetric[]> => {
  try {
    const response = await api.get(`/leads/${leadId}/metrics`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addMetric = async (leadId: string, metric: Partial<LeadMetric>): Promise<LeadMetric> => {
  try {
    const response = await api.post(`/leads/${leadId}/metrics`, metric);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Tags Management
export const getTags = async (leadId: string): Promise<LeadTag[]> => {
  try {
    const response = await api.get(`/leads/${leadId}/tags`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addTag = async (leadId: string, tag: Partial<LeadTag>): Promise<LeadTag> => {
  try {
    const response = await api.post(`/leads/${leadId}/tags`, tag);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const removeTag = async (leadId: string, tagId: string): Promise<void> => {
  try {
    await api.delete(`/leads/${leadId}/tags/${tagId}`);
  } catch (error) {
    return handleError(error);
  }
};

// Analytics and Reporting
export const getLeadMetrics = async (): Promise<LeadMetrics> => {
  try {
    const response = await api.get('/leads/metrics');
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getAlerts = async (): Promise<LeadAlert[]> => {
  try {
    const response = await api.get('/leads/alerts');
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const markAlertAsRead = async (alertId: string): Promise<void> => {
  try {
    await api.put(`/leads/alerts/${alertId}/read`);
  } catch (error) {
    return handleError(error);
  }
};

// Export Functionality
export const exportLeadData = async (leadId: string, format: 'csv' | 'json' | 'excel'): Promise<Blob> => {
  try {
    const response = await api.get(`/leads/${leadId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// WebSocket Connection
let ws: WebSocket | null = null;
let updateCallback: ((data: any) => void) | null = null;

export const connectWebSocket = () => {
  if (ws) return;

  ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:3000/ws');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (updateCallback) {
      updateCallback(data);
    }
  };

  ws.onclose = () => {
    ws = null;
    setTimeout(connectWebSocket, 5000);
  };
};

export const subscribeToUpdates = (callback: (data: any) => void) => {
  updateCallback = callback;
  if (!ws) {
    connectWebSocket();
  }
};

export const unsubscribeFromUpdates = () => {
  updateCallback = null;
  if (ws) {
    ws.close();
    ws = null;
  }
}; 