import React from 'react';
import { Card, Title, Text, List, ListItem } from '@tremor/react';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';

interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  impact: string;
  recommendation?: string;
}

interface AnalyticsInsightsProps {
  insights: Insight[];
}

const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ insights }) => {
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <FiTrendingUp className="text-green-500" />;
      case 'negative':
        return <FiTrendingDown className="text-red-500" />;
      default:
        return <FiAlertCircle className="text-yellow-500" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <Card>
      <Title>Key Insights</Title>
      <List className="mt-4">
        {insights.map((insight, index) => (
          <ListItem key={index} className="py-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <Text className={`font-medium ${getInsightColor(insight.type)}`}>
                  {insight.title}
                </Text>
                <Text className="mt-1 text-gray-600">{insight.description}</Text>
                <Text className="mt-2 text-sm font-medium">Impact: {insight.impact}</Text>
                {insight.recommendation && (
                  <Text className="mt-2 text-sm text-gray-600">
                    Recommendation: {insight.recommendation}
                  </Text>
                )}
              </div>
            </div>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default AnalyticsInsights; 