import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { ResourceMetadata } from '../../config/resourceClassification';
import { userBehaviorTrackingService } from '../../services/userBehaviorTracking';

interface RecommendationAnalyticsProps {
  resources: ResourceMetadata[];
  timeRange: 'day' | 'week' | 'month';
}

interface AnalyticsMetric {
  label: string;
  value: number;
  total: number;
  icon: React.ReactNode;
}

export const RecommendationAnalytics: React.FC<RecommendationAnalyticsProps> = ({
  resources,
  timeRange,
}) => {
  const getMetrics = (): AnalyticsMetric[] => {
    const stats = resources.reduce(
      (acc, resource) => {
        const resourceStats = userBehaviorTrackingService.getResourceStats(
          resource.id
        );
        return {
          views: acc.views + resourceStats.views,
          downloads: acc.downloads + resourceStats.downloads,
          completions: acc.completions + resourceStats.completions,
          positiveFeedback:
            acc.positiveFeedback +
            (resourceStats.averageRating >= 4 ? 1 : 0),
          negativeFeedback:
            acc.negativeFeedback +
            (resourceStats.averageRating <= 2 ? 1 : 0),
        };
      },
      {
        views: 0,
        downloads: 0,
        completions: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
      }
    );

    return [
      {
        label: 'Total Views',
        value: stats.views,
        total: resources.length * 100, // Example target
        icon: <VisibilityIcon />,
      },
      {
        label: 'Downloads',
        value: stats.downloads,
        total: stats.views,
        icon: <DownloadIcon />,
      },
      {
        label: 'Completions',
        value: stats.completions,
        total: stats.downloads,
        icon: <StarIcon />,
      },
      {
        label: 'Positive Feedback',
        value: stats.positiveFeedback,
        total: stats.positiveFeedback + stats.negativeFeedback,
        icon: <ThumbUpIcon />,
      },
      {
        label: 'Negative Feedback',
        value: stats.negativeFeedback,
        total: stats.positiveFeedback + stats.negativeFeedback,
        icon: <ThumbDownIcon />,
      },
    ];
  };

  const metrics = getMetrics();

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Recommendation Analytics</Typography>
      </Box>

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={4} key={metric.label}>
            <Paper
              variant="outlined"
              sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {metric.icon}
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                  {metric.label}
                </Typography>
              </Box>
              <Typography variant="h4" gutterBottom>
                {metric.value}
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <LinearProgress
                  variant="determinate"
                  value={(metric.value / metric.total) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {Math.round((metric.value / metric.total) * 100)}% of target
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Top Performing Resources
      </Typography>
      <List>
        {resources
          .map((resource) => ({
            ...resource,
            stats: userBehaviorTrackingService.getResourceStats(resource.id),
          }))
          .sort((a, b) => b.stats.views - a.stats.views)
          .slice(0, 5)
          .map((resource) => (
            <ListItem key={resource.id}>
              <ListItemIcon>
                <VisibilityIcon />
              </ListItemIcon>
              <ListItemText
                primary={resource.title}
                secondary={`${resource.stats.views} views • ${
                  resource.stats.downloads
                } downloads • ${Math.round(
                  resource.stats.averageRating * 10
                ) / 10} rating`}
              />
            </ListItem>
          ))}
      </List>
    </Paper>
  );
}; 