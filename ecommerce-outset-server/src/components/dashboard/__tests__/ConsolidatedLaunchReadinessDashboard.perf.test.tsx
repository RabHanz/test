import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConsolidatedLaunchReadinessDashboard from '../ConsolidatedLaunchReadinessDashboard';
import * as launchService from '../../../services/launchService';
import {
  LaunchStatus,
  LaunchPhase,
  ValidationStatus,
} from '../../../types/launch';

// Mock the launch service
jest.mock('../../../services/launchService');

// Generate large dataset for performance testing
const generateLargeDataset = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${index + 1}`,
    name: `Test Project ${index + 1}`,
    description: `Test Description ${index + 1}`,
    status: LaunchStatus.IN_PROGRESS,
    phase: LaunchPhase.PLANNING,
    ownerId: `user${index + 1}`,
    teamId: `team${index + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

describe('ConsolidatedLaunchReadinessDashboard Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders large dataset (1000 items) within 2 seconds', async () => {
    const largeDataset = generateLargeDataset(1000);
    (launchService.getProjects as jest.Mock).mockResolvedValue(largeDataset);

    const startTime = performance.now();
    
    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(2000); // 2 seconds
  });

  it('handles rapid filter changes efficiently', async () => {
    const largeDataset = generateLargeDataset(100);
    (launchService.getProjects as jest.Mock).mockResolvedValue(largeDataset);

    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Test multiple rapid filter changes
    const filterChanges = [
      { status: LaunchStatus.IN_PROGRESS },
      { phase: LaunchPhase.PLANNING },
      { status: LaunchStatus.COMPLETED },
      { phase: LaunchPhase.POST_LAUNCH },
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
      
      if (filter.phase) {
        const phaseSelect = screen.getByLabelText('Phase');
        fireEvent.mouseDown(phaseSelect);
        fireEvent.click(screen.getByText(filter.phase));
      }
      
      fireEvent.click(screen.getByText('Apply'));
      
      const endTime = performance.now();
      const filterTime = endTime - startTime;
      
      expect(filterTime).toBeLessThan(200); // 200ms per filter change
    }
  });

  it('handles real-time updates efficiently', async () => {
    const mockUpdate = {
      type: 'PROJECT',
      id: '1',
      status: LaunchStatus.COMPLETED,
    };

    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);

    // Select a project
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Test Project 1'));

    // Test multiple rapid updates
    const updateCallback = (launchService.subscribeToUpdates as jest.Mock).mock.calls[0][0];
    
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
    (launchService.getProjects as jest.Mock).mockResolvedValue(largeDataset);
    (launchService.getTimelineEvents as jest.Mock).mockResolvedValue(
      largeDataset.map(project => ({
        id: project.id,
        projectId: project.id,
        title: `Event ${project.id}`,
        description: `Event Description ${project.id}`,
        eventType: 'TEST',
        startDate: new Date(),
        status: LaunchStatus.IN_PROGRESS,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);

    // Select a project and navigate to timeline
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Test Project 1'));
    fireEvent.click(screen.getByText('Timeline'));

    // Test scrolling performance
    const timelineContainer = screen.getByTestId('timeline-container');
    
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now();
      
      fireEvent.scroll(timelineContainer, {
        target: { scrollTop: i * 1000 },
      });
      
      const endTime = performance.now();
      const scrollTime = endTime - startTime;
      
      expect(scrollTime).toBeLessThan(100); // 100ms per scroll action
    }
  });

  it('handles concurrent operations efficiently', async () => {
    const largeDataset = generateLargeDataset(100);
    (launchService.getProjects as jest.Mock).mockResolvedValue(largeDataset);

    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Perform multiple operations concurrently
    const startTime = performance.now();

    // Select project
    fireEvent.click(screen.getByText('Test Project 1'));

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