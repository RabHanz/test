import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import IntegrationList from '../IntegrationList';
import { IntegrationProject, IntegrationStatus, IntegrationType, IntegrationProtocol } from '../../../types/integration';

const mockIntegrations: IntegrationProject[] = [
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
    endpointUrl: 'https://api.example.com/v1',
    securityType: 'API_KEY',
    credentials: { apiKey: 'test-key' },
    config: { timeout: 5000 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '2',
    name: 'Test Integration 2',
    description: 'Test Description 2',
    type: IntegrationType.WEBHOOK,
    protocol: IntegrationProtocol.HTTP,
    status: IntegrationStatus.INACTIVE,
    sourceSystem: 'System C',
    targetSystem: 'System D',
    ownerId: 'user2',
    teamId: 'team2',
    endpointUrl: 'https://webhook.example.com',
    securityType: 'OAUTH2',
    credentials: { clientId: 'test-client' },
    config: { retryCount: 3 },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-04'),
  },
];

describe('IntegrationList', () => {
  const mockOnSelect = jest.fn();
  const mockOnFilter = jest.fn();

  const renderComponent = (integrations = mockIntegrations) => {
    return render(
      <ThemeProvider theme={theme}>
        <IntegrationList
          integrations={integrations}
          selectedIntegration={null}
          onSelect={mockOnSelect}
          onFilter={mockOnFilter}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders integration list correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Test Integration 1')).toBeInTheDocument();
    expect(screen.getByText('Test Integration 2')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    renderComponent();
    
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('calls onSelect when an integration is clicked', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Test Integration 1'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockIntegrations[0]);
  });

  it('applies filter when search input is used', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Search integrations...');
    fireEvent.change(searchInput, { target: { value: 'Test Integration 1' } });
    
    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({
      search: 'Test Integration 1',
    }));
  });

  it('applies filter when status filter is used', () => {
    renderComponent();
    
    const statusFilter = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusFilter);
    fireEvent.click(screen.getByText('ACTIVE'));
    
    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({
      status: IntegrationStatus.ACTIVE,
    }));
  });

  it('applies filter when type filter is used', () => {
    renderComponent();
    
    const typeFilter = screen.getByLabelText('Type');
    fireEvent.mouseDown(typeFilter);
    fireEvent.click(screen.getByText('API'));
    
    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({
      type: IntegrationType.API,
    }));
  });

  it('applies filter when protocol filter is used', () => {
    renderComponent();
    
    const protocolFilter = screen.getByLabelText('Protocol');
    fireEvent.mouseDown(protocolFilter);
    fireEvent.click(screen.getByText('REST'));
    
    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({
      protocol: IntegrationProtocol.REST,
    }));
  });

  it('handles empty integrations list', () => {
    renderComponent([]);
    
    expect(screen.getByText('No integrations found')).toBeInTheDocument();
  });

  it('displays correct date format', () => {
    renderComponent();
    
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 3, 2024')).toBeInTheDocument();
  });

  it('highlights selected integration', () => {
    renderComponent();
    
    const listItem = screen.getByText('Test Integration 1').closest('div');
    expect(listItem).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.04)' });
  });
}); 