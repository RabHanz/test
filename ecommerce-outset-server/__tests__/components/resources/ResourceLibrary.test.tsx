import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResourceLibrary from '@/components/resources/ResourceLibrary';

const mockResources = [
  {
    id: '1',
    title: 'Getting Started Guide',
    description: 'A comprehensive guide for new sellers',
    type: 'guide',
    persona: 'new-seller',
    url: '/resources/guides/getting-started',
  },
  {
    id: '2',
    title: 'Advanced PPC Strategies',
    description: 'Learn advanced PPC optimization techniques',
    type: 'video',
    persona: 'established-seller',
    url: '/resources/videos/advanced-ppc',
  },
];

describe('ResourceLibrary', () => {
  const mockProps = {
    resources: mockResources,
    onResourceClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all resources', () => {
    render(<ResourceLibrary {...mockProps} />);
    
    // Check if all resources are rendered
    expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
    expect(screen.getByText('Advanced PPC Strategies')).toBeInTheDocument();
  });

  it('filters resources by persona', () => {
    render(<ResourceLibrary {...mockProps} />);
    
    // Select new seller persona
    fireEvent.change(screen.getByLabelText(/persona/i), {
      target: { value: 'new-seller' },
    });
    
    // Check if only new seller resources are shown
    expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
    expect(screen.queryByText('Advanced PPC Strategies')).not.toBeInTheDocument();
  });

  it('filters resources by type', () => {
    render(<ResourceLibrary {...mockProps} />);
    
    // Select video type
    fireEvent.change(screen.getByLabelText(/type/i), {
      target: { value: 'video' },
    });
    
    // Check if only video resources are shown
    expect(screen.queryByText('Getting Started Guide')).not.toBeInTheDocument();
    expect(screen.getByText('Advanced PPC Strategies')).toBeInTheDocument();
  });

  it('calls onResourceClick when a resource is clicked', () => {
    render(<ResourceLibrary {...mockProps} />);
    
    // Click on a resource
    fireEvent.click(screen.getByText('Getting Started Guide'));
    
    // Check if onResourceClick was called with correct data
    expect(mockProps.onResourceClick).toHaveBeenCalledWith(mockResources[0]);
  });

  it('shows no results message when no resources match filters', () => {
    render(<ResourceLibrary {...mockProps} />);
    
    // Select filters that don't match any resources
    fireEvent.change(screen.getByLabelText(/persona/i), {
      target: { value: 'new-seller' },
    });
    fireEvent.change(screen.getByLabelText(/type/i), {
      target: { value: 'video' },
    });
    
    // Check if no results message is shown
    expect(screen.getByText(/no resources found/i)).toBeInTheDocument();
  });
}); 