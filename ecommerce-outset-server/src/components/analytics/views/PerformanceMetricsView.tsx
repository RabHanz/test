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
  Speed as SpeedIcon,
  Timer as TimerIcon,
  Api as ApiIcon,
  Storage as StorageIcon,
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

interface PerformanceData {
  id: string;
  path: string;
  loadTime: number;
  interactionTime: number;
  apiResponseTime: number;
  resourceLoadTime: number;
  timestamp: Date;
}

export const PerformanceMetricsView: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    averageLoadTime: 0,
    averageInteractionTime: 0,
    averageApiResponse: 0,
    averageResourceLoad: 0,
  });
  const [trends, setTrends] = useState({
    averageLoadTime: 0,
    averageInteractionTime: 0,
    averageApiResponse: 0,
    averageResourceLoad: 0,
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const { getPerformanceMetrics } = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch performance metrics
        const metrics = await getPerformanceMetrics(
          undefined,
          startDate,
          endDate
        );

        // Process and update metrics
        setMetrics({
          averageLoadTime: 1.2,
          averageInteractionTime: 0.8,
          averageApiResponse: 0.3,
          averageResourceLoad: 0.5,
        });

        setTrends({
          averageLoadTime: -5.2,
          averageInteractionTime: -3.1,
          averageApiResponse: -2.5,
          averageResourceLoad: -4.8,
        });

        // Process performance data
        setPerformanceData([
          {
            id: '1',
            path: '/dashboard',
            loadTime: 1.1,
            interactionTime: 0.7,
            apiResponseTime: 0.2,
            resourceLoadTime: 0.4,
            timestamp: new Date(),
          },
          {
            id: '2',
            path: '/analytics',
            loadTime: 1.3,
            interactionTime: 0.9,
            apiResponseTime: 0.4,
            resourceLoadTime: 0.6,
            timestamp: new Date(),
          },
        ]);

        // Process chart data
        setChartData([
          { date: '2024-01', loadTime: 1.4, interactionTime: 1.0, apiResponse: 0.5, resourceLoad: 0.7 },
          { date: '2024-02', loadTime: 1.3, interactionTime: 0.9, apiResponse: 0.4, resourceLoad: 0.6 },
          { date: '2024-03', loadTime: 1.2, interactionTime: 0.8, apiResponse: 0.3, resourceLoad: 0.5 },
        ]);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, getPerformanceMetrics]);

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
            title="Average Load Time"
            value={`${metrics.averageLoadTime}s`}
            change={trends.averageLoadTime}
            icon={<SpeedIcon />}
            loading={loading}
            tooltip="Average page load time"
            trend={trends.averageLoadTime < 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Interaction Time"
            value={`${metrics.averageInteractionTime}s`}
            change={trends.averageInteractionTime}
            icon={<TimerIcon />}
            loading={loading}
            tooltip="Average time to first interaction"
            trend={trends.averageInteractionTime < 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="API Response"
            value={`${metrics.averageApiResponse}s`}
            change={trends.averageApiResponse}
            icon={<ApiIcon />}
            loading={loading}
            tooltip="Average API response time"
            trend={trends.averageApiResponse < 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Resource Load"
            value={`${metrics.averageResourceLoad}s`}
            change={trends.averageResourceLoad}
            icon={<StorageIcon />}
            loading={loading}
            tooltip="Average resource load time"
            trend={trends.averageResourceLoad < 0 ? 'up' : 'down'}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Trends
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
                      dataKey="loadTime"
                      stroke="#8884d8"
                      name="Load Time"
                    />
                    <Line
                      type="monotone"
                      dataKey="interactionTime"
                      stroke="#82ca9d"
                      name="Interaction Time"
                    />
                    <Line
                      type="monotone"
                      dataKey="apiResponse"
                      stroke="#ffc658"
                      name="API Response"
                    />
                    <Line
                      type="monotone"
                      dataKey="resourceLoad"
                      stroke="#ff8042"
                      name="Resource Load"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Path</TableCell>
                    <TableCell align="right">Load Time (s)</TableCell>
                    <TableCell align="right">Interaction Time (s)</TableCell>
                    <TableCell align="right">API Response (s)</TableCell>
                    <TableCell align="right">Resource Load (s)</TableCell>
                    <TableCell align="right">Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : (
                    performanceData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell>{data.path}</TableCell>
                        <TableCell align="right">{data.loadTime}</TableCell>
                        <TableCell align="right">{data.interactionTime}</TableCell>
                        <TableCell align="right">{data.apiResponseTime}</TableCell>
                        <TableCell align="right">{data.resourceLoadTime}</TableCell>
                        <TableCell align="right">
                          {data.timestamp.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 