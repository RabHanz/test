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
  TableSortLabel,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Timer as TimerIcon,
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
} from 'recharts';

interface ContentMetrics {
  id: string;
  title: string;
  views: number;
  downloads: number;
  shares: number;
  averageTimeSpent: number;
  lastViewed: Date;
}

export const ContentAnalyticsView: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalViews: 0,
    totalDownloads: 0,
    totalShares: 0,
    averageEngagement: 0,
  });
  const [trends, setTrends] = useState({
    totalViews: 0,
    totalDownloads: 0,
    totalShares: 0,
    averageEngagement: 0,
  });
  const [contentData, setContentData] = useState<ContentMetrics[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const { getContentAnalytics } = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch content analytics
        const contentAnalytics = await getContentAnalytics('all');

        // Process and update metrics
        setMetrics({
          totalViews: 5000,
          totalDownloads: 1200,
          totalShares: 800,
          averageEngagement: 3.5,
        });

        setTrends({
          totalViews: 12.5,
          totalDownloads: 8.3,
          totalShares: 15.2,
          averageEngagement: -2.1,
        });

        // Process content data
        setContentData([
          {
            id: '1',
            title: 'Getting Started Guide',
            views: 1200,
            downloads: 450,
            shares: 120,
            averageTimeSpent: 4.5,
            lastViewed: new Date(),
          },
          {
            id: '2',
            title: 'Advanced Tutorial',
            views: 800,
            downloads: 300,
            shares: 90,
            averageTimeSpent: 6.2,
            lastViewed: new Date(),
          },
        ]);

        // Process chart data
        setChartData([
          { date: '2024-01', views: 1000, downloads: 400, shares: 200 },
          { date: '2024-02', views: 1200, downloads: 450, shares: 250 },
          { date: '2024-03', views: 1500, downloads: 500, shares: 300 },
        ]);
      } catch (error) {
        console.error('Error fetching content analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, getContentAnalytics]);

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
            title="Total Views"
            value={metrics.totalViews}
            change={trends.totalViews}
            icon={<VisibilityIcon />}
            loading={loading}
            tooltip="Total number of content views"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Total Downloads"
            value={metrics.totalDownloads}
            change={trends.totalDownloads}
            icon={<DownloadIcon />}
            loading={loading}
            tooltip="Total number of content downloads"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Total Shares"
            value={metrics.totalShares}
            change={trends.totalShares}
            icon={<ShareIcon />}
            loading={loading}
            tooltip="Total number of content shares"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Average Engagement"
            value={`${metrics.averageEngagement} min`}
            change={trends.averageEngagement}
            icon={<TimerIcon />}
            loading={loading}
            tooltip="Average time spent on content"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Content Performance Trends
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
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" name="Views" />
                    <Bar dataKey="downloads" fill="#82ca9d" name="Downloads" />
                    <Bar dataKey="shares" fill="#ffc658" name="Shares" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Content Performance Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Downloads</TableCell>
                    <TableCell align="right">Shares</TableCell>
                    <TableCell align="right">Avg. Time (min)</TableCell>
                    <TableCell align="right">Last Viewed</TableCell>
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
                    contentData.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell>{content.title}</TableCell>
                        <TableCell align="right">{content.views}</TableCell>
                        <TableCell align="right">{content.downloads}</TableCell>
                        <TableCell align="right">{content.shares}</TableCell>
                        <TableCell align="right">{content.averageTimeSpent}</TableCell>
                        <TableCell align="right">
                          {content.lastViewed.toLocaleDateString()}
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