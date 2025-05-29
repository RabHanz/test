import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsolidatedAutomationDashboard from '../ConsolidatedAutomationDashboard';
import * as automationService from '../../../services/automationService';
import { AutomationPlatform, AutomationStatus, AutomationType } from '../../../types/automation';

// Mock the automation service
jest.mock('../../../services/automationService');

describe('ConsolidatedAutomationDashboard Performance', () => {
  // Generate large datasets for performance testing
  const generateLargeDataset = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
      id: `id-${index}`,
      name: `Workflow ${index}`,
      platform: AutomationPlatform.HUBSPOT,
      type: AutomationType.WORKFLOW,
      status: AutomationStatus.ACTIVE,
      trigger: { type: 'webhook', config: {} },
      actions: [{ type: 'email', target: 'user@example.com', parameters: {} }],
      metadata: {
        description: `Description ${index}`,
        tags: ['test'],
        createdBy: 'user1',
        lastModifiedBy: 'user1',
      },
      metrics: {
        successRate: 95,
        totalExecutions: 100,
        averageExecutionTime: 500,
        lastExecution: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  };

  const generateLargeRulesDataset = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
      id: `rule-${index}`,
      name: `Rule ${index}`,
      description: `Rule description ${index}`,
      conditions: [{ field: 'status', operator: 'equals', value: 'active' }],
      actions: [{ type: 'notify', target: 'admin', parameters: {} }],
      priority: index,
      enabled: true,
      metadata: {
        tags: ['test'],
        createdBy: 'user1',
        lastModifiedBy: 'user1',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders large dataset (1000 items) within 2 seconds', async () => {
    const largeWorkflows = generateLargeDataset(1000);
    const largeRules = generateLargeRulesDataset(1000);

    (automationService.getWorkflows as jest.Mock).mockResolvedValue(largeWorkflows);
    (automationService.getRules as jest.Mock).mockResolvedValue(largeRules);
    (automationService.getMetrics as jest.Mock).mockResolvedValue({
      overallMetrics: {
        totalWorkflows: 1000,
        activeWorkflows: 500,
        averageSuccessRate: 95,
        totalExecutions: 10000,
      },
      platformMetrics: {},
      personaMetrics: {},
    });
    (automationService.getAlerts as jest.Mock).mockResolvedValue([]);

    const startTime = performance.now();
    
    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    await waitFor(() => {
      expect(screen.getByText('Workflow 0')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(2000); // Should render within 2 seconds
  });

  it('handles rapid filter changes efficiently', async () => {
    const workflows = generateLargeDataset(100);
    const rules = generateLargeRulesDataset(100);

    (automationService.getWorkflows as jest.Mock).mockResolvedValue(workflows);
    (automationService.getRules as jest.Mock).mockResolvedValue(rules);
    (automationService.getMetrics as jest.Mock).mockResolvedValue({
      overallMetrics: {
        totalWorkflows: 100,
        activeWorkflows: 50,
        averageSuccessRate: 95,
        totalExecutions: 1000,
      },
      platformMetrics: {},
      personaMetrics: {},
    });
    (automationService.getAlerts as jest.Mock).mockResolvedValue([]);

    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    await waitFor(() => {
      expect(screen.getByText('Workflow 0')).toBeInTheDocument();
    });

    const filterButton = screen.getByRole('button', { name: /filters/i });
    
    // Simulate rapid filter changes
    const startTime = performance.now();
    
    for (let i = 0; i < 10; i++) {
      await userEvent.click(filterButton);
      const platformSelect = screen.getByLabelText(/platform/i);
      await userEvent.selectOptions(platformSelect, AutomationPlatform.HUBSPOT);
      const closeButton = screen.getByRole('button', { name: /close/i });
      await userEvent.click(closeButton);
    }

    const endTime = performance.now();
    const filterTime = endTime - startTime;

    expect(filterTime / 10).toBeLessThan(200); // Each filter change should take less than 200ms
  });

  it('handles real-time updates efficiently', async () => {
    const workflows = generateLargeDataset(100);
    const rules = generateLargeRulesDataset(100);

    (automationService.getWorkflows as jest.Mock).mockResolvedValue(workflows);
    (automationService.getRules as jest.Mock).mockResolvedValue(rules);
    (automationService.getMetrics as jest.Mock).mockResolvedValue({
      overallMetrics: {
        totalWorkflows: 100,
        activeWorkflows: 50,
        averageSuccessRate: 95,
        totalExecutions: 1000,
      },
      platformMetrics: {},
      personaMetrics: {},
    });
    (automationService.getAlerts as jest.Mock).mockResolvedValue([]);

    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    await waitFor(() => {
      expect(screen.getByText('Workflow 0')).toBeInTheDocument();
    });

    // Simulate real-time updates
    const startTime = performance.now();
    
    for (let i = 0; i < 50; i++) {
      const update = {
        type: 'workflow',
        action: 'update',
        data: {
          ...workflows[0],
          name: `Updated Workflow ${i}`,
        },
      };
      
      // Simulate WebSocket message
      const event = new MessageEvent('message', {
        data: JSON.stringify(update),
      });
      
      window.dispatchEvent(event);
    }

    const endTime = performance.now();
    const updateTime = endTime - startTime;

    expect(updateTime / 50).toBeLessThan(50); // Each update should take less than 50ms
  });

  it('maintains smooth scrolling with large datasets', async () => {
    const workflows = generateLargeDataset(500);
    const rules = generateLargeRulesDataset(500);

    (automationService.getWorkflows as jest.Mock).mockResolvedValue(workflows);
    (automationService.getRules as jest.Mock).mockResolvedValue(rules);
    (automationService.getMetrics as jest.Mock).mockResolvedValue({
      overallMetrics: {
        totalWorkflows: 500,
        activeWorkflows: 250,
        averageSuccessRate: 95,
        totalExecutions: 5000,
      },
      platformMetrics: {},
      personaMetrics: {},
    });
    (automationService.getAlerts as jest.Mock).mockResolvedValue([]);

    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    await waitFor(() => {
      expect(screen.getByText('Workflow 0')).toBeInTheDocument();
    });

    const workflowList = screen.getByRole('list');
    const startTime = performance.now();

    // Simulate rapid scrolling
    for (let i = 0; i < 10; i++) {
      workflowList.scrollTop = i * 1000;
    }

    const endTime = performance.now();
    const scrollTime = endTime - startTime;

    expect(scrollTime / 10).toBeLessThan(100); // Each scroll should take less than 100ms
  });
}); 