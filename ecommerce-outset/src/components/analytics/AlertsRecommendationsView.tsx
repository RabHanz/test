import React from 'react';
import { Grid, Paper, Typography, Box, Chip, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Alert, OptimizationRecommendation } from '../../types/analytics';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

export const AlertsRecommendationsView: React.FC = () => {
  const { getAlerts, getRecommendations, loading, error } = useAnalytics();
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [recommendations, setRecommendations] = React.useState<OptimizationRecommendation[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsData, recommendationsData] = await Promise.all([
          getAlerts(),
          getRecommendations(),
        ]);
        setAlerts(alertsData);
        setRecommendations(recommendationsData);
      } catch (err) {
        console.error('Error fetching alerts and recommendations:', err);
      }
    };

    fetchData();
  }, [getAlerts, getRecommendations]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getRecommendationIcon = (status: OptimizationRecommendation['status']) => {
    switch (status) {
      case 'implemented':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return <PendingIcon />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getImpactColor = (impact: OptimizationRecommendation['impact']) => {
    switch (impact) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            <List>
              {alerts.map(alert => (
                <ListItem key={alert.id}>
                  <ListItemIcon>{getAlertIcon(alert.type)}</ListItemIcon>
                  <ListItemText
                    primary={alert.message}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          label={alert.status}
                          color={alert.status === 'active' ? 'error' : 'success'}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {alerts.length === 0 && (
                <ListItem>
                  <ListItemText primary="No active alerts" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Optimization Recommendations
            </Typography>
            <List>
              {recommendations.map(recommendation => (
                <ListItem key={recommendation.id}>
                  <ListItemIcon>{getRecommendationIcon(recommendation.status)}</ListItemIcon>
                  <ListItemText
                    primary={recommendation.title}
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {recommendation.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            label={recommendation.type}
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            size="small"
                            label={recommendation.impact}
                            color={getImpactColor(recommendation.impact)}
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            size="small"
                            label={recommendation.status}
                            color={
                              recommendation.status === 'implemented'
                                ? 'success'
                                : recommendation.status === 'rejected'
                                ? 'error'
                                : 'warning'
                            }
                          />
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
              {recommendations.length === 0 && (
                <ListItem>
                  <ListItemText primary="No recommendations available" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 