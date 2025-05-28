import React, { useState } from 'react';
import { Card, Title, Text, List, ListItem, Badge, Button, ProgressBar, Metric } from '@tremor/react';
import { FiCheck, FiAlertCircle, FiRefreshCw, FiUsers, FiGlobe, FiLayers } from 'react-icons/fi';

interface RolloutPhase {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress?: number;
  targetPercentage: number;
  currentPercentage: number;
  startDate?: Date;
  endDate?: Date;
  metrics?: {
    users: number;
    sessions: number;
    errors: number;
    satisfaction: number;
  };
}

interface MonitoringMetric {
  id: string;
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
}

interface SoftLaunchProps {
  onStatusUpdate: (key: string, value: boolean) => void;
}

const SoftLaunch: React.FC<SoftLaunchProps> = ({ onStatusUpdate }) => {
  const [rolloutPhases, setRolloutPhases] = useState<RolloutPhase[]>([
    {
      id: 'initial-access',
      title: 'Limited User Group',
      description: 'Initial access for 5% of traffic',
      status: 'pending',
      targetPercentage: 5,
      currentPercentage: 0
    },
    {
      id: 'geographic-rollout',
      title: 'Geographic Rollout',
      description: 'Phased rollout by region',
      status: 'pending',
      targetPercentage: 25,
      currentPercentage: 0
    },
    {
      id: 'persona-features',
      title: 'Persona Features',
      description: 'Activate features by persona',
      status: 'pending',
      targetPercentage: 50,
      currentPercentage: 0
    },
    {
      id: 'service-tiers',
      title: 'Service Tiers',
      description: 'Gradual service tier availability',
      status: 'pending',
      targetPercentage: 75,
      currentPercentage: 0
    },
    {
      id: 'community-integration',
      title: 'Community Integration',
      description: 'Phased community feature activation',
      status: 'pending',
      targetPercentage: 100,
      currentPercentage: 0
    }
  ]);

  const [monitoringMetrics, setMonitoringMetrics] = useState<MonitoringMetric[]>([
    {
      id: 'performance',
      title: 'Performance',
      value: 0,
      target: 2000,
      unit: 'ms',
      trend: 0
    },
    {
      id: 'uptime',
      title: 'Uptime',
      value: 0,
      target: 99.9,
      unit: '%',
      trend: 0
    },
    {
      id: 'error-rate',
      title: 'Error Rate',
      value: 0,
      target: 0.1,
      unit: '%',
      trend: 0
    },
    {
      id: 'satisfaction',
      title: 'User Satisfaction',
      value: 0,
      target: 90,
      unit: '%',
      trend: 0
    }
  ]);

  const updatePhaseStatus = (id: string, status: RolloutPhase['status'], progress?: number) => {
    setRolloutPhases(prev => 
      prev.map(phase => 
        phase.id === id 
          ? { 
              ...phase, 
              status, 
              progress,
              startDate: status === 'in-progress' ? new Date() : phase.startDate,
              endDate: status === 'completed' ? new Date() : phase.endDate
            }
          : phase
      )
    );

    // Update overall soft launch status
    const allCompleted = rolloutPhases.every(phase => phase.status === 'completed');
    onStatusUpdate('softLaunch', allCompleted);
  };

  const updateMetrics = (id: string, value: number, trend: number) => {
    setMonitoringMetrics(prev =>
      prev.map(metric =>
        metric.id === id
          ? { ...metric, value, trend }
          : metric
      )
    );
  };

  const getStatusBadge = (status: RolloutPhase['status']) => {
    const statusConfig = {
      pending: { color: 'gray', icon: <FiAlertCircle className="w-4 h-4" /> },
      'in-progress': { color: 'yellow', icon: <FiRefreshCw className="w-4 h-4 animate-spin" /> },
      completed: { color: 'green', icon: <FiCheck className="w-4 h-4" /> },
      failed: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Title>Rollout Progress</Title>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {monitoringMetrics.map(metric => (
            <Card key={metric.id} className="p-4">
              <Text>{metric.title}</Text>
              <Metric>
                {metric.value.toFixed(1)}{metric.unit}
              </Metric>
              <Text className="text-sm text-gray-500">
                Target: {metric.target}{metric.unit}
              </Text>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <Title>Phased Rollout</Title>
        <List className="mt-4">
          {rolloutPhases.map(phase => (
            <ListItem key={phase.id} className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Text className="font-medium">{phase.title}</Text>
                  <Text className="text-gray-500">{phase.description}</Text>
                  <div className="mt-2">
                    <ProgressBar 
                      value={(phase.currentPercentage / phase.targetPercentage) * 100} 
                      color="blue" 
                    />
                    <Text className="text-sm text-gray-500 mt-1">
                      {phase.currentPercentage}% of {phase.targetPercentage}% target
                    </Text>
                  </div>
                  {phase.startDate && (
                    <Text className="text-sm text-gray-400 mt-1">
                      Started: {phase.startDate.toLocaleString()}
                    </Text>
                  )}
                  {phase.endDate && (
                    <Text className="text-sm text-gray-400 mt-1">
                      Completed: {phase.endDate.toLocaleString()}
                    </Text>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(phase.status)}
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => updatePhaseStatus(phase.id, 'in-progress', 0)}
                  >
                    Start Phase
                  </Button>
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      </Card>
    </div>
  );
};

export default SoftLaunch; 