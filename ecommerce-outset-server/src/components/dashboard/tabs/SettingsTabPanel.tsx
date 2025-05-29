import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface IntegrationSettings {
  id: string;
  name: string;
  description: string;
  endpointUrl: string;
  securityType: 'NONE' | 'BASIC' | 'OAUTH2' | 'API_KEY';
  credentials?: {
    username?: string;
    password?: string;
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
  };
  config: {
    timeout: number;
    retryCount: number;
    retryDelay: number;
    maxConcurrentRequests: number;
    enableLogging: boolean;
    enableMetrics: boolean;
    enableAlerts: boolean;
    customHeaders?: Record<string, string>;
  };
}

interface SettingsTabPanelProps {
  settings: IntegrationSettings;
  onSave: (settings: IntegrationSettings) => Promise<void>;
  onReset: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export const SettingsTabPanel: React.FC<SettingsTabPanelProps> = ({
  settings,
  onSave,
  onReset,
  onDelete,
}) => {
  const [editedSettings, setEditedSettings] = React.useState<IntegrationSettings>(settings);
  const [isCustomHeadersDialogOpen, setIsCustomHeadersDialogOpen] = React.useState(false);
  const [newHeaderKey, setNewHeaderKey] = React.useState('');
  const [newHeaderValue, setNewHeaderValue] = React.useState('');
  const [hasChanges, setHasChanges] = React.useState(false);

  React.useEffect(() => {
    setEditedSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleChange = (field: string, value: any) => {
    setEditedSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleConfigChange = (field: string, value: any) => {
    setEditedSettings((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleCredentialsChange = (field: string, value: string) => {
    setEditedSettings((prev) => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleCustomHeaderAdd = () => {
    if (newHeaderKey && newHeaderValue) {
      setEditedSettings((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          customHeaders: {
            ...prev.config.customHeaders,
            [newHeaderKey]: newHeaderValue,
          },
        },
      }));
      setNewHeaderKey('');
      setNewHeaderValue('');
      setIsCustomHeadersDialogOpen(false);
      setHasChanges(true);
    }
  };

  const handleCustomHeaderDelete = (key: string) => {
    setEditedSettings((prev) => {
      const newHeaders = { ...prev.config.customHeaders };
      delete newHeaders[key];
      return {
        ...prev,
        config: {
          ...prev.config,
          customHeaders: newHeaders,
        },
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave(editedSettings);
    setHasChanges(false);
  };

  const handleReset = async () => {
    await onReset();
    setHasChanges(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      await onDelete();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Integration Settings</Typography>
          <Box>
            <Tooltip title="Reset Changes">
              <IconButton onClick={handleReset} disabled={!hasChanges} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save Changes">
              <IconButton onClick={handleSave} disabled={!hasChanges} color="primary" sx={{ mr: 1 }}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Integration">
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {hasChanges && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have unsaved changes. Click the save button to apply them.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Name"
                  fullWidth
                  value={editedSettings.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Description"
                  fullWidth
                  value={editedSettings.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Endpoint URL"
                  fullWidth
                  value={editedSettings.endpointUrl}
                  onChange={(e) => handleChange('endpointUrl', e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Security Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Security Type</InputLabel>
                  <Select
                    value={editedSettings.securityType}
                    label="Security Type"
                    onChange={(e) => handleChange('securityType', e.target.value)}
                  >
                    <MenuItem value="NONE">None</MenuItem>
                    <MenuItem value="BASIC">Basic Auth</MenuItem>
                    <MenuItem value="OAUTH2">OAuth 2.0</MenuItem>
                    <MenuItem value="API_KEY">API Key</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {editedSettings.securityType === 'BASIC' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Username"
                      fullWidth
                      value={editedSettings.credentials?.username || ''}
                      onChange={(e) => handleCredentialsChange('username', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Password"
                      type="password"
                      fullWidth
                      value={editedSettings.credentials?.password || ''}
                      onChange={(e) => handleCredentialsChange('password', e.target.value)}
                    />
                  </Grid>
                </>
              )}

              {editedSettings.securityType === 'OAUTH2' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Client ID"
                      fullWidth
                      value={editedSettings.credentials?.clientId || ''}
                      onChange={(e) => handleCredentialsChange('clientId', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Client Secret"
                      type="password"
                      fullWidth
                      value={editedSettings.credentials?.clientSecret || ''}
                      onChange={(e) => handleCredentialsChange('clientSecret', e.target.value)}
                    />
                  </Grid>
                </>
              )}

              {editedSettings.securityType === 'API_KEY' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="API Key"
                    type="password"
                    fullWidth
                    value={editedSettings.credentials?.apiKey || ''}
                    onChange={(e) => handleCredentialsChange('apiKey', e.target.value)}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Configuration Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Configuration Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Timeout (ms)"
                  type="number"
                  fullWidth
                  value={editedSettings.config.timeout}
                  onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Retry Count"
                  type="number"
                  fullWidth
                  value={editedSettings.config.retryCount}
                  onChange={(e) => handleConfigChange('retryCount', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Retry Delay (ms)"
                  type="number"
                  fullWidth
                  value={editedSettings.config.retryDelay}
                  onChange={(e) => handleConfigChange('retryDelay', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Max Concurrent Requests"
                  type="number"
                  fullWidth
                  value={editedSettings.config.maxConcurrentRequests}
                  onChange={(e) => handleConfigChange('maxConcurrentRequests', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedSettings.config.enableLogging}
                      onChange={(e) => handleConfigChange('enableLogging', e.target.checked)}
                    />
                  }
                  label="Enable Logging"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedSettings.config.enableMetrics}
                      onChange={(e) => handleConfigChange('enableMetrics', e.target.checked)}
                    />
                  }
                  label="Enable Metrics"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedSettings.config.enableAlerts}
                      onChange={(e) => handleConfigChange('enableAlerts', e.target.checked)}
                    />
                  }
                  label="Enable Alerts"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Custom Headers */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Custom Headers</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setIsCustomHeadersDialogOpen(true)}
              >
                Add Header
              </Button>
            </Box>

            {editedSettings.config.customHeaders && Object.keys(editedSettings.config.customHeaders).length > 0 ? (
              <Grid container spacing={2}>
                {Object.entries(editedSettings.config.customHeaders).map(([key, value]) => (
                  <Grid item xs={12} key={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        label="Header Key"
                        value={key}
                        fullWidth
                        disabled
                      />
                      <TextField
                        label="Header Value"
                        value={value}
                        fullWidth
                        disabled
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleCustomHeaderDelete(key)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No custom headers configured
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Add Custom Header Dialog */}
      <Dialog open={isCustomHeadersDialogOpen} onClose={() => setIsCustomHeadersDialogOpen(false)}>
        <DialogTitle>Add Custom Header</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Header Key"
            fullWidth
            value={newHeaderKey}
            onChange={(e) => setNewHeaderKey(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Header Value"
            fullWidth
            value={newHeaderValue}
            onChange={(e) => setNewHeaderValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCustomHeadersDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCustomHeaderAdd} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 