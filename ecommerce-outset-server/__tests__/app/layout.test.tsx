import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock the components
jest.mock('@/components/Header', () => ({
  __esModule: true,
  default: () => <header data-testid="header">Header</header>,
}));

jest.mock('@/components/Footer', () => ({
  __esModule: true,
  default: () => <footer data-testid="footer">Footer</footer>,
}));

describe('RootLayout', () => {
  it('renders the header and footer', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <RootLayout>
        <div data-testid="test-content">Test Content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies the correct layout classes', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    const main = screen.getByRole('main');
    expect(main).toHaveClass('flex-grow', 'pt-16', 'md:pt-[72px]');
  });
}); 