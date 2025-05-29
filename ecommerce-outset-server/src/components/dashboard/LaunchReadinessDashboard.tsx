import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Notifications,
  Timeline,
  Settings,
} from '@mui/icons-material';
import {
  IntegrationStatus,
  ChecklistItemStatus,
  IntegrationHealth,
  ChecklistItem,
  PersonaJourney,
  BusinessMetrics,
  LaunchNotification,
} from '../../types/launchReadiness';
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

const LaunchReadinessDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [integrations, setIntegrations] = useState<IntegrationHealth[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [personaJourneys, setPersonaJourneys] = useState<PersonaJourney[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics[]>([]);
  const [notifications, setNotifications] = useState<LaunchNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch data from API
    setLoading(false);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: IntegrationStatus | ChecklistItemStatus) => {
    switch (status) {
      case IntegrationStatus.HEALTHY:
      case ChecklistItemStatus.COMPLETED:
        return 'success';
      case IntegrationStatus.DEGRADED:
      case ChecklistItemStatus.IN_PROGRESS:
        return 'warning';
      case IntegrationStatus.UNHEALTHY:
      case ChecklistItemStatus.FAILED:
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateReadinessScore = () => {
    const totalItems = checklist.length;
    const completedItems = checklist.filter(
      item => item.status === ChecklistItemStatus.COMPLETED
    ).length;
    return (completedItems / totalItems) * 100;
  };

  return (
    <AdminAutomationWrapper>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Launch Readiness Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Overall Readiness
                </Typography>
                <Typography variant="h4">
                  {calculateReadinessScore().toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={calculateReadinessScore()}
                  color={calculateReadinessScore() > 90 ? 'success' : 'warning'}
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Integration Health
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip
                    icon={<CheckCircle />}
                    label={`${integrations.filter(i => i.status === IntegrationStatus.HEALTHY).length} Healthy`}
                    color="success"
                    size="small"
                  />
                  <Chip
                    icon={<Warning />}
                    label={`${integrations.filter(i => i.status === IntegrationStatus.DEGRADED).length} Degraded`}
                    color="warning"
                    size="small"
                  />
                  <Chip
                    icon={<Error />}
                    label={`${integrations.filter(i => i.status === IntegrationStatus.UNHEALTHY).length} Unhealthy`}
                    color="error"
                    size="small"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Notifications
                </Typography>
                <Typography variant="h4">
                  {notifications.filter(n => !n.read).length}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip
                    icon={<Error />}
                    label={`${notifications.filter(n => n.type === 'ERROR').length} Critical`}
                    color="error"
                    size="small"
                  />
                  <Chip
                    icon={<Warning />}
                    label={`${notifications.filter(n => n.type === 'WARNING').length} Warnings`}
                    color="warning"
                    size="small"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Persona Journey Status
                </Typography>
                <Typography variant="h4">
                  {personaJourneys.filter(j => j.overallStatus === ChecklistItemStatus.COMPLETED).length}/{personaJourneys.length}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(personaJourneys.filter(j => j.overallStatus === ChecklistItemStatus.COMPLETED).length / personaJourneys.length) * 100}
                  color="primary"
                  sx={{ mt: 2 }}
                />
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
                <Tab label="Checklist" />
                <Tab label="Integrations" />
                <Tab label="Persona Journeys" />
                <Tab label="Business Metrics" />
                <Tab label="Notifications" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <Stack spacing={2}>
                  {checklist.map(item => (
                    <Card key={item.id}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">{item.title}</Typography>
                            <Typography color="textSecondary">
                              {item.description}
                            </Typography>
                          </Box>
                          <Box>
                            <Chip
                              label={item.status}
                              color={getStatusColor(item.status)}
                            />
                            <Chip
                              label={item.category}
                              variant="outlined"
                              size="small"
                            />
                            {item.lastVerified && (
                              <Typography variant="caption" color="textSecondary">
                                Last verified: {new Date(item.lastVerified).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Stack spacing={2}>
                  {integrations.map(integration => (
                    <Card key={integration.id}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">{integration.name}</Typography>
                            {integration.error && (
                              <Alert severity="error" sx={{ mt: 1 }}>
                                {integration.error}
                              </Alert>
                            )}
                          </Box>
                          <Box>
                            <Chip
                              label={integration.status}
                              color={getStatusColor(integration.status)}
                            />
                            {integration.responseTime && (
                              <Typography variant="caption" color="textSecondary">
                                Response time: {integration.responseTime}ms
                              </Typography>
                            )}
                            <Tooltip title="Refresh">
                              <IconButton>
                                <Refresh />
                              </IconButton>
                            </Tooltip>
                          </Box>
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

export default LaunchReadinessDashboard; 