import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import ContentManagementDashboard from '../ContentManagementDashboard';
import { useContentGovernance } from '../../../hooks/useContentGovernance';
import { createMockIntegration } from '../../../utils/testUtils';

// Mock the useContentGovernance hook
jest.mock('../../../hooks/useContentGovernance');

describe('ContentManagementDashboard', () => {
  const mockIntegration = createMockIntegration();
  const mockVersions = [
    {
      id: '1',
      version: 1,
      content: 'Test content',
      author: 'Test Author',
      timestamp: new Date(),
      status: 'draft',
      comments: [],
      metadata: {
        title: 'Test Documentation',
        category: 'integration-docs',
        tags: ['integration', 'API', 'REST'],
        lastModified: new Date(),
        created: new Date(),
        contentType: 'guide',
        targetAudience: ['developers'],
        seoKeywords: ['test', 'api'],
      },
    },
  ];

  beforeEach(() => {
    (useContentGovernance as jest.Mock).mockReturnValue({
      currentVersion: mockVersions[0],
      versions: mockVersions,
      isDraft: true,
      isReview: false,
      isApproved: false,
      isRejected: false,
      createContent: jest.fn(),
      updateContent: jest.fn(),
      submitForReview: jest.fn(),
      approveContent: jest.fn(),
      rejectContent: jest.fn(),
      addComment: jest.fn(),
    });
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <ContentManagementDashboard integration={mockIntegration} />
      </ThemeProvider>
    );
  };

  it('renders the dashboard with tabs', () => {
    renderComponent();
    
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('API Guides')).toBeInTheDocument();
    expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
    expect(screen.getByText('Best Practices')).toBeInTheDocument();
  });

  it('renders the create content button', () => {
    renderComponent();
    
    expect(screen.getByText('Create New Content')).toBeInTheDocument();
  });

  it('renders content list with version information', () => {
    renderComponent();
    
    expect(screen.getByText('Test Documentation')).toBeInTheDocument();
    expect(screen.getByText('Version 1 - draft')).toBeInTheDocument();
    expect(screen.getByText('integration')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('REST')).toBeInTheDocument();
  });

  it('handles content creation', async () => {
    const { createContent } = useContentGovernance();
    renderComponent();
    
    fireEvent.click(screen.getByText('Create New Content'));
    
    await waitFor(() => {
      expect(createContent).toHaveBeenCalledWith('', expect.any(Object));
    });
  });

  it('handles content editing', async () => {
    const { updateContent } = useContentGovernance();
    renderComponent();
    
    fireEvent.click(screen.getByLabelText('Edit'));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('handles content approval', async () => {
    const { approveContent } = useContentGovernance();
    (useContentGovernance as jest.Mock).mockReturnValue({
      ...useContentGovernance(),
      isReview: true,
    });
    
    renderComponent();
    
    fireEvent.click(screen.getByLabelText('Approve'));
    
    await waitFor(() => {
      expect(approveContent).toHaveBeenCalledWith('Content approved for integration documentation');
    });
  });

  it('handles content rejection', async () => {
    const { rejectContent } = useContentGovernance();
    (useContentGovernance as jest.Mock).mockReturnValue({
      ...useContentGovernance(),
      isReview: true,
    });
    
    renderComponent();
    
    fireEvent.click(screen.getByLabelText('Reject'));
    
    await waitFor(() => {
      expect(rejectContent).toHaveBeenCalledWith('Content needs revision');
    });
  });

  it('shows loading state', () => {
    renderComponent();
    
    // Simulate loading state
    (useContentGovernance as jest.Mock).mockReturnValue({
      ...useContentGovernance(),
      versions: null,
    });
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
}); 