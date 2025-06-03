import React from 'react';
import { render, screen } from '@testing-library/react';
import LaunchPage from '@/app/launch/page';

// Mock the LaunchHubPage component
jest.mock('@/components/hubs/launch/LaunchHubPage', () => ({
  __esModule: true,
  default: () => <div data-testid="launch-hub-page">Launch Hub Page</div>,
}));

describe('LaunchPage', () => {
  it('renders the launch hub page component', () => {
    render(<LaunchPage />);
    expect(screen.getByTestId('launch-hub-page')).toBeInTheDocument();
  });

  it('applies page transition animations', () => {
    render(<LaunchPage />);
    const motionDiv = screen.getByTestId('launch-hub-page').parentElement;
    expect(motionDiv).toHaveAttribute('key', 'launch');
  });
}); 