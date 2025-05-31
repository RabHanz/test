import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  source: string;
}

interface AnalyticsAlertsProps {
  alerts: Alert[];
  loading?: boolean;
  onAlertDismiss?: (alertId: string) => void;
}

const getSeverityIcon = (severity: AlertSeverity) => {
  switch (severity) {
    case 'error':
      return <ErrorIcon color="error" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'info':
      return <InfoIcon color="info" />;
    case 'success':
      return <SuccessIcon color="success" />;
  }
};

const getSeverityColor = (severity: AlertSeverity) => {
  switch (severity) {
    case 'error':
      return 'error.main';
    case 'warning':
      return 'warning.main';
    case 'info':
      return 'info.main';
    case 'success':
      return 'success.main';
  }
};

export const AnalyticsAlerts: React.FC<AnalyticsAlertsProps> = ({
  alerts,
  loading = false,
  onAlertDismiss,
}) => {
  const groupedAlerts = React.useMemo(() => {
    return alerts.reduce((acc, alert) => {
      if (!acc[alert.severity]) {
        acc[alert.severity] = [];
      }
      acc[alert.severity].push(alert);
      return acc;
    }, {} as Record<AlertSeverity, Alert[]>);
  }, [alerts]);

  const severityOrder: AlertSeverity[] = ['error', 'warning', 'info', 'success'];

  return (
    <Card>
      <CardHeader
        title="Alerts"
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent>
        {loading ? (
          <Typography color="text.secondary">Loading alerts...</Typography>
        ) : alerts.length === 0 ? (
          <Typography color="text.secondary">No alerts to display</Typography>
        ) : (
          <Stack spacing={2}>
            {severityOrder.map((severity) => {
              const severityAlerts = groupedAlerts[severity] || [];
              if (severityAlerts.length === 0) return null;

              return (
                <Box key={severity}>
                  <Typography
                    variant="subtitle2"
                    color={getSeverityColor(severity)}
                    gutterBottom
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}s
                  </Typography>
                  <List>
                    {severityAlerts.map((alert) => (
                      <ListItem
                        key={alert.id}
                        secondaryAction={
                          onAlertDismiss && (
                            <IconButton
                              edge="end"
                              aria-label="dismiss"
                              onClick={() => onAlertDismiss(alert.id)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemIcon>
                          {getSeverityIcon(alert.severity)}
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.title}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {alert.message}
                              </Typography>
                              <br />
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(alert.timestamp).toLocaleString()} •{' '}
                                {alert.source}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}; 