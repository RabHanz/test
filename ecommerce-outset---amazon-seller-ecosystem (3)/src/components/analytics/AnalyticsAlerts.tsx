import React from 'react';
import { Card, Title, Text, List, ListItem } from '@tremor/react';
import { FiAlertTriangle, FiInfo, FiCheckCircle } from 'react-icons/fi';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

interface AnalyticsAlertsProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
}

const AnalyticsAlerts: React.FC<AnalyticsAlertsProps> = ({
  alerts,
  onDismiss,
}) => {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500" />;
      case 'info':
        return <FiInfo className="text-blue-500" />;
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100';
      case 'medium':
        return 'bg-yellow-100';
      case 'low':
        return 'bg-green-100';
    }
  };

  return (
    <Card>
      <Title>Analytics Alerts</Title>
      <List className="mt-4">
        {alerts.map((alert) => (
          <ListItem
            key={alert.id}
            className={`py-4 ${getPriorityColor(alert.priority)}`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <Text className={`font-medium ${getAlertColor(alert.type)}`}>
                    {alert.title}
                  </Text>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                <Text className="mt-1 text-gray-600">{alert.message}</Text>
                <Text className="mt-2 text-sm text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </Text>
              </div>
            </div>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default AnalyticsAlerts; 