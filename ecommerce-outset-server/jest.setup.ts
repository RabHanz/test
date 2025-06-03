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

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter',
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
process.env.MAILCHIMP_API_KEY = 'test-mailchimp-key';
process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
process.env.FACEBOOK_ACCESS_TOKEN = 'test-facebook-token';
process.env.CLICKUP_API_KEY = 'test-clickup-key';
process.env.TEACHABLE_API_KEY = 'test-teachable-key';
process.env.SEMRUSH_API_KEY = 'test-semrush-key';

// Mock fetch
global.fetch = jest.fn();

// Mock console methods
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock Date
const mockDate = new Date('2024-01-01T00:00:00.000Z');
global.Date = class extends Date {
  constructor() {
    super();
    return mockDate;
  }
} as DateConstructor; 