import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsolidatedAutomationDashboard from '../ConsolidatedAutomationDashboard';
import * as automationService from '../../../services/automationService';
import { AutomationPlatform, AutomationStatus, AutomationType } from '../../../types/automation';

// Mock the automation service
jest.mock('../../../services/automationService');

describe('ConsolidatedAutomationDashboard', () => {
  const mockWorkflows = [
    {
      id: '1',
      name: 'Test Workflow',
      platform: AutomationPlatform.HUBSPOT,
      type: AutomationType.WORKFLOW,
      status: AutomationStatus.ACTIVE,
      trigger: { type: 'webhook', config: {} },
      actions: [{ type: 'email', target: 'user@example.com', parameters: {} }],
      metadata: {
        description: 'Test workflow description',
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
    },
  ];

  const mockRules = [
    {
      id: '1',
      name: 'Test Rule',
      description: 'Test rule description',
      conditions: [{ field: 'status', operator: 'equals', value: 'active' }],
      actions: [{ type: 'notify', target: 'admin', parameters: {} }],
      priority: 1,
      enabled: true,
      metadata: {
        tags: ['test'],
        createdBy: 'user1',
        lastModifiedBy: 'user1',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockMetrics = {
    overallMetrics: {
      totalWorkflows: 10,
      activeWorkflows: 5,
      averageSuccessRate: 95,
      totalExecutions: 100,
    },
    platformMetrics: {
      [AutomationPlatform.HUBSPOT]: {
        activeWorkflows: 3,
        conversionRate: 90,
        averageTimeToConversion: 1000,
        revenueAttribution: 5000,
      },
    },
    personaMetrics: {
      'test-persona': {
        activeWorkflows: 2,
        conversionRate: 85,
        averageTimeToConversion: 1200,
        revenueAttribution: 3000,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (automationService.getWorkflows as jest.Mock).mockResolvedValue(mockWorkflows);
    (automationService.getRules as jest.Mock).mockResolvedValue(mockRules);
    (automationService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (automationService.getAlerts as jest.Mock).mockResolvedValue([]);
  });

  it('renders the dashboard with all components', async () => {
    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    // Check for main components
    expect(screen.getByText('Automation Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Active Workflows')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
      expect(screen.getByText('Test Rule')).toBeInTheDocument();
    });
  });

  it('handles workflow status toggle', async () => {
    const mockToggleStatus = jest.fn().mockResolvedValue({
      ...mockWorkflows[0],
      status: AutomationStatus.PAUSED,
    });
    (automationService.toggleWorkflowStatus as jest.Mock) = mockToggleStatus;

    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(toggleButton);

    expect(mockToggleStatus).toHaveBeenCalledWith('1', AutomationStatus.PAUSED);
  });

  it('handles rule status toggle', async () => {
    const mockToggleRule = jest.fn().mockResolvedValue({
      ...mockRules[0],
      enabled: false,
    });
    (automationService.toggleRuleStatus as jest.Mock) = mockToggleRule;

    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    await waitFor(() => {
      expect(screen.getByText('Test Rule')).toBeInTheDocument();
    });

    const toggleSwitch = screen.getByRole('checkbox');
    fireEvent.click(toggleSwitch);

    expect(mockToggleRule).toHaveBeenCalledWith('1', false);
  });

  it('handles filter dialog', async () => {
    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    const filterButton = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filterButton);

    expect(screen.getByText('Advanced Filters')).toBeInTheDocument();

    const platformSelect = screen.getByLabelText(/platform/i);
    fireEvent.change(platformSelect, { target: { value: AutomationPlatform.HUBSPOT } });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
  });

  it('handles export functionality', async () => {
    const mockExport = jest.fn().mockResolvedValue(new Blob(['test'], { type: 'text/csv' }));
    (automationService.exportWorkflows as jest.Mock) = mockExport;

    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    expect(mockExport).toHaveBeenCalledWith('csv');
  });

  it('handles audit logs', async () => {
    const mockAuditLogs = [
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
    (automationService.getAuditLogs as jest.Mock).mockResolvedValue(mockAuditLogs);

    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    const auditLogsButton = screen.getByRole('button', { name: /audit logs/i });
    fireEvent.click(auditLogsButton);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
      expect(screen.getByText(/CREATE - workflow/i)).toBeInTheDocument();
    });
  });

  it('handles error states', async () => {
    (automationService.getWorkflows as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ConsolidatedAutomationDashboard userRole="admin" accessLevel="admin" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch automation data')).toBeInTheDocument();
    });
  });
}); 