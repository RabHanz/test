import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { TimeRangeSelector, TimeRange } from '../shared/TimeRangeSelector';
import { MetricsCard } from '../shared/MetricsCard';
import { useAnalytics } from '../../../hooks/useAnalytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface FunnelStep {
  id: string;
  name: string;
  count: number;
  conversion: number;
  dropoff: number;
}

interface FunnelData {
  id: string;
  name: string;
  steps: FunnelStep[];
  totalConversion: number;
  averageTime: number;
}

export const FunnelAnalysisView: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalFunnels: 0,
    averageConversion: 0,
    totalUsers: 0,
    averageTime: 0,
  });
  const [trends, setTrends] = useState({
    totalFunnels: 0,
    averageConversion: 0,
    totalUsers: 0,
    averageTime: 0,
  });
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const { getFunnelAnalytics } = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch funnel analytics
        const analytics = await getFunnelAnalytics(startDate, endDate);

        // Process and update metrics
        setMetrics({
          totalFunnels: 5,
          averageConversion: 32.5,
          totalUsers: 1250,
          averageTime: 4.2,
        });

        setTrends({
          totalFunnels: 12.5,
          averageConversion: 5.2,
          totalUsers: 8.7,
          averageTime: -2.1,
        });

        // Process funnel data
        setFunnelData([
          {
            id: '1',
            name: 'Product Purchase',
            steps: [
              { id: '1', name: 'View Product', count: 1000, conversion: 100, dropoff: 0 },
              { id: '2', name: 'Add to Cart', count: 600, conversion: 60, dropoff: 40 },
              { id: '3', name: 'Checkout', count: 400, conversion: 40, dropoff: 33.3 },
              { id: '4', name: 'Complete Purchase', count: 300, conversion: 30, dropoff: 25 },
            ],
            totalConversion: 30,
            averageTime: 4.5,
          },
          {
            id: '2',
            name: 'Sign Up',
            steps: [
              { id: '1', name: 'Landing Page', count: 800, conversion: 100, dropoff: 0 },
              { id: '2', name: 'Form Start', count: 500, conversion: 62.5, dropoff: 37.5 },
              { id: '3', name: 'Form Complete', count: 400, conversion: 50, dropoff: 20 },
              { id: '4', name: 'Email Verify', count: 350, conversion: 43.75, dropoff: 12.5 },
            ],
            totalConversion: 43.75,
            averageTime: 3.8,
          },
        ]);

        // Process chart data
        setChartData([
          { name: 'View Product', value: 1000 },
          { name: 'Add to Cart', value: 600 },
          { name: 'Checkout', value: 400 },
          { name: 'Complete Purchase', value: 300 },
        ]);
      } catch (error) {
        console.error('Error fetching funnel analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, getFunnelAnalytics]);

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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TimeRangeSelector
          selectedRange={selectedRange}
          startDate={startDate}
          endDate={endDate}
          onRangeChange={handleRangeChange}
          onDateChange={handleDateChange}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Total Funnels"
            value={metrics.totalFunnels.toString()}
            change={trends.totalFunnels}
            icon={<TrendingUpIcon />}
            loading={loading}
            tooltip="Total number of active funnels"
            trend={trends.totalFunnels > 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Avg. Conversion"
            value={`${metrics.averageConversion}%`}
            change={trends.averageConversion}
            icon={<CheckCircleIcon />}
            loading={loading}
            tooltip="Average conversion rate across all funnels"
            trend={trends.averageConversion > 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Total Users"
            value={metrics.totalUsers.toString()}
            change={trends.totalUsers}
            icon={<PeopleIcon />}
            loading={loading}
            tooltip="Total users in funnels"
            trend={trends.totalUsers > 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Avg. Time"
            value={`${metrics.averageTime}m`}
            change={trends.averageTime}
            icon={<ShoppingCartIcon />}
            loading={loading}
            tooltip="Average time to complete funnel"
            trend={trends.averageTime < 0 ? 'up' : 'down'}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Funnel Visualization
            </Typography>
            <Box sx={{ height: 400 }}>
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        {funnelData.map((funnel) => (
          <Grid item xs={12} key={funnel.id}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {funnel.name} Funnel
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Step</TableCell>
                      <TableCell align="right">Users</TableCell>
                      <TableCell align="right">Conversion</TableCell>
                      <TableCell align="right">Dropoff</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : (
                      funnel.steps.map((step) => (
                        <TableRow key={step.id}>
                          <TableCell>{step.name}</TableCell>
                          <TableCell align="right">{step.count}</TableCell>
                          <TableCell align="right">{step.conversion}%</TableCell>
                          <TableCell align="right">{step.dropoff}%</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 