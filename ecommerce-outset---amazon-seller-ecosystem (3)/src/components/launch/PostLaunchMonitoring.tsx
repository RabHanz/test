import React, { useState } from 'react';
import { Card, Title, Text, Grid, Col, Metric, AreaChart, BarChart, DonutChart, List, ListItem, Badge } from '@tremor/react';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface MetricData {
  name: string;
  value: number;
  change: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface SystemHealth {
  component: string;
  status: 'operational' | 'degraded' | 'down';
  lastChecked: Date;
  uptime: number;
  responseTime: number;
}

interface PostLaunchMonitoringProps {
  onStatusUpdate: (key: string, value: boolean) => void;
}

const PostLaunchMonitoring: React.FC<PostLaunchMonitoringProps> = ({ onStatusUpdate }) => {
  const [metrics, setMetrics] = useState<MetricData[]>([
    {
      name: 'Active Users',
      value: 1250,
      change: 12.5,
      status: 'healthy'
    },
    {
      name: 'Response Time',
      value: 245,
      change: -8.2,
      status: 'healthy'
    },
    {
      name: 'Error Rate',
      value: 0.8,
      change: 0.2,
      status: 'warning'
    },
    {
      name: 'Server Load',
      value: 65,
      change: 15,
      status: 'warning'
    }
  ]);

  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([
    {
      component: 'Web Server',
      status: 'operational',
      lastChecked: new Date(),
      uptime: 99.99,
      responseTime: 120
    },
    {
      component: 'Database',
      status: 'operational',
      lastChecked: new Date(),
      uptime: 99.95,
      responseTime: 85
    },
    {
      component: 'API Gateway',
      status: 'degraded',
      lastChecked: new Date(),
      uptime: 99.8,
      responseTime: 250
    },
    {
      component: 'Cache Layer',
      status: 'operational',
      lastChecked: new Date(),
      uptime: 99.9,
      responseTime: 45
    }
  ]);

  const updateMetric = (name: string, value: number, change: number) => {
    setMetrics(prev =>
      prev.map(metric =>
        metric.name === name
          ? {
              ...metric,
              value,
              change,
              status: getMetricStatus(name, value, change)
            }
          : metric
      )
    );
  };

  const updateSystemHealth = (component: string, status: SystemHealth['status']) => {
    setSystemHealth(prev =>
      prev.map(health =>
        health.component === component
          ? {
              ...health,
              status,
              lastChecked: new Date()
            }
          : health
      )
    );

    // Update overall monitoring status
    const allOperational = systemHealth.every(health => health.status === 'operational');
    onStatusUpdate('postLaunchMonitoring', allOperational);
  };

  const getMetricStatus = (name: string, value: number, change: number): MetricData['status'] => {
    switch (name) {
      case 'Error Rate':
        return value > 1 ? 'critical' : value > 0.5 ? 'warning' : 'healthy';
      case 'Server Load':
        return value > 80 ? 'critical' : value > 60 ? 'warning' : 'healthy';
      case 'Response Time':
        return value > 500 ? 'critical' : value > 300 ? 'warning' : 'healthy';
      default:
        return 'healthy';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      operational: { color: 'green', icon: <FiCheckCircle className="w-4 h-4" /> },
      degraded: { color: 'yellow', icon: <FiAlertCircle className="w-4 h-4" /> },
      down: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> },
      healthy: { color: 'green', icon: <FiCheckCircle className="w-4 h-4" /> },
      warning: { color: 'yellow', icon: <FiAlertCircle className="w-4 h-4" /> },
      critical: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <FiTrendingUp className="w-4 h-4 text-green-500" />;
    }
    return <FiTrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        {metrics.map(metric => (
          <Col key={metric.name}>
            <Card className="p-6">
              <Text>{metric.name}</Text>
              <Metric>{metric.value.toLocaleString()}</Metric>
              <div className="flex items-center gap-2 mt-2">
                {getChangeIcon(metric.change)}
                <Text className="text-sm">
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </Text>
                {getStatusBadge(metric.status)}
              </div>
            </Card>
          </Col>
        ))}
      </Grid>

      <Card className="p-6">
        <Title>System Health</Title>
        <List className="mt-4">
          {systemHealth.map(health => (
            <ListItem key={health.component} className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Text className="font-medium">{health.component}</Text>
                  <div className="mt-2">
                    <Text className="text-sm text-gray-500">
                      Uptime: {health.uptime}%
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Response Time: {health.responseTime}ms
                    </Text>
                    <Text className="text-sm text-gray-400 mt-1">
                      Last Checked: {health.lastChecked.toLocaleString()}
                    </Text>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(health.status)}
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      </Card>

      <Grid numItems={1} numItemsSm={2} className="gap-6">
        <Col>
          <Card className="p-6">
            <Title>User Activity</Title>
            <AreaChart
              className="mt-4 h-72"
              data={[
                { date: '00:00', users: 100 },
                { date: '04:00', users: 150 },
                { date: '08:00', users: 300 },
                { date: '12:00', users: 450 },
                { date: '16:00', users: 600 },
                { date: '20:00', users: 400 },
                { date: '24:00', users: 200 }
              ]}
              index="date"
              categories={['users']}
              colors={['blue']}
            />
          </Card>
        </Col>
        <Col>
          <Card className="p-6">
            <Title>Error Distribution</Title>
            <DonutChart
              className="mt-4 h-72"
              data={[
                { name: 'API Errors', value: 45 },
                { name: 'Database Errors', value: 25 },
                { name: 'Network Errors', value: 20 },
                { name: 'Other', value: 10 }
              ]}
              category="value"
              index="name"
              colors={['red', 'orange', 'yellow', 'blue']}
            />
          </Card>
        </Col>
      </Grid>
    </div>
  );
};

export default PostLaunchMonitoring; 