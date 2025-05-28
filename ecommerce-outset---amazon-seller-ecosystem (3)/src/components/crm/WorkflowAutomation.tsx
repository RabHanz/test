import React, { useState } from 'react';
import { Card, Title, Text, Badge, Button, List, ListItem } from '@tremor/react';
import { FiPlus, FiPlay, FiPause, FiEdit2, FiTrash2, FiClock, FiMail, FiMessageSquare, FiCalendar } from 'react-icons/fi';

interface WorkflowStep {
  id: string;
  type: 'email' | 'task' | 'notification' | 'delay';
  name: string;
  description: string;
  config: {
    template?: string;
    delay?: number;
    assignee?: string;
    priority?: 'high' | 'medium' | 'low';
    conditions?: WorkflowCondition[];
  };
  status: 'active' | 'paused' | 'completed';
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'nurture' | 'sales';
  trigger: {
    type: 'lead_created' | 'stage_change' | 'activity' | 'manual';
    conditions?: WorkflowCondition[];
  };
  steps: WorkflowStep[];
  status: 'active' | 'paused' | 'draft';
  metrics: {
    totalLeads: number;
    completionRate: number;
    averageTime: number;
  };
}

const WorkflowAutomation: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'welcome-sequence',
      name: 'Welcome Sequence',
      description: 'Automated welcome sequence for new leads',
      type: 'nurture',
      trigger: {
        type: 'lead_created'
      },
      steps: [
        {
          id: 'welcome-email',
          type: 'email',
          name: 'Welcome Email',
          description: 'Send welcome email with company overview',
          config: {
            template: 'welcome-email-template',
            conditions: [
              {
                field: 'source',
                operator: 'equals',
                value: 'website'
              }
            ]
          },
          status: 'active'
        },
        {
          id: 'follow-up-task',
          type: 'task',
          name: 'Schedule Follow-up',
          description: 'Create task for sales team to follow up',
          config: {
            assignee: 'sales-team',
            priority: 'high'
          },
          status: 'active'
        }
      ],
      status: 'active',
      metrics: {
        totalLeads: 150,
        completionRate: 85,
        averageTime: 2.5
      }
    }
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'green', icon: <FiPlay className="w-4 h-4" /> },
      paused: { color: 'yellow', icon: <FiPause className="w-4 h-4" /> },
      draft: { color: 'gray', icon: <FiEdit2 className="w-4 h-4" /> },
      completed: { color: 'blue', icon: <FiClock className="w-4 h-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    const iconConfig = {
      email: <FiMail className="w-4 h-4" />,
      task: <FiMessageSquare className="w-4 h-4" />,
      notification: <FiMessageSquare className="w-4 h-4" />,
      delay: <FiClock className="w-4 h-4" />
    };

    return iconConfig[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title>Workflow Automation</Title>
        <Button size="xs" variant="secondary" icon={FiPlus}>
          Create Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {workflows.map(workflow => (
          <Card key={workflow.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Title>{workflow.name}</Title>
                  {getStatusBadge(workflow.status)}
                </div>
                <Text className="text-gray-500 mt-1">{workflow.description}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Button size="xs" variant="secondary" icon={FiEdit2}>
                  Edit
                </Button>
                <Button size="xs" variant="secondary" icon={FiTrash2}>
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {Object.entries(workflow.metrics).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <Text className="text-sm text-gray-500">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <Text className="text-2xl font-semibold mt-1">
                    {typeof value === 'number' && key !== 'completionRate'
                      ? value.toLocaleString()
                      : `${value}%`}
                  </Text>
                </div>
              ))}
            </div>

            <Title className="mb-4">Workflow Steps</Title>
            <List>
              {workflow.steps.map(step => (
                <ListItem key={step.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getStepIcon(step.type)}
                      </div>
                      <div>
                        <Text className="font-medium">{step.name}</Text>
                        <Text className="text-sm text-gray-500">
                          {step.description}
                        </Text>
                        {step.config.conditions && (
                          <div className="mt-2">
                            <Text className="text-xs text-gray-400">
                              Conditions:
                            </Text>
                            {step.config.conditions.map((condition, index) => (
                              <Text key={index} className="text-xs text-gray-500">
                                {condition.field} {condition.operator} {condition.value}
                              </Text>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(step.status)}
                      <Button size="xs" variant="secondary" icon={FiEdit2}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </ListItem>
              ))}
            </List>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkflowAutomation; 