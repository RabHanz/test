import React from 'react';
import { Card, Title, Text, Grid, Col } from '@tremor/react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const layouts = {
    lg: [
      { i: 'executive-overview', x: 0, y: 0, w: 12, h: 4 },
      { i: 'traffic-analytics', x: 0, y: 4, w: 6, h: 4 },
      { i: 'conversion-funnel', x: 6, y: 4, w: 6, h: 4 },
      { i: 'revenue-metrics', x: 0, y: 8, w: 4, h: 4 },
      { i: 'customer-satisfaction', x: 4, y: 8, w: 4, h: 4 },
      { i: 'team-performance', x: 8, y: 8, w: 4, h: 4 },
    ],
  };

  return (
    <div className={`p-4 ${className}`}>
      <Title className="mb-4">Analytics Dashboard</Title>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        margin={[16, 16]}
      >
        <div key="executive-overview">
          <Card>
            <Title>Executive Overview</Title>
            <Text>Real-time business health scorecard and key metrics</Text>
            {/* Executive Overview Component will go here */}
          </Card>
        </div>

        <div key="traffic-analytics">
          <Card>
            <Title>Traffic Analytics</Title>
            <Text>Multi-channel traffic source analysis and visitor behavior</Text>
            {/* Traffic Analytics Component will go here */}
          </Card>
        </div>

        <div key="conversion-funnel">
          <Card>
            <Title>Conversion Funnel</Title>
            <Text>Detailed funnel analysis and optimization metrics</Text>
            {/* Conversion Funnel Component will go here */}
          </Card>
        </div>

        <div key="revenue-metrics">
          <Card>
            <Title>Revenue Metrics</Title>
            <Text>Revenue performance across all service lines</Text>
            {/* Revenue Metrics Component will go here */}
          </Card>
        </div>

        <div key="customer-satisfaction">
          <Card>
            <Title>Customer Satisfaction</Title>
            <Text>Client satisfaction scores and feedback analysis</Text>
            {/* Customer Satisfaction Component will go here */}
          </Card>
        </div>

        <div key="team-performance">
          <Card>
            <Title>Team Performance</Title>
            <Text>Team metrics and productivity analysis</Text>
            {/* Team Performance Component will go here */}
          </Card>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default AnalyticsDashboard; 