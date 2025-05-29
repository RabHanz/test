import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
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
import { IntegrationMetric } from '../../types/integration';

interface MetricsTabPanelProps {
  metrics: IntegrationMetric[];
}

export const MetricsTabPanel: React.FC<MetricsTabPanelProps> = ({ metrics }) => {
  const processMetrics = () => {
    const groupedMetrics = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push({
        timestamp: new Date(metric.timestamp).toLocaleString(),
        value: metric.value,
        unit: metric.unit,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(groupedMetrics).map(([name, data]) => ({
      name,
      data: data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    }));
  };

  const processedMetrics = processMetrics();

  const getChartColor = (index: number) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
    return colors[index % colors.length];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Metrics Charts */}
        {processedMetrics.map((metric, index) => (
          <Grid item xs={12} key={metric.name}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {metric.name}
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={metric.data}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={getChartColor(index)}
                      name={`${metric.name} (${metric.data[0]?.unit || ''})`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        ))}

        {/* Metrics Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Metrics
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell>{metric.name}</TableCell>
                        <TableCell>{metric.value}</TableCell>
                        <TableCell>{metric.unit}</TableCell>
                        <TableCell>
                          {new Date(metric.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 