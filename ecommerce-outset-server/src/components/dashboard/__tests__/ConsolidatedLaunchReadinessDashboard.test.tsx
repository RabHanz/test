import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsolidatedLaunchReadinessDashboard from '../ConsolidatedLaunchReadinessDashboard';
import * as launchService from '../../../services/launchService';
import {
  LaunchStatus,
  LaunchPhase,
  ValidationStatus,
} from '../../../types/launch';

// Mock the launch service
jest.mock('../../../services/launchService');

// Mock data
const mockProjects = [
  {
    id: '1',
    name: 'Test Project 1',
    description: 'Test Description 1',
    status: LaunchStatus.IN_PROGRESS,
    phase: LaunchPhase.PLANNING,
    ownerId: 'user1',
    teamId: 'team1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Test Project 2',
    description: 'Test Description 2',
    status: LaunchStatus.COMPLETED,
    phase: LaunchPhase.POST_LAUNCH,
    ownerId: 'user2',
    teamId: 'team2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockChecklists = [
  {
    id: '1',
    projectId: '1',
    name: 'Test Checklist 1',
    description: 'Test Checklist Description 1',
    category: 'General',
    priority: 'HIGH',
    isRequired: true,
    status: ValidationStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMetrics = {
  overallMetrics: {
    totalProjects: 2,
    activeProjects: 1,
    completedProjects: 1,
    blockedProjects: 0,
    averageCompletionTime: 30,
  },
  validationMetrics: {
    totalValidations: 10,
    passedValidations: 7,
    failedValidations: 2,
    pendingValidations: 1,
  },
};

describe('ConsolidatedLaunchReadinessDashboard', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (launchService.getProjects as jest.Mock).mockResolvedValue(mockProjects);
    (launchService.getProjectMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (launchService.getChecklists as jest.Mock).mockResolvedValue(mockChecklists);
    (launchService.getValidations as jest.Mock).mockResolvedValue([]);
    (launchService.getTimelineEvents as jest.Mock).mockResolvedValue([]);
    (launchService.getDocuments as jest.Mock).mockResolvedValue([]);
    (launchService.getTeamMembers as jest.Mock).mockResolvedValue([]);
    (launchService.getAlerts as jest.Mock).mockResolvedValue([]);
  });

  it('renders the dashboard with project list', async () => {
    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);

    // Check if the dashboard title is rendered
    expect(screen.getByText('Launch Readiness Dashboard')).toBeInTheDocument();

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });
  });

  it('handles project selection and displays project details', async () => {
    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Click on a project
    fireEvent.click(screen.getByText('Test Project 1'));

    // Check if project details are displayed
    await waitFor(() => {
      expect(screen.getByText('Launch Checklist')).toBeInTheDocument();
      expect(screen.getByText('Test Checklist 1')).toBeInTheDocument();
    });
  });

  it('handles filter dialog and applies filters', async () => {
    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);

    // Open filter dialog
    fireEvent.click(screen.getByTestId('FilterIcon'));

    // Select status filter
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByText(LaunchStatus.IN_PROGRESS));

    // Apply filter
    fireEvent.click(screen.getByText('Apply'));

    // Verify that getProjects was called with the correct filter
    await waitFor(() => {
      expect(launchService.getProjects).toHaveBeenCalledWith({
        status: LaunchStatus.IN_PROGRESS,
      });
    });
  });

  it('handles project creation', async () => {
    const mockNewProject = {
      id: '3',
      name: 'New Project',
      description: 'New Description',
      status: LaunchStatus.NOT_STARTED,
      phase: LaunchPhase.PLANNING,
      ownerId: 'user1',
      teamId: 'team1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (launchService.createProject as jest.Mock).mockResolvedValue(mockNewProject);

    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);

    // Open new project dialog
    fireEvent.click(screen.getByText('New Project'));

    // Fill in project details
    await userEvent.type(screen.getByLabelText('Project Name'), 'New Project');
    await userEvent.type(screen.getByLabelText('Description'), 'New Description');

    // Create project
    fireEvent.click(screen.getByText('Create'));

    // Verify that createProject was called with correct data
    await waitFor(() => {
      expect(launchService.createProject).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'New Description',
        phase: LaunchPhase.PLANNING,
      });
    });
  });

  it('handles export functionality', async () => {
    const mockBlob = new Blob(['test'], { type: 'text/csv' });
    (launchService.exportProjectData as jest.Mock).mockResolvedValue(mockBlob);

    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);

    // Select a project
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Test Project 1'));

    // Click export button
    fireEvent.click(screen.getByTestId('ExportIcon'));

    // Verify that exportProjectData was called
    await waitFor(() => {
      expect(launchService.exportProjectData).toHaveBeenCalledWith('1', 'csv');
    });
  });

  it('handles real-time updates', async () => {
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

    // Simulate real-time update
    const updateCallback = (launchService.subscribeToUpdates as jest.Mock).mock.calls[0][0];
    updateCallback(mockUpdate);

    // Verify that the project status was updated
    await waitFor(() => {
      expect(screen.getByText(LaunchStatus.COMPLETED)).toBeInTheDocument();
    });
  });

  it('displays error message when API calls fail', async () => {
    const errorMessage = 'Failed to fetch data';
    (launchService.getProjects as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<ConsolidatedLaunchReadinessDashboard userRole="admin" accessLevel="full" />);

    // Verify that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
}); 