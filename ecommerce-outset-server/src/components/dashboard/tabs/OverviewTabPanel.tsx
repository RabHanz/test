import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { IntegrationProject, IntegrationTimelineEvent, IntegrationAlert, IntegrationHealthCheck } from '../../types/integration';

interface OverviewTabPanelProps {
  integration: IntegrationProject;
  timeline: IntegrationTimelineEvent[];
  alerts: IntegrationAlert[];
  healthChecks: IntegrationHealthCheck[];
}

export const OverviewTabPanel: React.FC<OverviewTabPanelProps> = ({
  integration,
  timeline,
  alerts,
  healthChecks,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'MAINTENANCE':
        return 'info';
      case 'DEPRECATED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getHealthStatusColor = (status: string) => {
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

  const getAlertSeverityColor = (severity: string) => {
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

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Integration Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Integration Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Name
                </Typography>
                <Typography variant="body1">{integration.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={integration.status}
                  color={getStatusColor(integration.status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Type
                </Typography>
                <Typography variant="body1">{integration.type}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Protocol
                </Typography>
                <Typography variant="body1">{integration.protocol}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Description
                </Typography>
                <Typography variant="body1">{integration.description}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Health Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Health Status
            </Typography>
            {healthChecks.length > 0 ? (
              healthChecks.map((check) => (
                <Box key={check.id} sx={{ mb: 2 }}>
                  <Chip
                    label={check.status}
                    color={getHealthStatusColor(check.status) as any}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    Response Time: {check.responseTime}ms
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last Checked: {new Date(check.lastChecked).toLocaleString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No health checks available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            {alerts.length > 0 ? (
              <List>
                {alerts.map((alert) => (
                  <ListItem key={alert.id}>
                    <ListItemIcon>
                      <WarningIcon color={getAlertSeverityColor(alert.severity) as any} />
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={`Severity: ${alert.severity} - ${new Date(
                        alert.createdAt
                      ).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No active alerts
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Timeline
            </Typography>
            <List>
              {timeline.map((event) => (
                <React.Fragment key={event.id}>
                  <ListItem>
                    <ListItemIcon>
                      {event.type === 'SUCCESS' ? (
                        <CheckCircleIcon color="success" />
                      ) : event.type === 'WARNING' ? (
                        <WarningIcon color="warning" />
                      ) : event.type === 'ERROR' ? (
                        <WarningIcon color="error" />
                      ) : (
                        <TimelineIcon color="info" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <>
                          {event.description}
                          <br />
                          {new Date(event.date).toLocaleString()}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 