import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Api as ApiIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  BugReport as BugReportIcon,
  Timeline as TimelineIcon,
  HealthAndSafety as HealthIcon,
} from '@mui/icons-material';
import * as integrationService from '../../services/integrationService';
import {
  IntegrationProject,
  IntegrationLog,
  IntegrationMetric,
  IntegrationAlert,
  IntegrationVersion,
  IntegrationDependency,
  IntegrationTest,
  IntegrationDocumentation,
  IntegrationFilter,
  IntegrationMetrics,
  IntegrationTimelineEvent,
  IntegrationHealthCheck,
  IntegrationStatus,
  IntegrationType,
  IntegrationProtocol,
  IntegrationSecurityType,
} from '../../types/integration';
import ContentManagementDashboard from './ContentManagementDashboard';

interface Props {
  userRole: string;
  accessLevel: string;
}

const ConsolidatedIntegrationManagementDashboard: React.FC<Props> = ({ userRole, accessLevel }) => {
  // State management
  const [integrations, setIntegrations] = useState<IntegrationProject[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationProject | null>(null);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [metrics, setMetrics] = useState<IntegrationMetric[]>([]);
  const [alerts, setAlerts] = useState<IntegrationAlert[]>([]);
  const [versions, setVersions] = useState<IntegrationVersion[]>([]);
  const [dependencies, setDependencies] = useState<IntegrationDependency[]>([]);
  const [tests, setTests] = useState<IntegrationTest[]>([]);
  const [documentation, setDocumentation] = useState<IntegrationDocumentation[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<IntegrationMetrics | null>(null);
  const [timeline, setTimeline] = useState<IntegrationTimelineEvent[]>([]);
  const [healthChecks, setHealthChecks] = useState<IntegrationHealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<IntegrationFilter>({});
  const [newIntegration, setNewIntegration] = useState<Partial<IntegrationProject>>({
    status: IntegrationStatus.PENDING,
    type: IntegrationType.API,
    protocol: IntegrationProtocol.REST,
  });

  // Load initial data
  useEffect(() => {
    loadData();
    const unsubscribe = integrationService.subscribeToUpdates(handleRealTimeUpdate);
    return () => {
      integrationService.unsubscribeFromUpdates();
    };
  }, []);

  // Load data when filter changes
  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [integrationsData, metricsData] = await Promise.all([
        integrationService.getIntegrations(filter),
        integrationService.getIntegrationMetrics(),
      ]);
      setIntegrations(integrationsData);
      setOverallMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    if (data.type === 'INTEGRATION') {
      setIntegrations(prevIntegrations =>
        prevIntegrations.map(integration =>
          integration.id === data.id ? { ...integration, ...data } : integration
        )
      );
    }
  };

  const handleIntegrationSelect = async (integration: IntegrationProject) => {
    setSelectedIntegration(integration);
    try {
      const [
        logsData,
        metricsData,
        alertsData,
        versionsData,
        dependenciesData,
        testsData,
        documentationData,
        timelineData,
        healthChecksData,
      ] = await Promise.all([
        integrationService.getLogs(integration.id),
        integrationService.getMetrics(integration.id),
        integrationService.getAlerts(integration.id),
        integrationService.getVersions(integration.id),
        integrationService.getDependencies(integration.id),
        integrationService.getTests(integration.id),
        integrationService.getDocumentation(integration.id),
        integrationService.getTimeline(integration.id),
        integrationService.getHealthChecks(integration.id),
      ]);
      setLogs(logsData);
      setMetrics(metricsData);
      setAlerts(alertsData);
      setVersions(versionsData);
      setDependencies(dependenciesData);
      setTests(testsData);
      setDocumentation(documentationData);
      setTimeline(timelineData);
      setHealthChecks(healthChecksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleFilterApply = (newFilter: IntegrationFilter) => {
    setFilter(newFilter);
    setFilterDialogOpen(false);
  };

  const handleCreateIntegration = async () => {
    try {
      const createdIntegration = await integrationService.createIntegration(newIntegration);
      setIntegrations(prevIntegrations => [...prevIntegrations, createdIntegration]);
      setCreateDialogOpen(false);
      setNewIntegration({
        status: IntegrationStatus.PENDING,
        type: IntegrationType.API,
        protocol: IntegrationProtocol.REST,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case IntegrationStatus.ACTIVE:
        return 'success';
      case IntegrationStatus.INACTIVE:
        return 'default';
      case IntegrationStatus.PENDING:
        return 'info';
      case IntegrationStatus.FAILED:
        return 'error';
      case IntegrationStatus.MAINTENANCE:
        return 'warning';
      case IntegrationStatus.DEPRECATED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: IntegrationType) => {
    switch (type) {
      case IntegrationType.API:
        return 'primary';
      case IntegrationType.WEBHOOK:
        return 'secondary';
      case IntegrationType.DATABASE:
        return 'success';
      case IntegrationType.FILE_TRANSFER:
        return 'info';
      case IntegrationType.MESSAGE_QUEUE:
        return 'warning';
      case IntegrationType.CUSTOM:
        return 'default';
      default:
        return 'default';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <MetricsOverview metrics={metrics} />;
      case 1:
        return <IntegrationList integrations={integrations} selectedIntegration={selectedIntegration} onSelectIntegration={handleIntegrationSelect} />;
      case 2:
        return selectedIntegration ? (
          <ContentManagementDashboard integration={selectedIntegration} />
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Select an integration to view its documentation
            </Typography>
          </Box>
        );
      case 3:
        return <LogsList logs={logs} />;
      case 4:
        return <MetricsList metrics={metrics} />;
      case 5:
        return <AlertsList alerts={alerts} />;
      case 6:
        return <VersionsList versions={versions} />;
      case 7:
        return <DependenciesList dependencies={dependencies} />;
      case 8:
        return <TestsList tests={tests} />;
      case 9:
        return <DocumentationList documentation={documentation} />;
      case 10:
        return <TimelineList timeline={timeline} />;
      case 11:
        return <HealthChecksList healthChecks={healthChecks} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Integration Management Dashboard</Typography>
        <Box>
          <IconButton onClick={() => setFilterDialogOpen(true)}>
            <FilterIcon />
          </IconButton>
          <IconButton onClick={() => setCreateDialogOpen(true)}>
            <AddIcon />
          </IconButton>
          <IconButton>
            <NotificationsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Metrics Overview */}
      {overallMetrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Integrations
                </Typography>
                <Typography variant="h5">
                  {overallMetrics.overallMetrics.totalIntegrations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Integrations
                </Typography>
                <Typography variant="h5">
                  {overallMetrics.overallMetrics.activeIntegrations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Success Rate
                </Typography>
                <Typography variant="h5">
                  {overallMetrics.overallMetrics.successRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Response Time
                </Typography>
                <Typography variant="h5">
                  {overallMetrics.overallMetrics.averageResponseTime}ms
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Integration List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <List>
              {integrations.map(integration => (
                <ListItem
                  key={integration.id}
                  button
                  selected={selectedIntegration?.id === integration.id}
                  onClick={() => handleIntegrationSelect(integration)}
                >
                  <ListItemText
                    primary={integration.name}
                    secondary={
                      <Box>
                        <Chip
                          label={integration.status}
                          size="small"
                          color={getStatusColor(integration.status)}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={integration.type}
                          size="small"
                          color={getTypeColor(integration.type)}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Integration Details */}
        <Grid item xs={12} md={8}>
          {selectedIntegration ? (
            <Paper sx={{ p: 2, height: 'calc(100vh - 300px)', overflow: 'auto' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                  <Tab label="Overview" />
                  <Tab label="Logs" />
                  <Tab label="Metrics" />
                  <Tab label="Alerts" />
                  <Tab label="Versions" />
                  <Tab label="Dependencies" />
                  <Tab label="Tests" />
                  <Tab label="Documentation" />
                  <Tab label="Timeline" />
                  <Tab label="Health" />
                </Tabs>
              </Box>

              {/* Overview Tab */}
              {activeTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        <ApiIcon sx={{ mr: 1 }} />
                        Integration Information
                      </Typography>
                      <Typography>Type: {selectedIntegration.type}</Typography>
                      <Typography>Protocol: {selectedIntegration.protocol}</Typography>
                      <Typography>Source System: {selectedIntegration.sourceSystem}</Typography>
                      <Typography>Target System: {selectedIntegration.targetSystem}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        <SecurityIcon sx={{ mr: 1 }} />
                        Security Information
                      </Typography>
                      <Typography>
                        Security Type: {selectedIntegration.securityType || 'None'}
                      </Typography>
                      <Typography>
                        Endpoint URL: {selectedIntegration.endpointUrl || 'Not configured'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Logs Tab */}
              {activeTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {logs.map(log => (
                      <ListItem key={log.id}>
                        <ListItemText
                          primary={log.message}
                          secondary={
                            <>
                              <Typography variant="body2">Level: {log.level}</Typography>
                              <Typography variant="caption">
                                {new Date(log.createdAt).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Metrics Tab */}
              {activeTab === 2 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {metrics.map(metric => (
                      <ListItem key={metric.id}>
                        <ListItemText
                          primary={`${metric.metricType}: ${metric.value}`}
                          secondary={new Date(metric.timestamp).toLocaleString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Alerts Tab */}
              {activeTab === 3 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {alerts.map(alert => (
                      <ListItem key={alert.id}>
                        <ListItemText
                          primary={alert.message}
                          secondary={
                            <>
                              <Typography variant="body2">
                                Severity: {alert.severity}
                              </Typography>
                              <Typography variant="caption">
                                {new Date(alert.createdAt).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Versions Tab */}
              {activeTab === 4 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {versions.map(version => (
                      <ListItem key={version.id}>
                        <ListItemText
                          primary={`Version ${version.version}`}
                          secondary={
                            <>
                              <Typography variant="body2">{version.changes}</Typography>
                              <Typography variant="caption">
                                Created by: {version.createdBy}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Dependencies Tab */}
              {activeTab === 5 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {dependencies.map(dependency => (
                      <ListItem key={dependency.id}>
                        <ListItemText
                          primary={`Dependency: ${dependency.dependencyType}`}
                          secondary={`Created: ${new Date(dependency.createdAt).toLocaleString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Tests Tab */}
              {activeTab === 6 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {tests.map(test => (
                      <ListItem key={test.id}>
                        <ListItemText
                          primary={test.name}
                          secondary={
                            <>
                              <Typography variant="body2">
                                Type: {test.testType}
                              </Typography>
                              <Typography variant="caption">
                                Status: {test.status}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Documentation Tab */}
              {activeTab === 7 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {documentation.map(doc => (
                      <ListItem key={doc.id}>
                        <ListItemText
                          primary={doc.title}
                          secondary={
                            <>
                              <Typography variant="body2">
                                Version: {doc.version}
                              </Typography>
                              <Typography variant="caption">
                                Created by: {doc.createdBy}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Timeline Tab */}
              {activeTab === 8 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {timeline.map(event => (
                      <ListItem key={event.id}>
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <>
                              <Typography variant="body2">
                                {event.description}
                              </Typography>
                              <Typography variant="caption">
                                {new Date(event.date).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Health Tab */}
              {activeTab === 9 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {healthChecks.map(check => (
                      <ListItem key={check.id}>
                        <ListItemText
                          primary={`Status: ${check.status}`}
                          secondary={
                            <>
                              <Typography variant="body2">
                                Response Time: {check.responseTime}ms
                              </Typography>
                              <Typography variant="caption">
                                Last Checked: {new Date(check.lastChecked).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 2, height: 'calc(100vh - 300px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Select an integration to view details
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
        <DialogTitle>Filter Integrations</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filter.status || ''}
              onChange={e => setFilter({ ...filter, status: e.target.value as IntegrationStatus })}
            >
              {Object.values(IntegrationStatus).map(status => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filter.type || ''}
              onChange={e => setFilter({ ...filter, type: e.target.value as IntegrationType })}
            >
              {Object.values(IntegrationType).map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Protocol</InputLabel>
            <Select
              value={filter.protocol || ''}
              onChange={e => setFilter({ ...filter, protocol: e.target.value as IntegrationProtocol })}
            >
              {Object.values(IntegrationProtocol).map(protocol => (
                <MenuItem key={protocol} value={protocol}>
                  {protocol}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleFilterApply(filter)}>Apply</Button>
        </DialogActions>
      </Dialog>

      {/* Create Integration Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Integration</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newIntegration.name || ''}
            onChange={e => setNewIntegration({ ...newIntegration, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newIntegration.description || ''}
            onChange={e => setNewIntegration({ ...newIntegration, description: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Source System"
            value={newIntegration.sourceSystem || ''}
            onChange={e => setNewIntegration({ ...newIntegration, sourceSystem: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Target System"
            value={newIntegration.targetSystem || ''}
            onChange={e => setNewIntegration({ ...newIntegration, targetSystem: e.target.value })}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={newIntegration.type || ''}
              onChange={e => setNewIntegration({ ...newIntegration, type: e.target.value as IntegrationType })}
            >
              {Object.values(IntegrationType).map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Protocol</InputLabel>
            <Select
              value={newIntegration.protocol || ''}
              onChange={e => setNewIntegration({ ...newIntegration, protocol: e.target.value as IntegrationProtocol })}
            >
              {Object.values(IntegrationProtocol).map(protocol => (
                <MenuItem key={protocol} value={protocol}>
                  {protocol}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateIntegration}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Message */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConsolidatedIntegrationManagementDashboard; 