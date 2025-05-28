import React from 'react';
import { Card, Title, Text, Grid, Col, Metric, AreaChart } from '@tremor/react';
import { format } from 'date-fns';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType }) => (
  <Card>
    <Text>{title}</Text>
    <Metric>{value}</Metric>
    <Text className={`mt-2 ${changeType === 'increase' ? 'text-green-500' : changeType === 'decrease' ? 'text-red-500' : 'text-gray-500'}`}>
      {change > 0 ? '+' : ''}{change}%
    </Text>
  </Card>
);

interface ExecutiveOverviewProps {
  data: {
    revenue: {
      current: number;
      previous: number;
      change: number;
    };
    conversions: {
      current: number;
      previous: number;
      change: number;
    };
    satisfaction: {
      current: number;
      previous: number;
      change: number;
    };
    revenueHistory: Array<{
      date: string;
      revenue: number;
    }>;
  };
}

const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({ data }) => {
  const { revenue, conversions, satisfaction, revenueHistory } = data;

  return (
    <div className="space-y-4">
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
        <Col>
          <MetricCard
            title="Total Revenue"
            value={`$${revenue.current.toLocaleString()}`}
            change={revenue.change}
            changeType={revenue.change >= 0 ? 'increase' : 'decrease'}
          />
        </Col>
        <Col>
          <MetricCard
            title="Conversion Rate"
            value={`${conversions.current}%`}
            change={conversions.change}
            changeType={conversions.change >= 0 ? 'increase' : 'decrease'}
          />
        </Col>
        <Col>
          <MetricCard
            title="Customer Satisfaction"
            value={`${satisfaction.current}/10`}
            change={satisfaction.change}
            changeType={satisfaction.change >= 0 ? 'increase' : 'decrease'}
          />
        </Col>
      </Grid>

      <Card>
        <Title>Revenue Trend</Title>
        <AreaChart
          className="h-72 mt-4"
          data={revenueHistory}
          index="date"
          categories={['revenue']}
          colors={['blue']}
          valueFormatter={(value) => `$${value.toLocaleString()}`}
          showLegend={false}
          showGridLines={false}
        />
      </Card>
    </div>
  );
};

export default ExecutiveOverview; 