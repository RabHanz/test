import React, { useState } from 'react';
import { Card, Title, Text, Tab, TabList, TabGroup, TabPanel, TabPanels, Grid, Col, Metric, Badge, Button } from '@tremor/react';
import { FiTrendingUp, FiActivity, FiUsers, FiDollarSign, FiTarget, FiBarChart2 } from 'react-icons/fi';

import DataDrivenOptimization from './DataDrivenOptimization';
import PerformanceOptimization from './PerformanceOptimization';
import ConversionOptimization from './ConversionOptimization';
import PersonaEvolution from './PersonaEvolution';
import RevenueOptimization from './RevenueOptimization';
import TechnologyEvolution from './TechnologyEvolution';
import MarketExpansion from './MarketExpansion';
import CompetitiveIntelligence from './CompetitiveIntelligence';
import CustomerSuccess from './CustomerSuccess';
import TeamOptimization from './TeamOptimization';
import FinancialOptimization from './FinancialOptimization';
import AnalyticsDashboard from './AnalyticsDashboard';
import InnovationFramework from './InnovationFramework';

interface OptimizationMetric {
  name: string;
  value: number;
  target: number;
  change: number;
  status: 'on-track' | 'at-risk' | 'off-track';
  icon: React.ReactNode;
}

const OptimizationEngine: React.FC = () => {
  const [metrics, setMetrics] = useState<OptimizationMetric[]>([
    {
      name: 'Conversion Rate',
      value: 3.2,
      target: 4.0,
      change: 0.5,
      status: 'on-track',
      icon: <FiTrendingUp className="w-5 h-5" />
    },
    {
      name: 'User Engagement',
      value: 65,
      target: 70,
      change: 2.5,
      status: 'at-risk',
      icon: <FiActivity className="w-5 h-5" />
    },
    {
      name: 'Customer Satisfaction',
      value: 4.5,
      target: 4.8,
      change: 0.2,
      status: 'on-track',
      icon: <FiUsers className="w-5 h-5" />
    },
    {
      name: 'Revenue Growth',
      value: 15,
      target: 20,
      change: 3.5,
      status: 'at-risk',
      icon: <FiDollarSign className="w-5 h-5" />
    },
    {
      name: 'Performance Score',
      value: 85,
      target: 90,
      change: 2.0,
      status: 'on-track',
      icon: <FiTarget className="w-5 h-5" />
    },
    {
      name: 'Market Share',
      value: 12,
      target: 15,
      change: 1.5,
      status: 'off-track',
      icon: <FiBarChart2 className="w-5 h-5" />
    }
  ]);

  const getStatusBadge = (status: OptimizationMetric['status']) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title>Optimization & Growth Engine</Title>
        <Button size="xs" variant="secondary">
          Generate Report
        </Button>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        {metrics.map(metric => (
          <Col key={metric.name}>
            <Card className="p-6">
              <div className="flex items-center gap-2">
                {metric.icon}
                <Text>{metric.name}</Text>
              </div>
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

      <TabGroup>
        <TabList className="mt-6">
          <Tab>Data & Performance</Tab>
          <Tab>Conversion & Persona</Tab>
          <Tab>Revenue & Technology</Tab>
          <Tab>Market & Competition</Tab>
          <Tab>Customer & Team</Tab>
          <Tab>Finance & Analytics</Tab>
          <Tab>Innovation</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="space-y-6">
              <DataDrivenOptimization />
              <PerformanceOptimization />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="space-y-6">
              <ConversionOptimization />
              <PersonaEvolution />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="space-y-6">
              <RevenueOptimization />
              <TechnologyEvolution />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="space-y-6">
              <MarketExpansion />
              <CompetitiveIntelligence />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="space-y-6">
              <CustomerSuccess />
              <TeamOptimization />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="space-y-6">
              <FinancialOptimization />
              <AnalyticsDashboard />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="space-y-6">
              <InnovationFramework />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default OptimizationEngine; 