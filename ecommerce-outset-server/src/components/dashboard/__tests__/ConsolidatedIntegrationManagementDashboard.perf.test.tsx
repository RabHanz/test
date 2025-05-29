import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsolidatedIntegrationManagementDashboard from '../ConsolidatedIntegrationManagementDashboard';
import * as integrationService from '../../../services/integrationService';
import {
  IntegrationStatus,
  IntegrationType,
  IntegrationProtocol,
} from '../../../types/integration';

// Mock the integration service
jest.mock('../../../services/integrationService');

// Helper function to generate a large dataset
const generateLargeDataset = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${index + 1}`,
    name: `Test Integration ${index + 1}`,
    description: `Test Description ${index + 1}`,
    type: index % 2 === 0 ? IntegrationType.API : IntegrationType.WEBHOOK,
    protocol: index % 2 === 0 ? IntegrationProtocol.REST : IntegrationProtocol.HTTP,
    status: index % 3 === 0 ? IntegrationStatus.ACTIVE : IntegrationStatus.PENDING,
    sourceSystem: `System ${String.fromCharCode(65 + (index % 26))}`,
    targetSystem: `System ${String.fromCharCode(65 + ((index + 1) % 26))}`,
    ownerId: `user${index + 1}`,
    teamId: `team${index + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

describe('ConsolidatedIntegrationManagementDashboard Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders large dataset within 2 seconds', async () => {
    const largeDataset = generateLargeDataset(1000);
    (integrationService.getIntegrations as jest.Mock).mockResolvedValue(largeDataset);
    (integrationService.getIntegrationMetrics as jest.Mock).mockResolvedValue({
      overallMetrics: {
        totalIntegrations: 1000,
        activeIntegrations: 333,
        failedIntegrations: 0,
        averageResponseTime: 150,
        successRate: 95,
      },
      byStatus: {
        [IntegrationStatus.ACTIVE]: 333,
        [IntegrationStatus.PENDING]: 667,
      },
      byType: {
        [IntegrationType.API]: 500,
        [IntegrationType.WEBHOOK]: 500,
      },
      byProtocol: {
        [IntegrationProtocol.REST]: 500,
        [IntegrationProtocol.HTTP]: 500,
      },
    });

    const startTime = performance.now();
    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Integration 1000')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(2000); // Should render within 2 seconds
  });

  it('handles rapid filter changes efficiently', async () => {
    const dataset = generateLargeDataset(100);
    (integrationService.getIntegrations as jest.Mock).mockResolvedValue(dataset);

    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Test Integration 1')).toBeInTheDocument();
    });

    // Test multiple filter changes
    const filterChanges = [
      { status: IntegrationStatus.ACTIVE },
      { type: IntegrationType.API },
      { protocol: IntegrationProtocol.REST },
      { status: IntegrationStatus.PENDING },
    ];

    for (const filter of filterChanges) {
      const startTime = performance.now();
      
      // Open filter dialog
      fireEvent.click(screen.getByTestId('FilterListIcon'));
      
      // Apply filter
      if (filter.status) {
        fireEvent.click(screen.getByText(filter.status));
      }
      if (filter.type) {
        fireEvent.click(screen.getByText(filter.type));
      }
      if (filter.protocol) {
        fireEvent.click(screen.getByText(filter.protocol));
      }
      
      fireEvent.click(screen.getByText('Apply'));

      // Wait for filter to be applied
      await waitFor(() => {
        expect(integrationService.getIntegrations).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const filterTime = endTime - startTime;
      expect(filterTime).toBeLessThan(200); // Each filter change should take less than 200ms
    }
  });

  it('handles real-time updates efficiently', async () => {
    const dataset = generateLargeDataset(100);
    (integrationService.getIntegrations as jest.Mock).mockResolvedValue(dataset);

    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Test Integration 1')).toBeInTheDocument();
    });

    // Simulate multiple rapid updates
    const updates = Array.from({ length: 10 }, (_, index) => ({
      type: 'INTEGRATION',
      id: `${index + 1}`,
      status: IntegrationStatus.FAILED,
    }));

    const subscribeCallback = (integrationService.subscribeToUpdates as jest.Mock).mock.calls[0][0];

    for (const update of updates) {
      const startTime = performance.now();
      subscribeCallback(update);
      
      await waitFor(() => {
        expect(screen.getByText('FAILED')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const updateTime = endTime - startTime;
      expect(updateTime).toBeLessThan(50); // Each update should take less than 50ms
    }
  });

  it('maintains smooth scrolling performance with large datasets', async () => {
    const largeDataset = generateLargeDataset(1000);
    (integrationService.getIntegrations as jest.Mock).mockResolvedValue(largeDataset);

    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Test Integration 1')).toBeInTheDocument();
    });

    // Test scrolling performance
    const scrollContainer = screen.getByTestId('integration-list');
    const scrollSteps = 10;
    const scrollDistance = 1000;

    for (let i = 0; i < scrollSteps; i++) {
      const startTime = performance.now();
      
      fireEvent.scroll(scrollContainer, {
        target: { scrollTop: (i + 1) * scrollDistance },
      });

      // Wait for scroll to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const endTime = performance.now();
      const scrollTime = endTime - startTime;
      expect(scrollTime).toBeLessThan(100); // Each scroll action should take less than 100ms
    }
  });

  it('handles concurrent operations efficiently', async () => {
    const dataset = generateLargeDataset(100);
    (integrationService.getIntegrations as jest.Mock).mockResolvedValue(dataset);

    render(<ConsolidatedIntegrationManagementDashboard userRole="admin" accessLevel="full" />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Test Integration 1')).toBeInTheDocument();
    });

    // Perform multiple operations concurrently
    const startTime = performance.now();

    // Select an integration
    fireEvent.click(screen.getByText('Test Integration 1'));

    // Apply a filter
    fireEvent.click(screen.getByTestId('FilterListIcon'));
    fireEvent.click(screen.getByText(IntegrationStatus.ACTIVE));
    fireEvent.click(screen.getByText('Apply'));

    // Create a new integration
    fireEvent.click(screen.getByTestId('AddIcon'));
    await userEvent.type(screen.getByLabelText('Name'), 'New Integration');
    fireEvent.click(screen.getByText('Create'));

    // Wait for all operations to complete
    await waitFor(() => {
      expect(integrationService.createIntegration).toHaveBeenCalled();
    });

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    expect(totalTime).toBeLessThan(500); // All operations should complete within 500ms
  });
}); 