import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'performance' | 'conversion' | 'engagement' | 'revenue';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  impact: {
    metric: string;
    value: number;
    unit: string;
  };
  timestamp: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

interface AnalyticsRecommendationsProps {
  recommendations: Recommendation[];
  loading?: boolean;
  onRecommendationAction?: (recommendationId: string, action: 'start' | 'complete' | 'dismiss') => void;
}

const getPriorityColor = (priority: RecommendationPriority) => {
  switch (priority) {
    case 'high':
      return 'error.main';
    case 'medium':
      return 'warning.main';
    case 'low':
      return 'info.main';
  }
};

const getCategoryIcon = (category: RecommendationCategory) => {
  switch (category) {
    case 'performance':
      return <TrendingUpIcon />;
    case 'conversion':
      return <TrendingDownIcon />;
    case 'engagement':
      return <LightbulbIcon />;
    case 'revenue':
      return <TrendingUpIcon />;
  }
};

const getStatusColor = (status: Recommendation['status']) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'in_progress':
      return 'info';
    case 'completed':
      return 'success';
    case 'dismissed':
      return 'default';
  }
};

export const AnalyticsRecommendations: React.FC<AnalyticsRecommendationsProps> = ({
  recommendations,
  loading = false,
  onRecommendationAction,
}) => {
  const groupedRecommendations = React.useMemo(() => {
    return recommendations.reduce((acc, rec) => {
      if (!acc[rec.category]) {
        acc[rec.category] = [];
      }
      acc[rec.category].push(rec);
      return acc;
    }, {} as Record<RecommendationCategory, Recommendation[]>);
  }, [recommendations]);

  const categoryOrder: RecommendationCategory[] = [
    'performance',
    'conversion',
    'engagement',
    'revenue',
  ];

  return (
    <Card>
      <CardHeader
        title="Recommendations"
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent>
        {loading ? (
          <Typography color="text.secondary">Loading recommendations...</Typography>
        ) : recommendations.length === 0 ? (
          <Typography color="text.secondary">No recommendations available</Typography>
        ) : (
          <Stack spacing={2}>
            {categoryOrder.map((category) => {
              const categoryRecommendations = groupedRecommendations[category] || [];
              if (categoryRecommendations.length === 0) return null;

              return (
                <Box key={category}>
                  <Typography
                    variant="subtitle2"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    gutterBottom
                  >
                    {getCategoryIcon(category)}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Typography>
                  <List>
                    {categoryRecommendations.map((recommendation) => (
                      <ListItem
                        key={recommendation.id}
                        secondaryAction={
                          onRecommendationAction && (
                            <Stack direction="row" spacing={1}>
                              {recommendation.status === 'pending' && (
                                <Chip
                                  label="Start"
                                  size="small"
                                  onClick={() => onRecommendationAction(recommendation.id, 'start')}
                                />
                              )}
                              {recommendation.status === 'in_progress' && (
                                <Chip
                                  label="Complete"
                                  size="small"
                                  color="success"
                                  onClick={() => onRecommendationAction(recommendation.id, 'complete')}
                                />
                              )}
                              <Chip
                                label="Dismiss"
                                size="small"
                                color="default"
                                onClick={() => onRecommendationAction(recommendation.id, 'dismiss')}
                              />
                            </Stack>
                          )
                        }
                      >
                        <ListItemIcon>
                          <LightbulbIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {recommendation.title}
                              <Chip
                                label={recommendation.priority}
                                size="small"
                                sx={{
                                  backgroundColor: getPriorityColor(recommendation.priority),
                                  color: 'white',
                                }}
                              />
                              <Chip
                                label={recommendation.status}
                                size="small"
                                color={getStatusColor(recommendation.status)}
                              />
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {recommendation.description}
                              </Typography>
                              <br />
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                              >
                                Potential Impact: {recommendation.impact.value}{' '}
                                {recommendation.impact.unit} on {recommendation.impact.metric} •{' '}
                                {new Date(recommendation.timestamp).toLocaleString()}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}; 