import axios from 'axios';
import * as automationService from '../automationService';
import { AutomationPlatform, AutomationStatus, AutomationType } from '../../types/automation';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Automation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Workflow Management', () => {
    it('should fetch workflows successfully', async () => {
      const mockWorkflows = [
        {
          id: '1',
          name: 'Test Workflow',
          platform: AutomationPlatform.HUBSPOT,
          type: AutomationType.WORKFLOW,
          status: AutomationStatus.ACTIVE,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockWorkflows });

      const result = await automationService.getWorkflows();
      expect(result).toEqual(mockWorkflows);
      expect(mockedAxios.get).toHaveBeenCalledWith('/automation/workflows');
    });

    it('should handle workflow creation', async () => {
      const mockWorkflow = {
        name: 'New Workflow',
        platform: AutomationPlatform.HUBSPOT,
      };

      mockedAxios.post.mockResolvedValueOnce({ data: { id: '1', ...mockWorkflow } });

      const result = await automationService.createWorkflow(mockWorkflow);
      expect(result).toHaveProperty('id');
      expect(mockedAxios.post).toHaveBeenCalledWith('/automation/workflows', mockWorkflow);
    });
  });

  describe('Rule Management', () => {
    it('should fetch rules successfully', async () => {
      const mockRules = [
        {
          id: '1',
          name: 'Test Rule',
          enabled: true,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockRules });

      const result = await automationService.getRules();
      expect(result).toEqual(mockRules);
      expect(mockedAxios.get).toHaveBeenCalledWith('/automation/rules');
    });

    it('should toggle rule status', async () => {
      const mockRule = {
        id: '1',
        enabled: true,
      };

      mockedAxios.put.mockResolvedValueOnce({ data: mockRule });

      const result = await automationService.toggleRuleStatus('1', true);
      expect(result).toEqual(mockRule);
      expect(mockedAxios.put).toHaveBeenCalledWith('/automation/rules/1/status', { enabled: true });
    });
  });

  describe('Metrics and Analytics', () => {
    it('should fetch metrics successfully', async () => {
      const mockMetrics = {
        overallMetrics: {
          totalWorkflows: 10,
          activeWorkflows: 5,
          averageSuccessRate: 95,
          totalExecutions: 100,
        },
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockMetrics });

      const result = await automationService.getMetrics();
      expect(result).toEqual(mockMetrics);
      expect(mockedAxios.get).toHaveBeenCalledWith('/automation/metrics');
    });
  });

  describe('Export Functionality', () => {
    it('should export workflows in CSV format', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      mockedAxios.get.mockResolvedValueOnce({ data: mockBlob });

      const result = await automationService.exportWorkflows('csv');
      expect(result).toBeInstanceOf(Blob);
      expect(mockedAxios.get).toHaveBeenCalledWith('/automation/workflows/export', {
        params: { format: 'csv' },
        responseType: 'blob',
      });
    });
  });

  describe('Audit Logging', () => {
    it('should fetch audit logs', async () => {
      const mockLogs = [
        {
          id: '1',
          action: 'CREATE',
          entityType: 'workflow',
          entityId: '1',
          userId: 'user1',
          timestamp: new Date(),
          details: {},
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockLogs });

      const result = await automationService.getAuditLogs();
      expect(result).toEqual(mockLogs);
      expect(mockedAxios.get).toHaveBeenCalledWith('/automation/audit-logs');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: errorMessage },
        },
      });

      await expect(automationService.getWorkflows()).rejects.toThrow(errorMessage);
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        request: {},
      });

      await expect(automationService.getWorkflows()).rejects.toThrow('No response received from server');
    });
  });
}); 