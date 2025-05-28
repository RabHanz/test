import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Button, Grid, Col, Table, TableRow, TableCell, TableHead, TableHeaderCell, TableBody, Badge } from '@tremor/react';
import { FiPlay, FiPause, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { Workflow } from '@/types/workflow';

interface WorkflowMonitorProps {
  workflowId: string;
  onPause: (workflowId: string) => Promise<void>;
  onResume: (workflowId: string) => Promise<void>;
  onDelete: (workflowId: string) => Promise<void>;
}

const WorkflowMonitor: React.FC<WorkflowMonitorProps> = ({
  workflowId,
  onPause,
  onResume,
  onDelete,
}) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkflowStatus = async () => {
    try {
      setIsLoading(true);
      // Implement API call to fetch workflow status
      const response = await fetch(`/api/workflows/${workflowId}/status`);
      const data = await response.json();
      setWorkflow(data.workflow);
      setExecutionHistory(data.history);
    } catch (error) {
      console.error('Error fetching workflow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowStatus();
    const interval = setInterval(fetchWorkflowStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [workflowId]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      running: 'blue',
      completed: 'green',
      failed: 'red',
      paused: 'yellow',
    };

    return (
      <Badge color={statusColors[status as keyof typeof statusColors] || 'gray'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!workflow) {
    return (
      <Card>
        <Text>Workflow not found</Text>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title>{workflow.name}</Title>
            <Text>{workflow.description}</Text>
          </div>
          <div className="flex gap-2">
            {workflow.status === 'active' ? (
              <Button
                icon={FiPause}
                variant="secondary"
                onClick={() => onPause(workflowId)}
              >
                Pause
              </Button>
            ) : (
              <Button
                icon={FiPlay}
                variant="secondary"
                onClick={() => onResume(workflowId)}
              >
                Resume
              </Button>
            )}
            <Button
              icon={FiRefreshCw}
              variant="secondary"
              onClick={fetchWorkflowStatus}
            >
              Refresh
            </Button>
            <Button
              icon={FiTrash2}
              variant="secondary"
              onClick={() => onDelete(workflowId)}
            >
              Delete
            </Button>
          </div>
        </div>

        <Grid numItems={3} className="gap-4 mb-4">
          <Col>
            <Card>
              <Text>Status</Text>
              <Title>{getStatusBadge(workflow.status)}</Title>
            </Card>
          </Col>
          <Col>
            <Card>
              <Text>Last Updated</Text>
              <Title>{new Date(workflow.updatedAt).toLocaleString()}</Title>
            </Card>
          </Col>
          <Col>
            <Card>
              <Text>Version</Text>
              <Title>v{workflow.version}</Title>
            </Card>
          </Col>
        </Grid>
      </Card>

      <Card>
        <Title>Execution History</Title>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Start Time</TableHeaderCell>
              <TableHeaderCell>End Time</TableHeaderCell>
              <TableHeaderCell>Duration</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {executionHistory.map((execution) => (
              <TableRow key={execution.id}>
                <TableCell>{execution.id}</TableCell>
                <TableCell>{getStatusBadge(execution.status)}</TableCell>
                <TableCell>
                  {new Date(execution.startTime).toLocaleString()}
                </TableCell>
                <TableCell>
                  {execution.endTime
                    ? new Date(execution.endTime).toLocaleString()
                    : '-'}
                </TableCell>
                <TableCell>
                  {execution.endTime
                    ? `${Math.round(
                        (new Date(execution.endTime).getTime() -
                          new Date(execution.startTime).getTime()) /
                          1000
                      )}s`
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WorkflowMonitor; 