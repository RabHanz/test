import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { IntegrationHealthCheck } from '../../types/integration';

interface HealthTabPanelProps {
  healthChecks: IntegrationHealthCheck[];
  onRefresh?: () => void;
}

export const HealthTabPanel: React.FC<HealthTabPanelProps> = ({
  healthChecks,
  onRefresh,
}) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircleIcon color="success" />;
      case 'DEGRADED':
        return <WarningIcon color="warning" />;
      case 'UNHEALTHY':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'responseTime':
        return <TimerIcon />;
      case 'throughput':
        return <SpeedIcon />;
      case 'memoryUsage':
        return <MemoryIcon />;
      case 'diskUsage':
        return <StorageIcon />;
      default:
        return <TimerIcon />;
    }
  };

  const calculateOverallHealth = () => {
    const healthy = healthChecks.filter((check) => check.status === 'HEALTHY').length;
    const total = healthChecks.length;
    return total > 0 ? (healthy / total) * 100 : 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Health Status</Typography>
          {onRefresh && (
            <Tooltip title="Refresh health status">
              <IconButton onClick={onRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Overall Health
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={calculateOverallHealth()}
                      color={
                        calculateOverallHealth() > 80
                          ? 'success'
                          : calculateOverallHealth() > 50
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(calculateOverallHealth())}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {healthChecks.map((check) => (
            <Grid item xs={12} md={6} key={check.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">{check.name}</Typography>
                    <Chip
                      icon={getStatusIcon(check.status)}
                      label={check.status}
                      color={getStatusColor(check.status) as any}
                      size="small"
                    />
                  </Box>

                  <List dense>
                    {check.metrics.map((metric) => (
                      <React.Fragment key={metric.name}>
                        <ListItem>
                          <ListItemIcon>{getMetricIcon(metric.name)}</ListItemIcon>
                          <ListItemText
                            primary={metric.name}
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" component="span">
                                  {metric.value} {metric.unit}
                                </Typography>
                                {metric.threshold && (
                                  <Typography variant="body2" color="text.secondary" component="span">
                                    (Threshold: {metric.threshold} {metric.unit})
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Last checked: {formatTimestamp(check.lastChecked)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}; 