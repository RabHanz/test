import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useAnalytics } from '../../hooks/useAnalytics';
import { FunnelMetrics } from '../../types/analytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const FunnelAnalysisView: React.FC = () => {
  const { getFunnelMetrics, loading, error } = useAnalytics();
  const [funnelMetrics, setFunnelMetrics] = React.useState<FunnelMetrics | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFunnelMetrics();
        setFunnelMetrics(data);
      } catch (err) {
        console.error('Error fetching funnel metrics:', err);
      }
    };

    fetchData();
  }, [getFunnelMetrics]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!funnelMetrics) return <Typography>No data available</Typography>;

  const stageData = funnelMetrics.stages.map(stage => ({
    name: stage.name,
    visitors: stage.visitors,
    conversionRate: stage.conversionRate,
  }));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Funnel Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Visitors
                </Typography>
                <Typography variant="h4">{funnelMetrics.totalVisitors}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Overall Conversion Rate
                </Typography>
                <Typography variant="h4">{funnelMetrics.conversionRate.toFixed(1)}%</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Drop-off Rate
                </Typography>
                <Typography variant="h4">{funnelMetrics.dropOffRate.toFixed(1)}%</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Avg. Time to Convert
                </Typography>
                <Typography variant="h4">{funnelMetrics.averageTimeToConvert.toFixed(1)}s</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Funnel Stages
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="visitors" name="Visitors" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="conversionRate" name="Conversion Rate (%)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 