import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface HealthCheck {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  expectedStatus: number;
  timeout: number;
  interval: number;
  lastChecked: string;
  lastStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  responseTime: number;
  error?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface HealthChecksTabPanelProps {
  healthChecks: HealthCheck[];
  onAdd: (healthCheck: Omit<HealthCheck, 'id'>) => Promise<void>;
  onUpdate: (id: string, healthCheck: Partial<HealthCheck>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRun: (id: string) => Promise<void>;
}

export const HealthChecksTabPanel: React.FC<HealthChecksTabPanelProps> = ({
  healthChecks,
  onAdd,
  onUpdate,
  onDelete,
  onRun,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedHealthCheck, setSelectedHealthCheck] = React.useState<HealthCheck | null>(null);
  const [newHealthCheck, setNewHealthCheck] = React.useState<Omit<HealthCheck, 'id'>>({
    name: '',
    description: '',
    endpoint: '',
    method: 'GET',
    expectedStatus: 200,
    timeout: 5000,
    interval: 60000,
    lastChecked: new Date().toISOString(),
    lastStatus: 'HEALTHY',
    responseTime: 0,
  });
  const [isRunning, setIsRunning] = React.useState<string | null>(null);

  const handleAddClick = () => {
    setNewHealthCheck({
      name: '',
      description: '',
      endpoint: '',
      method: 'GET',
      expectedStatus: 200,
      timeout: 5000,
      interval: 60000,
      lastChecked: new Date().toISOString(),
      lastStatus: 'HEALTHY',
      responseTime: 0,
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (healthCheck: HealthCheck) => {
    setSelectedHealthCheck(healthCheck);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this health check?')) {
      await onDelete(id);
    }
  };

  const handleRunClick = async (id: string) => {
    setIsRunning(id);
    try {
      await onRun(id);
    } finally {
      setIsRunning(null);
    }
  };

  const handleAddSubmit = async () => {
    await onAdd(newHealthCheck);
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    if (selectedHealthCheck) {
      await onUpdate(selectedHealthCheck.id, selectedHealthCheck);
      setIsEditDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircleIcon color="success" />;
      case 'DEGRADED':
        return <WarningIcon color="warning" />;
      case 'UNHEALTHY':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'success';
      case 'DEGRADED':
        return 'warning';
      case 'UNHEALTHY':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatResponseTime = (time: number) => {
    return `${time}ms`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Health Checks</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Health Check
          </Button>
        </Box>

        <List>
          {healthChecks.map((healthCheck, index) => (
            <React.Fragment key={healthCheck.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemIcon>{getStatusIcon(healthCheck.lastStatus)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{healthCheck.name}</Typography>
                      <Chip
                        label={healthCheck.lastStatus}
                        color={getStatusColor(healthCheck.lastStatus) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {healthCheck.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Endpoint: {healthCheck.endpoint}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Method: {healthCheck.method}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expected Status: {healthCheck.expectedStatus}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Checked: {formatTimestamp(healthCheck.lastChecked)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Response Time: {formatResponseTime(healthCheck.responseTime)}
                      </Typography>
                      {healthCheck.error && (
                        <Typography variant="body2" color="error">
                          Error: {healthCheck.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Run Check">
                    <IconButton
                      edge="end"
                      onClick={() => handleRunClick(healthCheck.id)}
                      disabled={isRunning === healthCheck.id}
                      sx={{ mr: 1 }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      edge="end"
                      onClick={() => handleEditClick(healthCheck)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteClick(healthCheck.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
              {isRunning === healthCheck.id && (
                <LinearProgress sx={{ mx: 2 }} />
              )}
            </React.Fragment>
          ))}

          {healthChecks.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No health checks"
                secondary="Add health checks to monitor your integration"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Add Health Check Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Health Check</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                fullWidth
                value={newHealthCheck.name}
                onChange={(e) => setNewHealthCheck({ ...newHealthCheck, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={newHealthCheck.description}
                onChange={(e) => setNewHealthCheck({ ...newHealthCheck, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Endpoint"
                fullWidth
                value={newHealthCheck.endpoint}
                onChange={(e) => setNewHealthCheck({ ...newHealthCheck, endpoint: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Method</InputLabel>
                <Select
                  value={newHealthCheck.method}
                  label="Method"
                  onChange={(e) => setNewHealthCheck({ ...newHealthCheck, method: e.target.value as any })}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Expected Status"
                type="number"
                fullWidth
                value={newHealthCheck.expectedStatus}
                onChange={(e) => setNewHealthCheck({ ...newHealthCheck, expectedStatus: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Timeout (ms)"
                type="number"
                fullWidth
                value={newHealthCheck.timeout}
                onChange={(e) => setNewHealthCheck({ ...newHealthCheck, timeout: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Interval (ms)"
                type="number"
                fullWidth
                value={newHealthCheck.interval}
                onChange={(e) => setNewHealthCheck({ ...newHealthCheck, interval: parseInt(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Health Check Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Health Check</DialogTitle>
        <DialogContent>
          {selectedHealthCheck && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  fullWidth
                  value={selectedHealthCheck.name}
                  onChange={(e) =>
                    setSelectedHealthCheck({ ...selectedHealthCheck, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={selectedHealthCheck.description}
                  onChange={(e) =>
                    setSelectedHealthCheck({ ...selectedHealthCheck, description: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Endpoint"
                  fullWidth
                  value={selectedHealthCheck.endpoint}
                  onChange={(e) =>
                    setSelectedHealthCheck({ ...selectedHealthCheck, endpoint: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={selectedHealthCheck.method}
                    label="Method"
                    onChange={(e) =>
                      setSelectedHealthCheck({ ...selectedHealthCheck, method: e.target.value as any })
                    }
                  >
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Expected Status"
                  type="number"
                  fullWidth
                  value={selectedHealthCheck.expectedStatus}
                  onChange={(e) =>
                    setSelectedHealthCheck({
                      ...selectedHealthCheck,
                      expectedStatus: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Timeout (ms)"
                  type="number"
                  fullWidth
                  value={selectedHealthCheck.timeout}
                  onChange={(e) =>
                    setSelectedHealthCheck({
                      ...selectedHealthCheck,
                      timeout: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Interval (ms)"
                  type="number"
                  fullWidth
                  value={selectedHealthCheck.interval}
                  onChange={(e) =>
                    setSelectedHealthCheck({
                      ...selectedHealthCheck,
                      interval: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 