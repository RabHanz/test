import React from 'react';
import { render, screen } from '@testing-library/react';
import BlogLayout from '@/components/blog/BlogLayout';

// Mock the metadata
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
      return <>{children}</>;
    },
  };
});

describe('BlogLayout', () => {
  const mockProps = {
    title: 'Test Blog Post',
    description: 'Test description',
    keywords: ['test', 'blog'],
    children: <div data-testid="test-content">Test content</div>,
  };

  it('renders the blog layout with correct metadata', () => {
    render(<BlogLayout {...mockProps} />);
    
    // Check if title is rendered
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    
    // Check if content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    
    // Check if main content has correct classes
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveClass('max-w-4xl', 'mx-auto', 'px-4', 'py-8');
  });

  it('renders breadcrumbs navigation', () => {
    render(<BlogLayout {...mockProps} />);
    
    // Check if breadcrumbs are rendered
    const breadcrumbs = screen.getByRole('navigation');
    expect(breadcrumbs).toHaveClass('text-sm', 'mb-8');
  });
}); 