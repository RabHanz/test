import axios, { AxiosInstance } from 'axios';

export abstract class BaseService<T> {
  protected api: AxiosInstance;
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  protected handleError(error: any): never {
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred');
    }
    throw error;
  }

  async getAll(params?: any): Promise<T[]> {
    try {
      const response = await this.api.get(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(id: string): Promise<T> {
    try {
      const response = await this.api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const response = await this.api.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const response = await this.api.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMetrics(id: string): Promise<any> {
    try {
      const response = await this.api.get(`${this.baseUrl}/${id}/metrics`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getLogs(id: string): Promise<any[]> {
    try {
      const response = await this.api.get(`${this.baseUrl}/${id}/logs`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAlerts(id: string): Promise<any[]> {
    try {
      const response = await this.api.get(`${this.baseUrl}/${id}/alerts`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getHealthChecks(id: string): Promise<any[]> {
    try {
      const response = await this.api.get(`${this.baseUrl}/${id}/health`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
} 