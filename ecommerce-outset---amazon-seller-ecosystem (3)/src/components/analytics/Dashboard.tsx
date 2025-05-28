import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanels,
  TabPanel,
  AreaChart,
  BarChart,
  DonutChart,
  Metric,
  Grid,
  Col
} from '@tremor/react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiActivity } from 'react-icons/fi';

interface MetricData {
  name: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

interface ChartData {
  date: string;
  value: number;
}

interface AnalyticsData {
  revenue: ChartData[];
  leads: ChartData[];
  conversions: ChartData[];
  sources: { name: string; value: number }[];
}

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: [],
    leads: [],
    conversions: [],
    sources: []
  });

  const metrics: MetricData[] = [
    {
      name: 'Total Revenue',
      value: 125000,
      change: 12.5,
      icon: <FiDollarSign className="w-6 h-6" />
    },
    {
      name: 'Active Leads',
      value: 2450,
      change: 8.2,
      icon: <FiUsers className="w-6 h-6" />
    },
    {
      name: 'Conversion Rate',
      value: 3.2,
      change: -1.5,
      icon: <FiTrendingUp className="w-6 h-6" />
    },
    {
      name: 'Avg. Response Time',
      value: 2.5,
      change: 0.5,
      icon: <FiActivity className="w-6 h-6" />
    }
  ];

  useEffect(() => {
    // Simulate fetching analytics data
    const fetchData = async () => {
      // In a real application, this would be an API call
      const mockData: AnalyticsData = {
        revenue: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.random() * 10000 + 5000
        })),
        leads: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.random() * 100 + 50
        })),
        conversions: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.random() * 10 + 2
        })),
        sources: [
          { name: 'Website', value: 45 },
          { name: 'Social Media', value: 25 },
          { name: 'Referrals', value: 20 },
          { name: 'Other', value: 10 }
        ]
      };
      setAnalyticsData(mockData);
    };

    fetchData();
  }, [timeRange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title>Analytics Dashboard</Title>
        <TabGroup>
          <TabList>
            <Tab value="7d">7 Days</Tab>
            <Tab value="30d">30 Days</Tab>
            <Tab value="90d">90 Days</Tab>
          </TabList>
        </TabGroup>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        {metrics.map(metric => (
          <Card key={metric.name} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-500">{metric.name}</Text>
                <Metric className="mt-2">{metric.value.toLocaleString()}</Metric>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                {metric.icon}
              </div>
            </div>
            <Text
              className={`mt-2 ${
                metric.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {metric.change >= 0 ? '+' : ''}{metric.change}%
            </Text>
          </Card>
        ))}
      </Grid>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Revenue Trend</Title>
          <AreaChart
            className="mt-4 h-72"
            data={analyticsData.revenue}
            index="date"
            categories={['value']}
            colors={['blue']}
            valueFormatter={(value) => `$${value.toLocaleString()}`}
          />
        </Card>

        <Card>
          <Title>Lead Generation</Title>
          <BarChart
            className="mt-4 h-72"
            data={analyticsData.leads}
            index="date"
            categories={['value']}
            colors={['green']}
          />
        </Card>
      </Grid>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Conversion Rate</Title>
          <AreaChart
            className="mt-4 h-72"
            data={analyticsData.conversions}
            index="date"
            categories={['value']}
            colors={['purple']}
            valueFormatter={(value) => `${value}%`}
          />
        </Card>

        <Card>
          <Title>Lead Sources</Title>
          <DonutChart
            className="mt-4 h-72"
            data={analyticsData.sources}
            category="value"
            index="name"
            valueFormatter={(value) => `${value}%`}
            colors={['blue', 'green', 'purple', 'orange']}
          />
        </Card>
      </Grid>
    </div>
  );
};

export default Dashboard; 