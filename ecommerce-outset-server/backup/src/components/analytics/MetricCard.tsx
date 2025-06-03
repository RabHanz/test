import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  tooltip?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  tooltip,
  icon,
  loading = false,
}) => {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            {tooltip && (
              <Tooltip title={tooltip}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {icon && <Box>{icon}</Box>}
        </Box>

        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {loading ? '...' : value}
        </Typography>

        {change !== undefined && !loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: getChangeColor(change),
            }}
          >
            {change > 0 ? (
              <TrendingUpIcon fontSize="small" />
            ) : (
              <TrendingDownIcon fontSize="small" />
            )}
            <Typography variant="body2">{formatChange(change)}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 