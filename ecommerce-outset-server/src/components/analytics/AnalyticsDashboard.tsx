import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import type { ContentAnalytics, PerformanceMetric, UserEvent } from '../../services/analytics';

interface AnalyticsDashboardProps {
  contentId?: string;
  startDate?: Date;
  endDate?: Date;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  contentId,
  startDate,
  endDate,
}) => {
  const {
    getContentAnalytics,
    getPerformanceMetrics,
    getUserEvents,
  } = useAnalytics();

  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics | undefined>();
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    if (contentId) {
      const analytics = getContentAnalytics(contentId);
      setContentAnalytics(analytics);
    }
  }, [contentId, getContentAnalytics]);

  useEffect(() => {
    const metrics = getPerformanceMetrics(undefined, startDate, endDate);
    setPerformanceMetrics(metrics);
  }, [startDate, endDate, getPerformanceMetrics]);

  useEffect(() => {
    const events = getUserEvents(undefined, startDate, endDate);
    setUserEvents(events);
  }, [startDate, endDate, getUserEvents]);

  const handleTimeRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTimeRange(event.target.value as 'day' | 'week' | 'month');
  };

  const renderContentAnalytics = () => {
    if (!contentAnalytics) return null;

    return (
      <Card>
        <CardHeader title="Content Analytics" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6">Views</Typography>
              <Typography variant="h4">{contentAnalytics.views}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6">Unique Views</Typography>
              <Typography variant="h4">{contentAnalytics.uniqueViews}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6">Downloads</Typography>
              <Typography variant="h4">{contentAnalytics.downloads}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6">Shares</Typography>
              <Typography variant="h4">{contentAnalytics.shares}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderPerformanceMetrics = () => {
    const metricsByType = performanceMetrics.reduce((acc, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = [];
      }
      acc[metric.type].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    return (
      <Card>
        <CardHeader title="Performance Metrics" />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={Object.entries(metricsByType).map(([type, metrics]) => ({
              type,
              value: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderUserEvents = () => {
    const eventsByType = userEvents.reduce((acc, event) => {
      if (!acc[event.type]) {
        acc[event.type] = 0;
      }
      acc[event.type]++;
      return acc;
    }, {} as Record<string, number>);

    return (
      <Card>
        <CardHeader title="User Events" />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(eventsByType).map(([type, count]) => ({
              type,
              count,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            label="Time Range"
          >
            <MenuItem value="day">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {contentId && (
          <Grid item xs={12}>
            {renderContentAnalytics()}
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          {renderPerformanceMetrics()}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderUserEvents()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard; 