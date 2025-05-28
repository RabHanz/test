import axios from 'axios';

// API Configuration
const API_CONFIG = {
  crm: {
    baseURL: process.env.NEXT_PUBLIC_CRM_API_URL,
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRM_API_KEY}`,
      'Content-Type': 'application/json'
    }
  },
  email: {
    baseURL: process.env.NEXT_PUBLIC_EMAIL_API_URL,
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_EMAIL_API_KEY}`,
      'Content-Type': 'application/json'
    }
  },
  calendar: {
    baseURL: process.env.NEXT_PUBLIC_CALENDAR_API_URL,
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CALENDAR_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
};

// CRM API Service
export const crmApi = {
  // Leads
  getLeads: async (params?: any) => {
    const response = await axios.get(`${API_CONFIG.crm.baseURL}/leads`, {
      headers: API_CONFIG.crm.headers,
      params
    });
    return response.data;
  },

  createLead: async (leadData: any) => {
    const response = await axios.post(`${API_CONFIG.crm.baseURL}/leads`, leadData, {
      headers: API_CONFIG.crm.headers
    });
    return response.data;
  },

  updateLead: async (leadId: string, leadData: any) => {
    const response = await axios.put(`${API_CONFIG.crm.baseURL}/leads/${leadId}`, leadData, {
      headers: API_CONFIG.crm.headers
    });
    return response.data;
  },

  // Deals
  getDeals: async (params?: any) => {
    const response = await axios.get(`${API_CONFIG.crm.baseURL}/deals`, {
      headers: API_CONFIG.crm.headers,
      params
    });
    return response.data;
  },

  createDeal: async (dealData: any) => {
    const response = await axios.post(`${API_CONFIG.crm.baseURL}/deals`, dealData, {
      headers: API_CONFIG.crm.headers
    });
    return response.data;
  },

  updateDeal: async (dealId: string, dealData: any) => {
    const response = await axios.put(`${API_CONFIG.crm.baseURL}/deals/${dealId}`, dealData, {
      headers: API_CONFIG.crm.headers
    });
    return response.data;
  }
};

// Email Marketing API Service
export const emailApi = {
  // Campaigns
  getCampaigns: async (params?: any) => {
    const response = await axios.get(`${API_CONFIG.email.baseURL}/campaigns`, {
      headers: API_CONFIG.email.headers,
      params
    });
    return response.data;
  },

  createCampaign: async (campaignData: any) => {
    const response = await axios.post(`${API_CONFIG.email.baseURL}/campaigns`, campaignData, {
      headers: API_CONFIG.email.headers
    });
    return response.data;
  },

  // Templates
  getTemplates: async (params?: any) => {
    const response = await axios.get(`${API_CONFIG.email.baseURL}/templates`, {
      headers: API_CONFIG.email.headers,
      params
    });
    return response.data;
  },

  createTemplate: async (templateData: any) => {
    const response = await axios.post(`${API_CONFIG.email.baseURL}/templates`, templateData, {
      headers: API_CONFIG.email.headers
    });
    return response.data;
  },

  // Lists
  getLists: async (params?: any) => {
    const response = await axios.get(`${API_CONFIG.email.baseURL}/lists`, {
      headers: API_CONFIG.email.headers,
      params
    });
    return response.data;
  },

  addSubscriber: async (listId: string, subscriberData: any) => {
    const response = await axios.post(`${API_CONFIG.email.baseURL}/lists/${listId}/subscribers`, subscriberData, {
      headers: API_CONFIG.email.headers
    });
    return response.data;
  }
};

// Calendar API Service
export const calendarApi = {
  // Events
  getEvents: async (params?: any) => {
    const response = await axios.get(`${API_CONFIG.calendar.baseURL}/events`, {
      headers: API_CONFIG.calendar.headers,
      params
    });
    return response.data;
  },

  createEvent: async (eventData: any) => {
    const response = await axios.post(`${API_CONFIG.calendar.baseURL}/events`, eventData, {
      headers: API_CONFIG.calendar.headers
    });
    return response.data;
  },

  updateEvent: async (eventId: string, eventData: any) => {
    const response = await axios.put(`${API_CONFIG.calendar.baseURL}/events/${eventId}`, eventData, {
      headers: API_CONFIG.calendar.headers
    });
    return response.data;
  },

  deleteEvent: async (eventId: string) => {
    const response = await axios.delete(`${API_CONFIG.calendar.baseURL}/events/${eventId}`, {
      headers: API_CONFIG.calendar.headers
    });
    return response.data;
  },

  // Availability
  getAvailability: async (params?: any) => {
    const response = await axios.get(`${API_CONFIG.calendar.baseURL}/availability`, {
      headers: API_CONFIG.calendar.headers,
      params
    });
    return response.data;
  }
};

// Error handling middleware
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          console.error('Unauthorized access. Please check your API keys.');
          break;
        case 403:
          // Handle forbidden access
          console.error('Access forbidden. Please check your permissions.');
          break;
        case 429:
          // Handle rate limiting
          console.error('Rate limit exceeded. Please try again later.');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Handle network errors
      console.error('Network Error:', error.request);
    } else {
      // Handle other errors
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
); 