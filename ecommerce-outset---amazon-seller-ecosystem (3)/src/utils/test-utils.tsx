import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data generators
export const generateMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides,
});

export const generateMockWorkflow = (overrides = {}) => ({
  id: '1',
  name: 'Test Workflow',
  description: 'Test workflow description',
  nodes: [],
  triggers: [],
  actions: [],
  conditions: [],
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'system',
  lastModifiedBy: 'system',
  version: 1,
  tags: ['test'],
  metadata: {},
  ...overrides,
});

// Test helpers
export const waitForLoadingToFinish = async () => {
  const loadingElement = document.querySelector('[data-testid="loading"]');
  if (loadingElement) {
    await waitForElementToBeRemoved(() =>
      document.querySelector('[data-testid="loading"]')
    );
  }
};

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render }; 