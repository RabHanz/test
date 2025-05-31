import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsolidatedLeadManagementDashboard from '../ConsolidatedLeadManagementDashboard';
import * as leadService from '../../../services/leadService';
import {
  LeadStatus,
  LeadSource,
  LeadPriority,
} from '../../../types/lead';

// Mock the lead service
jest.mock('../../../services/leadService');

// Mock data
const mockLeads = [
  {
    id: '1',
    name: 'Test Lead 1',
    description: 'Test Description 1',
    status: LeadStatus.NEW,
    source: LeadSource.WEBSITE,
    priority: LeadPriority.MEDIUM,
    ownerId: 'user1',
    teamId: 'team1',
    companyName: 'Test Company 1',
    contactName: 'John Doe',
    contactEmail: 'john@test.com',
    contactPhone: '1234567890',
    expectedValue: 1000,
    expectedCloseDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Test Lead 2',
    description: 'Test Description 2',
    status: LeadStatus.CONTACTED,
    source: LeadSource.REFERRAL,
    priority: LeadPriority.HIGH,
    ownerId: 'user2',
    teamId: 'team2',
    companyName: 'Test Company 2',
    contactName: 'Jane Smith',
    contactEmail: 'jane@test.com',
    contactPhone: '0987654321',
    expectedValue: 2000,
    expectedCloseDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMetrics = {
  overallMetrics: {
    totalLeads: 2,
    activeLeads: 1,
    closedLeads: 1,
    conversionRate: 50,
    averageValue: 1500,
  },
  statusMetrics: {
    [LeadStatus.NEW]: 1,
    [LeadStatus.CONTACTED]: 1,
    [LeadStatus.QUALIFIED]: 0,
    [LeadStatus.PROPOSAL]: 0,
    [LeadStatus.NEGOTIATION]: 0,
    [LeadStatus.CLOSED_WON]: 0,
    [LeadStatus.CLOSED_LOST]: 0,
    [LeadStatus.ON_HOLD]: 0,
  },
  sourceMetrics: {
    [LeadSource.WEBSITE]: 1,
    [LeadSource.REFERRAL]: 1,
    [LeadSource.SOCIAL_MEDIA]: 0,
    [LeadSource.EMAIL_CAMPAIGN]: 0,
    [LeadSource.EVENT]: 0,
    [LeadSource.DIRECT_CALL]: 0,
    [LeadSource.OTHER]: 0,
  },
  priorityMetrics: {
    [LeadPriority.LOW]: 0,
    [LeadPriority.MEDIUM]: 1,
    [LeadPriority.HIGH]: 1,
    [LeadPriority.URGENT]: 0,
  },
};

const mockCommunications = [
  {
    id: '1',
    leadId: '1',
    type: 'EMAIL',
    content: 'Test communication 1',
    direction: 'OUTBOUND',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockNotes = [
  {
    id: '1',
    leadId: '1',
    content: 'Test note 1',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockTasks = [
  {
    id: '1',
    leadId: '1',
    title: 'Test task 1',
    description: 'Test task description 1',
    dueDate: new Date(),
    status: 'PENDING',
    assignedTo: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockDocuments = [
  {
    id: '1',
    leadId: '1',
    name: 'Test document 1',
    type: 'PDF',
    url: 'http://test.com/doc1.pdf',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('ConsolidatedLeadManagementDashboard', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (leadService.getLeads as jest.Mock).mockResolvedValue(mockLeads);
    (leadService.getLeadMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (leadService.getCommunications as jest.Mock).mockResolvedValue(mockCommunications);
    (leadService.getNotes as jest.Mock).mockResolvedValue(mockNotes);
    (leadService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    (leadService.getDocuments as jest.Mock).mockResolvedValue(mockDocuments);
    (leadService.getAlerts as jest.Mock).mockResolvedValue([]);
  });

  it('renders the dashboard with lead list', async () => {
    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);

    // Check if the dashboard title is rendered
    expect(screen.getByText('Lead Management Dashboard')).toBeInTheDocument();

    // Wait for leads to load
    await waitFor(() => {
      expect(screen.getByText('Test Lead 1')).toBeInTheDocument();
      expect(screen.getByText('Test Lead 2')).toBeInTheDocument();
    });
  });

  it('handles lead selection and displays lead details', async () => {
    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);

    // Wait for leads to load
    await waitFor(() => {
      expect(screen.getByText('Test Lead 1')).toBeInTheDocument();
    });

    // Click on a lead
    fireEvent.click(screen.getByText('Test Lead 1'));

    // Check if lead details are displayed
    await waitFor(() => {
      expect(screen.getByText('Test Company 1')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('handles filter dialog and applies filters', async () => {
    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);

    // Open filter dialog
    fireEvent.click(screen.getByTestId('FilterIcon'));

    // Select status filter
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByText(LeadStatus.NEW));

    // Apply filter
    fireEvent.click(screen.getByText('Apply'));

    // Verify that getLeads was called with the correct filter
    await waitFor(() => {
      expect(leadService.getLeads).toHaveBeenCalledWith({
        status: LeadStatus.NEW,
      });
    });
  });

  it('handles lead creation', async () => {
    const mockNewLead = {
      id: '3',
      name: 'New Lead',
      description: 'New Description',
      status: LeadStatus.NEW,
      source: LeadSource.WEBSITE,
      priority: LeadPriority.MEDIUM,
      ownerId: 'user1',
      teamId: 'team1',
      companyName: 'New Company',
      contactName: 'New Contact',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (leadService.createLead as jest.Mock).mockResolvedValue(mockNewLead);

    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);

    // Open new lead dialog
    fireEvent.click(screen.getByTestId('AddIcon'));

    // Fill in lead details
    await userEvent.type(screen.getByLabelText('Name'), 'New Lead');
    await userEvent.type(screen.getByLabelText('Contact Name'), 'New Contact');
    await userEvent.type(screen.getByLabelText('Company Name'), 'New Company');

    // Create lead
    fireEvent.click(screen.getByText('Create'));

    // Verify that createLead was called with correct data
    await waitFor(() => {
      expect(leadService.createLead).toHaveBeenCalledWith({
        name: 'New Lead',
        contactName: 'New Contact',
        companyName: 'New Company',
        status: LeadStatus.NEW,
        priority: LeadPriority.MEDIUM,
      });
    });
  });

  it('handles export functionality', async () => {
    const mockBlob = new Blob(['test'], { type: 'text/csv' });
    (leadService.exportLeadData as jest.Mock).mockResolvedValue(mockBlob);

    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);

    // Select a lead
    await waitFor(() => {
      expect(screen.getByText('Test Lead 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Test Lead 1'));

    // Click export button
    fireEvent.click(screen.getByTestId('ExportIcon'));

    // Verify that exportLeadData was called
    await waitFor(() => {
      expect(leadService.exportLeadData).toHaveBeenCalledWith('1', 'csv');
    });
  });

  it('handles real-time updates', async () => {
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

    // Simulate real-time update
    const updateCallback = (leadService.subscribeToUpdates as jest.Mock).mock.calls[0][0];
    updateCallback(mockUpdate);

    // Verify that the lead status was updated
    await waitFor(() => {
      expect(screen.getByText(LeadStatus.CONTACTED)).toBeInTheDocument();
    });
  });

  it('displays error message when API calls fail', async () => {
    const errorMessage = 'Failed to fetch data';
    (leadService.getLeads as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<ConsolidatedLeadManagementDashboard userRole="admin" accessLevel="full" />);

    // Verify that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
}); 