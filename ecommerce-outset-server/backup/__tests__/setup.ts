import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter',
  }),
})); 