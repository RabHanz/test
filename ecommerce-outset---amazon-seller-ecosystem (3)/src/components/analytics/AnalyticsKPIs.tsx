import React from 'react';
import { Card, Title, Text, Grid, Col, Metric } from '@tremor/react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface KPI {
  title: string;
  value: number;
  change: number;
  format?: 'number' | 'currency' | 'percentage';
  description?: string;
}

interface AnalyticsKPIsProps {
  kpis: KPI[];
}

const AnalyticsKPIs: React.FC<AnalyticsKPIsProps> = ({ kpis }) => {
  const formatValue = (kpi: KPI) => {
    const { value, format } = kpi;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <FiTrendingUp className="w-5 h-5" />
    ) : (
      <FiTrendingDown className="w-5 h-5" />
    );
  };

  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
      {kpis.map((kpi, index) => (
        <Col key={index}>
          <Card>
            <Text>{kpi.title}</Text>
            <Metric className="mt-2">{formatValue(kpi)}</Metric>
            <div className="mt-2 flex items-center space-x-2">
              <span className={getChangeColor(kpi.change)}>
                {getChangeIcon(kpi.change)}
              </span>
              <Text className={getChangeColor(kpi.change)}>
                {kpi.change >= 0 ? '+' : ''}
                {kpi.change.toFixed(1)}%
              </Text>
            </div>
            {kpi.description && (
              <Text className="mt-2 text-sm text-gray-500">
                {kpi.description}
              </Text>
            )}
          </Card>
        </Col>
      ))}
    </Grid>
  );
};

export default AnalyticsKPIs; 