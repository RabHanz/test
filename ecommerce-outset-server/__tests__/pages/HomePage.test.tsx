import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import { useVisitorStore } from '@/store/visitorStore';

// Mock the store
jest.mock('@/store/visitorStore', () => ({
  useVisitorStore: jest.fn(),
}));

describe('HomePage', () => {
  beforeEach(() => {
    // Default mock implementation
    (useVisitorStore as jest.Mock).mockImplementation(() => ({
      determinedPersonaId: null,
      engagementLevel: 'low',
      isEmailSubscriber: false,
    }));
  });

  it('renders the hero section with default content', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the persona section', () => {
    render(<HomePage />);
    expect(screen.getByTestId('persona-section')).toBeInTheDocument();
  });

  it('renders the social proof section', () => {
    render(<HomePage />);
    expect(screen.getByTestId('social-proof-section')).toBeInTheDocument();
  });

  it('renders the footer with newsletter signup', () => {
    render(<HomePage />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('newsletter-signup')).toBeInTheDocument();
  });
}); 