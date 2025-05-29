import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid as MuiGrid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';
import {
  AutomationWorkflow,
  AutomationPlatform,
  AutomationStatus,
  AutomationMetrics,
  AutomationAlert,
} from '../../types/automation';
import AdminAutomationWrapper from './AdminAutomationWrapper';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '24px 0' }}>
    {value === index && children}
  </div>
);

const Grid = MuiGrid as any; // Temporary fix for Grid type issues

const AutomationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [alerts, setAlerts] = useState<AutomationAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch data from API
    setLoading(false);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: AutomationStatus) => {
    switch (status) {
      case AutomationStatus.ACTIVE:
        return 'success';
      case AutomationStatus.ERROR:
        return 'error';
      case AutomationStatus.PAUSED:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPlatformIcon = (platform: AutomationPlatform) => {
    // TODO: Add platform-specific icons
    return '🔌';
  };

  return (
    <AdminAutomationWrapper>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Automation Orchestration Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Workflows
                </Typography>
                <Typography variant="h4">
                  {metrics?.overallMetrics.totalWorkflows || 0}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics?.overallMetrics.averageSuccessRate || 0}
                  color="primary"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Success Rate
                </Typography>
                <Typography variant="h4">
                  {metrics?.overallMetrics.averageSuccessRate.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics?.overallMetrics.averageSuccessRate || 0}
                  color="success"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Time Saved
                </Typography>
                <Typography variant="h4">
                  {metrics?.overallMetrics.timeSaved || 0}h
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  color="info"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Alerts
                </Typography>
                <Typography variant="h4">{alerts.length}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip
                    icon={<Error />}
                    label={`${alerts.filter(a => a.type === 'ERROR').length} Errors`}
                    color="error"
                    size="small"
                  />
                  <Chip
                    icon={<Warning />}
                    label={`${alerts.filter(a => a.type === 'WARNING').length} Warnings`}
                    color="warning"
                    size="small"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12}>
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Workflows" />
                <Tab label="Templates" />
                <Tab label="Webhooks" />
                <Tab label="Alerts" />
                <Tab label="Analytics" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <Stack spacing={2}>
                  {workflows.map(workflow => (
                    <Card key={workflow.id}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">{workflow.name}</Typography>
                            <Typography color="textSecondary">
                              {workflow.metadata.description}
                            </Typography>
                          </Box>
                          <Box>
                            <Chip
                              label={workflow.platform}
                              icon={<span>{getPlatformIcon(workflow.platform)}</span>}
                            />
                            <Chip
                              label={workflow.status}
                              color={getStatusColor(workflow.status)}
                            />
                            <Tooltip title={workflow.status === AutomationStatus.ACTIVE ? 'Pause' : 'Resume'}>
                              <IconButton>
                                {workflow.status === AutomationStatus.ACTIVE ? <Pause /> : <PlayArrow />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Refresh">
                              <IconButton>
                                <Refresh />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Success Rate: {workflow.metrics.successRate.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={workflow.metrics.successRate}
                            color={workflow.metrics.successRate > 90 ? 'success' : 'warning'}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </TabPanel>

              {/* Add other tab panels here */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminAutomationWrapper>
  );
};

export default AutomationDashboard; 