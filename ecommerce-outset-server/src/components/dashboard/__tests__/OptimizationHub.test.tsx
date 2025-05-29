import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OptimizationHub from '../OptimizationHub';
import {
  getPlatformMetrics,
  getTasks,
  getPersonaPerformance,
  getIntegrationHealth,
  getAlerts,
} from '../../../services/optimizationHubService';
import { OptimizationType } from '../../../types/optimizationHub';

// Mock the service layer
jest.mock('../../../services/optimizationHubService');

// Mock the AdminAutomationWrapper component
jest.mock('../AdminAutomationWrapper', () => {
  return function MockAdminAutomationWrapper({ children }: { children: React.ReactNode }) {
    return <div data-testid="admin-automation-wrapper">{children}</div>;
  };
});

describe('OptimizationHub', () => {
  const mockPlatformMetrics = [
    {
      platformType: 'GOOGLE_ANALYTICS',
      metrics: [
        { name: 'Page Views', value: 1000, change: 5, trend: 'up' },
        { name: 'Unique Visitors', value: 500, change: -2, trend: 'down' },
      ],
      conversionMetrics: {
        conversionRate: 0.25,
        bounceRate: 0.35,
        funnelCompletion: 0.75,
      },
      revenueMetrics: {
        avgOrderValue: 150,
        revenuePerVisitor: 37.5,
        customerLTV: 450,
      },
      lastUpdated: new Date(),
    },
  ];

  const mockTasks = [
    {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high',
      status: 'in_progress',
      platformType: 'GOOGLE_ANALYTICS',
      optimizationType: OptimizationType.CRO,
      source: 'manual',
      insights: ['Test Insight'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPersonaPerformance = [
    {
      personaType: 'STARTUP_SAM',
      metrics: {
        conversionRate: 0.25,
        engagementRate: 0.75,
        revenuePerUser: 100,
        retentionRate: 0.85,
        satisfactionScore: 4.5,
      },
      trends: [],
      recommendations: [
        {
          priority: 'high',
          description: 'Test Recommendation',
          expectedImpact: 'High impact',
          optimizationType: OptimizationType.CRO,
        },
      ],
      bundleOffers: [
        {
          name: 'Starter Bundle',
          description: 'Perfect for startups',
          price: 299,
          conversionRate: 0.15,
          revenueImpact: 0.25,
        },
      ],
      serviceTiers: [
        {
          name: 'Premium',
          features: ['24/7 Support', 'Advanced Analytics'],
          price: 499,
          conversionRate: 0.1,
          revenueImpact: 0.4,
        },
      ],
    },
  ];

  const mockIntegrationHealth = [
    {
      platformType: 'GOOGLE_ANALYTICS',
      status: 'healthy',
      lastChecked: new Date(),
      responseTime: 100,
      details: {
        quotaUsage: 0.5,
        lastSync: new Date(),
      },
    },
  ];

  const mockAlerts = [
    {
      id: '1',
      type: 'metric',
      severity: 'critical',
      message: 'Test Alert',
      details: { metric: 'Page Views', threshold: 1000 },
      detectedAt: new Date(),
      status: 'active',
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock implementations
    (getPlatformMetrics as jest.Mock).mockResolvedValue(mockPlatformMetrics);
    (getTasks as jest.Mock).mockResolvedValue(mockTasks);
    (getPersonaPerformance as jest.Mock).mockResolvedValue(mockPersonaPerformance);
    (getIntegrationHealth as jest.Mock).mockResolvedValue(mockIntegrationHealth);
    (getAlerts as jest.Mock).mockResolvedValue(mockAlerts);
  });

  it('renders loading state initially', () => {
    render(<OptimizationHub />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state when API calls fail', async () => {
    (getPlatformMetrics as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(<OptimizationHub />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load optimization hub data')).toBeInTheDocument();
    });
  });

  it('renders all data correctly after loading', async () => {
    render(<OptimizationHub />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if all sections are rendered
    expect(screen.getByText('Optimization Hub')).toBeInTheDocument();
    expect(screen.getByText('Overall Performance')).toBeInTheDocument();
    expect(screen.getByText('Integration Health')).toBeInTheDocument();
    expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    expect(screen.getByText('Optimization Tasks')).toBeInTheDocument();

    // Check if platform metrics are rendered
    expect(screen.getByText('GOOGLE_ANALYTICS')).toBeInTheDocument();
    expect(screen.getByText('Page Views')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();

    // Check if tasks are rendered
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();

    // Check if persona performance is rendered
    expect(screen.getByText('STARTUP_SAM')).toBeInTheDocument();
    expect(screen.getByText('Test Recommendation')).toBeInTheDocument();

    // Check if integration health is rendered
    expect(screen.getByText('healthy')).toBeInTheDocument();

    // Check if alerts are rendered
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });

  it('changes tabs correctly', async () => {
    render(<OptimizationHub />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click on Tasks tab
    fireEvent.click(screen.getByText('Tasks'));
    expect(screen.getByText('Test Task')).toBeInTheDocument();

    // Click on Persona Performance tab
    fireEvent.click(screen.getByText('Persona Performance'));
    expect(screen.getByText('STARTUP_SAM')).toBeInTheDocument();

    // Click on Integrations tab
    fireEvent.click(screen.getByText('Integrations'));
    expect(screen.getByText('healthy')).toBeInTheDocument();

    // Click on Alerts tab
    fireEvent.click(screen.getByText('Alerts'));
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });

  it('calculates overall performance correctly', async () => {
    render(<OptimizationHub />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // The mock data has two metrics with values 1000 and 500
    // Average is 750, which should be displayed as 75%
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays CRO and RVO impact metrics', async () => {
    render(<OptimizationHub />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('CRO Impact')).toBeInTheDocument();
    expect(screen.getByText('RVO Impact')).toBeInTheDocument();
  });

  it('displays conversion metrics for platforms', async () => {
    render(<OptimizationHub />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Conversion Metrics')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
    expect(screen.getByText('35.0%')).toBeInTheDocument();
    expect(screen.getByText('Funnel Completion')).toBeInTheDocument();
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('displays revenue metrics for platforms', async () => {
    render(<OptimizationHub />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Revenue Metrics')).toBeInTheDocument();
    expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('Revenue/Visitor')).toBeInTheDocument();
    expect(screen.getByText('$37.50')).toBeInTheDocument();
    expect(screen.getByText('Customer LTV')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();
  });

  it('displays bundle offers for personas', async () => {
    render(<OptimizationHub />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click on Persona Performance tab
    fireEvent.click(screen.getByText('Persona Performance'));

    expect(screen.getByText('Bundle Offers')).toBeInTheDocument();
    expect(screen.getByText('Starter Bundle')).toBeInTheDocument();
    expect(screen.getByText('Perfect for startups')).toBeInTheDocument();
    expect(screen.getByText('$299')).toBeInTheDocument();
    expect(screen.getByText('15.0% Conv.')).toBeInTheDocument();
    expect(screen.getByText('25.0% Impact')).toBeInTheDocument();
  });

  it('displays service tiers for personas', async () => {
    render(<OptimizationHub />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click on Persona Performance tab
    fireEvent.click(screen.getByText('Persona Performance'));

    expect(screen.getByText('Service Tiers')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('24/7 Support')).toBeInTheDocument();
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    expect(screen.getByText('$499')).toBeInTheDocument();
    expect(screen.getByText('10.0% Conv.')).toBeInTheDocument();
    expect(screen.getByText('40.0% Impact')).toBeInTheDocument();
  });

  it('displays optimization type icons for recommendations', async () => {
    render(<OptimizationHub />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click on Persona Performance tab
    fireEvent.click(screen.getByText('Persona Performance'));

    const recommendationChip = screen.getByText('Test Recommendation');
    expect(recommendationChip).toBeInTheDocument();
    expect(recommendationChip.closest('.MuiChip-root')).toHaveAttribute('data-testid', 'cro-recommendation');
  });
}); 