import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useAnalytics } from '../../hooks/useAnalytics';
import { ContentAnalytics } from '../../types/analytics';
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

export const ContentAnalyticsView: React.FC = () => {
  const { getContentAnalytics, loading, error } = useAnalytics();
  const [contentAnalytics, setContentAnalytics] = React.useState<ContentAnalytics | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getContentAnalytics('all');
        setContentAnalytics(data);
      } catch (err) {
        console.error('Error fetching content analytics:', err);
      }
    };

    fetchData();
  }, [getContentAnalytics]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!contentAnalytics) return <Typography>No data available</Typography>;

  const interactionData = contentAnalytics.interactions.map(interaction => ({
    name: interaction.type,
    count: interaction.count,
  }));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Content Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Views
                </Typography>
                <Typography variant="h4">{contentAnalytics.views}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Unique Views
                </Typography>
                <Typography variant="h4">{contentAnalytics.uniqueViews}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Avg. Time on Page
                </Typography>
                <Typography variant="h4">{contentAnalytics.averageTimeOnPage.toFixed(1)}s</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Bounce Rate
                </Typography>
                <Typography variant="h4">{contentAnalytics.bounceRate.toFixed(1)}%</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Content Interactions
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 