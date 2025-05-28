import React, { useState } from 'react';
import { Card, Title, Text, Grid, Col, Metric, BarChart, LineChart, DonutChart, List, ListItem, Badge } from '@tremor/react';
import { FiTrendingUp, FiTrendingDown, FiTarget, FiUsers, FiDollarSign, FiActivity } from 'react-icons/fi';

interface KPI {
  name: string;
  value: number;
  target: number;
  change: number;
  status: 'on-track' | 'at-risk' | 'off-track';
  icon: React.ReactNode;
}

interface LaunchMetricsProps {
  onStatusUpdate: (key: string, value: boolean) => void;
}

const LaunchMetrics: React.FC<LaunchMetricsProps> = ({ onStatusUpdate }) => {
  const [kpis, setKpis] = useState<KPI[]>([
    {
      name: 'User Acquisition',
      value: 2500,
      target: 3000,
      change: 15.5,
      status: 'on-track',
      icon: <FiUsers className="w-5 h-5" />
    },
    {
      name: 'Revenue',
      value: 45000,
      target: 50000,
      change: 12.3,
      status: 'on-track',
      icon: <FiDollarSign className="w-5 h-5" />
    },
    {
      name: 'Engagement Rate',
      value: 65,
      target: 70,
      change: -2.5,
      status: 'at-risk',
      icon: <FiActivity className="w-5 h-5" />
    },
    {
      name: 'Conversion Rate',
      value: 3.2,
      target: 4.0,
      change: -0.8,
      status: 'off-track',
      icon: <FiTarget className="w-5 h-5" />
    }
  ]);

  const updateKPI = (name: string, value: number, change: number) => {
    setKpis(prev =>
      prev.map(kpi =>
        kpi.name === name
          ? {
              ...kpi,
              value,
              change,
              status: getKPIStatus(value, kpi.target)
            }
          : kpi
      )
    );

    // Update overall metrics status
    const allOnTrack = kpis.every(kpi => kpi.status === 'on-track');
    onStatusUpdate('launchMetrics', allOnTrack);
  };

  const getKPIStatus = (value: number, target: number): KPI['status'] => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'on-track';
    if (percentage >= 75) return 'at-risk';
    return 'off-track';
  };

  const getStatusBadge = (status: KPI['status']) => {
    const statusConfig = {
      'on-track': { color: 'green', text: 'On Track' },
      'at-risk': { color: 'yellow', text: 'At Risk' },
      'off-track': { color: 'red', text: 'Off Track' }
    };

    const config = statusConfig[status];
    return (
      <Badge color={config.color as any} size="sm">
        {config.text}
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
        {kpis.map(kpi => (
          <Col key={kpi.name}>
            <Card className="p-6">
              <div className="flex items-center gap-2">
                {kpi.icon}
                <Text>{kpi.name}</Text>
              </div>
              <Metric>{kpi.value.toLocaleString()}</Metric>
              <div className="mt-2">
                <Text className="text-sm text-gray-500">
                  Target: {kpi.target.toLocaleString()}
                </Text>
                <div className="flex items-center gap-2 mt-1">
                  {getChangeIcon(kpi.change)}
                  <Text className="text-sm">
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </Text>
                  {getStatusBadge(kpi.status)}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Grid>

      <Grid numItems={1} numItemsSm={2} className="gap-6">
        <Col>
          <Card className="p-6">
            <Title>User Growth Trend</Title>
            <LineChart
              className="mt-4 h-72"
              data={[
                { date: 'Day 1', users: 500 },
                { date: 'Day 2', users: 800 },
                { date: 'Day 3', users: 1200 },
                { date: 'Day 4', users: 1500 },
                { date: 'Day 5', users: 2000 },
                { date: 'Day 6', users: 2200 },
                { date: 'Day 7', users: 2500 }
              ]}
              index="date"
              categories={['users']}
              colors={['blue']}
            />
          </Card>
        </Col>
        <Col>
          <Card className="p-6">
            <Title>Revenue Distribution</Title>
            <DonutChart
              className="mt-4 h-72"
              data={[
                { name: 'Product A', value: 15000 },
                { name: 'Product B', value: 12000 },
                { name: 'Product C', value: 10000 },
                { name: 'Product D', value: 8000 }
              ]}
              category="value"
              index="name"
              colors={['blue', 'cyan', 'indigo', 'violet']}
            />
          </Card>
        </Col>
      </Grid>

      <Card className="p-6">
        <Title>Engagement Metrics</Title>
        <BarChart
          className="mt-4 h-72"
          data={[
            { metric: 'Page Views', value: 25000 },
            { metric: 'Time on Site', value: 1800 },
            { metric: 'Bounce Rate', value: 35 },
            { metric: 'Return Rate', value: 45 }
          ]}
          index="metric"
          categories={['value']}
          colors={['blue']}
        />
      </Card>
    </div>
  );
};

export default LaunchMetrics; 