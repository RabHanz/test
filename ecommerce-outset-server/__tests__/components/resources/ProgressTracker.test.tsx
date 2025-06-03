import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressTracker from '@/components/resources/ProgressTracker';

const mockProgress = {
  completedResources: ['1', '2'],
  inProgressResources: ['3'],
  recommendedResources: [
    {
      id: '4',
      title: 'Next Steps Guide',
      description: 'Continue your learning journey',
      type: 'guide',
      persona: 'new-seller',
      url: '/resources/guides/next-steps',
    },
  ],
};

describe('ProgressTracker', () => {
  const mockProps = {
    progress: mockProgress,
    onResourceClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders progress statistics', () => {
    render(<ProgressTracker {...mockProps} />);
    
    // Check if progress stats are rendered
    expect(screen.getByText(/completed: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress: 1/i)).toBeInTheDocument();
  });

  it('renders recommended resources', () => {
    render(<ProgressTracker {...mockProps} />);
    
    // Check if recommended resource is rendered
    expect(screen.getByText('Next Steps Guide')).toBeInTheDocument();
    expect(screen.getByText('Continue your learning journey')).toBeInTheDocument();
  });

  it('shows progress bar with correct percentage', () => {
    render(<ProgressTracker {...mockProps} />);
    
    // Check if progress bar is rendered with correct percentage
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '66');
  });

  it('calls onResourceClick when a recommended resource is clicked', () => {
    render(<ProgressTracker {...mockProps} />);
    
    // Click on a recommended resource
    fireEvent.click(screen.getByText('Next Steps Guide'));
    
    // Check if onResourceClick was called with correct data
    expect(mockProps.onResourceClick).toHaveBeenCalledWith(mockProgress.recommendedResources[0]);
  });

  it('shows empty state when no progress', () => {
    const emptyProgress = {
      completedResources: [],
      inProgressResources: [],
      recommendedResources: [],
    };
    
    render(<ProgressTracker progress={emptyProgress} onResourceClick={mockProps.onResourceClick} />);
    
    // Check if empty state message is shown
    expect(screen.getByText(/start your learning journey/i)).toBeInTheDocument();
  });
}); 