import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConsolidatedLeadManagementDashboard from '../ConsolidatedLeadManagementDashboard';
import * as leadService from '../../../services/leadService';
import {
  LeadStatus,
  LeadSource,
  LeadPriority,
} from '../../../types/lead';

// Mock the lead service
jest.mock('../../../services/leadService');

// Generate large dataset for performance testing
const generateLargeDataset = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${index + 1}`,
    name: `Test Lead ${index + 1}`,
    description: `Test Description ${index + 1}`,
    status: LeadStatus.NEW,
    source: LeadSource.WEBSITE,
    priority: LeadPriority.MEDIUM,
    ownerId: `user${index + 1}`,
    teamId: `team${index + 1}`,
    companyName: `Test Company ${index + 1}`,
    contactName: `Contact ${index + 1}`,
    contactEmail: `contact${index + 1}@test.com`,
    contactPhone: `123456789${index}`,
    expectedValue: 1000 + index,
    expectedCloseDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

describe('ConsolidatedLeadManagementDashboard Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders large dataset (1000 items) within 2 seconds', async () => {
    const largeDataset = generateLargeDataset(1000);
    (leadService.getLeads as jest.Mock).mockResolvedValue(largeDataset);

    const startTime = performance.now();
    
    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Lead 1')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(2000); // 2 seconds
  });

  it('handles rapid filter changes efficiently', async () => {
    const largeDataset = generateLargeDataset(100);
    (leadService.getLeads as jest.Mock).mockResolvedValue(largeDataset);

    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Test Lead 1')).toBeInTheDocument();
    });

    // Test multiple rapid filter changes
    const filterChanges = [
      { status: LeadStatus.NEW },
      { source: LeadSource.WEBSITE },
      { status: LeadStatus.CONTACTED },
      { source: LeadSource.REFERRAL },
    ];

    for (const filter of filterChanges) {
      const startTime = performance.now();
      
      // Open filter dialog
      fireEvent.click(screen.getByTestId('FilterIcon'));
      
      // Apply filter
      if (filter.status) {
        const statusSelect = screen.getByLabelText('Status');
        fireEvent.mouseDown(statusSelect);
        fireEvent.click(screen.getByText(filter.status));
      }
      
      if (filter.source) {
        const sourceSelect = screen.getByLabelText('Source');
        fireEvent.mouseDown(sourceSelect);
        fireEvent.click(screen.getByText(filter.source));
      }
      
      fireEvent.click(screen.getByText('Apply'));
      
      const endTime = performance.now();
      const filterTime = endTime - startTime;
      
      expect(filterTime).toBeLessThan(200); // 200ms per filter change
    }
  });

  it('handles real-time updates efficiently', async () => {
    const mockUpdate = {
      type: 'LEAD',
      id: '1',
      status: LeadStatus.CONTACTED,
    };

    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);

    // Select a lead
    await waitFor(() => {
      expect(screen.getByText('Test Lead 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Test Lead 1'));

    // Test multiple rapid updates
    const updateCallback = (leadService.subscribeToUpdates as jest.Mock).mock.calls[0][0];
    
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      
      updateCallback({
        ...mockUpdate,
        id: `${i + 1}`,
      });
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      expect(updateTime).toBeLessThan(50); // 50ms per update
    }
  });

  it('maintains smooth scrolling with large datasets', async () => {
    const largeDataset = generateLargeDataset(100);
    (leadService.getLeads as jest.Mock).mockResolvedValue(largeDataset);
    (leadService.getCommunications as jest.Mock).mockResolvedValue(
      largeDataset.map(lead => ({
        id: lead.id,
        leadId: lead.id,
        type: 'EMAIL',
        content: `Communication ${lead.id}`,
        direction: 'OUTBOUND',
        userId: lead.ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);

    // Select a lead and navigate to communications
    await waitFor(() => {
      expect(screen.getByText('Test Lead 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Test Lead 1'));
    fireEvent.click(screen.getByText('Communications'));

    // Test scrolling performance
    const communicationsContainer = screen.getByTestId('communications-container');
    
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now();
      
      fireEvent.scroll(communicationsContainer, {
        target: { scrollTop: i * 1000 },
      });
      
      const endTime = performance.now();
      const scrollTime = endTime - startTime;
      
      expect(scrollTime).toBeLessThan(100); // 100ms per scroll action
    }
  });

  it('handles concurrent operations efficiently', async () => {
    const largeDataset = generateLargeDataset(100);
    (leadService.getLeads as jest.Mock).mockResolvedValue(largeDataset);

    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Test Lead 1')).toBeInTheDocument();
    });

    // Perform multiple operations concurrently
    const startTime = performance.now();

    // Select lead
    fireEvent.click(screen.getByText('Test Lead 1'));

    // Open filter dialog
    fireEvent.click(screen.getByTestId('FilterIcon'));

    // Export data
    fireEvent.click(screen.getByTestId('ExportIcon'));

    // Check notifications
    fireEvent.click(screen.getByTestId('NotificationsIcon'));

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    expect(totalTime).toBeLessThan(500); // 500ms for all operations
  });
}); 