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
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

interface IntegrationAlert {
  id: string;
  type: 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  source: string;
  timestamp: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  metadata?: Record<string, any>;
}

interface AlertsTabPanelProps {
  alerts: IntegrationAlert[];
  onAdd: (alert: Omit<IntegrationAlert, 'id'>) => Promise<void>;
  onUpdate: (id: string, alert: Partial<IntegrationAlert>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const AlertsTabPanel: React.FC<AlertsTabPanelProps> = ({
  alerts,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedAlert, setSelectedAlert] = React.useState<IntegrationAlert | null>(null);
  const [newAlert, setNewAlert] = React.useState<Omit<IntegrationAlert, 'id'>>({
    type: 'INFO',
    severity: 'LOW',
    message: '',
    source: '',
    timestamp: new Date().toISOString(),
    status: 'ACTIVE',
  });

  const handleAddClick = () => {
    setNewAlert({
      type: 'INFO',
      severity: 'LOW',
      message: '',
      source: '',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (alert: IntegrationAlert) => {
    setSelectedAlert(alert);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      await onDelete(id);
    }
  };

  const handleAddSubmit = async () => {
    await onAdd(newAlert);
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    if (selectedAlert) {
      await onUpdate(selectedAlert.id, selectedAlert);
      setIsEditDialogOpen(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ERROR':
        return <ErrorIcon color="error" />;
      case 'WARNING':
        return <WarningIcon color="warning" />;
      case 'INFO':
        return <InfoIcon color="info" />;
      case 'SUCCESS':
        return <CheckCircleIcon color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'error';
      case 'ACKNOWLEDGED':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Integration Alerts</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Alert
          </Button>
        </Box>

        <List>
          {alerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemIcon>{getAlertIcon(alert.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{alert.message}</Typography>
                      <Chip
                        label={alert.severity}
                        color={getSeverityColor(alert.severity) as any}
                        size="small"
                      />
                      <Chip
                        label={alert.status}
                        color={getStatusColor(alert.status) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Source: {alert.source}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Timestamp: {formatTimestamp(alert.timestamp)}
                      </Typography>
                      {alert.metadata && (
                        <Typography variant="body2" color="text.secondary">
                          Metadata: {JSON.stringify(alert.metadata)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Edit">
                    <IconButton
                      edge="end"
                      onClick={() => handleEditClick(alert)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteClick(alert.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}

          {alerts.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No alerts"
                secondary="Add alerts to monitor your integration"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Add Alert Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Alert</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newAlert.type}
                  label="Type"
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as any })}
                >
                  <MenuItem value="ERROR">Error</MenuItem>
                  <MenuItem value="WARNING">Warning</MenuItem>
                  <MenuItem value="INFO">Info</MenuItem>
                  <MenuItem value="SUCCESS">Success</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={newAlert.severity}
                  label="Severity"
                  onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as any })}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message"
                fullWidth
                multiline
                rows={3}
                value={newAlert.message}
                onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Source"
                fullWidth
                value={newAlert.source}
                onChange={(e) => setNewAlert({ ...newAlert, source: e.target.value })}
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

      {/* Edit Alert Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Alert</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedAlert.type}
                    label="Type"
                    onChange={(e) =>
                      setSelectedAlert({ ...selectedAlert, type: e.target.value as any })
                    }
                  >
                    <MenuItem value="ERROR">Error</MenuItem>
                    <MenuItem value="WARNING">Warning</MenuItem>
                    <MenuItem value="INFO">Info</MenuItem>
                    <MenuItem value="SUCCESS">Success</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={selectedAlert.severity}
                    label="Severity"
                    onChange={(e) =>
                      setSelectedAlert({ ...selectedAlert, severity: e.target.value as any })
                    }
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="CRITICAL">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  fullWidth
                  multiline
                  rows={3}
                  value={selectedAlert.message}
                  onChange={(e) =>
                    setSelectedAlert({ ...selectedAlert, message: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Source"
                  fullWidth
                  value={selectedAlert.source}
                  onChange={(e) =>
                    setSelectedAlert({ ...selectedAlert, source: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedAlert.status}
                    label="Status"
                    onChange={(e) =>
                      setSelectedAlert({ ...selectedAlert, status: e.target.value as any })
                    }
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem>
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                  </Select>
                </FormControl>
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