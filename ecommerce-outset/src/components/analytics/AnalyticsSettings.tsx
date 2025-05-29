import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Save as SaveIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
}

interface AlertThreshold {
  id: string;
  metric: string;
  condition: 'above' | 'below';
  value: number;
  enabled: boolean;
}

interface AnalyticsSettingsProps {
  integrations: Integration[];
  alertThresholds: AlertThreshold[];
  refreshInterval: number;
  dataRetention: number;
  autoRefresh: boolean;
  onIntegrationUpdate: (integrationId: string, config: Record<string, any>) => void;
  onIntegrationDisconnect: (integrationId: string) => void;
  onAlertThresholdUpdate: (thresholdId: string, threshold: Partial<AlertThreshold>) => void;
  onAlertThresholdDelete: (thresholdId: string) => void;
  onSettingsUpdate: (settings: {
    refreshInterval: number;
    dataRetention: number;
    autoRefresh: boolean;
  }) => void;
  loading?: boolean;
}

export const AnalyticsSettings: React.FC<AnalyticsSettingsProps> = ({
  integrations,
  alertThresholds,
  refreshInterval,
  dataRetention,
  autoRefresh,
  onIntegrationUpdate,
  onIntegrationDisconnect,
  onAlertThresholdUpdate,
  onAlertThresholdDelete,
  onSettingsUpdate,
  loading = false,
}) => {
  const [localSettings, setLocalSettings] = React.useState({
    refreshInterval,
    dataRetention,
    autoRefresh,
  });

  const handleSettingsChange = (field: keyof typeof localSettings, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = () => {
    onSettingsUpdate(localSettings);
  };

  return (
    <Card>
      <CardHeader
        title="Analytics Settings"
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent>
        {loading ? (
          <Typography color="text.secondary">Loading settings...</Typography>
        ) : (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.autoRefresh}
                      onChange={(e) =>
                        handleSettingsChange('autoRefresh', e.target.checked)
                      }
                    />
                  }
                  label="Auto-refresh data"
                />
                <FormControl fullWidth>
                  <InputLabel>Refresh Interval</InputLabel>
                  <Select
                    value={localSettings.refreshInterval}
                    label="Refresh Interval"
                    onChange={(e) =>
                      handleSettingsChange('refreshInterval', e.target.value)
                    }
                  >
                    <MenuItem value={30000}>30 seconds</MenuItem>
                    <MenuItem value={60000}>1 minute</MenuItem>
                    <MenuItem value={300000}>5 minutes</MenuItem>
                    <MenuItem value={900000}>15 minutes</MenuItem>
                    <MenuItem value={1800000}>30 minutes</MenuItem>
                    <MenuItem value={3600000}>1 hour</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Data Retention</InputLabel>
                  <Select
                    value={localSettings.dataRetention}
                    label="Data Retention"
                    onChange={(e) =>
                      handleSettingsChange('dataRetention', e.target.value)
                    }
                  >
                    <MenuItem value={7}>7 days</MenuItem>
                    <MenuItem value={30}>30 days</MenuItem>
                    <MenuItem value={90}>90 days</MenuItem>
                    <MenuItem value={180}>180 days</MenuItem>
                    <MenuItem value={365}>1 year</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Integrations
              </Typography>
              <Stack spacing={2}>
                {integrations.map((integration) => (
                  <Box
                    key={integration.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="subtitle1">
                        {integration.name}
                      </Typography>
                      <Chip
                        label={integration.status}
                        color={
                          integration.status === 'connected'
                            ? 'success'
                            : integration.status === 'error'
                            ? 'error'
                            : 'default'
                        }
                      />
                    </Stack>
                    {Object.entries(integration.config).map(([key, value]) => (
                      <TextField
                        key={key}
                        label={key}
                        value={value}
                        onChange={(e) =>
                          onIntegrationUpdate(integration.id, {
                            ...integration.config,
                            [key]: e.target.value,
                          })
                        }
                        fullWidth
                        margin="normal"
                      />
                    ))}
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => onIntegrationDisconnect(integration.id)}
                      sx={{ mt: 2 }}
                    >
                      Disconnect
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Alert Thresholds
              </Typography>
              <Stack spacing={2}>
                {alertThresholds.map((threshold) => (
                  <Box
                    key={threshold.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      mb={2}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={threshold.enabled}
                            onChange={(e) =>
                              onAlertThresholdUpdate(threshold.id, {
                                enabled: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Enabled"
                      />
                      <TextField
                        label="Metric"
                        value={threshold.metric}
                        onChange={(e) =>
                          onAlertThresholdUpdate(threshold.id, {
                            metric: e.target.value,
                          })
                        }
                      />
                      <FormControl>
                        <InputLabel>Condition</InputLabel>
                        <Select
                          value={threshold.condition}
                          label="Condition"
                          onChange={(e) =>
                            onAlertThresholdUpdate(threshold.id, {
                              condition: e.target.value as 'above' | 'below',
                            })
                          }
                        >
                          <MenuItem value="above">Above</MenuItem>
                          <MenuItem value="below">Below</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="Value"
                        type="number"
                        value={threshold.value}
                        onChange={(e) =>
                          onAlertThresholdUpdate(threshold.id, {
                            value: parseFloat(e.target.value),
                          })
                        }
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => onAlertThresholdDelete(threshold.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}; 