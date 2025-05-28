import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import CommunityDashboard from './CommunityDashboard';
import { generateMockUser } from '@/utils/test-utils';

describe('CommunityDashboard', () => {
  const mockUser = generateMockUser();

  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders the dashboard with user information', () => {
    render(<CommunityDashboard user={mockUser} />);
    
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<CommunityDashboard user={mockUser} />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows error message when data fetch fails', async () => {
    // Mock a failed API call
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<CommunityDashboard user={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
    });
  });

  it('updates user profile when edit button is clicked', async () => {
    render(<CommunityDashboard user={mockUser} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);
    
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('New Name')).toBeInTheDocument();
    });
  });

  it('navigates to different sections when menu items are clicked', () => {
    render(<CommunityDashboard user={mockUser} />);
    
    const menuItems = [
      { name: /discussions/i, testId: 'discussions-section' },
      { name: /resources/i, testId: 'resources-section' },
      { name: /study groups/i, testId: 'study-groups-section' },
    ];
    
    menuItems.forEach(({ name, testId }) => {
      const menuItem = screen.getByRole('button', { name });
      fireEvent.click(menuItem);
      expect(screen.getByTestId(testId)).toBeVisible();
    });
  });

  it('handles notifications correctly', async () => {
    render(<CommunityDashboard user={mockUser} />);
    
    const notificationButton = screen.getByTestId('notifications-button');
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('notifications-panel')).toBeVisible();
    });
    
    const markAllReadButton = screen.getByRole('button', { name: /mark all as read/i });
    fireEvent.click(markAllReadButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('unread-notification')).not.toBeInTheDocument();
    });
  });

  it('filters content based on search input', async () => {
    render(<CommunityDashboard user={mockUser} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      const filteredItems = screen.getAllByTestId('content-item');
      filteredItems.forEach(item => {
        expect(item).toHaveTextContent(/test/i);
      });
    });
  });

  it('applies filters correctly', async () => {
    render(<CommunityDashboard user={mockUser} />);
    
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);
    
    const categoryFilter = screen.getByLabelText(/category/i);
    fireEvent.change(categoryFilter, { target: { value: 'discussions' } });
    
    const applyButton = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      const filteredItems = screen.getAllByTestId('content-item');
      filteredItems.forEach(item => {
        expect(item).toHaveAttribute('data-category', 'discussions');
      });
    });
  });
}); 