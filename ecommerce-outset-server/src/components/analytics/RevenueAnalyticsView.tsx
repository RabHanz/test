import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useAnalytics } from '../../hooks/useAnalytics';
import { RevenueMetrics } from '../../types/analytics';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const RevenueAnalyticsView: React.FC = () => {
  const { getRevenueMetrics, loading, error } = useAnalytics();
  const [revenueMetrics, setRevenueMetrics] = React.useState<RevenueMetrics | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRevenueMetrics();
        setRevenueMetrics(data);
      } catch (err) {
        console.error('Error fetching revenue metrics:', err);
      }
    };

    fetchData();
  }, [getRevenueMetrics]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!revenueMetrics) return <Typography>No data available</Typography>;

  const productData = revenueMetrics.revenueByProduct.map(product => ({
    name: product.productId,
    revenue: product.revenue,
    units: product.units,
  }));

  const channelData = revenueMetrics.revenueByChannel.map(channel => ({
    name: channel.channel,
    value: channel.revenue,
    percentage: channel.percentage,
  }));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Revenue
                </Typography>
                <Typography variant="h4">${revenueMetrics.totalRevenue.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Average Order Value
                </Typography>
                <Typography variant="h4">${revenueMetrics.averageOrderValue.toLocaleString()}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Product
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="units" name="Units Sold" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Channel
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 