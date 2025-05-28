import React from 'react';
import { Card, Title, Text, BarChart } from '@tremor/react';

interface ConversionFunnelProps {
  data: {
    funnelMetrics: {
      visitors: number;
      quizCompletions: number;
      emailCaptures: number;
      inquiries: number;
      strategySessions: number;
      enrollments: number;
    };
  };
}

const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
  const { funnelMetrics } = data;

  const funnelData = [
    {
      stage: 'Visitors',
      value: funnelMetrics.visitors,
      conversion: 100,
    },
    {
      stage: 'Quiz Completions',
      value: funnelMetrics.quizCompletions,
      conversion: (funnelMetrics.quizCompletions / funnelMetrics.visitors) * 100,
    },
    {
      stage: 'Email Captures',
      value: funnelMetrics.emailCaptures,
      conversion: (funnelMetrics.emailCaptures / funnelMetrics.visitors) * 100,
    },
    {
      stage: 'Inquiries',
      value: funnelMetrics.inquiries,
      conversion: (funnelMetrics.inquiries / funnelMetrics.visitors) * 100,
    },
    {
      stage: 'Strategy Sessions',
      value: funnelMetrics.strategySessions,
      conversion: (funnelMetrics.strategySessions / funnelMetrics.visitors) * 100,
    },
    {
      stage: 'Enrollments',
      value: funnelMetrics.enrollments,
      conversion: (funnelMetrics.enrollments / funnelMetrics.visitors) * 100,
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <Title>Conversion Funnel</Title>
        <BarChart
          className="mt-4 h-72"
          data={funnelData}
          index="stage"
          categories={['value']}
          colors={['blue']}
          valueFormatter={(value) => value.toLocaleString()}
          stack={false}
        />
      </Card>

      <Card>
        <Title>Conversion Rates</Title>
        <div className="mt-4 space-y-4">
          {funnelData.map((stage) => (
            <div key={stage.stage} className="flex justify-between items-center">
              <Text>{stage.stage}</Text>
              <div className="flex items-center space-x-4">
                <Text className="text-sm text-gray-500">
                  {stage.value.toLocaleString()}
                </Text>
                <Text className="text-sm font-medium">
                  {stage.conversion.toFixed(1)}%
                </Text>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Title>Key Insights</Title>
        <div className="mt-4 space-y-2">
          <Text>
            • Highest drop-off: {funnelData.reduce((prev, curr) =>
              prev.conversion > curr.conversion ? prev : curr
            ).stage}
          </Text>
          <Text>
            • Overall conversion rate:{' '}
            {(
              (funnelMetrics.enrollments / funnelMetrics.visitors) *
              100
            ).toFixed(1)}
            %
          </Text>
          <Text>
            • Average time to conversion: 14 days
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ConversionFunnel; 