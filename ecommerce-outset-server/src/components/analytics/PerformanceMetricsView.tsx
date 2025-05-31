import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useAnalytics } from '../../hooks/useAnalytics';
import { PerformanceMetric } from '../../types/analytics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const PerformanceMetricsView: React.FC = () => {
  const { getPerformanceMetrics, loading, error } = useAnalytics();
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPerformanceMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching performance metrics:', err);
      }
    };

    fetchData();
  }, [getPerformanceMetrics]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!metrics.length) return <Typography>No data available</Typography>;

  const chartData = metrics.map(metric => ({
    timestamp: new Date(metric.timestamp).toLocaleDateString(),
    value: metric.value,
    type: metric.type,
  }));

  const metricTypes = Array.from(new Set(metrics.map(m => m.type)));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {metricTypes.map((type, index) => (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey="value"
                      name={type}
                      stroke={`hsl(${(index * 360) / metricTypes.length}, 70%, 50%)`}
                      data={chartData.filter(d => d.type === type)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Metric Summary
            </Typography>
            <Grid container spacing={2}>
              {metricTypes.map(type => {
                const typeMetrics = metrics.filter(m => m.type === type);
                const avgValue = typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length;
                const maxValue = Math.max(...typeMetrics.map(m => m.value));
                const minValue = Math.min(...typeMetrics.map(m => m.value));

                return (
                  <Grid item xs={12} sm={6} md={4} key={type}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {type}
                    </Typography>
                    <Typography variant="body2">
                      Average: {avgValue.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Max: {maxValue.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Min: {minValue.toFixed(2)}
                    </Typography>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 