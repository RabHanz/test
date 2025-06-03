import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Refresh,
  Notifications,
  Timeline,
  Settings,
  MonetizationOn,
  People,
} from '@mui/icons-material';
import {
  PlatformType,
  PersonaType,
  PlatformMetrics,
  OptimizationTask,
  PersonaPerformance,
  IntegrationHealth,
  AnomalyAlert,
  OptimizationType,
} from '../../types/optimizationHub';
import AdminAutomationWrapper from './AdminAutomationWrapper';
import {
  getPlatformMetrics,
  refreshPlatformMetrics,
  getTasks,
  getPersonaPerformance,
  getIntegrationHealth,
  getAlerts,
} from '../../services/optimizationHubService';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { withCircuitBreaker } from '../../utils/circuitBreaker';
import { usePagination } from '../../utils/pagination';
import { trackPerformanceMetrics } from '../../utils/performance';

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

const OptimizationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics[]>([]);
  const [tasks, setTasks] = useState<OptimizationTask[]>([]);
  const [personaPerformance, setPersonaPerformance] = useState<PersonaPerformance[]>([]);
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationHealth[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        metrics,
        tasksData,
        personaData,
        integrationData,
        alertsData,
      ] = await trackPerformanceMetrics('fetch_optimization_data', async () => {
        return Promise.all([
          withCircuitBreaker(() => getPlatformMetrics()),
          withCircuitBreaker(() => getTasks()),
          withCircuitBreaker(() => getPersonaPerformance()),
          withCircuitBreaker(() => getIntegrationHealth()),
          withCircuitBreaker(() => getAlerts()),
        ]);
      });

      setPlatformMetrics(metrics);
      setTasks(tasksData);
      setPersonaPerformance(personaData);
      setIntegrationHealth(integrationData);
      setAlerts(alertsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefreshMetrics = async () => {
    try {
      const updatedMetrics = await withCircuitBreaker(() =>
        refreshPlatformMetrics()
      );
      setPlatformMetrics(updatedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh metrics');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return 'success';
      case 'degraded':
      case 'in_progress':
        return 'warning';
      case 'unhealthy':
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateOverallPerformance = () => {
    if (platformMetrics.length === 0) return 0;
    
    const totalMetrics = platformMetrics.reduce((acc, platform) => {
      return acc + platform.metrics.reduce((sum, metric) => sum + metric.value, 0);
    }, 0);
    
    return Math.round((totalMetrics / (platformMetrics.length * platformMetrics[0].metrics.length)) * 100);
  };

  const calculateOptimizationImpact = (type: OptimizationType) => {
    if (platformMetrics.length === 0) return 0;
    
    const relevantMetrics = platformMetrics.filter(m => 
      type === OptimizationType.CRO 
        ? m.conversionMetrics 
        : m.revenueMetrics
    );
    
    if (relevantMetrics.length === 0) return 0;
    
    const totalImpact = relevantMetrics.reduce((acc, platform) => {
      if (type === OptimizationType.CRO && platform.conversionMetrics) {
        return acc + platform.conversionMetrics.conversionRate;
      } else if (type === OptimizationType.RVO && platform.revenueMetrics) {
        return acc + platform.revenueMetrics.revenuePerVisitor;
      }
      return acc;
    }, 0);
    
    return Math.round((totalImpact / relevantMetrics.length) * 100);
  };

  // Use pagination for tasks
  const {
    currentItems: currentTasks,
    currentPage: tasksPage,
    totalPages: tasksTotalPages,
    hasNextPage: hasNextTasksPage,
    hasPreviousPage: hasPreviousTasksPage,
    nextPage: nextTasksPage,
    previousPage: previousTasksPage,
    goToPage: goToTasksPage,
  } = usePagination(tasks, { pageSize: 5 });

  // Use pagination for alerts
  const {
    currentItems: currentAlerts,
    currentPage: alertsPage,
    totalPages: alertsTotalPages,
    hasNextPage: hasNextAlertsPage,
    hasPreviousPage: hasPreviousAlertsPage,
    nextPage: nextAlertsPage,
    previousPage: previousAlertsPage,
    goToPage: goToAlertsPage,
  } = usePagination(alerts, { pageSize: 5 });

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <AdminAutomationWrapper>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Optimization Hub
          </Typography>

          <Grid container spacing={3}>
            {/* Overview Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Overall Performance
                  </Typography>
                  <Typography variant="h4">
                    {calculateOverallPerformance()}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={calculateOverallPerformance()}
                    color={calculateOverallPerformance() > 80 ? 'success' : 'warning'}
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
                      icon={<TrendingUp />}
                      label={`${integrationHealth.filter(i => i.status === 'healthy').length} Healthy`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      icon={<Warning />}
                      label={`${integrationHealth.filter(i => i.status === 'degraded').length} Degraded`}
                      color="warning"
                      size="small"
                    />
                    <Chip
                      icon={<TrendingDown />}
                      label={`${integrationHealth.filter(i => i.status === 'unhealthy').length} Unhealthy`}
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
                    Active Alerts
                  </Typography>
                  <Typography variant="h4">
                    {alerts.filter(a => a.status === 'active').length}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip
                      icon={<TrendingDown />}
                      label={`${alerts.filter(a => a.severity === 'critical').length} Critical`}
                      color="error"
                      size="small"
                    />
                    <Chip
                      icon={<Warning />}
                      label={`${alerts.filter(a => a.severity === 'warning').length} Warnings`}
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
                    Optimization Tasks
                  </Typography>
                  <Typography variant="h4">
                    {tasks.filter(t => t.status === 'completed').length}/{tasks.length}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(tasks.filter(t => t.status === 'completed').length / tasks.length) * 100}
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
                    CRO Impact
                  </Typography>
                  <Typography variant="h4">
                    {calculateOptimizationImpact(OptimizationType.CRO)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={calculateOptimizationImpact(OptimizationType.CRO)}
                    color={calculateOptimizationImpact(OptimizationType.CRO) > 80 ? 'success' : 'warning'}
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    RVO Impact
                  </Typography>
                  <Typography variant="h4">
                    {calculateOptimizationImpact(OptimizationType.RVO)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={calculateOptimizationImpact(OptimizationType.RVO)}
                    color={calculateOptimizationImpact(OptimizationType.RVO) > 80 ? 'success' : 'warning'}
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
                  <Tab label="Performance" />
                  <Tab label="Tasks" />
                  <Tab label="Persona Performance" />
                  <Tab label="Integrations" />
                  <Tab label="Alerts" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                  <Stack spacing={2}>
                    {platformMetrics.map(metrics => (
                      <Card key={metrics.platformType}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="h6">{metrics.platformType}</Typography>
                              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                {metrics.metrics.map(metric => (
                                  <Box key={metric.name}>
                                    <Typography variant="body2" color="textSecondary">
                                      {metric.name}
                                    </Typography>
                                    <Typography variant="h6">
                                      {metric.value}
                                      {metric.change && (
                                        <Chip
                                          icon={metric.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                                          label={`${metric.change}%`}
                                          color={metric.trend === 'up' ? 'success' : 'error'}
                                          size="small"
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
                              </Typography>
                              <Tooltip title="Refresh">
                                <IconButton onClick={() => handleRefreshMetrics()}>
                                  <Refresh />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>

                          {/* CRO Metrics */}
                          {metrics.conversionMetrics && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Conversion Metrics
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <Typography variant="body2" color="textSecondary">
                                    Conversion Rate
                                  </Typography>
                                  <Typography variant="h6">
                                    {(metrics.conversionMetrics.conversionRate * 100).toFixed(1)}%
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="body2" color="textSecondary">
                                    Bounce Rate
                                  </Typography>
                                  <Typography variant="h6">
                                    {(metrics.conversionMetrics.bounceRate * 100).toFixed(1)}%
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="body2" color="textSecondary">
                                    Funnel Completion
                                  </Typography>
                                  <Typography variant="h6">
                                    {(metrics.conversionMetrics.funnelCompletion * 100).toFixed(1)}%
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          )}

                          {/* RVO Metrics */}
                          {metrics.revenueMetrics && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Revenue Metrics
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <Typography variant="body2" color="textSecondary">
                                    Avg Order Value
                                  </Typography>
                                  <Typography variant="h6">
                                    ${metrics.revenueMetrics.avgOrderValue.toFixed(2)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="body2" color="textSecondary">
                                    Revenue/Visitor
                                  </Typography>
                                  <Typography variant="h6">
                                    ${metrics.revenueMetrics.revenuePerVisitor.toFixed(2)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="body2" color="textSecondary">
                                    Customer LTV
                                  </Typography>
                                  <Typography variant="h6">
                                    ${metrics.revenueMetrics.customerLTV.toFixed(2)}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Box>
                    {currentTasks.map((task) => (
                      <Box key={task.id} sx={{ mb: 2 }}>
                        <Typography variant="h6">{task.title}</Typography>
                        <Typography color="textSecondary">
                          {task.description}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <IconButton
                        disabled={!hasPreviousTasksPage}
                        onClick={previousTasksPage}
                      >
                        ←
                      </IconButton>
                      <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                        Page {tasksPage} of {tasksTotalPages}
                      </Typography>
                      <IconButton
                        disabled={!hasNextTasksPage}
                        onClick={nextTasksPage}
                      >
                        →
                      </IconButton>
                    </Box>
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Stack spacing={2}>
                    {personaPerformance.map(persona => (
                      <Card key={persona.personaType}>
                        <CardContent>
                          <Typography variant="h6">{persona.personaType}</Typography>
                          <Grid container spacing={2} sx={{ mt: 1 }}>
                            {Object.entries(persona.metrics).map(([key, value]) => (
                              <Grid item xs={6} md={3} key={key}>
                                <Typography variant="body2" color="textSecondary">
                                  {key}
                                </Typography>
                                <Typography variant="h6">
                                  {typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : value}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>

                          {/* Bundle Offers */}
                          {persona.bundleOffers && persona.bundleOffers.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Bundle Offers
                              </Typography>
                              <Stack spacing={1}>
                                {persona.bundleOffers.map((offer, index) => (
                                  <Card key={index} variant="outlined">
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                          <Typography variant="subtitle1">{offer.name}</Typography>
                                          <Typography variant="body2" color="textSecondary">
                                            {offer.description}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="h6">${offer.price}</Typography>
                                          <Stack direction="row" spacing={1}>
                                            <Chip
                                              icon={<People />}
                                              label={`${(offer.conversionRate * 100).toFixed(1)}% Conv.`}
                                              size="small"
                                            />
                                            <Chip
                                              icon={<MonetizationOn />}
                                              label={`${(offer.revenueImpact * 100).toFixed(1)}% Impact`}
                                              size="small"
                                            />
                                          </Stack>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {/* Service Tiers */}
                          {persona.serviceTiers && persona.serviceTiers.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Service Tiers
                              </Typography>
                              <Stack spacing={1}>
                                {persona.serviceTiers.map((tier, index) => (
                                  <Card key={index} variant="outlined">
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                          <Typography variant="subtitle1">{tier.name}</Typography>
                                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            {tier.features.map((feature, idx) => (
                                              <Chip key={idx} label={feature} size="small" />
                                            ))}
                                          </Stack>
                                        </Box>
                                        <Box>
                                          <Typography variant="h6">${tier.price}</Typography>
                                          <Stack direction="row" spacing={1}>
                                            <Chip
                                              icon={<People />}
                                              label={`${(tier.conversionRate * 100).toFixed(1)}% Conv.`}
                                              size="small"
                                            />
                                            <Chip
                                              icon={<MonetizationOn />}
                                              label={`${(tier.revenueImpact * 100).toFixed(1)}% Impact`}
                                              size="small"
                                            />
                                          </Stack>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {/* Recommendations */}
                          {persona.recommendations.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Recommendations
                              </Typography>
                              <Stack spacing={1}>
                                {persona.recommendations.map((rec, index) => (
                                  <Chip
                                    key={index}
                                    label={rec.description}
                                    color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}
                                    size="small"
                                    icon={rec.optimizationType === OptimizationType.CRO ? <People /> : <MonetizationOn />}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  <Stack spacing={2}>
                    {integrationHealth.map(health => (
                      <Card key={health.platformType}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="h6">{health.platformType}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Last checked: {new Date(health.lastChecked).toLocaleString()}
                              </Typography>
                            </Box>
                            <Chip
                              label={health.status}
                              color={getStatusColor(health.status)}
                            />
                          </Box>
                          {health.details && (
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                              {Object.entries(health.details).map(([key, value]) => (
                                <Grid item xs={6} md={3} key={key}>
                                  <Typography variant="body2" color="textSecondary">
                                    {key}
                                  </Typography>
                                  <Typography variant="body1">
                                    {typeof value === 'number' ? value.toFixed(2) : value.toString()}
                                  </Typography>
                                </Grid>
                              ))}
                            </Grid>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab} index={4}>
                  <Box>
                    {currentAlerts.map((alert) => (
                      <Box key={alert.id} sx={{ mb: 2 }}>
                        <Typography variant="h6" color={alert.severity}>
                          {alert.title}
                        </Typography>
                        <Typography color="textSecondary">
                          {alert.message}
                        </Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <IconButton
                        disabled={!hasPreviousAlertsPage}
                        onClick={previousAlertsPage}
                      >
                        ←
                      </IconButton>
                      <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                        Page {alertsPage} of {alertsTotalPages}
                      </Typography>
                      <IconButton
                        disabled={!hasNextAlertsPage}
                        onClick={nextAlertsPage}
                      >
                        →
                      </IconButton>
                    </Box>
                  </Box>
                </TabPanel>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </AdminAutomationWrapper>
    </ErrorBoundary>
  );
};

export default OptimizationHub; 