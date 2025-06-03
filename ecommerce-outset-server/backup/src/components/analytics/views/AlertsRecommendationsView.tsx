import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { TimeRangeSelector, TimeRange } from '../shared/TimeRangeSelector';
import { useAnalytics } from '../../../hooks/useAnalytics';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  category: string;
  status: 'active' | 'resolved' | 'acknowledged';
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  status: 'pending' | 'implemented' | 'rejected';
  potentialBenefit: string;
}

export const AlertsRecommendationsView: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeAlerts: 0,
    highPriorityAlerts: 0,
    pendingRecommendations: 0,
  });

  const { getAlertsAndRecommendations } = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch alerts and recommendations
        const data = await getAlertsAndRecommendations(startDate, endDate);

        // Process alerts
        setAlerts([
          {
            id: '1',
            type: 'warning',
            title: 'High Drop-off Rate',
            message: 'Product page drop-off rate increased by 15% in the last 24 hours',
            timestamp: new Date(),
            priority: 'high',
            category: 'Conversion',
            status: 'active',
          },
          {
            id: '2',
            type: 'error',
            title: 'API Response Time',
            message: 'Checkout API response time exceeded threshold',
            timestamp: new Date(),
            priority: 'high',
            category: 'Performance',
            status: 'active',
          },
          {
            id: '3',
            type: 'info',
            title: 'New Feature Available',
            message: 'A/B testing feature is now available for your account',
            timestamp: new Date(),
            priority: 'low',
            category: 'Feature',
            status: 'acknowledged',
          },
        ]);

        // Process recommendations
        setRecommendations([
          {
            id: '1',
            title: 'Optimize Product Images',
            description: 'Compress product images to improve page load time',
            impact: 'high',
            category: 'Performance',
            status: 'pending',
            potentialBenefit: 'Expected 20% improvement in page load time',
          },
          {
            id: '2',
            title: 'Implement Cart Abandonment Recovery',
            description: 'Set up automated email reminders for abandoned carts',
            impact: 'high',
            category: 'Conversion',
            status: 'pending',
            potentialBenefit: 'Potential 15% increase in conversion rate',
          },
          {
            id: '3',
            title: 'Update Product Descriptions',
            description: 'Enhance product descriptions with more detailed specifications',
            impact: 'medium',
            category: 'Content',
            status: 'pending',
            potentialBenefit: 'Expected 10% increase in product engagement',
          },
        ]);

        // Update stats
        setStats({
          totalAlerts: 3,
          activeAlerts: 2,
          highPriorityAlerts: 2,
          pendingRecommendations: 3,
        });
      } catch (error) {
        console.error('Error fetching alerts and recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, getAlertsAndRecommendations]);

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    const now = new Date();
    let start = new Date();

    switch (range) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      default:
        break;
    }

    setStartDate(start);
    setEndDate(now);
  };

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setSelectedRange('custom');
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
    }
  };

  const getImpactColor = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TimeRangeSelector
          selectedRange={selectedRange}
          startDate={startDate}
          endDate={endDate}
          onRangeChange={handleRangeChange}
          onDateChange={handleDateChange}
        />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            setLoading(true);
            // Trigger data refresh
          }}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Alerts
            </Typography>
            <Typography variant="h4">
              {loading ? <CircularProgress size={24} /> : stats.totalAlerts}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Active Alerts
            </Typography>
            <Typography variant="h4">
              {loading ? <CircularProgress size={24} /> : stats.activeAlerts}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              High Priority
            </Typography>
            <Typography variant="h4">
              {loading ? <CircularProgress size={24} /> : stats.highPriorityAlerts}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Pending Recommendations
            </Typography>
            <Typography variant="h4">
              {loading ? <CircularProgress size={24} /> : stats.pendingRecommendations}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {alerts
                  .filter((alert) => alert.status === 'active')
                  .map((alert) => (
                    <React.Fragment key={alert.id}>
                      <ListItem>
                        <ListItemIcon>{getAlertIcon(alert.type)}</ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {alert.title}
                              <Chip
                                label={alert.priority}
                                size="small"
                                color={getPriorityColor(alert.priority)}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary">
                                {alert.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {alert.timestamp.toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {recommendations
                  .filter((rec) => rec.status === 'pending')
                  .map((recommendation) => (
                    <React.Fragment key={recommendation.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {recommendation.title}
                              <Chip
                                label={recommendation.impact}
                                size="small"
                                color={getImpactColor(recommendation.impact)}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary">
                                {recommendation.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Potential Benefit: {recommendation.potentialBenefit}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Alert History
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {alerts.map((alert) => (
                  <React.Fragment key={alert.id}>
                    <ListItem>
                      <ListItemIcon>{getAlertIcon(alert.type)}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {alert.title}
                            <Chip
                              label={alert.priority}
                              size="small"
                              color={getPriorityColor(alert.priority)}
                            />
                            <Chip
                              label={alert.status}
                              size="small"
                              color={alert.status === 'resolved' ? 'success' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {alert.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {alert.timestamp.toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 