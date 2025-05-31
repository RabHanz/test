import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import MetricsOverview from '../MetricsOverview';

const mockMetrics = {
  overallMetrics: {
    totalIntegrations: 10,
    activeIntegrations: 8,
    successRate: 95.5,
    averageResponseTime: 250,
  },
  metricsByType: {
    API: {
      count: 5,
      successRate: 98.0,
      averageResponseTime: 200,
    },
    WEBHOOK: {
      count: 3,
      successRate: 92.0,
      averageResponseTime: 300,
    },
    DATABASE: {
      count: 2,
      successRate: 96.0,
      averageResponseTime: 150,
    },
  },
  metricsByProtocol: {
    REST: {
      count: 6,
      successRate: 97.0,
      averageResponseTime: 180,
    },
    SOAP: {
      count: 2,
      successRate: 94.0,
      averageResponseTime: 400,
    },
    GRAPHQL: {
      count: 2,
      successRate: 95.0,
      averageResponseTime: 220,
    },
  },
};

describe('MetricsOverview', () => {
  const renderComponent = (metrics = mockMetrics) => {
    return render(
      <ThemeProvider theme={theme}>
        <MetricsOverview metrics={metrics} />
      </ThemeProvider>
    );
  };

  it('renders overall metrics correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Overall Metrics')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Total Integrations
    expect(screen.getByText('8')).toBeInTheDocument(); // Active Integrations
    expect(screen.getByText('95.5%')).toBeInTheDocument(); // Success Rate
    expect(screen.getByText('250ms')).toBeInTheDocument(); // Average Response Time
  });

  it('renders metrics by type correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Metrics by Type')).toBeInTheDocument();
    
    // API metrics
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Count
    expect(screen.getByText('98.0%')).toBeInTheDocument(); // Success Rate
    expect(screen.getByText('200ms')).toBeInTheDocument(); // Response Time
    
    // Webhook metrics
    expect(screen.getByText('WEBHOOK')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Count
    expect(screen.getByText('92.0%')).toBeInTheDocument(); // Success Rate
    expect(screen.getByText('300ms')).toBeInTheDocument(); // Response Time
  });

  it('renders metrics by protocol correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Metrics by Protocol')).toBeInTheDocument();
    
    // REST metrics
    expect(screen.getByText('REST')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument(); // Count
    expect(screen.getByText('97.0%')).toBeInTheDocument(); // Success Rate
    expect(screen.getByText('180ms')).toBeInTheDocument(); // Response Time
    
    // SOAP metrics
    expect(screen.getByText('SOAP')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Count
    expect(screen.getByText('94.0%')).toBeInTheDocument(); // Success Rate
    expect(screen.getByText('400ms')).toBeInTheDocument(); // Response Time
  });

  it('handles empty metrics gracefully', () => {
    const emptyMetrics = {
      overallMetrics: {
        totalIntegrations: 0,
        activeIntegrations: 0,
        successRate: 0,
        averageResponseTime: 0,
      },
      metricsByType: {},
      metricsByProtocol: {},
    };
    
    renderComponent(emptyMetrics);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // Total Integrations
    expect(screen.getByText('0%')).toBeInTheDocument(); // Success Rate
    expect(screen.getByText('0ms')).toBeInTheDocument(); // Response Time
  });

  it('formats numbers correctly', () => {
    const metricsWithDecimals = {
      ...mockMetrics,
      overallMetrics: {
        ...mockMetrics.overallMetrics,
        successRate: 99.999,
        averageResponseTime: 123.456,
      },
    };
    
    renderComponent(metricsWithDecimals);
    
    expect(screen.getByText('100.0%')).toBeInTheDocument(); // Success Rate
    expect(screen.getByText('123ms')).toBeInTheDocument(); // Response Time
  });
}); 