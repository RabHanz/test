import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { JourneyMetrics, PersonaType, JourneyStage } from '../../types/testing';
import { useJourneyTracking } from '../../hooks/useJourneyTracking';

interface JourneyMetricsProps {
  personaType: PersonaType;
}

const JourneyMetrics: React.FC<JourneyMetricsProps> = ({ personaType }) => {
  const [metrics, setMetrics] = useState<JourneyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const { getMetrics } = useJourneyTracking({ personaType });

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading journey metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [personaType]);

  const getStageColor = (dropOffRate: number) => {
    if (dropOffRate > 50) return 'error';
    if (dropOffRate > 25) return 'warning';
    return 'success';
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Journey Metrics</Typography>
        <Tooltip title="Refresh Metrics">
          <IconButton onClick={loadMetrics} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {/* Overall Metrics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Performance
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center">
                      <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Completion Rate
                        </Typography>
                        <Typography variant="h6">
                          {metrics[0]?.overallCompletionRate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center">
                      <TimerIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Avg. Time to Conversion
                        </Typography>
                        <Typography variant="h6">
                          {formatTime(metrics[0]?.averageTimeToConversion || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center">
                      <ErrorIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Conversion Rate
                        </Typography>
                        <Typography variant="h6">
                          {metrics[0]?.conversionRate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Stage Metrics */}
          {metrics[0]?.stages && Object.entries(metrics[0].stages).map(([stage, data]) => (
            <Grid item xs={12} md={6} key={stage}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {stage.replace(/_/g, ' ')}
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Drop-off Rate
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Box flex={1} mr={1}>
                        <LinearProgress
                          variant="determinate"
                          value={100 - data.dropOffRate}
                          color={getStageColor(data.dropOffRate)}
                        />
                      </Box>
                      <Typography variant="body2">
                        {data.dropOffRate.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Started
                      </Typography>
                      <Typography variant="h6">{data.started}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Completed
                      </Typography>
                      <Typography variant="h6">{data.completed}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Avg. Time to Complete
                      </Typography>
                      <Typography variant="h6">
                        {formatTime(data.averageTimeToComplete)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default JourneyMetrics; 