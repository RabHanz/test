import React, { useState } from 'react';
import { Card, Title, Text, List, ListItem, Badge, Button, Grid, Col } from '@tremor/react';
import { FiCheck, FiAlertCircle, FiRefreshCw, FiAlertTriangle, FiRotateCcw } from 'react-icons/fi';

interface Incident {
  id: string;
  type: 'technical' | 'customer' | 'service' | 'data' | 'pr' | 'legal';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'mitigating' | 'resolved';
  detectedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  resolution?: string;
}

interface RollbackProcedure {
  id: string;
  title: string;
  description: string;
  status: 'ready' | 'in-progress' | 'completed' | 'failed';
  lastTested?: Date;
  estimatedTime: string;
  dependencies: string[];
}

interface CrisisManagementProps {
  onStatusUpdate: (key: string, value: boolean) => void;
}

const CrisisManagement: React.FC<CrisisManagementProps> = ({ onStatusUpdate }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [rollbackProcedures, setRollbackProcedures] = useState<RollbackProcedure[]>([
    {
      id: 'quick-rollback',
      title: 'Quick Rollback',
      description: 'Immediate rollback to last stable version',
      status: 'ready',
      estimatedTime: '5 minutes',
      dependencies: []
    },
    {
      id: 'data-integrity',
      title: 'Data Integrity Protection',
      description: 'Ensure data consistency during rollback',
      status: 'ready',
      estimatedTime: '10 minutes',
      dependencies: ['quick-rollback']
    },
    {
      id: 'customer-notification',
      title: 'Customer Notification',
      description: 'Notify affected customers of service interruption',
      status: 'ready',
      estimatedTime: '2 minutes',
      dependencies: []
    },
    {
      id: 'alternative-service',
      title: 'Alternative Service',
      description: 'Provide alternative service during issues',
      status: 'ready',
      estimatedTime: '15 minutes',
      dependencies: ['quick-rollback']
    },
    {
      id: 'recovery-time',
      title: 'Recovery Time',
      description: 'Define and monitor recovery time objectives',
      status: 'ready',
      estimatedTime: '30 minutes',
      dependencies: ['quick-rollback', 'data-integrity']
    },
    {
      id: 'business-continuity',
      title: 'Business Continuity',
      description: 'Ensure business operations continue during issues',
      status: 'ready',
      estimatedTime: '20 minutes',
      dependencies: ['alternative-service']
    }
  ]);

  const addIncident = (incident: Omit<Incident, 'id' | 'detectedAt'>) => {
    const newIncident: Incident = {
      ...incident,
      id: `incident-${Date.now()}`,
      detectedAt: new Date()
    };
    setIncidents(prev => [...prev, newIncident]);
  };

  const updateIncidentStatus = (id: string, status: Incident['status'], resolution?: string) => {
    setIncidents(prev =>
      prev.map(incident =>
        incident.id === id
          ? {
              ...incident,
              status,
              resolvedAt: status === 'resolved' ? new Date() : incident.resolvedAt,
              resolution
            }
          : incident
      )
    );
  };

  const updateRollbackStatus = (id: string, status: RollbackProcedure['status']) => {
    setRollbackProcedures(prev =>
      prev.map(procedure =>
        procedure.id === id
          ? {
              ...procedure,
              status,
              lastTested: status === 'completed' ? new Date() : procedure.lastTested
            }
          : procedure
      )
    );

    // Update overall crisis management status
    const allReady = rollbackProcedures.every(procedure => procedure.status === 'ready');
    onStatusUpdate('crisisManagement', allReady);
  };

  const getSeverityBadge = (severity: Incident['severity']) => {
    const severityConfig = {
      low: { color: 'blue', icon: <FiAlertCircle className="w-4 h-4" /> },
      medium: { color: 'yellow', icon: <FiAlertCircle className="w-4 h-4" /> },
      high: { color: 'orange', icon: <FiAlertTriangle className="w-4 h-4" /> },
      critical: { color: 'red', icon: <FiAlertTriangle className="w-4 h-4" /> }
    };

    const config = severityConfig[severity];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      detected: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> },
      investigating: { color: 'yellow', icon: <FiRefreshCw className="w-4 h-4 animate-spin" /> },
      mitigating: { color: 'orange', icon: <FiRefreshCw className="w-4 h-4 animate-spin" /> },
      resolved: { color: 'green', icon: <FiCheck className="w-4 h-4" /> },
      ready: { color: 'green', icon: <FiCheck className="w-4 h-4" /> },
      'in-progress': { color: 'yellow', icon: <FiRefreshCw className="w-4 h-4 animate-spin" /> },
      completed: { color: 'green', icon: <FiCheck className="w-4 h-4" /> },
      failed: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
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
        <div className="flex items-center justify-between mb-4">
          <Title>Active Incidents</Title>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => addIncident({
              type: 'technical',
              title: 'New Incident',
              description: 'Describe the incident...',
              severity: 'medium',
              status: 'detected'
            })}
          >
            Report Incident
          </Button>
        </div>
        <List>
          {incidents.map(incident => (
            <ListItem key={incident.id} className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(incident.severity)}
                    <Text className="font-medium">{incident.title}</Text>
                  </div>
                  <Text className="text-gray-500">{incident.description}</Text>
                  {incident.resolution && (
                    <Text className="text-sm text-gray-400 mt-1">
                      Resolution: {incident.resolution}
                    </Text>
                  )}
                  <Text className="text-sm text-gray-400 mt-1">
                    Detected: {incident.detectedAt.toLocaleString()}
                  </Text>
                  {incident.resolvedAt && (
                    <Text className="text-sm text-gray-400 mt-1">
                      Resolved: {incident.resolvedAt.toLocaleString()}
                    </Text>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(incident.status)}
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => updateIncidentStatus(incident.id, 'investigating')}
                  >
                    Investigate
                  </Button>
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      </Card>

      <Card className="p-6">
        <Title>Rollback Procedures</Title>
        <List className="mt-4">
          {rollbackProcedures.map(procedure => (
            <ListItem key={procedure.id} className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Text className="font-medium">{procedure.title}</Text>
                  <Text className="text-gray-500">{procedure.description}</Text>
                  <div className="mt-2">
                    <Text className="text-sm text-gray-500">
                      Estimated Time: {procedure.estimatedTime}
                    </Text>
                    {procedure.dependencies.length > 0 && (
                      <Text className="text-sm text-gray-500">
                        Dependencies: {procedure.dependencies.join(', ')}
                      </Text>
                    )}
                    {procedure.lastTested && (
                      <Text className="text-sm text-gray-400 mt-1">
                        Last Tested: {procedure.lastTested.toLocaleString()}
                      </Text>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(procedure.status)}
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => updateRollbackStatus(procedure.id, 'in-progress')}
                  >
                    Execute
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

export default CrisisManagement; 