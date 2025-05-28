import React from 'react';
import { Card, Title, Text, DonutChart, BarChart } from '@tremor/react';

interface TrafficAnalyticsProps {
  data: {
    trafficSources: {
      organic: number;
      paid: number;
      social: number;
      referral: number;
      direct: number;
    };
    trafficTrend: Array<{
      date: string;
      visitors: number;
      pageviews: number;
    }>;
  };
}

const TrafficAnalytics: React.FC<TrafficAnalyticsProps> = ({ data }) => {
  const { trafficSources, trafficTrend } = data;

  const trafficSourceData = [
    { name: 'Organic', value: trafficSources.organic },
    { name: 'Paid', value: trafficSources.paid },
    { name: 'Social', value: trafficSources.social },
    { name: 'Referral', value: trafficSources.referral },
    { name: 'Direct', value: trafficSources.direct },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <Title>Traffic Sources</Title>
        <DonutChart
          className="mt-4 h-72"
          data={trafficSourceData}
          category="value"
          index="name"
          valueFormatter={(value) => `${value}%`}
          colors={['blue', 'cyan', 'indigo', 'violet', 'fuchsia']}
        />
      </Card>

      <Card>
        <Title>Traffic Trends</Title>
        <BarChart
          className="mt-4 h-72"
          data={trafficTrend}
          index="date"
          categories={['visitors', 'pageviews']}
          colors={['blue', 'cyan']}
          valueFormatter={(value) => value.toLocaleString()}
          stack={false}
        />
      </Card>

      <Card>
        <Title>Key Metrics</Title>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Text>Total Visitors</Text>
            <Text className="text-2xl font-bold">
              {trafficTrend.reduce((sum, day) => sum + day.visitors, 0).toLocaleString()}
            </Text>
          </div>
          <div>
            <Text>Total Pageviews</Text>
            <Text className="text-2xl font-bold">
              {trafficTrend.reduce((sum, day) => sum + day.pageviews, 0).toLocaleString()}
            </Text>
          </div>
          <div>
            <Text>Avg. Pages per Visit</Text>
            <Text className="text-2xl font-bold">
              {(trafficTrend.reduce((sum, day) => sum + day.pageviews, 0) /
                trafficTrend.reduce((sum, day) => sum + day.visitors, 0)).toFixed(2)}
            </Text>
          </div>
          <div>
            <Text>Bounce Rate</Text>
            <Text className="text-2xl font-bold">45.2%</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrafficAnalytics; 