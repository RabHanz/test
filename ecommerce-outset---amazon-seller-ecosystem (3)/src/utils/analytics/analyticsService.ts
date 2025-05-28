import axios from 'axios';
import { ProcessedAnalyticsData, processAnalyticsData } from './dataProcessing';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  segment?: string;
  channel?: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private axiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async fetchAnalyticsData(filters?: AnalyticsFilters): Promise<ProcessedAnalyticsData> {
    try {
      const response = await this.axiosInstance.get('/analytics', { params: filters });
      return processAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  public async fetchTrafficData(filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/analytics/traffic', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      throw error;
    }
  }

  public async fetchFunnelData(filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/analytics/funnel', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      throw error;
    }
  }

  public async fetchRevenueData(filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/analytics/revenue', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
  }

  public async fetchCustomerSatisfaction(filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/analytics/satisfaction', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer satisfaction data:', error);
      throw error;
    }
  }

  public async fetchTeamPerformance(filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/analytics/team', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching team performance data:', error);
      throw error;
    }
  }

  public async exportAnalyticsData(filters?: AnalyticsFilters): Promise<Blob> {
    try {
      const response = await this.axiosInstance.get('/analytics/export', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }
}

export default AnalyticsService; 