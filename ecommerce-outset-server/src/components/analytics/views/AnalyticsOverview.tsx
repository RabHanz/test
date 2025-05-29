import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Article as ArticleIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { TimeRangeSelector, TimeRange } from '../shared/TimeRangeSelector';
import { MetricsCard } from '../shared/MetricsCard';
import { useAnalytics } from '../../../hooks/useAnalytics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AnalyticsOverview: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalContent: 0,
    averagePerformance: 0,
    conversionRate: 0,
  });
  const [trends, setTrends] = useState({
    totalUsers: 0,
    totalContent: 0,
    averagePerformance: 0,
    conversionRate: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  const { getPerformanceMetrics, getUserEvents } = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch performance metrics
        const performanceMetrics = await getPerformanceMetrics(
          undefined,
          startDate,
          endDate
        );

        // Fetch user events
        const userEvents = await getUserEvents(
          undefined,
          startDate,
          endDate
        );

        // Process and update metrics
        // This is a simplified example - you would need to implement proper data processing
        setMetrics({
          totalUsers: 1000,
          totalContent: 500,
          averagePerformance: 85,
          conversionRate: 2.5,
        });

        setTrends({
          totalUsers: 5.2,
          totalContent: 3.1,
          averagePerformance: -1.2,
          conversionRate: 0.8,
        });

        // Process chart data
        setChartData([
          { date: '2024-01', users: 800, content: 400 },
          { date: '2024-02', users: 900, content: 450 },
          { date: '2024-03', users: 1000, content: 500 },
        ]);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, getPerformanceMetrics, getUserEvents]);

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
            title="Total Users"
            value={metrics.totalUsers}
            change={trends.totalUsers}
            icon={<PeopleIcon />}
            loading={loading}
            tooltip="Total number of unique users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Total Content"
            value={metrics.totalContent}
            change={trends.totalContent}
            icon={<ArticleIcon />}
            loading={loading}
            tooltip="Total number of content pieces"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Average Performance"
            value={`${metrics.averagePerformance}%`}
            change={trends.averagePerformance}
            icon={<SpeedIcon />}
            loading={loading}
            tooltip="Average performance score"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Conversion Rate"
            value={`${metrics.conversionRate}%`}
            change={trends.conversionRate}
            icon={<TrendingUpIcon />}
            loading={loading}
            tooltip="Overall conversion rate"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User & Content Trends
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
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      name="Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="content"
                      stroke="#82ca9d"
                      name="Content"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 