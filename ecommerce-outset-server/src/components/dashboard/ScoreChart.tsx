import React from 'react';
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
import { Box, Typography, useTheme } from '@mui/material';
import { LeadScore } from '../../types/leadScoring';

interface ScoreChartProps {
  data?: LeadScore[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ data = [] }) => {
  const theme = useTheme();

  const chartData = data.map((score) => ({
    date: new Date(score.lastUpdated).toLocaleDateString(),
    totalScore: score.totalScore,
    behavioralScore: score.behavioralScore,
    demographicScore: score.demographicScore,
    engagementScore: score.engagementScore,
  }));

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalScore"
            stroke={theme.palette.primary.main}
            name="Total Score"
          />
          <Line
            type="monotone"
            dataKey="behavioralScore"
            stroke={theme.palette.secondary.main}
            name="Behavioral Score"
          />
          <Line
            type="monotone"
            dataKey="demographicScore"
            stroke={theme.palette.success.main}
            name="Demographic Score"
          />
          <Line
            type="monotone"
            dataKey="engagementScore"
            stroke={theme.palette.warning.main}
            name="Engagement Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ScoreChart; 