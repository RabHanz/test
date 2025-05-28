import React, { useState, ReactElement } from 'react';
import { Card, Title, Text, List, ListItem, Badge, Button, Grid, Col, Metric, AreaChart, BarChart } from '@tremor/react';
import { FiActivity, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiRefreshCw, FiClock } from 'react-icons/fi';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  change: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface ABTest {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  startDate: Date;
  endDate?: Date;
  variantA: {
    name: string;
    conversionRate: number;
    sampleSize: number;
  };
  variantB: {
    name: string;
    conversionRate: number;
    sampleSize: number;
  };
  confidence: number;
  winner?: string;
}

interface MLRecommendation {
  id: string;
  type: 'performance' | 'conversion' | 'engagement' | 'revenue';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  status: 'pending' | 'implemented' | 'rejected';
  implementationDate?: Date;
}

const DataDrivenOptimization: React.FC = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'Page Load Time',
      value: 1.8,
      target: 2.0,
      change: -0.2,
      status: 'healthy'
    },
    {
      name: 'API Response Time',
      value: 150,
      target: 200,
      change: -25,
      status: 'healthy'
    },
    {
      name: 'Error Rate',
      value: 0.8,
      target: 1.0,
      change: 0.1,
      status: 'warning'
    },
    {
      name: 'Server Load',
      value: 65,
      target: 70,
      change: 5,
      status: 'healthy'
    }
  ]);

  const [abTests, setABTests] = useState<ABTest[]>([
    {
      id: 'test-1',
      name: 'Landing Page CTA',
      status: 'running',
      startDate: new Date('2024-03-01'),
      variantA: {
        name: 'Control',
        conversionRate: 3.2,
        sampleSize: 1000
      },
      variantB: {
        name: 'New Design',
        conversionRate: 3.8,
        sampleSize: 1000
      },
      confidence: 85
    },
    {
      id: 'test-2',
      name: 'Pricing Page Layout',
      status: 'completed',
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-03-01'),
      variantA: {
        name: 'Original',
        conversionRate: 2.5,
        sampleSize: 2000
      },
      variantB: {
        name: 'Simplified',
        conversionRate: 3.1,
        sampleSize: 2000
      },
      confidence: 95,
      winner: 'Simplified'
    }
  ]);

  const [mlRecommendations, setMLRecommendations] = useState<MLRecommendation[]>([
    {
      id: 'rec-1',
      type: 'conversion',
      title: 'Optimize Checkout Flow',
      description: 'Reduce form fields and simplify payment process',
      impact: 'high',
      confidence: 92,
      status: 'pending'
    },
    {
      id: 'rec-2',
      type: 'performance',
      title: 'Implement Lazy Loading',
      description: 'Add lazy loading for images below the fold',
      impact: 'medium',
      confidence: 88,
      status: 'implemented',
      implementationDate: new Date('2024-03-05')
    }
  ]);

  const getStatusBadge = (status: string): ReactElement => {
    const statusConfig = {
      healthy: { color: 'green', icon: <FiCheckCircle className="w-4 h-4" /> },
      warning: { color: 'yellow', icon: <FiAlertCircle className="w-4 h-4" /> },
      critical: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> },
      running: { color: 'blue', icon: <FiRefreshCw className="w-4 h-4 animate-spin" /> },
      completed: { color: 'green', icon: <FiCheckCircle className="w-4 h-4" /> },
      failed: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> },
      pending: { color: 'yellow', icon: <FiClock className="w-4 h-4" /> },
      implemented: { color: 'green', icon: <FiCheckCircle className="w-4 h-4" /> },
      rejected: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Title>Real-time Performance Monitoring</Title>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mt-4">
          {performanceMetrics.map((metric: PerformanceMetric) => (
            <Col key={metric.name}>
              <Card className="p-4">
                <Text>{metric.name}</Text>
                <Metric>{metric.value.toLocaleString()}</Metric>
                <div className="mt-2">
                  <Text className="text-sm text-gray-500">
                    Target: {metric.target.toLocaleString()}
                  </Text>
                  <div className="flex items-center gap-2 mt-1">
                    <Text className="text-sm">
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </Text>
                    {getStatusBadge(metric.status)}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Grid>
      </Card>

      <Card className="p-6">
        <Title>A/B Testing Dashboard</Title>
        <List className="mt-4">
          {abTests.map((test: ABTest) => (
            <ListItem key={test.id} className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Text className="font-medium">{test.name}</Text>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <Text className="text-sm text-gray-500">Variant A ({test.variantA.name})</Text>
                      <Text className="text-sm">
                        Conversion: {test.variantA.conversionRate}%
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Sample: {test.variantA.sampleSize}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-sm text-gray-500">Variant B ({test.variantB.name})</Text>
                      <Text className="text-sm">
                        Conversion: {test.variantB.conversionRate}%
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Sample: {test.variantB.sampleSize}
                      </Text>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Text className="text-sm text-gray-500">
                      Confidence: {test.confidence}%
                    </Text>
                    {test.winner && (
                      <Text className="text-sm text-green-500">
                        Winner: {test.winner}
                      </Text>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(test.status)}
                  {test.status === 'running' && (
                    <Button size="xs" variant="secondary">
                      Stop Test
                    </Button>
                  )}
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      </Card>

      <Card className="p-6">
        <Title>ML-Based Optimization Recommendations</Title>
        <List className="mt-4">
          {mlRecommendations.map(rec => (
            <ListItem key={rec.id} className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(rec.status)}
                    <Text className="font-medium">{rec.title}</Text>
                  </div>
                  <Text className="text-gray-500">{rec.description}</Text>
                  <div className="mt-2">
                    <Text className="text-sm text-gray-500">
                      Impact: {rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Confidence: {rec.confidence}%
                    </Text>
                    {rec.implementationDate && (
                      <Text className="text-sm text-gray-400">
                        Implemented: {rec.implementationDate.toLocaleDateString()}
                      </Text>
                    )}
                  </div>
                </div>
                {rec.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button size="xs" variant="secondary">
                      Implement
                    </Button>
                    <Button size="xs" variant="secondary">
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </ListItem>
          ))}
        </List>
      </Card>

      <Grid numItems={1} numItemsSm={2} className="gap-6">
        <Col>
          <Card className="p-6">
            <Title>Performance Trends</Title>
            <AreaChart
              className="mt-4 h-72"
              data={[
                { date: '00:00', value: 1.5 },
                { date: '04:00', value: 1.6 },
                { date: '08:00', value: 1.8 },
                { date: '12:00', value: 2.0 },
                { date: '16:00', value: 1.9 },
                { date: '20:00', value: 1.7 },
                { date: '24:00', value: 1.5 }
              ]}
              index="date"
              categories={['value']}
              colors={['blue']}
            />
          </Card>
        </Col>
        <Col>
          <Card className="p-6">
            <Title>Error Distribution</Title>
            <BarChart
              className="mt-4 h-72"
              data={[
                { type: 'API Errors', value: 45 },
                { type: 'Database Errors', value: 25 },
                { type: 'Network Errors', value: 20 },
                { type: 'Other', value: 10 }
              ]}
              index="type"
              categories={['value']}
              colors={['red']}
            />
          </Card>
        </Col>
      </Grid>
    </div>
  );
};

export default DataDrivenOptimization; 