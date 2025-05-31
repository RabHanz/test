import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

interface AnalyticsChartProps {
  title: string;
  type: 'line' | 'bar';
  data: ChartData<'line' | 'bar'>;
  tooltip?: string;
  height?: number;
  loading?: boolean;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  type,
  data,
  tooltip,
  height = 300,
  loading = false,
}) => {
  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{title}</Typography>
            {tooltip && (
              <Tooltip title={tooltip}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent>
        <Box sx={{ height, position: 'relative' }}>
          {loading ? (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : type === 'line' ? (
            <Line data={data} options={options} />
          ) : (
            <Bar data={data} options={options} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}; 