import React, { useState, useEffect, useCallback } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Button,
  Collapse,
  Divider,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  Error,
  Warning,
  Info,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Timeline,
  Assessment,
  FilterList,
  FileDownload,
  History,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  AutomationWorkflow,
  AutomationPlatform,
  AutomationStatus,
  AutomationMetrics,
  AutomationAlert,
  AutomationRule,
  AutomationFilter,
  AuditLog,
} from '../../types/automation';
import { useAuth } from '../../hooks/useAuth';
import * as automationService from '../../services/automationService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

interface ConsolidatedAutomationDashboardProps {
  userRole: string;
  accessLevel: 'admin' | 'manager' | 'viewer';
}

const ConsolidatedAutomationDashboard: React.FC<ConsolidatedAutomationDashboardProps> = ({
  userRole,
  accessLevel,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [alerts, setAlerts] = useState<AutomationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [filter, setFilter] = useState<AutomationFilter>({});
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [workflowsData, rulesData, metricsData, alertsData] = await Promise.all([
          automationService.getWorkflows(),
          automationService.getRules(),
          automationService.getMetrics(),
          automationService.getAlerts(),
        ]);
        setWorkflows(workflowsData);
        setRules(rulesData);
        setMetrics(metricsData);
        setAlerts(alertsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch automation data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const hasAccess = (requiredRole: string) => {
    return userRole === requiredRole;
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

  const handleRuleToggle = async (ruleId: string, enabled: boolean) => {
    try {
      const updatedRule = await automationService.toggleRuleStatus(ruleId, enabled);
      setRules(rules.map(rule => rule.id === ruleId ? updatedRule : rule));
    } catch (err) {
      setError('Failed to update rule status');
    }
  };

  const handleRuleDelete = async (ruleId: string) => {
    try {
      await automationService.deleteRule(ruleId);
      setRules(rules.filter(rule => rule.id !== ruleId));
    } catch (err) {
      setError('Failed to delete rule');
    }
  };

  const formatCondition = (condition: { field: string; operator: string; value: any }) => {
    return `${condition.field} ${condition.operator.toLowerCase()} ${condition.value}`;
  };

  const formatAction = (action: { type: string; target: string; parameters: Record<string, any> }) => {
    return `${action.type.toLowerCase()} ${action.target}`;
  };

  // Real-time updates
  useEffect(() => {
    const unsubscribe = automationService.subscribeToUpdates((data) => {
      if (data.type === 'workflow') {
        setWorkflows(prev => prev.map(w => w.id === data.id ? data : w));
      } else if (data.type === 'rule') {
        setRules(prev => prev.map(r => r.id === data.id ? data : r));
      } else if (data.type === 'alert') {
        setAlerts(prev => [data, ...prev].slice(0, 5));
      } else if (data.type === 'metrics') {
        setMetrics(data);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch data with filters
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [workflowsData, rulesData, metricsData, alertsData] = await Promise.all([
        automationService.getFilteredWorkflows(filter),
        automationService.getFilteredRules(filter),
        automationService.getMetrics(),
        automationService.getAlerts(),
      ]);
      setWorkflows(workflowsData);
      setRules(rulesData);
      setMetrics(metricsData);
      setAlerts(alertsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch automation data');
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Export functionality
  const handleExport = async (type: 'workflows' | 'rules' | 'metrics', format: 'csv' | 'json' | 'excel') => {
    try {
      let blob: Blob;
      switch (type) {
        case 'workflows':
          blob = await automationService.exportWorkflows(format);
          break;
        case 'rules':
          blob = await automationService.exportRules(format);
          break;
        case 'metrics':
          blob = await automationService.exportMetrics(format);
          break;
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `automation-${type}-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(`Failed to export ${type}`);
    }
  };

  // Audit logging
  const fetchAuditLogs = async () => {
    try {
      const logs = await automationService.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      setError('Failed to fetch audit logs');
    }
  };

  // Filter dialog
  const FilterDialog = () => (
    <Dialog open={showFilterDialog} onClose={() => setShowFilterDialog(false)}>
      <DialogTitle>Advanced Filters</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Platform</InputLabel>
            <Select
              value={filter.platform || ''}
              onChange={(e: SelectChangeEvent) => setFilter(prev => ({ ...prev, platform: e.target.value as AutomationPlatform }))}
            >
              <MenuItem value="">All</MenuItem>
              {Object.values(AutomationPlatform).map(platform => (
                <MenuItem key={platform} value={platform}>{platform}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filter.status || ''}
              onChange={(e: SelectChangeEvent) => setFilter(prev => ({ ...prev, status: e.target.value as AutomationStatus }))}
            >
              <MenuItem value="">All</MenuItem>
              {Object.values(AutomationStatus).map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Search"
            value={filter.searchTerm || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
            fullWidth
          />

          <DatePicker
            label="Start Date"
            value={filter.dateRange?.start || null}
            onChange={(date) => setFilter(prev => ({
              ...prev,
              dateRange: { ...prev.dateRange, start: date || new Date() }
            }))}
          />

          <DatePicker
            label="End Date"
            value={filter.dateRange?.end || null}
            onChange={(date) => setFilter(prev => ({
              ...prev,
              dateRange: { ...prev.dateRange, end: date || new Date() }
            }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setFilter({})}>Clear</Button>
        <Button onClick={() => setShowFilterDialog(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  // Audit logs dialog
  const AuditLogsDialog = () => (
    <Dialog open={showAuditLogs} onClose={() => setShowAuditLogs(false)} maxWidth="md" fullWidth>
      <DialogTitle>Audit Logs</DialogTitle>
      <DialogContent>
        <List>
          {auditLogs.map((log) => (
            <ListItem key={log.id}>
              <ListItemText
                primary={`${log.action} - ${log.entityType} (${log.entityId})`}
                secondary={
                  <>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(log.timestamp).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      User: {log.userId}
                    </Typography>
                    <Typography variant="body2">
                      Details: {JSON.stringify(log.details)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowAuditLogs(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Automation Dashboard</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<FilterList />}
            onClick={() => setShowFilterDialog(true)}
          >
            Filters
          </Button>
          <Button
            startIcon={<FileDownload />}
            onClick={() => handleExport('workflows', 'csv')}
          >
            Export
          </Button>
          <Button
            startIcon={<History />}
            onClick={() => {
              fetchAuditLogs();
              setShowAuditLogs(true);
            }}
          >
            Audit Logs
          </Button>
        </Stack>
      </Box>

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

        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              {hasAccess('admin') && <Tab label="Workflows" />}
              {hasAccess('manager') && <Tab label="Rules" />}
              {hasAccess('viewer') && <Tab label="Metrics" />}
            </Tabs>

            <TabPanel value={selectedTab} index={0}>
              <Stack spacing={2}>
                {workflows.map((workflow) => (
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
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={workflow.status}
                            color={getStatusColor(workflow.status)}
                            sx={{ mr: 1 }}
                          />
                          {hasAccess('admin') && (
                            <>
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
                            </>
                          )}
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

            <TabPanel value={selectedTab} index={1}>
              <Box>
                <List>
                  {rules.map((rule) => (
                    <React.Fragment key={rule.id}>
                      <ListItem
                        button
                        onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">{rule.name}</Typography>
                              <Chip
                                label={`Priority: ${rule.priority}`}
                                size="small"
                                color="primary"
                              />
                            </Box>
                          }
                          secondary={rule.description}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={rule.is_enabled}
                            onChange={(e) => handleRuleToggle(rule.id, e.target.checked)}
                          />
                          {hasAccess('admin') && (
                            <>
                              <IconButton
                                edge="end"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement edit functionality
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRuleDelete(rule.id);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                          {expandedRule === rule.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Collapse in={expandedRule === rule.id}>
                        <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Conditions:
                          </Typography>
                          {rule.conditions.map((condition, index) => (
                            <Chip
                              key={index}
                              label={formatCondition(condition)}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Actions:
                          </Typography>
                          {rule.actions.map((action, index) => (
                            <Chip
                              key={index}
                              label={formatAction(action)}
                              size="small"
                              color="primary"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      </Collapse>
                    </React.Fragment>
                  ))}
                </List>
                {hasAccess('admin') && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                      // TODO: Implement new rule creation
                    }}
                  >
                    Add New Rule
                  </Button>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={selectedTab} index={2}>
              <Grid container spacing={3}>
                {/* Platform Metrics */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Platform Performance
                      </Typography>
                      {Object.entries(metrics?.platformMetrics || {}).map(([platform, data]) => (
                        <Box key={platform} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            {platform}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2">
                              Success Rate: {data.successRate.toFixed(1)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={data.successRate}
                              color={data.successRate > 90 ? 'success' : 'warning'}
                              sx={{ flexGrow: 1 }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Persona Metrics */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Persona Performance
                      </Typography>
                      {Object.entries(metrics?.personaMetrics || {}).map(([persona, data]) => (
                        <Box key={persona} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            {persona}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2">
                              Success Rate: {data.successRate.toFixed(1)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={data.successRate}
                              color={data.successRate > 90 ? 'success' : 'warning'}
                              sx={{ flexGrow: 1 }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recent Alerts */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Alerts
                      </Typography>
                      <List>
                        {alerts.slice(0, 5).map((alert) => (
                          <ListItem key={alert.id}>
                            <ListItemText
                              primary={alert.message}
                              secondary={new Date(alert.created_at).toLocaleString()}
                            />
                            <Chip
                              label={alert.severity}
                              color={alert.severity === 'HIGH' ? 'error' : 'warning'}
                              size="small"
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      <FilterDialog />
      <AuditLogsDialog />
    </Box>
  );
};

export default ConsolidatedAutomationDashboard; 