import React, { useState } from 'react';
import { Card, Title, Text, Grid, Col, List, ListItem, Badge, Button, ProgressBar } from '@tremor/react';
import { FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle, FiTarget } from 'react-icons/fi';

interface Optimization {
  id: string;
  category: 'performance' | 'user-experience' | 'conversion' | 'engagement' | 'technical';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  progress: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  startDate?: Date;
  completionDate?: Date;
  assignedTo?: string;
}

interface OptimizationFrameworkProps {
  onStatusUpdate: (key: string, value: boolean) => void;
}

const OptimizationFramework: React.FC<OptimizationFrameworkProps> = ({ onStatusUpdate }) => {
  const [optimizations, setOptimizations] = useState<Optimization[]>([
    {
      id: 'perf-1',
      category: 'performance',
      title: 'Database Query Optimization',
      description: 'Optimize slow database queries to improve response times',
      priority: 'high',
      status: 'in-progress',
      progress: 65,
      impact: 'high',
      effort: 'medium',
      startDate: new Date('2024-03-01'),
      assignedTo: 'Tech Team'
    },
    {
      id: 'ux-1',
      category: 'user-experience',
      title: 'Mobile Responsiveness',
      description: 'Improve mobile user experience and fix layout issues',
      priority: 'high',
      status: 'planned',
      progress: 0,
      impact: 'high',
      effort: 'high',
      assignedTo: 'UX Team'
    },
    {
      id: 'conv-1',
      category: 'conversion',
      title: 'Checkout Flow Optimization',
      description: 'Streamline checkout process to reduce cart abandonment',
      priority: 'medium',
      status: 'completed',
      progress: 100,
      impact: 'high',
      effort: 'medium',
      startDate: new Date('2024-02-15'),
      completionDate: new Date('2024-03-01'),
      assignedTo: 'Product Team'
    },
    {
      id: 'eng-1',
      category: 'engagement',
      title: 'Personalization Features',
      description: 'Implement personalized recommendations and content',
      priority: 'medium',
      status: 'in-progress',
      progress: 40,
      impact: 'medium',
      effort: 'high',
      startDate: new Date('2024-03-05'),
      assignedTo: 'Data Team'
    }
  ]);

  const updateOptimizationStatus = (id: string, status: Optimization['status'], progress?: number) => {
    setOptimizations(prev =>
      prev.map(optimization =>
        optimization.id === id
          ? {
              ...optimization,
              status,
              progress: progress ?? optimization.progress,
              completionDate: status === 'completed' ? new Date() : optimization.completionDate
            }
          : optimization
      )
    );

    // Update overall optimization status
    const allCompleted = optimizations.every(opt => opt.status === 'completed');
    onStatusUpdate('optimizationFramework', allCompleted);
  };

  const getPriorityBadge = (priority: Optimization['priority']) => {
    const priorityConfig = {
      high: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> },
      medium: { color: 'yellow', icon: <FiClock className="w-4 h-4" /> },
      low: { color: 'blue', icon: <FiTarget className="w-4 h-4" /> }
    };

    const config = priorityConfig[priority];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: Optimization['status']) => {
    const statusConfig = {
      planned: { color: 'blue', icon: <FiClock className="w-4 h-4" /> },
      'in-progress': { color: 'yellow', icon: <FiTrendingUp className="w-4 h-4" /> },
      completed: { color: 'green', icon: <FiCheckCircle className="w-4 h-4" /> },
      cancelled: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getImpactBadge = (impact: Optimization['impact']) => {
    const impactConfig = {
      high: { color: 'red', text: 'High Impact' },
      medium: { color: 'yellow', text: 'Medium Impact' },
      low: { color: 'blue', text: 'Low Impact' }
    };

    const config = impactConfig[impact];
    return (
      <Badge color={config.color as any} size="sm">
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Title>Optimization Initiatives</Title>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => {
              // Add new optimization logic here
            }}
          >
            Add Initiative
          </Button>
        </div>
        <List>
          {optimizations.map(optimization => (
            <ListItem key={optimization.id} className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(optimization.priority)}
                    <Text className="font-medium">{optimization.title}</Text>
                  </div>
                  <Text className="text-gray-500">{optimization.description}</Text>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(optimization.status)}
                      {getImpactBadge(optimization.impact)}
                    </div>
                    <div className="mt-2">
                      <Text className="text-sm text-gray-500">
                        Progress: {optimization.progress}%
                      </Text>
                      <ProgressBar value={optimization.progress} className="mt-1" />
                    </div>
                    <div className="mt-2">
                      <Text className="text-sm text-gray-500">
                        Assigned to: {optimization.assignedTo}
                      </Text>
                      {optimization.startDate && (
                        <Text className="text-sm text-gray-400">
                          Started: {optimization.startDate.toLocaleDateString()}
                        </Text>
                      )}
                      {optimization.completionDate && (
                        <Text className="text-sm text-gray-400">
                          Completed: {optimization.completionDate.toLocaleDateString()}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {optimization.status === 'in-progress' && (
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => updateOptimizationStatus(optimization.id, 'completed', 100)}
                    >
                      Complete
                    </Button>
                  )}
                  {optimization.status === 'planned' && (
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => updateOptimizationStatus(optimization.id, 'in-progress', 0)}
                    >
                      Start
                    </Button>
                  )}
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      </Card>

      <Grid numItems={1} numItemsSm={2} className="gap-6">
        <Col>
          <Card className="p-6">
            <Title>Optimization Impact</Title>
            <div className="mt-4 space-y-4">
              {optimizations
                .filter(opt => opt.status === 'completed')
                .map(optimization => (
                  <div key={optimization.id} className="flex items-center justify-between">
                    <Text>{optimization.title}</Text>
                    {getImpactBadge(optimization.impact)}
                  </div>
                ))}
            </div>
          </Card>
        </Col>
        <Col>
          <Card className="p-6">
            <Title>Resource Allocation</Title>
            <div className="mt-4 space-y-4">
              {Array.from(new Set(optimizations.map(opt => opt.assignedTo))).map(team => (
                <div key={team} className="flex items-center justify-between">
                  <Text>{team}</Text>
                  <Text className="text-gray-500">
                    {optimizations.filter(opt => opt.assignedTo === team && opt.status === 'in-progress').length} active
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Grid>
    </div>
  );
};

export default OptimizationFramework; 