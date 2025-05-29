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
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  AccountBalance as BalanceIcon,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface RevenueData {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  source: string;
  category: string;
  status: string;
}

interface RevenueMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  revenueGrowth: number;
}

export const RevenueAnalyticsView: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    revenueGrowth: 0,
  });
  const [trends, setTrends] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    revenueGrowth: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  const { getRevenueAnalytics } = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch revenue analytics
        const analytics = await getRevenueAnalytics(startDate, endDate);

        // Process and update metrics
        setMetrics({
          totalRevenue: 125000,
          averageOrderValue: 250,
          totalOrders: 500,
          revenueGrowth: 15.5,
        });

        setTrends({
          totalRevenue: 12.5,
          averageOrderValue: 5.2,
          totalOrders: 8.7,
          revenueGrowth: 15.5,
        });

        // Process revenue data
        setRevenueData([
          {
            id: '1',
            date: new Date(),
            amount: 1250,
            currency: 'USD',
            source: 'Online Store',
            category: 'Electronics',
            status: 'Completed',
          },
          {
            id: '2',
            date: new Date(),
            amount: 850,
            currency: 'USD',
            source: 'Mobile App',
            category: 'Clothing',
            status: 'Completed',
          },
        ]);

        // Process chart data
        setChartData([
          { date: '2024-01', revenue: 100000, orders: 400 },
          { date: '2024-02', revenue: 115000, orders: 450 },
          { date: '2024-03', revenue: 125000, orders: 500 },
        ]);

        // Process pie chart data
        setPieData([
          { name: 'Electronics', value: 45 },
          { name: 'Clothing', value: 30 },
          { name: 'Home & Garden', value: 15 },
          { name: 'Others', value: 10 },
        ]);
      } catch (error) {
        console.error('Error fetching revenue analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, getRevenueAnalytics]);

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
            title="Total Revenue"
            value={`$${metrics.totalRevenue.toLocaleString()}`}
            change={trends.totalRevenue}
            icon={<MoneyIcon />}
            loading={loading}
            tooltip="Total revenue in selected period"
            trend={trends.totalRevenue > 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Avg. Order Value"
            value={`$${metrics.averageOrderValue}`}
            change={trends.averageOrderValue}
            icon={<CartIcon />}
            loading={loading}
            tooltip="Average value per order"
            trend={trends.averageOrderValue > 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Total Orders"
            value={metrics.totalOrders.toString()}
            change={trends.totalOrders}
            icon={<TrendingUpIcon />}
            loading={loading}
            tooltip="Total number of orders"
            trend={trends.totalOrders > 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Revenue Growth"
            value={`${metrics.revenueGrowth}%`}
            change={trends.revenueGrowth}
            icon={<BalanceIcon />}
            loading={loading}
            tooltip="Year-over-year revenue growth"
            trend={trends.revenueGrowth > 0 ? 'up' : 'down'}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trends
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
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#82ca9d"
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Category
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
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : (
                    revenueData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell>
                          {data.date.toLocaleDateString()}
                        </TableCell>
                        <TableCell>{data.source}</TableCell>
                        <TableCell>{data.category}</TableCell>
                        <TableCell align="right">
                          {data.currency} {data.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{data.status}</TableCell>
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