import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsolidatedIntegrationManagementDashboard from '../ConsolidatedIntegrationManagementDashboard';
import * as integrationService from '../../../services/integrationService';
import {
  IntegrationStatus,
  IntegrationType,
  IntegrationProtocol,
  IntegrationSecurityType,
} from '../../../types/integration';

// Mock the integration service
jest.mock('../../../services/integrationService');

const mockIntegrations = [
  {
    id: '1',
    name: 'Test Integration 1',
    description: 'Test Description 1',
    type: IntegrationType.API,
    protocol: IntegrationProtocol.REST,
    status: IntegrationStatus.ACTIVE,
    sourceSystem: 'System A',
    targetSystem: 'System B',
    ownerId: 'user1',
    teamId: 'team1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Test Integration 2',
    description: 'Test Description 2',
    type: IntegrationType.WEBHOOK,
    protocol: IntegrationProtocol.SOAP,
    status: IntegrationStatus.PENDING,
    sourceSystem: 'System C',
    targetSystem: 'System D',
    ownerId: 'user2',
    teamId: 'team2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMetrics = {
  overallMetrics: {
    totalIntegrations: 2,
    activeIntegrations: 1,
    failedIntegrations: 0,
    averageResponseTime: 150,
    successRate: 95,
  },
  byStatus: {
    [IntegrationStatus.ACTIVE]: 1,
    [IntegrationStatus.PENDING]: 1,
  },
  byType: {
    [IntegrationType.API]: 1,
    [IntegrationType.WEBHOOK]: 1,
  },
  byProtocol: {
    [IntegrationProtocol.REST]: 1,
    [IntegrationProtocol.HTTP]: 1,
  },
};

const mockLogs = [
  {
    id: '1',
    integrationId: '1',
    level: 'INFO',
    message: 'Test log message',
    createdAt: new Date(),
  },
];

const mockAlerts = [
  {
    id: '1',
    integrationId: '1',
    type: 'ERROR',
    message: 'Test alert message',
    severity: 'HIGH',
    isResolved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('ConsolidatedIntegrationManagementDashboard', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock the service functions
    (integrationService.getIntegrations as jest.Mock).mockResolvedValue(mockIntegrations);
    (integrationService.getIntegrationMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (integrationService.getLogs as jest.Mock).mockResolvedValue(mockLogs);
    (integrationService.getAlerts as jest.Mock).mockResolvedValue(mockAlerts);
    (integrationService.createIntegration as jest.Mock).mockResolvedValue(mockIntegrations[0]);
  });

  it('renders the dashboard with initial data', async () => {
    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Check if the dashboard title is rendered
    expect(screen.getByText('Integration Management Dashboard')).toBeInTheDocument();

    // Check if the metrics are rendered
    await waitFor(() => {
      expect(screen.getByText('Total Integrations')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Check if the integration list is rendered
    expect(screen.getByText('Test Integration 1')).toBeInTheDocument();
    expect(screen.getByText('Test Integration 2')).toBeInTheDocument();
  });

  it('handles integration selection', async () => {
    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Click on the first integration
    await waitFor(() => {
      fireEvent.click(screen.getByText('Test Integration 1'));
    });

    // Check if the integration details are loaded
    expect(integrationService.getLogs).toHaveBeenCalledWith('1');
    expect(integrationService.getAlerts).toHaveBeenCalledWith('1');
  });

  it('handles filter dialog', async () => {
    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Open filter dialog
    fireEvent.click(screen.getByTestId('FilterListIcon'));

    // Check if filter options are rendered
    expect(screen.getByText('Filter Integrations')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Protocol')).toBeInTheDocument();

    // Apply filter
    fireEvent.click(screen.getByText('Apply'));

    // Check if the filter was applied
    expect(integrationService.getIntegrations).toHaveBeenCalled();
  });

  it('handles create integration dialog', async () => {
    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Open create dialog
    fireEvent.click(screen.getByTestId('AddIcon'));

    // Fill in the form
    await userEvent.type(screen.getByLabelText('Name'), 'New Integration');
    await userEvent.type(screen.getByLabelText('Description'), 'New Description');
    await userEvent.type(screen.getByLabelText('Source System'), 'System E');
    await userEvent.type(screen.getByLabelText('Target System'), 'System F');

    // Create integration
    fireEvent.click(screen.getByText('Create'));

    // Check if the integration was created
    expect(integrationService.createIntegration).toHaveBeenCalled();
  });

  it('handles real-time updates', async () => {
    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Simulate real-time update
    const mockUpdate = {
      type: 'INTEGRATION',
      id: '1',
      status: IntegrationStatus.FAILED,
    };

    // Get the callback function that was passed to subscribeToUpdates
    const subscribeCallback = (integrationService.subscribeToUpdates as jest.Mock).mock.calls[0][0];
    subscribeCallback(mockUpdate);

    // Check if the integration was updated
    await waitFor(() => {
      expect(screen.getByText('FAILED')).toBeInTheDocument();
    });
  });

  it('handles error states', async () => {
    // Mock an error
    (integrationService.getIntegrations as jest.Mock).mockRejectedValue(new Error('Test error'));

    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  it('handles loading state', async () => {
    // Mock a delay in the API response
    (integrationService.getIntegrations as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockIntegrations), 100))
    );

    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Check if loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('handles tab navigation correctly', async () => {
    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Select an integration first
    await waitFor(() => {
      fireEvent.click(screen.getByText('Test Integration 1'));
    });

    // Test each tab
    const tabs = [
      'Overview',
      'Logs',
      'Metrics',
      'Alerts',
      'Versions',
      'Dependencies',
      'Tests',
      'Documentation',
      'Timeline',
      'Health',
    ];

    for (const tab of tabs) {
      fireEvent.click(screen.getByText(tab));
      expect(screen.getByText(tab)).toHaveAttribute('aria-selected', 'true');
    }
  });

  it('handles security type selection in create dialog', async () => {
    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Open create dialog
    fireEvent.click(screen.getByTestId('AddIcon'));

    // Fill in required fields
    await userEvent.type(screen.getByLabelText('Name'), 'Secure Integration');
    await userEvent.type(screen.getByLabelText('Source System'), 'System A');
    await userEvent.type(screen.getByLabelText('Target System'), 'System B');

    // Select security type
    fireEvent.mouseDown(screen.getByLabelText('Security Type'));
    fireEvent.click(screen.getByText(IntegrationSecurityType.OAUTH2));

    // Create integration
    fireEvent.click(screen.getByText('Create'));

    // Verify security type was included in creation
    expect(integrationService.createIntegration).toHaveBeenCalledWith(
      expect.objectContaining({
        securityType: IntegrationSecurityType.OAUTH2,
      })
    );
  });

  it('handles documentation versioning', async () => {
    const mockDocumentation = [
      {
        id: '1',
        integrationId: '1',
        title: 'API Documentation',
        content: 'Test content',
        version: '1.0.0',
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (integrationService.getDocumentation as jest.Mock).mockResolvedValue(mockDocumentation);

    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Select an integration
    await waitFor(() => {
      fireEvent.click(screen.getByText('Test Integration 1'));
    });

    // Navigate to documentation tab
    fireEvent.click(screen.getByText('Documentation'));

    // Verify documentation is displayed
    expect(screen.getByText('API Documentation')).toBeInTheDocument();
    expect(screen.getByText('Version: 1.0.0')).toBeInTheDocument();
  });

  it('handles health check status updates', async () => {
    const mockHealthChecks = [
      {
        id: '1',
        integrationId: '1',
        status: 'HEALTHY',
        responseTime: 100,
        lastChecked: new Date(),
        details: { uptime: '99.9%' },
        createdAt: new Date(),
      },
    ];

    (integrationService.getHealthChecks as jest.Mock).mockResolvedValue(mockHealthChecks);
    (integrationService.runHealthCheck as jest.Mock).mockResolvedValue({
      ...mockHealthChecks[0],
      status: 'DEGRADED',
    });

    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Select an integration
    await waitFor(() => {
      fireEvent.click(screen.getByText('Test Integration 1'));
    });

    // Navigate to health tab
    fireEvent.click(screen.getByText('Health'));

    // Verify health check status
    expect(screen.getByText('Status: HEALTHY')).toBeInTheDocument();
  });

  it('handles error recovery gracefully', async () => {
    // Mock initial error
    (integrationService.getIntegrations as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockIntegrations);

    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Verify retry works
    await waitFor(() => {
      expect(screen.getByText('Test Integration 1')).toBeInTheDocument();
    });
  });

  it('handles access level restrictions', async () => {
    render(<ConsolidatedIntegrationManagementDashboard userRole="viewer" accessLevel="read" />);

    // Verify create button is not available
    expect(screen.queryByTestId('AddIcon')).not.toBeInTheDocument();

    // Verify filter button is available
    expect(screen.getByTestId('FilterListIcon')).toBeInTheDocument();
  });

  it('handles bulk operations', async () => {
    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Select multiple integrations
    await waitFor(() => {
      fireEvent.click(screen.getByText('Test Integration 1'));
    });

    // Verify bulk action buttons are available
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Bulk Update')).toBeInTheDocument();
  });
}); 